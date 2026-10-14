-- 001_extensions_and_enums.sql
-- Core extensions and shared enum types used across the Vormirix schema.

create extension if not exists "pgcrypto";

do $$ begin
  create type public.user_role as enum ('student', 'teacher', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.course_category as enum ('coding', 'math', 'physics', 'chemistry', 'career');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.video_category as enum ('coding', 'math', 'physics', 'chemistry', 'career', 'tips');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.difficulty_level as enum ('Beginner', 'Intermediate', 'Advanced');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.course_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.video_visibility as enum ('public', 'unlisted', 'private');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.enrollment_status as enum ('active', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('free', 'pending', 'paid', 'failed', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.purchase_status as enum ('created', 'pending', 'completed', 'failed', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.xp_activity_type as enum (
    'lesson_completed', 'quiz_completed', 'daily_login', 'course_completed', 'streak_bonus'
  );
exception when duplicate_object then null; end $$;

-- Reusable "touch updated_at" trigger function.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
