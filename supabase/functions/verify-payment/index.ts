// Supabase Edge Function: verify-payment
//
// Runs server-side with the service role key (never exposed to the browser).
// This is the ONLY place allowed to mark a course_purchases row 'completed'
// and activate a paid enrollment — see finalize_payment() in
// supabase/migrations/009_functions.sql, which this function is the sole
// caller of.
//
// Deploy: supabase functions deploy verify-payment
// Secrets (set via `supabase secrets set`, never in frontend .env):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (both auto-injected by Supabase)
//   PAYMENT_GATEWAY_KEY_SECRET  — only needed once a real gateway is wired up
//
// SANDBOX MODE (current state — no real gateway credentials configured):
// accepts the order + a chosen payment method and marks it completed
// unconditionally. This still closes the original security hole (the
// browser can no longer directly write 'paid' into the database), even
// though there's no real money movement to verify yet. Swap the
// `verifyWithGateway()` body below for a real signature check against your
// gateway's API once credentials exist — nothing else in this function, nor
// any RLS policy, needs to change.

import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req: Request) => {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ success: false, error: 'Missing Authorization header' }, 401);
    }

    const { orderId, paymentMethod } = await req.json();
    if (!orderId || !paymentMethod) {
      return jsonResponse({ success: false, error: 'orderId and paymentMethod are required' }, 400);
    }

    // Client used only to resolve *who* is calling (RLS still applies here,
    // so this can only read the caller's own purchase rows).
    const callerClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData, error: userError } = await callerClient.auth.getUser();
    if (userError || !userData.user) {
      return jsonResponse({ success: false, error: 'Not authenticated' }, 401);
    }

    const { data: purchase, error: purchaseError } = await callerClient
      .from('course_purchases')
      .select('*')
      .eq('provider_order_id', orderId)
      .single();

    if (purchaseError || !purchase) {
      return jsonResponse({ success: false, error: 'Order not found' }, 404);
    }
    if (purchase.student_id !== userData.user.id) {
      return jsonResponse({ success: false, error: 'Order does not belong to this user' }, 403);
    }
    if (purchase.status === 'completed') {
      return jsonResponse({ success: true, paymentId: purchase.provider_payment_id, alreadyCompleted: true });
    }

    const verification = await verifyWithGateway(purchase, paymentMethod);

    // service_role client — the only credential permitted to call
    // finalize_payment(), per its GRANT in 009_functions.sql.
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { error: finalizeError } = await adminClient.rpc('finalize_payment', {
      p_order_id: orderId,
      p_provider_payment_id: verification.paymentId,
      p_status: verification.success ? 'completed' : 'failed',
    });

    if (finalizeError) {
      return jsonResponse({ success: false, error: finalizeError.message }, 500);
    }

    return jsonResponse({ success: verification.success, paymentId: verification.paymentId });
  } catch (err) {
    return jsonResponse({ success: false, error: err instanceof Error ? err.message : 'Unknown error' }, 500);
  }
});

async function verifyWithGateway(
  purchase: { provider_order_id: string; amount: number },
  paymentMethod: string
): Promise<{ success: boolean; paymentId: string }> {
  const gatewaySecret = Deno.env.get('PAYMENT_GATEWAY_KEY_SECRET');

  if (!gatewaySecret) {
    // Sandbox mode — no real gateway configured yet. See module header.
    return { success: true, paymentId: `pay_sandbox_${crypto.randomUUID().slice(0, 12)}` };
  }

  // TODO(real gateway integration): call the provider's order-verification
  // API here with `gatewaySecret`, check the returned signature against
  // purchase.provider_order_id + purchase.amount, and return the real
  // success/paymentId. Left unimplemented since no gateway account was
  // configured at the time this backend was built (see plan's open
  // decision #2).
  throw new Error('Real payment gateway integration not implemented yet');
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
