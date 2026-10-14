-- 008_notifications_and_purchases.sql

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  message text,
  reference_id text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on public.notifications (user_id, created_at desc) where is_read = false;

-- course_purchases: the payment/order ledger. Rows are only ever
-- inserted/updated by the service_role (Edge Functions) — see 010_rls.sql.
-- `enrollments.payment_status` is only flipped to 'paid' once a matching
-- purchase row here is 'completed' (via the trusted verify_payment() RPC in
-- 009_functions.sql), never directly from the client.
create table if not exists public.course_purchases (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  provider text not null default 'sandbox',
  provider_order_id text not null unique,
  provider_payment_id text,
  amount numeric(10, 2) not null,
  currency text not null default 'INR',
  status public.purchase_status not null default 'created',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_course_purchases_student on public.course_purchases (student_id);
create index if not exists idx_course_purchases_course on public.course_purchases (course_id);

create trigger trg_course_purchases_updated_at
  before update on public.course_purchases
  for each row execute function public.set_updated_at();
