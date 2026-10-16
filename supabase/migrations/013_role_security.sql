-- 013_role_security.sql
-- Closes two real authorization gaps found while separating Student and
-- Teacher into fully independent account types (see
-- VORMIREX_BACKEND_PLAN.md §13):
--
-- 1. profiles_update_own (010_rls.sql) let an authenticated user update ANY
--    column on their own profiles row, including `role` — meaning a Student
--    could call `supabase.from('profiles').update({ role: 'teacher' })`
--    directly from the browser console and self-promote. This migration
--    makes `role` immutable from the client entirely (it's set once, at
--    signup, by the handle_new_auth_user trigger).
--
-- 2. courses_insert_own / videos_insert_own (010_rls.sql) only checked
--    *ownership* (teacher_id / creator_id = auth.uid()), never that the
--    caller actually holds the teacher role. A Student account could insert
--    a row into `courses` or `short_videos` with their own id as the
--    teacher/creator — RLS would allow it. These policies now also require
--    profiles.role in ('teacher', 'admin').
--
-- Both are backend-enforced (Postgres RLS / triggers), independent of
-- anything the frontend does — the frontend route guards added alongside
-- this migration are a UX convenience, not the security boundary.

create or replace function public.is_teacher_or_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin')
  );
$$;

-- ---------------------------------------------------------------------------
-- 1. Lock `role` so only service_role (e.g. a future admin tool, or the
--    handle_new_auth_user trigger at signup) can change it — never the
--    authenticated user themselves via a normal client update.
-- ---------------------------------------------------------------------------
create or replace function public.prevent_role_self_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role and auth.role() <> 'service_role' then
    raise exception 'role cannot be changed directly. Contact an administrator.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_role_self_change on public.profiles;
create trigger trg_prevent_role_self_change
  before update on public.profiles
  for each row execute function public.prevent_role_self_change();

-- ---------------------------------------------------------------------------
-- 2. Require the teacher (or admin) role, not just ownership, to create
--    courses or short videos.
-- ---------------------------------------------------------------------------
drop policy if exists "courses_insert_own" on public.courses;
create policy "courses_insert_own" on public.courses
  for insert with check (teacher_id = auth.uid() and public.is_teacher_or_admin());

drop policy if exists "videos_insert_own" on public.short_videos;
create policy "videos_insert_own" on public.short_videos
  for insert with check (creator_id = auth.uid() and public.is_teacher_or_admin());
