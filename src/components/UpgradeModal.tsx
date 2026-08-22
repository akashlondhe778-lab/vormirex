import confetti from 'canvas-confetti';
import { CheckCircle2, ShieldCheck, Sparkles, X, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { PricingPlan } from '../types';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan?: PricingPlan | null;
  billingCycle?: 'monthly' | 'yearly';
  onUpgradeSuccess: (planName: 'Pro' | 'Team') => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  selectedPlan,
  billingCycle = 'monthly',
  onUpgradeSuccess,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const targetPlanName = selectedPlan?.name === 'Team' ? 'Team' : 'Pro';
  const basePrice = selectedPlan ? (billingCycle === 'yearly' ? selectedPlan.priceYearly : selectedPlan.priceMonthly) : 12;
  const finalPrice = promoApplied ? Math.max(0, basePrice - 5) : basePrice;

  const handleApplyPromo = () => {
    if (promoCode.trim().toLowerCase() === 'vormi' || promoCode.trim().toLowerCase() === 'student') {
      setPromoApplied(true);
    }
  };

  const handleConfirmUpgrade = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#58f5e0', '#2dd8c4', '#ccbdff', '#aac0ff'],
        });
      } catch {}
      onUpgradeSuccess(targetPlanName as 'Pro' | 'Team');
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#191c21] border-2 border-[#58f5e0] w-full max-w-lg rounded-2xl p-6 shadow-[0_0_50px_rgba(45,216,196,0.25)] relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#bacac6] hover:text-[#e1e2ea] p-1.5 rounded-lg hover:bg-[#272a30] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[#2dd8c4] text-[#005a50] flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="font-['Manrope'] font-extrabold text-2xl text-[#e1e2ea]">
            Upgrade to {targetPlanName}
          </h3>
        </div>
        <p className="text-xs text-[#bacac6] mb-6">
          Unlock unlimited AI tutor interactions, step-by-step doubt solvers, and dynamic syllabus paths.
        </p>

        {/* Pricing Summary */}
        <div className="bg-[#1d2025] border border-[#3b4a47] rounded-xl p-4 mb-5 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-[#bacac6]">
              {targetPlanName} Plan ({billingCycle})
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-['Manrope'] text-3xl font-extrabold text-[#58f5e0]">
                ${finalPrice}
              </span>
              <span className="text-xs text-[#bacac6]">/month</span>
              {promoApplied && (
                <span className="text-[10px] bg-[#4f2db0] text-[#ccbdff] px-2 py-0.5 rounded-full font-bold">
                  $5 Promo Discount Applied!
                </span>
              )}
            </div>
          </div>
          <span className="text-[11px] text-[#2dd8c4] font-bold bg-[#2dd8c4]/15 px-3 py-1 rounded-full border border-[#2dd8c4]/30">
            Cancel Anytime
          </span>
        </div>

        {/* Features list */}
        <div className="flex flex-col gap-2.5 mb-6">
          <span className="text-[11px] uppercase tracking-wider font-bold text-[#bacac6]">
            Included Benefits:
          </span>
          <div className="flex items-center gap-2.5 text-xs text-[#e1e2ea]">
            <CheckCircle2 className="w-4 h-4 text-[#58f5e0] flex-shrink-0" />
            <span>Unlimited 24/7 AI Tutor Chat Sessions</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-[#e1e2ea]">
            <CheckCircle2 className="w-4 h-4 text-[#58f5e0] flex-shrink-0" />
            <span>Instant Photo & Equation Doubt Resolution</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-[#e1e2ea]">
            <CheckCircle2 className="w-4 h-4 text-[#58f5e0] flex-shrink-0" />
            <span>Adaptive Difficulty Exam Prep Arena</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-[#e1e2ea]">
            <CheckCircle2 className="w-4 h-4 text-[#58f5e0] flex-shrink-0" />
            <span>Deep Progress Analytics & Study Velocity Reports</span>
          </div>
        </div>

        {/* Promo code input */}
        <div className="flex items-center gap-2 mb-6">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Promo code (e.g. VORMI)"
            disabled={promoApplied}
            className="flex-1 bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3.5 py-2 text-xs text-[#e1e2ea] focus:outline-none"
          />
          <button
            onClick={handleApplyPromo}
            disabled={promoApplied || !promoCode.trim()}
            className="text-xs font-bold px-4 py-2 bg-[#272a30] text-[#e1e2ea] hover:text-[#58f5e0] border border-[#3b4a47] rounded-xl cursor-pointer disabled:opacity-50"
          >
            {promoApplied ? 'Applied' : 'Apply'}
          </button>
        </div>

        {/* Action button */}
        <button
          onClick={handleConfirmUpgrade}
          disabled={isProcessing}
          className="w-full text-xs uppercase tracking-wider font-extrabold bg-[#2dd8c4] text-[#005a50] py-3.5 rounded-full hover:scale-95 transition-all shadow-[0_0_20px_rgba(45,216,196,0.3)] cursor-pointer flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-[#005a50] border-t-transparent rounded-full animate-spin" />
              <span>Activating {targetPlanName} Membership...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-current" />
              <span>Confirm & Start {targetPlanName}</span>
            </>
          )}
        </button>

        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#859490]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#58f5e0]" />
          <span>256-bit Encrypted • 14-Day Money Back Guarantee</span>
        </div>
      </div>
    </div>
  );
};
