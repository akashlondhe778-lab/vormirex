import { Check, CheckCircle, CreditCard, Lock, QrCode, ShieldCheck, Smartphone, X } from 'lucide-react';
import React, { useState } from 'react';
import { paymentService } from '../services/paymentService';
import { Course, UserProfile } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  user: UserProfile;
  onPaymentSuccess: (course: Course) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  course,
  user,
  onPaymentSuccess,
}) => {
  const [method, setMethod] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [bank, setBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccessData, setPaymentSuccessData] = useState<{ paymentId: string; orderId: string } | null>(null);

  if (!isOpen || !course) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');
    setIsProcessing(true);

    try {
      // 1. Create a pending order (server-side; cannot grant access by itself)
      const order = await paymentService.createOrder(course.id);

      // 2. Verify via the verify-payment Edge Function, which is the only
      // code path allowed to mark the order paid and activate enrollment.
      const result = await paymentService.verifyPayment(order.id, method);

      if (result.success) {
        setPaymentSuccessData({
          paymentId: result.paymentId,
          orderId: result.orderId,
        });
        setTimeout(() => {
          onPaymentSuccess(course);
          setPaymentSuccessData(null);
          setIsProcessing(false);
          onClose();
        }, 1800);
      } else {
        setPaymentError(result.error || 'Payment could not be verified. Please try again.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      setPaymentError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#191c21] border border-[#3b4a47] w-full max-w-lg rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 text-[#e1e2ea]">
        {!paymentSuccessData && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-[#bacac6] hover:text-[#e1e2ea] p-1.5 rounded-lg hover:bg-[#272a30] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {paymentSuccessData ? (
          <div className="py-8 flex flex-col items-center text-center space-y-4 animate-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-[#58f5e0]/20 border border-[#58f5e0] flex items-center justify-center text-[#58f5e0] shadow-[0_0_25px_rgba(88,245,224,0.4)]">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-2xl font-extrabold text-[#58f5e0]">Payment Verified!</h3>
            <p className="text-sm text-[#bacac6] max-w-sm">
              Your enrollment for <span className="font-semibold text-white">{course.title}</span> has been confirmed. Unlocking all video lessons...
            </p>
            <div className="bg-[#111319] border border-[#3b4a47] rounded-xl p-3 w-full text-xs font-mono text-[#bacac6] flex justify-between">
              <span>Order: {paymentSuccessData.orderId}</span>
              <span className="text-[#58f5e0]">Paid: ₹{course.price}</span>
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-[#58f5e0]" />
              <span className="text-xs uppercase font-bold tracking-wider text-[#58f5e0]">
                Vormirix Secure Payment
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Checkout & Course Enrollment</h2>

            {/* Course Summary Card */}
            <div className="bg-[#111319] border border-[#272a30] rounded-xl p-3.5 mb-5 flex gap-3 items-center">
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="w-16 h-14 rounded-lg object-cover border border-[#3b4a47]"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white truncate">{course.title}</h4>
                <p className="text-xs text-[#bacac6]">By {course.teacherName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-[#58f5e0]">₹{course.price}</span>
                  <span className="text-[10px] bg-[#58f5e0]/10 text-[#58f5e0] px-1.5 py-0.5 rounded font-semibold border border-[#58f5e0]/20">
                    Lifetime Access
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              <button
                type="button"
                onClick={() => setMethod('UPI')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                  method === 'UPI'
                    ? 'bg-[#58f5e0]/15 border-[#58f5e0] text-[#58f5e0] shadow-[0_0_15px_rgba(88,245,224,0.15)]'
                    : 'bg-[#111319] border-[#272a30] text-[#bacac6] hover:border-[#3b4a47]'
                }`}
              >
                <Smartphone className="w-5 h-5 mb-1.5" />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('Card')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                  method === 'Card'
                    ? 'bg-[#58f5e0]/15 border-[#58f5e0] text-[#58f5e0] shadow-[0_0_15px_rgba(88,245,224,0.15)]'
                    : 'bg-[#111319] border-[#272a30] text-[#bacac6] hover:border-[#3b4a47]'
                }`}
              >
                <CreditCard className="w-5 h-5 mb-1.5" />
                <span>Card</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('NetBanking')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                  method === 'NetBanking'
                    ? 'bg-[#58f5e0]/15 border-[#58f5e0] text-[#58f5e0] shadow-[0_0_15px_rgba(88,245,224,0.15)]'
                    : 'bg-[#111319] border-[#272a30] text-[#bacac6] hover:border-[#3b4a47]'
                }`}
              >
                <QrCode className="w-5 h-5 mb-1.5" />
                <span>Net Banking</span>
              </button>
            </div>

            {/* Payment Fields */}
            <form onSubmit={handlePay} className="space-y-4">
              {method === 'UPI' && (
                <div className="space-y-3 bg-[#111319] p-4 rounded-xl border border-[#272a30]">
                  <div className="flex items-center justify-between text-xs text-[#bacac6]">
                    <span>Scan UPI QR or enter VPA ID</span>
                    <span className="text-[#58f5e0] font-semibold">GPay / PhonePe / Paytm</span>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-[#bacac6] block mb-1">
                      UPI ID / VPA
                    </label>
                    <input
                      type="text"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. yourname@okhdfcbank"
                      className="w-full bg-[#191c21] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    {['@okaxis', '@okhdfcbank', '@paytm', '@ybl'].map((vpa) => (
                      <button
                        key={vpa}
                        type="button"
                        onClick={() => setUpiId((prev) => (prev.includes('@') ? prev.split('@')[0] + vpa : prev + vpa))}
                        className="text-[11px] px-2 py-1 bg-[#1d2025] hover:bg-[#272a30] text-[#bacac6] rounded-md border border-[#3b4a47]"
                      >
                        {vpa}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {method === 'Card' && (
                <div className="space-y-3 bg-[#111319] p-4 rounded-xl border border-[#272a30]">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-[#bacac6] block mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4532 •••• •••• 8921"
                      className="w-full bg-[#191c21] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-[#bacac6] block mb-1">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        required
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        placeholder="08/28"
                        className="w-full bg-[#191c21] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase text-[#bacac6] block mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        required
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full bg-[#191c21] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {method === 'NetBanking' && (
                <div className="space-y-3 bg-[#111319] p-4 rounded-xl border border-[#272a30]">
                  <label className="text-[11px] font-bold uppercase text-[#bacac6] block mb-1">
                    Select Your Bank
                  </label>
                  <select
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    className="w-full bg-[#191c21] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="border-t border-[#272a30] pt-3 text-xs space-y-1.5 text-[#bacac6]">
                <div className="flex justify-between">
                  <span>Course Base Price</span>
                  <span className="font-semibold text-white">₹{course.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST & Platform Processing</span>
                  <span className="text-[#58f5e0]">₹0 (Included)</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-1">
                  <span>Total Amount Payable</span>
                  <span className="text-[#58f5e0]">₹{course.price}</span>
                </div>
              </div>

              {paymentError && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium text-center">
                  {paymentError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-bold bg-[#2dd8c4] text-[#005a50] py-3.5 rounded-full hover:scale-95 transition-all shadow-[0_0_20px_rgba(45,216,196,0.3)] disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#005a50] border-t-transparent rounded-full animate-spin" />
                    <span>Verifying with Bank...</span>
                  </div>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ₹{course.price} & Unlock Course</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[#bacac6]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#58f5e0]" />
                <span>256-bit Encrypted Transaction • Instant LMS Course Access</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
