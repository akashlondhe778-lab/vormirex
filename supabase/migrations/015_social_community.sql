-- 015_social_community.sql
-- Phase 1 of the Student Social Learning & Community system (see
-- VORMIRIX_BACKEND_PLAN.md §14): public student profiles, follow/unfollow
-- (reuses the existing `follows` table from 006_short_videos_and_social.sql
-- — it was already generic student<->teacher follow, not video-specific),
-- posts (text/image), and a Q&A "Ask & Solve" system with accepted answers.
--
-- Deferred to Phase 2/3 per the agreed scope: hashtags/search/discovery,
-- study groups, private profiles & follow requests, notifications UI,
-- reports/blocks/admin moderation, polls/carousels/achievement-share posts.

-- ---------------------------------------------------------------------------
-- Profile fields the Phase 1 public profile needs that don't exist yet.
-- bio/avatar_url/username already existed (002_profiles.sql).
-- ---------------------------------------------------------------------------
alter table public.profiles add column if not exists location text;
alter table public.profiles add column if not exists education_level text;
alter table public.profiles add column if not exists interests text[] not null default '{}';

-- ---------------------------------------------------------------------------
-- Denormalized social counters on student_stats (every profile already gets
-- a student_stats row — see handle_new_profile_stats in
-- 003_student_stats_and_xp.sql). Mirrors the existing short_videos counter
-- pattern (sync_video_like_count etc. in 006) rather than COUNT()-ing on
-- every profile view.
-- ---------------------------------------------------------------------------
alter table public.student_stats add column if not exists followers_count integer not null default 0;
alter table public.student_stats add column if not exists following_count integer not null default 0;
alter table public.student_stats add column if not exists posts_count integer not null default 0;
alter table public.student_stats add column if not exists questions_asked_count integer not null default 0;
alter table public.student_stats add column if not exists answers_given_count integer not null default 0;
alter table public.student_stats add column if not exists accepted_answers_count integer not null default 0;

-- Keep follower/following counts in sync on the existing `follows` table.
create or replace function public.sync_follow_counts()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.student_stats set following_count = following_count + 1 where student_id = new.follower_id;
    update public.student_stats set followers_count = followers_count + 1 where student_id = new.following_id;
  elsif tg_op = 'DELETE' then
    update public.student_stats set following_count = greatest(0, following_count - 1) where student_id = old.follower_id;
    update public.student_stats set followers_count = greatest(0, followers_count - 1) where student_id = old.following_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_sync_follow_counts on public.follows;
create trigger trg_sync_follow_counts
  after insert or delete on public.follows
  for each row execute function public.sync_follow_counts();

-- ---------------------------------------------------------------------------
-- POSTS (text / image). Mirrors short_videos' shape and counter-trigger
-- pattern. Editing is intentionally not supported in Phase 1 (delete +
-- repost covers it) — keeps the RLS surface small.
-- ---------------------------------------------------------------------------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'text' check (type in ('text', 'image')),
  content text not null check (char_length(btrim(content)) > 0 and char_length(content) <= 2000),
  image_url text,
  tags text[] not null default '{}',
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  saves_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_posts_author on public.posts (author_id, created_at desc);
create index if not exists idx_posts_created on public.posts (created_at desc);

create trigger trg_posts_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

create or replace function public.sync_post_count()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.student_stats set posts_count = posts_count + 1 where student_id = new.author_id;
  elsif tg_op = 'DELETE' then
    update public.student_stats set posts_count = greatest(0, posts_count - 1) where student_id = old.author_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_sync_post_count on public.posts;
create trigger trg_sync_post_count
  after insert or delete on public.posts
  for each row execute function public.sync_post_count();

