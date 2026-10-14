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
