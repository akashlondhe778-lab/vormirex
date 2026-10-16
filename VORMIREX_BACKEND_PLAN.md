# Vormirex Backend + Supabase Integration Plan

Status: **PLANNING ONLY — no backend code has been written yet.** This document is the
output of Phase 1 (audit) and Phase 2 (plan) as requested. Implementation begins only
after this plan is reviewed and approved.

---

## 1. Current Architecture

**Frontend framework:** React 19 + TypeScript, bundled with Vite 6. Styling is Tailwind
CSS 4 (via `@tailwindcss/vite`), icons from `lucide-react`, animations from `motion`,
confetti effects from `canvas-confetti`, charts from `recharts`.

**Routing:** No router library (no `react-router`). `App.tsx` implements a hand-rolled
router using `useState<string>(currentRoute)` synced to `window.history.pushState` /
`popstate`. All page selection is `if (currentRoute === '/x')` conditional rendering
inside one giant component. This must be preserved as-is — do not introduce React
Router.

**State management:** Local component state only. `App.tsx` is the single source of
truth for `user`, `courses`, `videos`, and all modal-open flags, passed down as props.
There is no context, no Redux/Zustand, no query cache. This is the biggest
architectural gap for a real backend (see §9/§10 below).

**Current authentication:** None. It's a **persona-switcher**, not auth:
- `AuthPage.tsx` (route `/login`, `/signup`) and `AuthModal.tsx` (quick modal variant)
  both duplicate the same logic: a form that never validates credentials against
  anything, plus "1-click persona" buttons that just call `onLoginSuccess(mockUser)`.
- Submitting the credentials form builds a brand-new fake `UserProfile` client-side
  (`user-${Date.now()}`) with hardcoded starter XP/level values — it never checks if
  the email already exists, never hashes/verifies a password.
- Logout just does `setUser(null)`. Refreshing the page loses the session entirely
  (no persistence layer at all — not even localStorage).
- Role switching in the authenticated shell (`handleSwitchRole` in `App.tsx`) swaps
  between two hardcoded personas (`INITIAL_USER` / `TEACHER_USER`) — a dev/demo
  convenience with no analogue in a real app.

**Current API architecture:** None. `src/services/paymentService.ts` is the only
"service" in the codebase, and it's an in-memory `Map`-backed fake payment gateway
(simulated Razorpay order id / payment id / signature generation, `setTimeout` delays).
No `fetch`/`axios` calls anywhere, no REST or GraphQL client, no `.env` consumption for
any backend URL. `express` and `dotenv` are in `package.json` dependencies but there is
no `server.js`/`api/` directory — they're unused leftovers (the `clean` npm script even
references a `server.js` that doesn't exist).

**Current data sources:** Two static files:
- `src/data/mockData.ts` — `INITIAL_USER`, `TEACHER_USER`, testimonials, subjects,
  roadmap nodes, sample quizzes, badges, pricing plans, sample doubts.
- `src/data/edtechData.ts` — `INITIAL_COURSES` (with nested `lessons[]`),
  `INITIAL_SHORT_VIDEOS`, `MOCK_ACHIEVEMENTS`, `MOCK_XP_ACTIVITIES` (fixed 7-day XP
  series used to render the Recharts chart).

All of this is loaded into `App.tsx` state at startup and mutated in-memory only —
nothing survives a refresh.

**Important reusable components:**
- `App.tsx` — root shell, routing, all mutation handlers (XP gain, enroll, complete
  lesson, create course, upload video, payment success, etc.)
- `AppSidebar.tsx` / `AppTopBar.tsx` — authenticated nav shell (role-aware menu items)
- `StudentHome.tsx`, `StudentDashboard.tsx`, `MyLearning.tsx`, `AchievementsView.tsx`,
  `StudentProfile.tsx` — student-facing views
- `TeacherDashboard.tsx` — teacher-facing course/video/revenue tabs
- `CoursesCatalog.tsx`, `CourseDetailPage.tsx`, `CoursePlayer.tsx` — course
  browsing/detail/playback, with `isFreePreview` per-lesson gating already modeled
- `ReelsFeed.tsx` — TikTok-style vertical video feed with like/save/comment/follow UI
- `CreateCourseModal.tsx`, `UploadVideoModal.tsx` — teacher content creation forms
  (video source is currently a picklist of sample stock MP4 URLs, **not** a real file
  input — there is no file upload UI to adapt yet, only metadata forms)
- `PaymentModal.tsx` + `paymentService.ts` — fake Razorpay-style checkout
- `StatsSection.tsx` (public landing page) and the dashboard's inline `AreaChart` in
  `StudentDashboard.tsx` — two separate Recharts usages; only the dashboard one is the
  "StatsSection"-like per-student XP chart the task description refers to (the
  literal `StatsSection.tsx` component is platform-wide marketing stats, hardcoded,
  and used only on the public landing page — it is not backed by student data and
  should probably stay hardcoded/marketing copy, not wired to Supabase)
