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
