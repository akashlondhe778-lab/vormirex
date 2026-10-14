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