- `StudioModal.tsx`, `InteractiveHeroChat.tsx` — "AI Tutor" chat UI. Despite
  `@google/genai` being a dependency, **no code anywhere calls it** — chat responses
  are scripted/simulated with `setTimeout`. This is out of scope for this backend plan
  (no AI/Gemini requirement was specified) but is worth flagging: if/when it's wired
  up, it should go through a Supabase Edge Function, never call Gemini directly from
  the browser with a secret key.

**TypeScript types:** `src/types.ts` is already a clean, well-formed contract for
almost every entity we need to persist (`UserProfile`, `Course`, `Lesson`,
`ShortVideo`, `VideoComment`, `PaymentOrder`, `XPActivity`, `Achievement`, etc). The
backend/database design in this plan intentionally mirrors these shapes so the
frontend requires minimal changes.

**Environment variables:** `.env.example` currently only documents `GEMINI_API_KEY`
and `APP_URL` (leftovers from an AI Studio template this project was scaffolded from).
No Supabase variables exist yet.

**Existing backend/database code:** None found anywhere in the repo.

### ⚠️ Wiring inconsistency found during audit
`App.tsx` renders `<ReelsFeed videos={videos} user={user} onGainXp={...}
onOpenCourseDetail={...} onOpenDoubtSolver={...} onOpenUpload={...}
onSaveVideo={...} />`, but `ReelsFeed.tsx`'s actual prop interface is `{ videos,
courses, user, onLikeVideo, onSaveVideo, onAddComment, onFollowTeacher,
onNavigateToCourse, onShowToast }`. These do not match (missing `courses`,
`onLikeVideo`, `onAddComment`, `onFollowTeacher`, `onShowToast`; extra `onGainXp`,
`onOpenCourseDetail`, `onOpenDoubtSolver`, `onOpenUpload`). This will surface as a
TypeScript error once `strict`/prop-checking is enforced (dependencies aren't
installed in this environment yet, so `tsc` couldn't be run to confirm, but the
mismatch is visible by inspection). **This needs to be resolved when we wire
`ReelsFeed` to real data** — I'll reconcile the prop contract at that time rather than
guessing which side is "right," since fixing it is in scope for backend wiring anyway
(the feed's like/save/comment/follow actions need real handlers regardless).

---

## 2. Existing Features

| Feature | Status | Notes |
|---|---|---|
| Landing page | COMPLETE | Fully static marketing content, no backend needed beyond course previews |
| Login | PARTIAL | UI complete; no real auth, no persistence, no password check |
| Signup | PARTIAL | UI complete; creates a throwaway client-side user object only |
| Session persistence | MISSING | No storage of any kind; refresh = logged out |
| Feed (short videos) | PARTIAL | Full player/like/save/comment/follow UI exists but is wired to local array mutation only; prop contract mismatch noted above |
| Courses catalog | PARTIAL | Browsing/filtering UI complete, backed by static array |
| Course detail | PARTIAL | UI complete, static data |
| Course player / lesson progress | PARTIAL | Free-preview gating logic already exists client-side (`isLessonLocked`), completion just mutates local `completedLessonIds` array, XP given client-side with no idempotency check |
| Course creation (teacher) | PARTIAL | Full form UI, but lessons use picklist sample video URLs, not real uploads; submit just pushes into local state |
| Short video upload (teacher) | PARTIAL | Same pattern — metadata form only, no real file upload, no Storage |
| Student dashboard + XP chart | PARTIAL | Recharts wired to a **hardcoded 7-day array** (`MOCK_XP_ACTIVITIES`), not derived from any activity log |
| Teacher dashboard + analytics/revenue | PARTIAL | Revenue/enrollment chart uses a hardcoded `revenueData` array; "my courses" filter uses a fragile `c.teacherId === user.id || user.id === 'teacher-1'` fallback that will break for any teacher other than the demo persona |
| Achievements | PARTIAL | Full UI, backed by static `MOCK_ACHIEVEMENTS`, "unlocked" flags are hardcoded, not derived from actual student progress |
| Student profile | PARTIAL | Editable name/bio, but `onUpdateUser` only patches local React state |
| Payments | MOCK | `paymentService.ts` fakes an entire gateway client-side; "verification" is fully trusted from the browser — must not ship as-is |
| XP system | MISSING (as data model) | XP is awarded via `setUser` mutation with no `xp_activities`-style ledger, no de-dup, no server enforcement |
| Role-based access | PARTIAL (UI-only) | UI hides teacher-only buttons for students etc., but nothing is enforced — it's all trust-the-client |
| AI Tutor / doubt solver | MOCK, out of scope | Scripted chat, `@google/genai` unused; not part of this backend task |

---

## 3. Backend Requirements

1. Real authentication (replace the persona-switcher) — signup, login, logout,
   session restore on refresh, password reset.
2. A `profiles` table keyed to `auth.users.id`, created automatically on signup, with
   the role chosen at signup.
3. Server-authoritative XP: every XP-granting action must write an
   `xp_activities` row; `student_stats.total_xp` must be derived/maintained
   consistently, never blindly overwritten by the client.
4. Server-authoritative lesson completion (idempotent — completing the same lesson
   twice must not double-award XP), backed by `lesson_progress` with a unique
   `(student_id, lesson_id)` constraint.
5. Server-authoritative course access: free courses enroll instantly via a normal
   insert; paid courses only become accessible after a payment is verified
   server-side (Edge Function), never because the client says "payment succeeded."
6. CRUD for courses/lessons restricted to the owning teacher, with a `draft` →
   `published` → `archived` lifecycle.
7. CRUD for short videos restricted to the owning creator, with visibility rules.
8. Social graph (`follows`), engagement (`video_likes`, `video_comments`,
   `saved_videos`) with the correct uniqueness constraints described in the task
   (no double-likes, no self-follow).
9. Course reviews (1 rating per student per course, editable).
10. Achievements: a rules table + an "unlocked" join table, populated by trusted
    server logic (not the client flipping a boolean).
11. Notifications table for future use (likes, comments, new followers, course
    updates) — schema only, UI wiring can follow later since no notification UI
    exists in the frontend today.
12. File storage for avatars, video files, and thumbnails, replacing the current
    "pick from a list of stock MP4 URLs" placeholder in the upload/create forms.
13. A typed service layer (`src/services/*.ts`) so components stop needing to know
    about Supabase directly, matching the existing pattern set by
    `paymentService.ts` (which we will rewrite, not just leave in place, since it
    currently fabricates its own fake signatures — real payment verification must
    move server-side into an Edge Function).

---

## 4. Database Requirements (entities)

All tables below, exactly as specified in the task brief, mapped to the existing
TypeScript types where a direct analogue exists:

- `profiles` ← extends `UserProfile` (auth-linked)
- `student_stats` ← the numeric fields currently spread across `UserProfile`
  (`currentXp`→`total_xp`, `level`, `streakDays`→`current_streak`, +
  `longest_streak`, `learningHours`→`learning_hours`, `lessons_completed`,
  `courses_completed`)
- `xp_activities` ← new; backs the `XPActivity`-shaped weekly chart, but as an
  append-only ledger rather than the current fixed mock array
- `short_videos` ← `ShortVideo`
- `video_likes`, `video_comments` ← `VideoComment` + like relation (currently only
  `likesCount`/`isLiked` scalar fields exist on `ShortVideo`, no per-user row)
- `follows` ← `followingTeacherIds` currently modeled as an array on `UserProfile`;
  needs to become a real join table
- `saved_videos` ← `savedVideoIds` currently an array on `UserProfile`; becomes a
  join table
- `courses` ← `Course` (minus nested `lessons[]`, which becomes its own table)
- `course_lessons` ← `Lesson`
- `enrollments` ← `enrolledCourseIds` array becomes a real table with status/payment
  status
- `lesson_progress` ← `completedLessonIds` array becomes a real table with
  watched-seconds tracking (richer than current boolean-only model)
- `course_reviews` ← new; `Course.rating`/`reviewCount` become derived aggregates
- `achievements`, `student_achievements` ← `Achievement`/`MOCK_ACHIEVEMENTS` become
  a rules table + unlock ledger
- `notifications` ← new, no current UI, schema-only for now
- `course_purchases` ← backs `PaymentOrder`, replacing the fully-client-side
  `paymentService.ts`

Full column-level DDL is in §Phase 4 migrations (to be written in
`supabase/migrations/` once this plan is approved).

---

## 5. API / Service Requirements

Service layer under `src/services/`, one file per domain, mirroring
`paymentService.ts`'s existing pattern:

- `supabaseClient.ts` — single client instance, reads `VITE_SUPABASE_URL` /
  `VITE_SUPABASE_ANON_KEY`
- `authService.ts` — signUp, signIn, signOut, getSession, onAuthStateChange,
  resetPassword
- `profileService.ts` — get/update own profile, get public profile by id
- `videoService.ts` — list feed (paginated, category filter), create (teacher),
  like/unlike, save/unsave, comment, increment view count
- `courseService.ts` — list/search catalog, get by id, create/update/publish
  (teacher, ownership-checked), delete
- `lessonService.ts` — CRUD lessons under a course (teacher, ownership-checked),
  reordering
- `enrollmentService.ts` — enroll free, get "my courses", check access
- `progressService.ts` — mark lesson complete (idempotent), get progress for a
  course
- `xpService.ts` — award XP (called only by other trusted service functions /
  Edge Functions, not directly from arbitrary UI), get weekly XP series for charts
- `achievementService.ts` — list achievements + unlock status for current user
- `notificationService.ts` — schema-ready, minimal for now
- `paymentService.ts` — **rewritten**: create order via Edge Function, redirect to
  real gateway (or keep a clearly-labeled sandbox mode), verify via Edge Function
  webhook/callback, never trust a client-side "success" flag to create the
  enrollment

Components call these services (directly or via the hooks in §6) instead of
containing Supabase queries inline — same principle the codebase already sort-of
follows with `paymentService.ts`, just extended consistently everywhere else.

---

## 6. React Hooks

Since the project has zero existing data-fetching hooks (everything is prop-drilled
from `App.tsx`), we'll introduce a small, focused set — not a full rewrite of the
state architecture:

- `useAuth()` — wraps `authService`, exposes `{ user, profile, loading, signIn,
  signUp, signOut }`, replacing `App.tsx`'s local `user` state + the persona-login
  handlers
- `useStudentStats(studentId)` — live XP/level/streak, replaces the numeric fields
  currently baked into `UserProfile`
- `useWeeklyXp(studentId)` — feeds the dashboard `AreaChart`, replacing
  `MOCK_XP_ACTIVITIES`
- `useCourses()` / `useCourse(id)` — catalog + detail
- `useEnrollment(courseId)` — access check + enroll action
- `useLessonProgress(courseId)` — replaces `completedLessonIds` array logic in
  `CoursePlayer`
- `useFeed()` — replaces the raw `videos` prop in `ReelsFeed`
- `useAchievements()` — replaces `MOCK_ACHIEVEMENTS`

`App.tsx` keeps owning **routing state** (no reason to touch the hand-rolled router)
but stops owning **data state** — that moves into these hooks, called from the leaf
components that need them. This is the minimum-diff way to decouple data from the
existing prop-drilling without a UI rewrite.

---

## 7. Authentication Requirements

- `AuthPage.tsx` and `AuthModal.tsx` keep their exact current layout/fields. Only the
  `handleSubmit`/`handleSubmitCustom` internals change:
  - Signup: `supabase.auth.signUp({ email, password })` → on success, insert a
    `profiles` row with `{ id: authUser.id, full_name, role: roleInput }` → call
    `onLoginSuccess` with the hydrated profile.
  - Login: `supabase.auth.signInWithPassword({ email, password })` → fetch
    `profiles` row → `onLoginSuccess`.
  - Password reset: wire the existing "Forgot Password?" `alert()` stub in
    `AuthModal.tsx` to `supabase.auth.resetPasswordForEmail`.
- The **"1-click persona" buttons** are a demo/dev convenience with no real backend
  equivalent (they don't correspond to real credentials). Recommend removing them or
  gating them behind a `VITE_ENABLE_DEMO_LOGIN` flag once real auth exists — flagging
  this as a decision for the user rather than silently ripping out UI.
- Session restore: `App.tsx` currently initializes `user` to `null` unconditionally.
  Add a startup effect that calls `supabase.auth.getSession()` +
  `onAuthStateChange` so a refresh keeps the user logged in — this is a **new**
  behavior (today refresh always logs out), called out since it changes visible
  behavior even though it's clearly desired.
- Redirect-by-role on login already exists in `App.tsx`
  (`handleLoginSuccess`) — no change needed there, just feed it a real profile.
- Passwords: never touch `profiles` table; Supabase Auth owns credentials entirely.

---

## 8. Security Requirements

- **RLS enabled on every table above**, default-deny.
- **profiles**: select — public read of non-sensitive columns (name, avatar,
  bio, role) for anyone; update — only `auth.uid() = id`.
- **student_stats / xp_activities / lesson_progress**: select/insert/update — only
  `auth.uid() = student_id`; inserts that grant XP happen through
  `SECURITY DEFINER` Postgres functions or Edge Functions, not raw client inserts,
  so a student can't `insert into xp_activities` with an arbitrary amount.
- **short_videos**: select — respects `visibility` column (public vs
  unlisted/private); update/delete — only `auth.uid() = creator_id`.
- **video_likes / saved_videos / follows**: insert/delete — only as self
  (`auth.uid() = user_id` / `follower_id`); unique constraints prevent duplicate
  likes/follows and self-follow (`CHECK (follower_id <> following_id)`).
- **courses**: select — `status = 'published'` for everyone, plus own drafts for the
  owning teacher; insert/update/delete — only `auth.uid() = teacher_id`.
- **course_lessons**: select — `is_preview = true` OR (has active paid/free
  enrollment) OR is the owning teacher; write — only owning teacher.
- **enrollments**: select/insert — only as self; **no client-side update of
  `payment_status`** — that column is only ever written by a `SECURITY DEFINER`
  function invoked from the payment-verification Edge Function.
- **course_purchases**: select — only own purchases (student) or purchases of own
  courses (teacher, aggregated/anonymized for revenue); insert/update — service
  role only (Edge Function), never anon/authenticated client.
- **course_reviews**: insert/update — only as self, one row per
  `(student_id, course_id)` (unique constraint + upsert for "editing"); rating
  `CHECK (rating BETWEEN 1 AND 5)`.
- **achievements**: read-only to all; **student_achievements**: insert only via
  trusted function (server decides when a milestone is hit), unique
  `(student_id, achievement_id)`.
- Ownership checks (`teacher_id = auth.uid()`) protect against a teacher editing
  another teacher's courses/lessons/revenue, matching Phase 6's role matrix exactly.
- Admin role: reserve `role = 'admin'` in `profiles.role` CHECK constraint now; no
  admin-only tables/policies needed yet since there's no admin UI, but RLS policies
  will be written so `role = 'admin'` bypasses ownership checks where relevant
  (future-proofing per the task's explicit instruction, not gold-plating for its own
  sake).

---

## 9. Migration Plan (mock data → Supabase, without breaking the UI)

The key insight from the audit: **`src/types.ts` interfaces are already close to the
target DB shape**, so the plan is "swap the data source under stable prop shapes,"
not "redesign components."

1. Stand up Supabase project + run all migrations + seed `courses`/`course_lessons`/
   `short_videos` with the *exact same content* currently in
   `INITIAL_COURSES`/`INITIAL_SHORT_VIDEOS`, so the catalog looks identical on day
   one.
2. Introduce `supabaseClient.ts` + `.env` (local only, gitignored — already covered
   by the existing `.env*` / `!.env.example` gitignore rule) without touching any
   component yet.
3. Swap auth first (`AuthPage`, `AuthModal`, `App.tsx`'s `user` state) behind
   `useAuth()`. Verify login/signup/logout/refresh-persistence before touching
   anything else.
4. Swap read paths next (`useCourses`, `useFeed`) — components keep receiving
   `Course[]`/`ShortVideo[]`-shaped props, just sourced from Supabase instead of the
   static arrays. UI should be pixel-identical.
5. Swap write paths one at a time, in the order they're least risky to verify
   manually: profile edit → lesson completion/XP → free enrollment → course/video
   creation → paid checkout (last, since it's the highest-stakes correctness
   requirement).
6. Only after all reads/writes are live, delete `src/data/mockData.ts` and
   `src/data/edtechData.ts` (keep them until then as a fallback reference / for
   local dev without a Supabase project configured, if useful — decide at that
   point based on whether a "demo mode" is still wanted).
7. Resolve the `ReelsFeed` prop-contract mismatch as part of step 4, since wiring
   real like/save/comment/follow handlers forces the interface to be reconciled
   anyway.

At every step: keep the component's external prop shape stable so JSX in `App.tsx`
needs minimal/no edits — this satisfies "don't rebuild the frontend" while still
replacing every mock data source.

---

## 10. Open Decisions For You

Before I start writing migrations/services, a few things worth confirming rather
than me guessing:

1. **Demo persona buttons** in `AuthPage`/`AuthModal` — remove, or keep behind a
   dev-only flag?
2. **Payment gateway** — do you have a real Razorpay (or other) account to
   integrate, or should the Edge Function implement a clearly-labeled sandbox
   verifier for now (same UX, but server-side-verified instead of client-faked)?
3. **File uploads** — `CreateCourseModal`/`UploadVideoModal` currently only offer a
   picklist of stock sample MP4s with no `<input type="file">`. Do you want me to
   add real file-picker UI as part of this backend work (needed to actually use
   Supabase Storage), or keep the picklist for now and just persist whichever URL
   is chosen?
4. **`src/data/*.ts` retirement** — delete once Supabase is fully wired, or keep as
   an offline/demo fallback?

Once you confirm these (or tell me to just use my best judgment), I'll proceed to
Phase 3 onward: Supabase client setup → schema migrations → RLS → auth wiring →
services/hooks → replacing mock data path-by-path, in the order laid out in §9.

---

## 11. Implementation Status

You said "yes" to proceeding — the decisions in §10 were made as follows, and
Phases 3–16 (schema through storage) are implemented. See `README.md` for
setup steps.

**Decisions made:**
1. **Demo persona buttons** — kept, but rewired to sign in with two real
   seeded Supabase Auth accounts (`scripts/seed-demo-data.ts`) instead of
   fabricating a client-side session. `handleSwitchRole` in `App.tsx` now
   signs into the other seeded account rather than swapping a hardcoded object.
2. **Payment gateway** — no real account configured, so
   `supabase/functions/verify-payment/index.ts` runs in a clearly-labeled
   sandbox mode: it still moves verification server-side (closing the
   original hole where the browser could self-report success), but always
   succeeds since there's no real gateway to check against yet. Swapping in
   a real gateway only requires editing that one function.
3. **File uploads** — left as-is (picklist of sample video URLs in
   `CreateCourseModal`/`UploadVideoModal`) since no file `<input>` existed in
   the original UI and adding one is a UI change beyond "wire the backend."
   `storageService.ts` and the Storage buckets/policies (`011_storage.sql`)
   are fully built and ready — swapping the picklist for a real file input
   only requires calling `storageService.upload(...)` in those two modals.
4. **Mock data files** — kept. `src/data/edtechData.ts` and `mockData.ts` are
   no longer imported by any live component, but now serve as the seed
   source for `scripts/seed-demo-data.ts`, so the seeded catalog matches
   what the UI originally shipped with.

**What's built:**
- Full schema + RLS + trusted RPCs (`supabase/migrations/001`–`012`) —
  profiles, student_stats, xp_activities, courses, course_lessons,
  enrollments, lesson_progress, short_videos + social graph, course_reviews,
  achievements, notifications, course_purchases.
- Real Supabase Auth wired into `AuthPage`, `AuthModal`, and `App.tsx`
  (`src/hooks/useAuth.ts`) — session persists across refresh.
- Service layer (`src/services/*.ts`) for every domain in §5, plus mapper
  functions (`mappers.ts`) that convert DB rows back into the existing
  `src/types.ts` shapes so components didn't need UI rewrites.
- Server-authoritative XP (`award_xp`), idempotent lesson completion
  (`complete_lesson`), free enrollment (`enroll_free_course`), and
  payment verification (`create_payment_order` + `finalize_payment`, called
  only from the Edge Function) — all per §12/§14's "never trust the client"
  requirement.
- `StudentDashboard`'s XP chart and `AchievementsView`/`StudentProfile`'s
  achievement grids now read real data via `useWeeklyXp`/`useAchievements`
  instead of `MOCK_XP_ACTIVITIES`/`MOCK_ACHIEVEMENTS`.
- Fixed the `ReelsFeed` prop-contract bug found during the audit — `App.tsx`
  now passes real `onLikeVideo`/`onSaveVideo`/`onAddComment`/`onFollowTeacher`
  handlers backed by `videoService`.
- `TeacherDashboard` now filters by real `teacher_id` (was a demo-only
  fallback matching `user.id === 'teacher-1'`), and reads from a dedicated
  `useTeacherCourses` hook so drafts (not just published courses) show up.
- `npx tsc --noEmit` and `npm run build` both pass clean.

**Known gaps / next steps:**
- Paid course video files sit in the private `course-videos` bucket with
  signed-URL support in `storageService.getSignedUrl()`, but `CoursePlayer`
  still reads `lesson.videoUrl` directly rather than requesting a signed URL
  — fine as long as lesson videos stay on external sample URLs (as today),
  but needs wiring before real private video files are uploaded there.
- Real payment gateway integration (see decision #2 above).
- Real file upload UI (see decision #3 above).
- `notifications` table has no producer yet (nothing inserts rows) since no
  notification UI exists in the frontend — schema-only, as scoped in §3.
- AI Tutor / doubt solver remains a scripted mock (`StudioModal.tsx`,
  `@google/genai` unused) — explicitly out of scope for this backend task.

## 12. Development-mode auth behavior (temporary)

Per explicit instruction, `/app/*` routes are **not** gated behind a login
redirect during development — the app must be freely navigable while the
backend is being built and tested.

- The old `useEffect` in `App.tsx` that force-navigated to `/login` (with a
  toast) whenever an unauthenticated visitor hit `/app/*` has been removed.
- Instead, `src/hooks/useAuth.ts` contains one clearly-isolated function,
  `attemptDevAutoLogin()`, gated by `import.meta.env.DEV` (stripped from
  production builds by Vite). On mount, if there's no real Supabase session,
  it silently signs into the seeded demo **student** account
  (`scripts/seed-demo-data.ts`) via real `supabase.auth.signInWithPassword`
  — not a fabricated client-side object — so `user` is populated with a
  real, RLS-respecting session and every `/app/*` route renders normally
  with no guard needed.
- If the demo account hasn't been seeded yet, it fails closed (console
  warning, stays logged out) rather than crashing — the existing Login page
  still works normally for a manual/real sign-in in that case.
- `App.tsx` shows a brief "Loading Vormirex..." state (existing color
  tokens only, no new design) while this resolves, so a direct link to an
  `/app/*` route doesn't flash the public marketing page first.

**To re-enable production auth gating later:** delete
`attemptDevAutoLogin()` and its one call site in `useAuth.ts`, and re-add a
route guard in `App.tsx` (the removed code is described in the comment left
at the guard's old location). Nothing else needs to change — RLS policies
were never relaxed for dev mode, only this client-side navigation
convenience.

## 13. Student/Teacher account separation

Per explicit instruction, Student and Teacher became fully separate account
types instead of one session with an in-app "Switch to Teacher View" toggle.

**What changed:**

- **Login UI** (`AuthPage.tsx`, `AuthModal.tsx`): a "How do you want to
  continue?" Student/Teacher chooser is now shown for both Sign In and
  Create Account (previously only shown for signup). The demo "1-click
  persona" list filters to only the persona matching the selected tab.
- **Role mismatch is rejected, not silently accepted**: after a successful
  `signInWithPassword`, `assertRoleOrSignOut()` (duplicated in both auth
  components — small enough that a shared hook wasn't worth it) compares the
  real `profiles.role` from the database against the tab the visitor picked.
  A mismatch immediately signs them back out and shows "This account is
  registered as a {Teacher|Student}. Please use {Teacher|Student} Login
  instead." — so picking the wrong tab can never land someone in the wrong
  dashboard, even for a split second.
- **No in-app role switch**: `handleSwitchRole` (App.tsx), the sidebar
  "Switch to Teacher Studio" button, and the profile dropdown's "Switch to
  Teacher/Student View" entries are all removed. The profile dropdown
  (`AppTopBar.tsx`) now renders two genuinely different menus — Student gets
  My Profile & Stats / My Learning; Teacher gets Teacher Profile / My
  Courses / Analytics — with no shared "switch" affordance between them.
  (A "Students" roster item was explicitly requested but doesn't exist as a
  page anywhere in the app yet — omitted rather than inventing a new page,
  per the "don't redesign" instruction; the closest existing surface is the
  student-count stat already on the Teacher Dashboard overview.)
- **Route separation**: existing route *prefixes* were kept
  (`/app/*` = student area, `/app/teacher/*` = teacher area) rather than
  renaming to `/student/*`/`/teacher/*`, to minimize the diff — this already
  satisfies "separate route namespaces," just under the URLs the app already
  used. A new effect in `App.tsx` redirects a Student away from any
  `/app/teacher/*` URL (back to `/app`) and a Teacher away from any
  student-only `/app/*` URL (to `/app/teacher`), each with a toast. This is
  a UX convenience only — see below for the real boundary. `/app/profile` is
  the one intentionally shared route (both role menus link to it).
- **Backend authorization** (`supabase/migrations/013_role_security.sql`) —
  the part that actually matters, since frontend route guards alone are
  trivially bypassed:
  - `profiles.role` is now immutable from the client. Previously
    `profiles_update_own` allowed updating *any* column on your own row,
    which meant a Student could run
    `supabase.from('profiles').update({ role: 'teacher' })` from the browser
    console and self-promote. A new `prevent_role_self_change` trigger
    rejects any update that changes `role` unless the caller is
    `service_role`.
  - `courses_insert_own` / `videos_insert_own` previously only checked
    *ownership* (`teacher_id`/`creator_id = auth.uid()`), never that the
    caller actually held the teacher role — a Student account could insert
    a course/video row naming themselves as the teacher/creator. Both
    policies now also require a new `is_teacher_or_admin()` check.
  - This closes the literal case this task's instructions warned about:
    "A Student must never be able to access Teacher-only APIs... Frontend
    cannot grant itself Teacher permissions" — that's now enforced at the
    database layer regardless of what the client sends.

**Existing users are unaffected** — `role` was already set once at signup
by the `handle_new_auth_user` trigger and was never meant to change; this
migration only makes that already-intended behavior impossible to bypass.
No data migration was needed.

## 14. Student Social Learning & Community (Phase 1 of 3)

The full brief (public profiles, follow system, multi-type posts, 4-tab
feed, Q&A with accepted answers, study groups, XP/levels, notifications,
discovery, hashtags, moderation, admin tooling) is realistically 15+ tables
and a dozen+ screens. Rather than build all of it untested in one pass, it
was split into three phases (confirmed with the user) and **this pass
builds Phase 1 only** — the actual learning loop the rest of the product
depends on:

- Public student profiles (bio, location, education level, interests,
  follower/following/post counts, XP/level/streak, contribution stats)
- Follow / unfollow (reuses the existing generic `follows` table from
  006_short_videos_and_social.sql — it was never video-specific)
- Posts: text and image, with likes/comments/saves
- Feed: Following and For You tabs (For You is reverse-chronological for
  now — real ranking/personalization is Phase 2+)
- "Ask & Solve": questions with subject/topic/difficulty/tags, multi-student
  answers, upvotes, and an accepted-answer flow that pays +50 XP
- New achievements tied to accepted answers / questions asked / posts /
  followers, using the same `check_and_unlock_achievements()` function
  already built for course-completion achievements

**Deferred to Phase 2:** hashtags/tag pages, global search, "discover
students," study groups, private profiles & follow requests.
**Deferred to Phase 3:** notifications UI (the `notifications` table has
existed since the original backend build but never had a producer or UI),
reports/blocks/mute + admin moderation, polls/carousels/achievement-share
post types, infinite scroll + skeleton-loader polish.

**New migrations:** `014_xp_activity_types.sql` (adds the `answer_accepted`
XP event — split into its own file because Postgres won't let a new enum
value be used in the same transaction that adds it), `015_social_community.sql`
(all Phase 1 tables, RLS, counters, and the `accept_answer()` trusted RPC).
**You need to run both, in order**, the same way as every prior migration —
SQL editor, paste, Run.

**Security notes specific to this phase:**
- `questions`/`answers` have **no update policy at all** for authenticated
  users (same pattern as `enrollments`/`lesson_progress`) — `is_resolved`,
  `accepted_answer_id`, and `is_accepted` can only change via
  `accept_answer()`, which verifies the caller owns the question before
  doing anything. A student can't fabricate "my answer was accepted" by
  calling `.update()` directly.
- `accept_answer()` is idempotent — `award_xp()`'s existing dedupe (on
  `(student, activity_type, reference_id)`) means re-accepting the same
  answer never double-pays. Un-accepting and accepting a *different* answer
  does NOT claw back the first answer's XP — documented as a known Phase 1
  simplification rather than hidden, since building XP reversal wasn't worth
  the complexity for an edge case this rare.
- No XP is awarded for merely posting, answering, liking, or following —
  only for an answer actually being accepted, per the brief's own "avoid
  meaningless engagement" / "not pay-to-win" principles.
- `student_stats` and `student_achievements` were select-own-only before
  this phase (fine when only a private dashboard read them). Both are now
  public-read, since a public profile showing someone's level/XP/streak/
  badges is the entire point of this feature — `xp_activities` (the
  granular ledger) stays select-own-only.
- New `post-images` Storage bucket, same public-read/own-folder-write
  pattern as every other bucket in 011_storage.sql.

**New frontend surface:** `src/components/community/` (CommunityPage,
PostCard, CreatePostModal, AskDoubtModal, QuestionCard, QuestionDetailPage,
StudentProfilePage, FollowListModal), new services (`communityService.ts`,
`qnaService.ts`, `socialProfileService.ts`), routes `/app/community`,
`/app/community/question`, `/app/community/profile` (selected
question/profile held in `App.tsx` state, same pattern as `selectedCourse`
— this router has no URL param support, so "detail view" pages have always
worked this way). A "Community Profile" link was added to the existing
`StudentProfile.tsx` (private dashboard) linking to the new public profile;
the two intentionally stay separate pages since they serve different
purposes (learning stats vs. social identity).

**Not yet tested against a live database** — I can't execute SQL directly
against your Supabase project from here, only via the SQL editor you run
yourself. Run the two new migrations, then re-seed or create a second demo
account to test following/answering between two real users, since the
single seeded demo student can't follow or answer itself.

## 15. Official Achievements, Projects, Usernames, Video Posts (Phase 1b)

A follow-up request largely re-specified Phase 1's profile section in much
more detail, but added one genuinely new, well-specified concept worth
calling out: **official certificates**, distinct from the existing
rule-based `achievements` badges.

- `achievements`/`student_achievements` (Phase 1a) = auto-unlocked badges
  from simple threshold rules ("5 accepted answers", "10 followers") — no
  per-award identity, can't carry a score or a verification code.
- `course_certificates` (new, `016_achievements_projects.sql`) = one row
  per (student, course), auto-issued by `issue_course_certificate()` only
  when a course both has `certificate_available = true` and the student has
  actually completed it (re-verified server-side, not trusted from the
  caller) — wired into the existing `complete_lesson()` RPC so it happens
  automatically the moment a course is finished, no extra client call
  needed. Each has a generated verification code (`VORM-{CAT}-{YEAR}-{hex}`)
  and is immutable from the client — no update/delete policy exists for
  authenticated users at all.
- **Score is left `null`** — there's no quiz/assessment-scoring system
  anywhere in this codebase, so "Score: 92%" from the brief's example isn't
  computable yet. The column exists for when real graded assessments do.
- **Achievement sharing**: a post can optionally reference a certificate
  via `posts.certificate_id`. The student can write/edit their own caption
  freely, but the certificate facts it points to (course, code, issued
  date) live in a table they have no write access to at all — satisfies
  "student can edit the caption but not the achievement data."

**Also added:** username claiming (format-checked, unique — reuses the
column that already existed since 002_profiles.sql but was never surfaced
in any UI), a `projects` table + showcase UI (public portfolio, own-only
write), video as a `posts.type` (reuses all of Phase 1a's likes/comments/
saves infrastructure instead of a parallel short-video system), and a
"Copy Profile Link" button with `?u=username` deep-link resolution on load.

**Still deferred**, same as before: Discover/recommendations, notifications
UI, privacy toggles, moderation/block/report, polls, mentions, QR sharing.

**New migration:** `016_achievements_projects.sql` — run it after 014/015,
same process (SQL editor, paste, Run). It recreates `complete_lesson()` in
full (adding one line to call `issue_course_certificate()`), so make sure
015 has already run first.
