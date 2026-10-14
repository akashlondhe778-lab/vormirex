import { PaymentOrder } from '../types';
import { supabase } from './supabaseClient';

export interface PaymentVerificationResult {
  success: boolean;
  orderId: string;
  paymentId: string;
  error?: string;
}

/**
 * Rewritten to be server-authoritative (see VORMIRIX_BACKEND_PLAN.md §8/§14).
 * The old implementation faked an entire gateway client-side and trusted its
 * own "success" flag — that flag never touched a database write. Now:
 *
 *   1. createOrder() calls the create_payment_order() Postgres function
 *      (student-callable, but can only ever create a 'created' order — it
 *      cannot grant course access by itself).
 *   2. verifyPayment() calls the `verify-payment` Edge Function, which runs
 *      with the service role and is the ONLY code path allowed to mark an
 *      order 'completed' and create/activate the paid enrollment
 *      (via the finalize_payment() Postgres function).
 *
 * No real payment gateway credentials are configured yet (see plan's open
 * decision #2) — the Edge Function currently runs in a clearly-labeled
 * sandbox mode that always succeeds after receiving a payment method
 * selection, without ever letting the browser directly flip the DB row. Once
 * a real gateway is chosen, only supabase/functions/verify-payment/index.ts
 * needs to change (call out to the real API + verify its signature) — this
 * client file and the RLS model do not need to change.
 */
class PaymentService {
  async createOrder(courseId: string): Promise<PaymentOrder> {
    const { data, error } = await supabase.rpc('create_payment_order', { p_course_id: courseId });
    if (error) throw error;

    return {
      id: data.provider_order_id,
      courseId: data.course_id,
      courseTitle: '',
      amount: data.amount,
      currency: 'INR',
      status: 'created',
      orderDate: data.created_at,
      paymentMethod: 'UPI',
    };
  }

  async verifyPayment(orderId: string, paymentMethod: 'UPI' | 'Card' | 'NetBanking'): Promise<PaymentVerificationResult> {
    const { data, error } = await supabase.functions.invoke('verify-payment', {
      body: { orderId, paymentMethod },
    });

    if (error) {
      return { success: false, orderId, paymentId: '', error: error.message };
    }

    return {
      success: Boolean(data?.success),
      orderId,
      paymentId: data?.paymentId || '',
      error: data?.error,
    };
  }
}

export const paymentService = new PaymentService();
