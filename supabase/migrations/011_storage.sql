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
