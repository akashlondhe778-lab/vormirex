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
