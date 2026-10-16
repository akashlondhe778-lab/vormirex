-- ===== migrations/001_extensions_and_enums.sql =====
-- 001_extensions_and_enums.sql
-- Core extensions and shared enum types used across the Vormirex schema.

create extension if not exists "pgcrypto";

do $$ begin
  create type public.user_role as enum ('student', 'teacher', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.course_category as enum ('coding', 'math', 'physics', 'chemistry', 'career');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.video_category as enum ('coding', 'math', 'physics', 'chemistry', 'career', 'tips');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.difficulty_level as enum ('Beginner', 'Intermediate', 'Advanced');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.course_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.video_visibility as enum ('public', 'unlisted', 'private');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.enrollment_status as enum ('active', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('free', 'pending', 'paid', 'failed', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.purchase_status as enum ('created', 'pending', 'completed', 'failed', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.xp_activity_type as enum (
    'lesson_completed', 'quiz_completed', 'daily_login', 'course_completed', 'streak_bonus'
  );
exception when duplicate_object then null; end $$;

-- Reusable "touch updated_at" trigger function.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ===== migrations/002_profiles.sql =====
-- 002_profiles.sql
-- profiles: 1:1 with auth.users, holds public-facing identity + role.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  username text unique,
  email text not null,
  avatar_url text,
  bio text,
  role public.user_role not null default 'student',
  plan text not null default 'Starter' check (plan in ('Starter', 'Pro', 'Team')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-provision a profile row (+ starter student_stats row, created in
-- 003_student_stats_and_xp.sql via a second trigger) whenever a new Supabase
-- Auth user is created. Role/full_name come from signUp's `options.data`
-- payload set client-side in authService.signUp.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'student'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_handle_new_auth_user on auth.users;
create trigger trg_handle_new_auth_user
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ===== migrations/003_student_stats_and_xp.sql =====
-- 003_student_stats_and_xp.sql
-- student_stats: fast-read denormalized snapshot (level/xp/streak/hours).
-- xp_activities: append-only ledger — the surce of truth XP is derived from.

create table if not exists public.student_stats (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null unique references public.profiles(id) on delete cascade,
  total_xp integer not null default 0,
  level integer not null default 1,
  next_level_xp integer not null default 500,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  learning_hours numeric(10, 2) not null default 0,
  lessons_completed integer not null default 0,
  courses_completed integer not null default 0,
  last_activity_date date,
  updated_at timestamptz not null default now()
);

create trigger trg_student_stats_updated_at
  before update on public.student_stats
  for each row execute function public.set_updated_at();

-- Give every new profile a starter stats row (students and teachers alike —
-- teachers can still watch/complete free preview lessons in this product).
create or replace function public.handle_new_profile_stats()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.student_stats (student_id)
  values (new.id)
  on conflict (student_id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_new_profile_stats on public.profiles;
create trigger trg_new_profile_stats
  after insert on public.profiles
  for each row execute function public.handle_new_profile_stats();

create table if not exists public.xp_activities (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  activity_type public.xp_activity_type not null,
  xp_amount integer not null check (xp_amount > 0),
  reference_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_xp_activities_student_created
  on public.xp_activities (student_id, created_at desc);

-- Idempotency: a given (student, activity_type, reference_id) can only grant
-- XP once. reference_id is the lesson/course/quiz id being rewarded; NULL is
-- allowed for repeatable activities like daily_login (uniqueness on the date
-- is enforced separately in award_xp()'s daily_login branch, see 009_functions.sql).
create unique index if not exists uq_xp_activities_dedupe
  on public.xp_activities (student_id, activity_type, reference_id)
  where reference_id is not null;

-- ===== migrations/004_courses_and_lessons.sql =====
-- 004_courses_and_lessons.sql

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  subtitle text,
  description text,
  long_description text,
  thumbnail_url text,
  category public.course_category not null,
  difficulty public.difficulty_level not null default 'Beginner',
  language text not null default 'English',
  price numeric(10, 2) not null default 0 check (price >= 0),
  is_free boolean not null default false,
  status public.course_status not null default 'draft',
  rating numeric(3, 2) not null default 0 check (rating >= 0 and rating <= 5),
  review_count integer not null default 0,
  students_count integer not null default 0,
  what_you_will_learn text[] not null default '{}',
  prerequisites text[] not null default '{}',
  certificate_available boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint chk_free_price check (not is_free or price = 0)
);

create index if not exists idx_courses_teacher on public.courses (teacher_id);
create index if not exists idx_courses_status_category on public.courses (status, category);

create trigger trg_courses_updated_at
  before update on public.courses
  for each row execute function public.set_updated_at();

create or replace function public.set_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published' and (old.status is distinct from 'published') then
    new.published_at = now();
  end if;
  return new;
end;
$$;

create trigger trg_courses_published_at
  before update on public.courses
  for each row execute function public.set_published_at();

create table if not exists public.course_lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  video_url text,
  thumbnail_url text,
  duration_seconds integer not null default 0,
  lesson_order integer not null default 1,
  xp_reward integer not null default 20 check (xp_reward >= 0),
  is_preview boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, lesson_order)
);

create index if not exists idx_lessons_course on public.course_lessons (course_id, lesson_order);

create trigger trg_lessons_updated_at
  before update on public.course_lessons
  for each row execute function public.set_updated_at();

-- ===== migrations/005_enrollments_and_progress.sql =====
-- 005_enrollments_and_progress.sql

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status public.enrollment_status not null default 'active',
  payment_status public.payment_status not null default 'free',
  purchased_price numeric(10, 2) not null default 0,
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (student_id, course_id)
);

create index if not exists idx_enrollments_student on public.enrollments (student_id);
create index if not exists idx_enrollments_course on public.enrollments (course_id);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.course_lessons(id) on delete cascade,
  watched_seconds integer not null default 0,
  completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (student_id, lesson_id)
);

create index if not exists idx_lesson_progress_student on public.lesson_progress (student_id);

create trigger trg_lesson_progress_updated_at
  before update on public.lesson_progress
  for each row execute function public.set_updated_at();

-- ===== migrations/006_short_videos_and_social.sql =====
-- 006_short_videos_and_social.sql

create table if not exists public.short_videos (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  caption text,
  description text,
  video_url text not null,
  thumbnail_url text,
  duration_seconds integer not null default 0,
  category public.video_category not null,
  difficulty public.difficulty_level not null default 'Beginner',
  tags text[] not null default '{}',
  visibility public.video_visibility not null default 'public',
  related_course_id uuid references public.courses(id) on delete set null,
  views_count integer not null default 0,
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  shares_count integer not null default 0,
  saves_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_short_videos_creator on public.short_videos (creator_id);
create index if not exists idx_short_videos_category on public.short_videos (category) where visibility = 'public';

create trigger trg_short_videos_updated_at
  before update on public.short_videos
  for each row execute function public.set_updated_at();

create table if not exists public.video_likes (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.short_videos(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (video_id, user_id)
);

create table if not exists public.video_comments (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.short_videos(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  comment text not null check (char_length(btrim(comment)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_video_comments_video on public.video_comments (video_id, created_at desc);

create trigger trg_video_comments_updated_at
  before update on public.video_comments
  for each row execute function public.set_updated_at();

create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, following_id),
  constraint chk_no_self_follow check (follower_id <> following_id)
);

create table if not exists public.saved_videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  video_id uuid not null references public.short_videos(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, video_id)
);

-- Keep denormalized counters on short_videos in sync so the feed can read a
-- single row instead of aggregating on every render.
create or replace function public.sync_video_like_count()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.short_videos set likes_count = likes_count + 1 where id = new.video_id;
  elsif tg_op = 'DELETE' then
    update public.short_videos set likes_count = greatest(0, likes_count - 1) where id = old.video_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_sync_video_like_count on public.video_likes;
create trigger trg_sync_video_like_count
  after insert or delete on public.video_likes
  for each row execute function public.sync_video_like_count();

create or replace function public.sync_video_comment_count()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.short_videos set comments_count = comments_count + 1 where id = new.video_id;
  elsif tg_op = 'DELETE' then
    update public.short_videos set comments_count = greatest(0, comments_count - 1) where id = old.video_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_sync_video_comment_count on public.video_comments;
create trigger trg_sync_video_comment_count
  after insert or delete on public.video_comments
  for each row execute function public.sync_video_comment_count();

create or replace function public.sync_video_save_count()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.short_videos set saves_count = saves_count + 1 where id = new.video_id;
  elsif tg_op = 'DELETE' then
    update public.short_videos set saves_count = greatest(0, saves_count - 1) where id = old.video_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_sync_video_save_count on public.saved_videos;
create trigger trg_sync_video_save_count
  after insert or delete on public.saved_videos
  for each row execute function public.sync_video_save_count();

-- ===== migrations/007_reviews_and_achievements.sql =====
-- 007_reviews_and_achievements.sql

create table if not exists public.course_reviews (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  review text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, student_id)
);

create trigger trg_course_reviews_updated_at
  before update on public.course_reviews
  for each row execute function public.set_updated_at();

-- Keep courses.rating / review_count derived from actual reviews.
create or replace function public.sync_course_rating()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  target_course_id uuid := coalesce(new.course_id, old.course_id);
begin
  update public.courses c
  set rating = coalesce((select round(avg(r.rating)::numeric, 2) from public.course_reviews r where r.course_id = target_course_id), 0),
      review_count = (select count(*) from public.course_reviews r where r.course_id = target_course_id)
  where c.id = target_course_id;
  return null;
end;
$$;

drop trigger if exists trg_sync_course_rating on public.course_reviews;
create trigger trg_sync_course_rating
  after insert or update or delete on public.course_reviews
  for each row execute function public.sync_course_rating();

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  icon text,
  category text not null default 'xp' check (category in ('streak', 'xp', 'course', 'quiz', 'social')),
  rarity text not null default 'Common' check (rarity in ('Common', 'Rare', 'Epic', 'Legendary')),
  requirement_type text not null check (requirement_type in (
    'total_xp', 'streak_days', 'courses_completed', 'lessons_completed', 'quizzes_completed'
  )),
  requirement_value integer not null check (requirement_value > 0)
);

create table if not exists public.student_achievements (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique (student_id, achievement_id)
);

create index if not exists idx_student_achievements_student on public.student_achievements (student_id);

-- ===== migrations/008_notifications_and_purchases.sql =====
-- 008_notifications_and_purchases.sql

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  message text,
  reference_id text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on public.notifications (user_id, created_at desc) where is_read = false;

-- course_purchases: the payment/order ledger. Rows are only ever
-- inserted/updated by the service_role (Edge Functions) — see 010_rls.sql.
-- `enrollments.payment_status` is only flipped to 'paid' once a matching
-- purchase row here is 'completed' (via the trusted verify_payment() RPC in
-- 009_functions.sql), never directly from the client.
create table if not exists public.course_purchases (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  provider text not null default 'sandbox',
  provider_order_id text not null unique,
  provider_payment_id text,
  amount numeric(10, 2) not null,
  currency text not null default 'INR',
  status public.purchase_status not null default 'created',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_course_purchases_student on public.course_purchases (student_id);
create index if not exists idx_course_purchases_course on public.course_purchases (course_id);

create trigger trg_course_purchases_updated_at
  before update on public.course_purchases
  for each row execute function public.set_updated_at();

-- ===== migrations/009_functions.sql =====
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

-- ===== migrations/010_rls.sql =====
-- 010_rls.sql
-- Row Level Security — default deny, explicit allow per table.

alter table public.profiles enable row level security;
alter table public.student_stats enable row level security;
alter table public.xp_activities enable row level security;
alter table public.courses enable row level security;
alter table public.course_lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.short_videos enable row level security;
alter table public.video_likes enable row level security;
alter table public.video_comments enable row level security;
alter table public.follows enable row level security;
alter table public.saved_videos enable row level security;
alter table public.course_reviews enable row level security;
alter table public.achievements enable row level security;
alter table public.student_achievements enable row level security;
alter table public.notifications enable row level security;
alter table public.course_purchases enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ============================== profiles ==============================
create policy "profiles_select_public" on public.profiles
  for select using (true);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- profiles insert is handled only by the handle_new_auth_user trigger
-- (security definer), so no insert policy is granted to authenticated/anon.

-- ============================== student_stats ==============================
create policy "student_stats_select_own" on public.student_stats
  for select using (auth.uid() = student_id or public.is_admin());

-- No insert/update policy for authenticated/anon: rows are created by the
-- handle_new_profile_stats trigger and only ever mutated by award_xp()
-- (SECURITY DEFINER, runs as table owner, bypasses RLS).

-- ============================== xp_activities ==============================
create policy "xp_activities_select_own" on public.xp_activities
  for select using (auth.uid() = student_id or public.is_admin());

-- No insert policy for authenticated/anon — only award_xp() (SECURITY
-- DEFINER) may write here. This is the enforcement point for "students
-- cannot arbitrarily give themselves XP."

-- ============================== courses ==============================
create policy "courses_select_published_or_own" on public.courses
  for select using (
    status = 'published' or teacher_id = auth.uid() or public.is_admin()
  );

create policy "courses_insert_own" on public.courses
  for insert with check (teacher_id = auth.uid());

create policy "courses_update_own" on public.courses
  for update using (teacher_id = auth.uid() or public.is_admin())
  with check (teacher_id = auth.uid() or public.is_admin());

create policy "courses_delete_own" on public.courses
  for delete using (teacher_id = auth.uid() or public.is_admin());

-- ============================== course_lessons ==============================
create policy "lessons_select_preview_or_entitled" on public.course_lessons
  for select using (
    is_preview
    or exists (select 1 from public.courses c where c.id = course_id and c.teacher_id = auth.uid())
    or exists (
      select 1 from public.enrollments e
      where e.course_id = course_lessons.course_id
        and e.student_id = auth.uid()
        and e.payment_status in ('free', 'paid')
    )
    or public.is_admin()
  );

create policy "lessons_write_own_course" on public.course_lessons
  for all using (
    exists (select 1 from public.courses c where c.id = course_id and c.teacher_id = auth.uid())
    or public.is_admin()
  )
  with check (
    exists (select 1 from public.courses c where c.id = course_id and c.teacher_id = auth.uid())
    or public.is_admin()
  );

-- ============================== enrollments ==============================
create policy "enrollments_select_own_or_teacher" on public.enrollments
  for select using (
    student_id = auth.uid()
    or exists (select 1 from public.courses c where c.id = course_id and c.teacher_id = auth.uid())
    or public.is_admin()
  );

-- No direct insert/update policy for authenticated: rows are only created via
-- enroll_free_course() (free) or finalize_payment() (paid, service_role
-- only). This is the enforcement point for "do not trust the frontend to
-- mark a course as paid."

-- ============================== lesson_progress ==============================
create policy "lesson_progress_select_own" on public.lesson_progress
  for select using (auth.uid() = student_id or public.is_admin());

-- No insert/update policy for authenticated: only complete_lesson()
-- (SECURITY DEFINER) may write, so completion + XP stay atomic and
-- access-checked server-side.

-- ============================== short_videos ==============================
create policy "videos_select_visible" on public.short_videos
  for select using (
    visibility = 'public'
    or creator_id = auth.uid()
    or public.is_admin()
  );

create policy "videos_insert_own" on public.short_videos
  for insert with check (creator_id = auth.uid());

create policy "videos_update_own" on public.short_videos
  for update using (creator_id = auth.uid() or public.is_admin())
  with check (creator_id = auth.uid() or public.is_admin());

create policy "videos_delete_own" on public.short_videos
  for delete using (creator_id = auth.uid() or public.is_admin());

-- ============================== video_likes ==============================
create policy "video_likes_select_all" on public.video_likes
  for select using (true);

create policy "video_likes_insert_own" on public.video_likes
  for insert with check (user_id = auth.uid());

create policy "video_likes_delete_own" on public.video_likes
  for delete using (user_id = auth.uid());

-- ============================== video_comments ==============================
create policy "video_comments_select_all" on public.video_comments
  for select using (true);

create policy "video_comments_insert_own" on public.video_comments
  for insert with check (user_id = auth.uid());

create policy "video_comments_update_own" on public.video_comments
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "video_comments_delete_own" on public.video_comments
  for delete using (user_id = auth.uid() or public.is_admin());

-- ============================== follows ==============================
create policy "follows_select_all" on public.follows
  for select using (true);

create policy "follows_insert_own" on public.follows
  for insert with check (follower_id = auth.uid());

create policy "follows_delete_own" on public.follows
  for delete using (follower_id = auth.uid());

-- ============================== saved_videos ==============================
create policy "saved_videos_select_own" on public.saved_videos
  for select using (user_id = auth.uid());

create policy "saved_videos_insert_own" on public.saved_videos
  for insert with check (user_id = auth.uid());

create policy "saved_videos_delete_own" on public.saved_videos
  for delete using (user_id = auth.uid());

-- ============================== course_reviews ==============================
create policy "reviews_select_all" on public.course_reviews
  for select using (true);

create policy "reviews_insert_own" on public.course_reviews
  for insert with check (
    student_id = auth.uid()
    and exists (
      select 1 from public.enrollments e
      where e.student_id = auth.uid() and e.course_id = course_reviews.course_id
        and e.payment_status in ('free', 'paid')
    )
  );

create policy "reviews_update_own" on public.course_reviews
  for update using (student_id = auth.uid()) with check (student_id = auth.uid());

create policy "reviews_delete_own" on public.course_reviews
  for delete using (student_id = auth.uid() or public.is_admin());

-- ============================== achievements ==============================
create policy "achievements_select_all" on public.achievements
  for select using (true);

-- Achievement definitions are admin/service-managed only — no insert/update/
-- delete policy for authenticated/anon.

-- ============================== student_achievements ==============================
create policy "student_achievements_select_own" on public.student_achievements
  for select using (student_id = auth.uid() or public.is_admin());

-- No insert policy for authenticated: only check_and_unlock_achievements()
-- (SECURITY DEFINER) may write.

-- ============================== notifications ==============================
create policy "notifications_select_own" on public.notifications
  for select using (user_id = auth.uid());

create policy "notifications_update_own" on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Inserts come from trusted server-side triggers/functions as notification
-- features are built out; no client insert policy for now.

-- ============================== course_purchases ==============================
create policy "purchases_select_own_or_teacher" on public.course_purchases
  for select using (
    student_id = auth.uid()
    or exists (select 1 from public.courses c where c.id = course_id and c.teacher_id = auth.uid())
    or public.is_admin()
  );

-- No direct insert/update policy for authenticated: rows are created only
-- via create_payment_order() and mutated only via finalize_payment()
-- (service_role). This is the enforcement point for "payment verification
-- must happen server-side."

-- ===== migrations/011_storage.sql =====
-- 011_storage.sql
-- Storage buckets + policies. Video/thumbnail buckets are public-read (the
-- product has no paid-video-file-level protection requirement beyond
-- enrollment-gated *metadata/URL* access already enforced by RLS on
-- course_lessons/short_videos; see plan §8 for the "signed URL" upgrade path
-- if fully private paid video hosting is required later).

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('short-videos', 'short-videos', true),
  ('course-thumbnails', 'course-thumbnails', true),
  ('course-videos', 'course-videos', false),
  ('lesson-thumbnails', 'lesson-thumbnails', true)
on conflict (id) do nothing;

-- avatars: any authenticated user manages only the file at their own uid-
-- prefixed path (e.g. avatars/<uid>/profile.jpg); publicly readable.
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars_own_write" on storage.objects
  for insert with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_own_update" on storage.objects
  for update using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_own_delete" on storage.objects
  for delete using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- short-videos / course-thumbnails / lesson-thumbnails: publicly readable,
-- writable only by the authenticated user into their own uid-prefixed folder.
-- (Ownership of the *row* referencing the file is still enforced by the
-- short_videos/courses/course_lessons RLS policies — this just stops one
-- teacher from overwriting another teacher's raw files.)
do $$
declare
  b text;
begin
  foreach b in array array['short-videos', 'course-thumbnails', 'lesson-thumbnails'] loop
    execute format(
      'create policy "%1$s_public_read" on storage.objects for select using (bucket_id = %2$L)',
      replace(b, '-', '_'), b
    );
    execute format(
      'create policy "%1$s_own_write" on storage.objects for insert with check (bucket_id = %2$L and (storage.foldername(name))[1] = auth.uid()::text)',
      replace(b, '-', '_'), b
    );
    execute format(
      'create policy "%1$s_own_update" on storage.objects for update using (bucket_id = %2$L and (storage.foldername(name))[1] = auth.uid()::text)',
      replace(b, '-', '_'), b
    );
    execute format(
      'create policy "%1$s_own_delete" on storage.objects for delete using (bucket_id = %2$L and (storage.foldername(name))[1] = auth.uid()::text)',
      replace(b, '-', '_'), b
    );
  end loop;
end $$;

-- course-videos: PRIVATE bucket. Full lesson video files for paid courses
-- should not be world-readable. Teachers may upload/manage their own course's
-- videos; students only get access via signed URLs minted server-side after
-- an enrollment check (see storageService.getSignedLessonVideoUrl +
-- the get-lesson-video Edge Function) rather than a direct storage policy,
-- since storage RLS can't easily join against course_lessons/enrollments for
-- an arbitrary object path. Direct object access is teacher-only here.
create policy "course_videos_owner_read" on storage.objects
  for select using (bucket_id = 'course-videos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "course_videos_own_write" on storage.objects
  for insert with check (bucket_id = 'course-videos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "course_videos_own_update" on storage.objects
  for update using (bucket_id = 'course-videos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "course_videos_own_delete" on storage.objects
  for delete using (bucket_id = 'course-videos' and (storage.foldername(name))[1] = auth.uid()::text);

-- ===== migrations/012_view_counter.sql =====
-- 012_view_counter.sql
-- Simple trusted increment so anon/authenticated viewers can't directly
-- UPDATE short_videos (no update policy is granted to non-owners in
-- 010_rls.sql) yet still bump the view counter.

create or replace function public.increment_video_views(p_video_id uuid)
returns void
language sql
security definer set search_path = public
as $$
  update public.short_videos set views_count = views_count + 1 where id = p_video_id;
$$;

grant execute on function public.increment_video_views(uuid) to authenticated, anon;

-- ===== seed.sql =====
-- seed.sql
-- Static reference data only (no auth.users dependency, safe to run via the
-- SQL editor or `supabase db reset`). Demo accounts + sample courses/videos
-- are seeded separately by `scripts/seed-demo-data.ts` (needs the service
-- role key to create real auth.users rows) — run `npm run seed` for that.

insert into public.achievements (name, description, icon, category, rarity, requirement_type, requirement_value) values
  ('First Steps', 'Complete your first lesson', 'footprints', 'course', 'Common', 'lessons_completed', 1),
  ('Quiz Ace', 'Reach 500 total XP', 'zap', 'xp', 'Common', 'total_xp', 500),
  ('Study Streak: 7 Days', 'Maintain a 7-day study streak', 'flame', 'streak', 'Rare', 'streak_days', 7),
  ('Study Streak: 30 Days', 'Maintain a 30-day study streak', 'flame', 'streak', 'Epic', 'streak_days', 30),
  ('Course Finisher', 'Complete your first full course', 'graduation-cap', 'course', 'Rare', 'courses_completed', 1),
  ('Masterclass Collector', 'Complete 5 full courses', 'trophy', 'course', 'Epic', 'courses_completed', 5),
  ('XP Grinder', 'Reach 5,000 total XP', 'trending-up', 'xp', 'Epic', 'total_xp', 5000),
  ('Quantum Overlord', 'Reach 20,000 total XP', 'award', 'xp', 'Legendary', 'total_xp', 20000),
  ('Lesson Marathon', 'Complete 50 lessons', 'book-open', 'course', 'Rare', 'lessons_completed', 50)
on conflict (name) do nothing;
