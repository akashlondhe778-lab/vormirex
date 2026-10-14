-- 009_functions.sql
-- Trusted, SECURITY DEFINER RPCs. These are the ONLY way XP, enrollment, and
-- payment state are allowed to change — RLS (010_rls.sql) blocks direct
-- client writes to xp_activities/student_stats/enrollments.payment_status/
-- course_purchases, forcing every mutation through here.

-- ---------------------------------------------------------------------------
-- award_xp: appends to the ledger, then recomputes student_stats from it.
-- Idempotent via the unique index on (student_id, activity_type, reference_id)
-- created in 003_student_stats_and_xp.sql — a duplicate call is a silent no-op
-- (ON CONFLICT DO NOTHING) rather than an error, so callers don't need to
-- pre-check "have I already awarded this."
-- ---------------------------------------------------------------------------
create or replace function public.award_xp(
  p_student_id uuid,
  p_activity_type public.xp_activity_type,
  p_xp_amount integer,
  p_reference_id text default null
)
returns table (awarded boolean, total_xp integer, level integer, leveled_up boolean)
language plpgsql
security definer set search_path = public
as $$
declare
  v_effective_reference_id text;
  v_row_count integer;
  v_inserted boolean;
  v_old_level integer;
  v_new_total integer;
  v_new_level integer;
  v_next_level_xp integer;
begin
  v_effective_reference_id := case
    when p_activity_type = 'daily_login' then coalesce(p_reference_id, to_char(now(), 'YYYY-MM-DD'))
    else p_reference_id
  end;

  insert into public.xp_activities (student_id, activity_type, xp_amount, reference_id)
  values (p_student_id, p_activity_type, p_xp_amount, v_effective_reference_id)
  on conflict (student_id, activity_type, reference_id) do nothing;

  get diagnostics v_row_count = row_count;
  v_inserted := v_row_count > 0;

  select ss.level into v_old_level from public.student_stats ss where ss.student_id = p_student_id;

  select coalesce(sum(xa.xp_amount), 0) into v_new_total
  from public.xp_activities xa
  where xa.student_id = p_student_id;

  -- Simple progressive level curve: level N requires N*500 cumulative XP.
  v_new_level := greatest(1, floor(v_new_total / 500.0)::integer + 1);
  v_next_level_xp := v_new_level * 500;

  update public.student_stats
  set total_xp = v_new_total,
      level = v_new_level,
      next_level_xp = v_next_level_xp,
      lessons_completed = (
        select count(*) from public.lesson_progress lp where lp.student_id = p_student_id and lp.completed
      ),
      last_activity_date = current_date
  where student_id = p_student_id;

  return query select v_inserted, v_new_total, v_new_level, (v_new_level > coalesce(v_old_level, 1));
end;
$$;

revoke all on function public.award_xp(uuid, public.xp_activity_type, integer, text) from public, anon;
grant execute on function public.award_xp(uuid, public.xp_activity_type, integer, text) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- complete_lesson: idempotent lesson completion + XP award in one call.
-- Enforces that the caller is enrolled (or the lesson is a free preview)
-- before marking progress, so a student can't fabricate completion of a
-- lesson they never had access to.
-- ---------------------------------------------------------------------------
create or replace function public.complete_lesson(p_lesson_id uuid)
returns table (already_completed boolean, xp_awarded integer)
language plpgsql
security definer set search_path = public
as $$
declare
  v_student_id uuid := auth.uid();
  v_course_id uuid;
  v_is_preview boolean;
  v_xp_reward integer;
  v_has_access boolean;
  v_was_completed boolean;
