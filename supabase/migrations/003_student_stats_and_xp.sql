-- 003_student_stats_and_xp.sql
-- student_stats: fast-read denormalized snapshot (level/xp/streak/hours).
-- xp_activities: append-only ledger — the source of truth XP is derived from.

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
