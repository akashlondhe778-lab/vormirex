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