create table if not exists public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_comment_id uuid references public.post_comments(id) on delete cascade,
  comment text not null check (char_length(btrim(comment)) > 0 and char_length(comment) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_post_comments_post on public.post_comments (post_id, created_at);

create trigger trg_post_comments_updated_at
  before update on public.post_comments
  for each row execute function public.set_updated_at();

create table if not exists public.saved_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

create or replace function public.sync_post_like_count()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set likes_count = likes_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update public.posts set likes_count = greatest(0, likes_count - 1) where id = old.post_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_sync_post_like_count on public.post_likes;
create trigger trg_sync_post_like_count
  after insert or delete on public.post_likes
  for each row execute function public.sync_post_like_count();

create or replace function public.sync_post_comment_count()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set comments_count = comments_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update public.posts set comments_count = greatest(0, comments_count - 1) where id = old.post_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_sync_post_comment_count on public.post_comments;
create trigger trg_sync_post_comment_count
  after insert or delete on public.post_comments
  for each row execute function public.sync_post_comment_count();

create or replace function public.sync_post_save_count()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set saves_count = saves_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update public.posts set saves_count = greatest(0, saves_count - 1) where id = old.post_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_sync_post_save_count on public.saved_posts;
create trigger trg_sync_post_save_count
  after insert or delete on public.saved_posts
  for each row execute function public.sync_post_save_count();

-- ---------------------------------------------------------------------------
-- QUESTIONS / ANSWERS ("Ask & Solve"). `questions` has no UPDATE policy
-- granted to authenticated users below — is_resolved/accepted_answer_id can
-- ONLY change via accept_answer() (SECURITY DEFINER), the same pattern
-- already used for enrollments/lesson_progress elsewhere in this schema, so
-- a client can't fabricate "my answer was accepted" by calling
-- `.update()` directly.
-- ---------------------------------------------------------------------------
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(btrim(title)) > 0 and char_length(title) <= 300),
  description text check (description is null or char_length(description) <= 3000),
  subject text,
  topic text,
  image_url text,
  tags text[] not null default '{}',
  difficulty text not null default 'Beginner' check (difficulty in ('Beginner', 'Intermediate', 'Advanced')),
  answers_count integer not null default 0,
  views_count integer not null default 0,
  is_resolved boolean not null default false,
  accepted_answer_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_questions_created on public.questions (created_at desc);
create index if not exists idx_questions_subject on public.questions (subject);

create trigger trg_questions_updated_at
  before update on public.questions
  for each row execute function public.set_updated_at();

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(btrim(content)) > 0 and char_length(content) <= 3000),
  upvotes_count integer not null default 0,
  is_accepted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_answers_question on public.answers (question_id, created_at);

create trigger trg_answers_updated_at
  before update on public.answers
  for each row execute function public.set_updated_at();

alter table public.questions
  drop constraint if exists fk_questions_accepted_answer,
  add constraint fk_questions_accepted_answer foreign key (accepted_answer_id) references public.answers(id) on delete set null;

create table if not exists public.answer_upvotes (
  id uuid primary key default gen_random_uuid(),
  answer_id uuid not null references public.answers(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (answer_id, user_id)
);

create table if not exists public.saved_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, question_id)
);

create or replace function public.sync_answer_count()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.questions set answers_count = answers_count + 1 where id = new.question_id;
    update public.student_stats set answers_given_count = answers_given_count + 1 where student_id = new.author_id;
  elsif tg_op = 'DELETE' then
    update public.questions set answers_count = greatest(0, answers_count - 1) where id = old.question_id;
    update public.student_stats set answers_given_count = greatest(0, answers_given_count - 1) where student_id = old.author_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_sync_answer_count on public.answers;
create trigger trg_sync_answer_count
  after insert or delete on public.answers
  for each row execute function public.sync_answer_count();

create or replace function public.sync_answer_upvote_count()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.answers set upvotes_count = upvotes_count + 1 where id = new.answer_id;
  elsif tg_op = 'DELETE' then
    update public.answers set upvotes_count = greatest(0, upvotes_count - 1) where id = old.answer_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_sync_answer_upvote_count on public.answer_upvotes;
create trigger trg_sync_answer_upvote_count
  after insert or delete on public.answer_upvotes
  for each row execute function public.sync_answer_upvote_count();

