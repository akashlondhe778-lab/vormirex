-- seed.sql
-- Static reference data only (no auth.users dependency, safe to run via the
-- SQL editor or `supabase db reset`). Demo accounts + sample courses/videos
-- are seeded separately by `scripts/seed-demo-data.ts` (needs the service
-- role key to create real auth.users rows) — run `npm run seed` for that.

insert into public.achievements (name, description, icon, category, rarity, requirement_type, requirement_value) values
  ('First Steps', 'Complete your first lesson', 'footprints', 'course', 'Common', 'lessons_completed', 1),
  ('Quiz Ace', 'Reach 500 total XP', 'zap', 'xp', 'Common', 'total_xp', 500),
  ('Study Streak: 7 Days', 'Maintain a 7-day study streak', 'flame', 'streak', 'Rare', 'streak_days', 7),
  ('Study Streak: 30 Days', 'Maintain a 30-day study streak', 'flame', 'streak', 'Epic', 'streak_days', 30),
  ('Course Finisher', 'Complete your first full course', 'graduation-cap', 'course', 'Rare', 'courses_completed', 1),
  ('Masterclass Collector', 'Complete 5 full courses', 'trophy', 'course', 'Epic', 'courses_completed', 5),
  ('XP Grinder', 'Reach 5,000 total XP', 'trending-up', 'xp', 'Epic', 'total_xp', 5000),
  ('Quantum Overlord', 'Reach 20,000 total XP', 'award', 'xp', 'Legendary', 'total_xp', 20000),
  ('Lesson Marathon', 'Complete 50 lessons', 'book-open', 'course', 'Rare', 'lessons_completed', 50)
on conflict (name) do nothing;