begin
  if v_student_id is null then
    raise exception 'Not authenticated';
  end if;

  select course_id, is_preview, xp_reward
    into v_course_id, v_is_preview, v_xp_reward
  from public.course_lessons
  where id = p_lesson_id;

  if v_course_id is null then
    raise exception 'Lesson not found';
  end if;

  select exists (
    select 1 from public.enrollments e
    where e.student_id = v_student_id
      and e.course_id = v_course_id
      and e.payment_status in ('free', 'paid')
  ) into v_has_access;

  if not v_has_access and not v_is_preview then
    raise exception 'Not enrolled in this course';
  end if;

  select completed into v_was_completed
  from public.lesson_progress
  where student_id = v_student_id and lesson_id = p_lesson_id;

  insert into public.lesson_progress (student_id, lesson_id, completed, completed_at, watched_seconds)
  values (v_student_id, p_lesson_id, true, now(), coalesce((select duration_seconds from public.course_lessons where id = p_lesson_id), 0))
  on conflict (student_id, lesson_id)
  do update set completed = true,
                completed_at = coalesce(public.lesson_progress.completed_at, now())
  where public.lesson_progress.completed is distinct from true;

  if coalesce(v_was_completed, false) then
    return query select true, 0;
    return;
  end if;

  perform public.award_xp(v_student_id, 'lesson_completed', greatest(1, v_xp_reward), p_lesson_id::text);

  -- If every lesson in the course is now complete, award the course-completed
  -- bonus once and flip the enrollment to completed.
  if not exists (
    select 1 from public.course_lessons cl
    left join public.lesson_progress lp
      on lp.lesson_id = cl.id and lp.student_id = v_student_id and lp.completed
    where cl.course_id = v_course_id and lp.id is null
  ) then
    perform public.award_xp(v_student_id, 'course_completed', 500, v_course_id::text);

    update public.enrollments
    set status = 'completed', completed_at = now()
    where student_id = v_student_id and course_id = v_course_id and status <> 'completed';

    update public.student_stats
    set courses_completed = courses_completed + 1
    where student_id = v_student_id;
  end if;

  return query select false, greatest(1, v_xp_reward);
end;
$$;

