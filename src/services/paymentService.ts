import { PaymentOrder } from '../types';

export interface InitiatePaymentParams {
  courseId: string;
  courseTitle: string;
  amount: number;
  studentName: string;
  studentEmail: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  orderId: string;
  paymentId: string;
  signature?: string;
  timestamp: string;
  error?: string;
}

class PaymentService {
  private orders: Map<string, PaymentOrder> = new Map();

  /**
   * Create Razorpay / Gateway order
   */
  async createOrder(params: InitiatePaymentParams): Promise<PaymentOrder> {
    // Generate simulated standard Indian gateway order ID (e.g. order_9932481)
    const orderId = `order_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString().slice(-4)}`;
    
    const newOrder: PaymentOrder = {
      id: orderId,
      courseId: params.courseId,
      courseTitle: params.courseTitle,
      amount: params.amount,
      currency: 'INR',
      status: 'created',
      orderDate: new Date().toISOString(),
      paymentMethod: 'UPI'
    };

    this.orders.set(orderId, newOrder);
    return newOrder;
  }

  /**
   * Verify signature & complete settlement
   */
  async verifyPayment(orderId: string, paymentMethod: 'UPI' | 'Card' | 'NetBanking'): Promise<PaymentVerificationResult> {
    // In production, signature verification happens server-side with gateway secret
    const order = this.orders.get(orderId);
    if (!order) {
      return {
        success: false,
        orderId,
        paymentId: '',
        timestamp: new Date().toISOString(),
        error: 'Order reference not found'
      };
    }

    const paymentId = `pay_${Math.random().toString(36).substring(2, 10)}`;
    order.status = 'completed';
    order.paymentMethod = paymentMethod;
    this.orders.set(orderId, order);

    return {
      success: true,
      orderId,
      paymentId,
      signature: `sig_${Math.random().toString(36).substring(2, 14)}`,
      timestamp: new Date().toISOString()
    };
  }

  getOrderStatus(orderId: string): PaymentOrder | undefined {
    return this.orders.get(orderId);
  }
}

export const paymentService = new PaymentService();
