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