-- ---------------------------------------------------------------------------
-- accept_answer: the ONLY way is_resolved/accepted_answer_id/is_accepted
-- can change. Verifies the caller owns the question, unaccepts any
-- previously-accepted answer, awards +50 XP to the answer's author
-- (idempotent — award_xp dedupes on (student, 'answer_accepted', answer_id),
-- so re-running this after un/re-accepting the same answer never double-pays),
-- and sweeps for newly-unlocked achievements.
-- ---------------------------------------------------------------------------
create or replace function public.accept_answer(p_answer_id uuid)
returns public.answers
language plpgsql
security definer set search_path = public
as $$
declare
  v_question_id uuid;
  v_answer_author uuid;
  v_question_owner uuid;
  v_previous_accepted uuid;
  v_result public.answers;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select question_id, author_id into v_question_id, v_answer_author
  from public.answers where id = p_answer_id;

  if v_question_id is null then
    raise exception 'Answer not found';
  end if;

  select author_id, accepted_answer_id into v_question_owner, v_previous_accepted
  from public.questions where id = v_question_id;

  if v_question_owner <> auth.uid() then
    raise exception 'Only the question owner can accept an answer';
  end if;

  if v_previous_accepted is not null and v_previous_accepted <> p_answer_id then
    update public.answers set is_accepted = false where id = v_previous_accepted;
  end if;

  update public.answers set is_accepted = true where id = p_answer_id returning * into v_result;
  update public.questions set is_resolved = true, accepted_answer_id = p_answer_id where id = v_question_id;

  perform public.award_xp(v_answer_author, 'answer_accepted', 50, p_answer_id::text);

  update public.student_stats
  set accepted_answers_count = (
    select count(*) from public.answers where author_id = v_answer_author and is_accepted = true
  )
  where student_id = v_answer_author;

  perform public.check_and_unlock_achievements(v_answer_author);

  return v_result;
end;
$$;

