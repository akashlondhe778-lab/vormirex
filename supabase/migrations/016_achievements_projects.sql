-- 016_achievements_projects.sql
-- Phase 1b: official Vormirix-issued course certificates (distinct from the
-- existing rule-based `achievements` badge system — see the comment block
-- below for why these are two different concepts), a student project
-- showcase, username claiming, and video as a post type.

-- ---------------------------------------------------------------------------
-- Username format guard. The column + unique constraint already existed
-- (002_profiles.sql); this just stops obviously-bad values once students
-- start claiming usernames through the new profile editor. Existing NULL
-- usernames are untouched.
-- ---------------------------------------------------------------------------
alter table public.profiles drop constraint if exists chk_username_format;
alter table public.profiles add constraint chk_username_format
  check (username is null or username ~ '^[a-z0-9_]{3,20}$');

-- ---------------------------------------------------------------------------
-- course_certificates: OFFICIAL achievements, as distinct from the existing
-- `achievements`/`student_achievements` tables (rule-based badges like
-- "30 Day Streak" or "Helpful Student" — unlocked automatically, no
-- per-award identity). A certificate is issued exactly once per
-- (student, course), only by issue_course_certificate() below, never
-- directly insertable by a client — this is the "cannot be manually
-- created, only system/admin can issue" requirement.
-- ---------------------------------------------------------------------------
create table if not exists public.course_certificates (
  id uuid primary key default gen_random_uuid(),
  verification_code text not null unique,
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  course_title text not null,
  -- No quiz/assessment-scoring system exists yet in this codebase, so score
  -- is nullable and left null for now rather than fabricating a number —
  -- wire it up once real graded assessments exist.
  score numeric(5, 2),
  issued_at timestamptz not null default now(),
  unique (student_id, course_id)
);

create index if not exists idx_course_certificates_student on public.course_certificates (student_id);

create or replace function public.generate_certificate_code(p_category text)
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  v_prefix text;
begin
  v_prefix := upper(left(coalesce(p_category, 'GEN'), 3));
  -- A random suffix (not a count(*)+1 sequence) avoids a race condition:
  -- two students completing a course in the same instant could otherwise
  -- compute the same "next number" concurrently and collide on the unique
  -- verification_code constraint. Still reads as a clean human ID, e.g.
  -- VORM-DS-2026-A1B2C3.
  return 'VORM-' || v_prefix || '-' || to_char(now(), 'YYYY') || '-' ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
end;
$$;

-- issue_course_certificate: the ONLY insert path for course_certificates.
-- Re-verifies completion server-side (not just trusted from the caller),
-- so granting it to `authenticated` is safe — nobody can fabricate a
-- certificate for a course they haven't actually finished, or for another
-- student. Idempotent via unique(student_id, course_id). Called
-- automatically from complete_lesson() when a course is fully finished;
-- also safe to call directly (e.g. to backfill/retry) since it just
-- re-checks and no-ops if already issued.
create or replace function public.issue_course_certificate(p_student_id uuid, p_course_id uuid)
returns public.course_certificates
language plpgsql
security definer set search_path = public
as $$
declare
  v_course record;
  v_has_completed boolean;
  v_cert public.course_certificates;
begin
  if auth.uid() is distinct from p_student_id and auth.role() <> 'service_role' then
    raise exception 'Not authorized to issue this certificate';
  end if;

  select title, category::text as category, certificate_available
    into v_course
  from public.courses where id = p_course_id;

  if v_course.title is null or v_course.certificate_available is not true then
    return null;
  end if;

  select exists (
    select 1 from public.enrollments e
    where e.student_id = p_student_id and e.course_id = p_course_id and e.status = 'completed'
  ) into v_has_completed;

  if not v_has_completed then
    raise exception 'Course not completed yet';
  end if;

  insert into public.course_certificates (verification_code, student_id, course_id, course_title)
  values (public.generate_certificate_code(v_course.category), p_student_id, p_course_id, v_course.title)
  on conflict (student_id, course_id) do nothing
  returning * into v_cert;

  if v_cert.id is null then
    select * into v_cert from public.course_certificates where student_id = p_student_id and course_id = p_course_id;
  end if;

  return v_cert;
end;
$$;

revoke all on function public.issue_course_certificate(uuid, uuid) from public, anon;
grant execute on function public.issue_course_certificate(uuid, uuid) to authenticated;

alter table public.course_certificates enable row level security;
create policy "course_certificates_select_all" on public.course_certificates for select using (true);
-- No insert/update/delete policy for authenticated — issue_course_certificate()
-- (SECURITY DEFINER) is the only writer, enforcing the "official, not
-- student-fabricated" requirement at the RLS layer too, not just the RPC.

-- Wire certificate issuance into the existing course-completion path so it
-- happens automatically — no new client call needed for the common case.
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

    -- NEW: auto-issue the official certificate (no-ops if the course
    -- doesn't have certificate_available, or if already issued).
    perform public.issue_course_certificate(v_student_id, v_course_id);
  end if;

  return query select false, greatest(1, v_xp_reward);
end;
$$;

revoke all on function public.complete_lesson(uuid) from public, anon;
grant execute on function public.complete_lesson(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Posts: add 'video' (educational shorts, reusing the whole posts/likes/
-- comments/saves infrastructure from 015 instead of a parallel system) and
-- 'achievement' (a post that references an official certificate) as post
-- types, plus the columns each needs.
-- ---------------------------------------------------------------------------
alter table public.posts drop constraint if exists posts_type_check;
alter table public.posts add constraint posts_type_check check (type in ('text', 'image', 'video', 'achievement'));
alter table public.posts add column if not exists video_url text;
alter table public.posts add column if not exists certificate_id uuid references public.course_certificates(id) on delete set null;

-- Achievement posts reference a certificate whose core facts
-- (course/score/verification code/issued date) live in course_certificates
-- and are immutable from the client (no update policy on that table) —
-- the student can still freely edit/delete the POST's own caption via the
-- existing posts_delete_own policy (no edit was ever added, consistent
-- with the rest of Phase 1), but can never alter what the certificate says.

-- ---------------------------------------------------------------------------
-- PROJECTS (student project showcase / portfolio).
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(btrim(title)) > 0 and char_length(title) <= 200),
  description text check (description is null or char_length(description) <= 3000),
  technologies text[] not null default '{}',
  image_url text,
  demo_url text,
  github_url text,
  what_i_learned text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_projects_author on public.projects (author_id, created_at desc);

create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

alter table public.projects enable row level security;
create policy "projects_select_all" on public.projects for select using (true);
create policy "projects_insert_own" on public.projects for insert with check (author_id = auth.uid());
create policy "projects_update_own" on public.projects for update using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "projects_delete_own" on public.projects for delete using (author_id = auth.uid() or public.is_admin());