revoke all on function public.complete_lesson(uuid) from public, anon;
grant execute on function public.complete_lesson(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- enroll_free_course: the only path that may create a 'free' enrollment.
-- Refuses paid courses — those must go through finalize_payment().
-- ---------------------------------------------------------------------------
create or replace function public.enroll_free_course(p_course_id uuid)
returns public.enrollments
language plpgsql
security definer set search_path = public
as $$
declare
  v_student_id uuid := auth.uid();
  v_is_free boolean;
  v_row public.enrollments;
begin
  if v_student_id is null then
    raise exception 'Not authenticated';
  end if;

  select is_free into v_is_free from public.courses where id = p_course_id and status = 'published';

  if v_is_free is null then
    raise exception 'Course not found or not published';
  end if;

  if not v_is_free then
    raise exception 'Course is paid — use the checkout flow';
  end if;

  insert into public.enrollments (student_id, course_id, status, payment_status, purchased_price)
  values (v_student_id, p_course_id, 'active', 'free', 0)
  on conflict (student_id, course_id) do nothing
  returning * into v_row;

  if v_row.id is null then
    select * into v_row from public.enrollments where student_id = v_student_id and course_id = p_course_id;
  else
    update public.courses set students_count = students_count + 1 where id = p_course_id;
  end if;

  return v_row;
end;
$$;

revoke all on function public.enroll_free_course(uuid) from public, anon;
grant execute on function public.enroll_free_course(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- create_payment_order: student-callable. Only ever creates a 'created'
-- order — cannot grant access by itself. The frontend calls this, then hands
-- the returned order id to the checkout UI; actual verification happens in
-- the finalize_payment() function below, invoked only from the
-- verify-payment Edge Function (service_role).
-- ---------------------------------------------------------------------------
create or replace function public.create_payment_order(p_course_id uuid)
returns public.course_purchases
language plpgsql
security definer set search_path = public
as $$
declare
  v_student_id uuid := auth.uid();
  v_price numeric(10, 2);
  v_is_free boolean;
  v_row public.course_purchases;
begin
  if v_student_id is null then
    raise exception 'Not authenticated';
  end if;

  select price, is_free into v_price, v_is_free from public.courses where id = p_course_id and status = 'published';

  if v_price is null then
    raise exception 'Course not found or not published';
  end if;

  if v_is_free then
    raise exception 'Course is free — use enroll_free_course instead';
  end if;

  if exists (select 1 from public.enrollments where student_id = v_student_id and course_id = p_course_id and payment_status = 'paid') then
    raise exception 'Already purchased';
  end if;

  insert into public.course_purchases (student_id, course_id, provider, provider_order_id, amount, currency, status)
  values (v_student_id, p_course_id, 'sandbox', 'order_' || replace(gen_random_uuid()::text, '-', ''), v_price, 'INR', 'created')
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.create_payment_order(uuid) from public, anon;
grant execute on function public.create_payment_order(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- finalize_payment: SERVICE ROLE ONLY. Called exclusively from the
-- `verify-payment` Edge Function after it has independently verified the
-- payment with the gateway (or, in sandbox mode, applied the sandbox rule).
-- This is the only function permitted to move payment_status to 'paid' and
-- create/activate the corresponding enrollment.
-- ---------------------------------------------------------------------------
create or replace function public.finalize_payment(
  p_order_id text,
  p_provider_payment_id text,
  p_status public.purchase_status
)
returns public.enrollments
language plpgsql
security definer set search_path = public
as $$
declare
  v_purchase public.course_purchases;
  v_enrollment public.enrollments;
begin
  select * into v_purchase from public.course_purchases where provider_order_id = p_order_id for update;

  if v_purchase.id is null then
    raise exception 'Order not found';
  end if;

  update public.course_purchases
  set status = p_status,
      provider_payment_id = p_provider_payment_id
  where id = v_purchase.id;

  if p_status <> 'completed' then
    return null;
  end if;

  insert into public.enrollments (student_id, course_id, status, payment_status, purchased_price)
  values (v_purchase.student_id, v_purchase.course_id, 'active', 'paid', v_purchase.amount)
  on conflict (student_id, course_id)
  do update set payment_status = 'paid', purchased_price = excluded.purchased_price, status = 'active'
  returning * into v_enrollment;

  update public.courses set students_count = students_count + 1 where id = v_purchase.course_id;

  return v_enrollment;
end;
$$;

revoke all on function public.finalize_payment(text, text, public.purchase_status) from public, anon, authenticated;
grant execute on function public.finalize_payment(text, text, public.purchase_status) to service_role;

-- ---------------------------------------------------------------------------
-- check_and_unlock_achievements: called after award_xp/complete_lesson from
-- the client (best-effort) to sweep for newly-earned achievements. Safe to
-- call redundantly — unique constraint on student_achievements prevents dupes.
-- ---------------------------------------------------------------------------
create or replace function public.check_and_unlock_achievements(p_student_id uuid default auth.uid())
returns setof public.student_achievements
language plpgsql
security definer set search_path = public
as $$
declare
  v_stats public.student_stats;
begin
  if p_student_id is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_stats from public.student_stats where student_id = p_student_id;

  return query
  insert into public.student_achievements (student_id, achievement_id)
  select p_student_id, a.id
  from public.achievements a
  where (
    (a.requirement_type = 'total_xp' and v_stats.total_xp >= a.requirement_value) or
    (a.requirement_type = 'streak_days' and v_stats.current_streak >= a.requirement_value) or
    (a.requirement_type = 'courses_completed' and v_stats.courses_completed >= a.requirement_value) or
    (a.requirement_type = 'lessons_completed' and v_stats.lessons_completed >= a.requirement_value)
  )
  on conflict (student_id, achievement_id) do nothing
  returning *;
end;
$$;

revoke all on function public.check_and_unlock_achievements(uuid) from public, anon;
grant execute on function public.check_and_unlock_achievements(uuid) to authenticated;
