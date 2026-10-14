/** Turns a caught auth error into an accurate user-facing message instead of
 * always assuming "account not seeded" — that message was misleading for a
 * real connectivity failure (e.g. a paused/deleted Supabase project), which
 * throws a network-level fetch error, not an auth error. */
export function describeAuthError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);

  if (/failed to fetch|networkerror|load failed|fetch/i.test(message)) {
    return "Can't reach Supabase right now — check that the project is running (not paused) at supabase.com/dashboard, and that VITE_SUPABASE_URL in .env is correct.";
  }

  if (/invalid login credentials/i.test(message)) {
    return 'Demo account not seeded yet — run `npm run seed`, or sign up with your own credentials below.';
  }

  return message || 'Sign-in failed. Please try again.';
}
