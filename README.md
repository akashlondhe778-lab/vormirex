# Vormirix

An EdTech platform: short-form educational video feed, course marketplace with
paid/free masterclasses, XP/gamification, and separate student/teacher portals.

Frontend: React 19 + TypeScript + Vite + Tailwind CSS 4.
Backend: Supabase (PostgreSQL + Auth + Storage + Edge Functions). See
[VORMIRIX_BACKEND_PLAN.md](./VORMIRIX_BACKEND_PLAN.md) for the full backend
architecture and design rationale.

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com), then
   copy `.env.example` to `.env` and fill in your project's URL + anon key
   (Project Settings → API).

3. **Run the database migrations** — in the Supabase Dashboard SQL editor,
   run each file in `supabase/migrations/` in numeric order (or via the
   Supabase CLI: `supabase db push` after `supabase link`). Then run
   `supabase/seed.sql` for the static achievement definitions.

4. **Deploy the payment verification Edge Function**

   ```bash
   supabase functions deploy verify-payment
   ```

   It runs in sandbox mode (no real gateway credentials needed) until you set
   `PAYMENT_GATEWAY_KEY_SECRET` via `supabase secrets set` — see the header
   comment in `supabase/functions/verify-payment/index.ts`.

5. **Seed demo data** (two real Supabase Auth accounts + the sample course/
   video catalog, reusing `src/data/edtechData.ts` so it matches what the UI
   originally shipped with):

   ```bash
   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed
   ```

   The service role key is only needed for this one-time seed script — never
   put it in `.env` / commit it / use it from the browser.

6. **Run the app**

   ```bash
   npm run dev
   ```

   Sign in with one of the seeded demo accounts from the login page's
   "1-click persona" buttons (password: `Vormirix-Demo-2026`, or whatever you
   set `DEMO_ACCOUNT_PASSWORD` to), or sign up with your own credentials.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build |
| `npm run lint` | Type-check with `tsc --noEmit` |
| `npm run seed` | Seed demo Supabase Auth accounts + sample courses/videos |

## Project structure

```
src/
  components/       UI (unchanged by the backend integration — see the plan doc)
  hooks/            useAuth, useCourses, useFeed, useXP, useAchievements, ...
  services/         Supabase-backed service layer (auth, courses, videos, XP, payments, ...)
  data/             Original mock data — now used as the seed source for scripts/seed-demo-data.ts
supabase/
  migrations/       Schema + RLS + trusted RPCs, numbered and applied in order
  functions/        Edge Functions (verify-payment)
  seed.sql          Static reference data (achievement definitions)
scripts/
  seed-demo-data.ts Creates real demo accounts + seeds the course/video catalog
```