revoke all on function public.accept_answer(uuid) from public, anon;
grant execute on function public.accept_answer(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Extend the achievement system with Phase 1 social requirement types.
-- ---------------------------------------------------------------------------
alter table public.achievements drop constraint if exists achievements_requirement_type_check;
alter table public.achievements add constraint achievements_requirement_type_check check (requirement_type in (
  'total_xp', 'streak_days', 'courses_completed', 'lessons_completed', 'quizzes_completed',
  'accepted_answers_count', 'questions_asked_count', 'posts_count', 'followers_count'
));

create or replace function public.check_and_unlock_achievements(p_student_id uuid default auth.uid())
returns setof public.student_achievements
language plpgsql
security definer set search_path = public
as $$
declare
  v_stats public.student_stats;
begin
  if p_student_id is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_stats from public.student_stats where student_id = p_student_id;

  return query
  insert into public.student_achievements (student_id, achievement_id)
  select p_student_id, a.id
  from public.achievements a
  where (
    (a.requirement_type = 'total_xp' and v_stats.total_xp >= a.requirement_value) or
    (a.requirement_type = 'streak_days' and v_stats.current_streak >= a.requirement_value) or
    (a.requirement_type = 'courses_completed' and v_stats.courses_completed >= a.requirement_value) or
    (a.requirement_type = 'lessons_completed' and v_stats.lessons_completed >= a.requirement_value) or
    (a.requirement_type = 'accepted_answers_count' and v_stats.accepted_answers_count >= a.requirement_value) or
    (a.requirement_type = 'questions_asked_count' and v_stats.questions_asked_count >= a.requirement_value) or
    (a.requirement_type = 'posts_count' and v_stats.posts_count >= a.requirement_value) or
    (a.requirement_type = 'followers_count' and v_stats.followers_count >= a.requirement_value)
  )
  on conflict (student_id, achievement_id) do nothing
  returning *;
end;
$$;

-- Keep questions_asked_count in sync (separately from the achievements
-- function above, which only READS it).
create or replace function public.sync_question_count()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.student_stats set questions_asked_count = questions_asked_count + 1 where student_id = new.author_id;
  elsif tg_op = 'DELETE' then
    update public.student_stats set questions_asked_count = greatest(0, questions_asked_count - 1) where student_id = old.author_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_sync_question_count on public.questions;
create trigger trg_sync_question_count
  after insert or delete on public.questions
  for each row execute function public.sync_question_count();

insert into public.achievements (name, description, icon, category, rarity, requirement_type, requirement_value) values
  ('First Answer Accepted', 'Had an answer marked as accepted for the first time', 'check-circle', 'social', 'Common', 'accepted_answers_count', 1),
  ('Helpful Student', 'Had 5 answers accepted by other students', 'heart-handshake', 'social', 'Rare', 'accepted_answers_count', 5),
  ('Top Contributor', 'Had 25 answers accepted by other students', 'star', 'social', 'Epic', 'accepted_answers_count', 25),
  ('Curious Mind', 'Asked 10 questions', 'help-circle', 'social', 'Common', 'questions_asked_count', 10),
  ('Knowledge Sharer', 'Published 10 educational posts', 'book-open', 'social', 'Rare', 'posts_count', 10),
  ('Community Builder', 'Reached 10 followers', 'users', 'social', 'Common', 'followers_count', 10)
on conflict (name) do nothing;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security;
alter table public.saved_posts enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;
alter table public.answer_upvotes enable row level security;
alter table public.saved_questions enable row level security;

-- posts: public read (Phase 1 has no private profiles yet), author-only write.
create policy "posts_select_all" on public.posts for select using (true);
create policy "posts_insert_own" on public.posts for insert with check (author_id = auth.uid());
create policy "posts_delete_own" on public.posts for delete using (author_id = auth.uid() or public.is_admin());

create policy "post_likes_select_all" on public.post_likes for select using (true);
create policy "post_likes_insert_own" on public.post_likes for insert with check (user_id = auth.uid());
create policy "post_likes_delete_own" on public.post_likes for delete using (user_id = auth.uid());

create policy "post_comments_select_all" on public.post_comments for select using (true);
create policy "post_comments_insert_own" on public.post_comments for insert with check (user_id = auth.uid());
create policy "post_comments_update_own" on public.post_comments for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "post_comments_delete_own" on public.post_comments for delete using (user_id = auth.uid() or public.is_admin());

create policy "saved_posts_select_own" on public.saved_posts for select using (user_id = auth.uid());
create policy "saved_posts_insert_own" on public.saved_posts for insert with check (user_id = auth.uid());
create policy "saved_posts_delete_own" on public.saved_posts for delete using (user_id = auth.uid());

-- questions: public read; author-only insert; NO update policy for
-- authenticated users (see accept_answer() comment above) — delete allowed
-- for the author so an unanswered/wrong question can be retracted.
create policy "questions_select_all" on public.questions for select using (true);
create policy "questions_insert_own" on public.questions for insert with check (author_id = auth.uid());
create policy "questions_delete_own" on public.questions for delete using (author_id = auth.uid() or public.is_admin());

-- answers: public read; author-only insert; no update/delete policy for
-- authenticated users — an answer that's been accepted (and paid out XP)
-- shouldn't be retractable by its own author. Admin can still moderate.
create policy "answers_select_all" on public.answers for select using (true);
create policy "answers_insert_own" on public.answers for insert with check (author_id = auth.uid());
create policy "answers_delete_admin" on public.answers for delete using (public.is_admin());

create policy "answer_upvotes_select_all" on public.answer_upvotes for select using (true);
create policy "answer_upvotes_insert_own" on public.answer_upvotes for insert with check (user_id = auth.uid());
create policy "answer_upvotes_delete_own" on public.answer_upvotes for delete using (user_id = auth.uid());

create policy "saved_questions_select_own" on public.saved_questions for select using (user_id = auth.uid());
create policy "saved_questions_insert_own" on public.saved_questions for insert with check (user_id = auth.uid());
create policy "saved_questions_delete_own" on public.saved_questions for delete using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Storage bucket for post/question images, same pattern as
-- 011_storage.sql's short-videos/course-thumbnails buckets: public read,
-- write only into your own uid-prefixed folder.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

create policy "post_images_public_read" on storage.objects
  for select using (bucket_id = 'post-images');

create policy "post_images_own_write" on storage.objects
  for insert with check (bucket_id = 'post-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "post_images_own_update" on storage.objects
  for update using (bucket_id = 'post-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "post_images_own_delete" on storage.objects
  for delete using (bucket_id = 'post-images' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------------------------
-- Public profile visibility: `student_stats` and `student_achievements`
-- were originally select-own-only (010_rls.sql) — fine when only the owner
-- ever saw their own dashboard. The new public community profile
-- (StudentProfilePage.tsx) needs to show ANY student's level/XP/streak/
-- follower counts and unlocked badges, which is exactly what a public
-- profile is supposed to do (brief §1/§9) — so these two become public read.
-- No other table's policy changes; xp_activities (the raw ledger, more
-- granular than the stats snapshot) stays select-own-only.
-- ---------------------------------------------------------------------------
drop policy if exists "student_stats_select_own" on public.student_stats;
create policy "student_stats_select_all" on public.student_stats
  for select using (true);

drop policy if exists "student_achievements_select_own" on public.student_achievements;
create policy "student_achievements_select_all" on public.student_achievements
  for select using (true);
