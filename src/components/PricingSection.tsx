import { Check, CheckCircle, CheckCircle2, Sparkles, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { PRICING_PLANS } from '../data/mockData';
import { PricingPlan } from '../types';

interface PricingSectionProps {
  onSelectPlan: (plan: PricingPlan, billingCycle: 'monthly' | 'yearly') => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto" id="pricing">
      <div className="text-center mb-16">
        <span className="text-xs uppercase tracking-widest font-bold text-[#58f5e0] mb-3 inline-block">
          Flexible Plans
        </span>
        <h2 className="font-['Manrope'] text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-[#e1e2ea]">
          Invest in Your Future
        </h2>
        <p className="text-base sm:text-[17px] text-[#bacac6] max-w-2xl mx-auto font-normal leading-relaxed mb-8">
          Start for free, upgrade when you need more power. Cancel anytime.
        </p>

        {/* Billing cycle switch */}
        <div className="inline-flex items-center p-1 bg-[#191c21] border border-[#3b4a47] rounded-full">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              billingCycle === 'monthly'
                ? 'bg-[#2dd8c4] text-[#005a50] shadow-sm'
                : 'text-[#bacac6] hover:text-[#e1e2ea]'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              billingCycle === 'yearly'
                ? 'bg-[#2dd8c4] text-[#005a50] shadow-sm'
                : 'text-[#bacac6] hover:text-[#e1e2ea]'
            }`}
          >
            <span>Annual Billing</span>
            <span className="bg-[#4f2db0] text-[#ccbdff] text-[10px] uppercase px-2 py-0.5 rounded-full font-extrabold">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
        {PRICING_PLANS.map((plan) => {
          const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;

          return (
            <div
              key={plan.id}
              className={`rounded-xl p-8 flex flex-col transition-all duration-300 ${
                plan.isPopular
                  ? 'bg-[#272a30] border-2 border-[#58f5e0] h-[105%] relative shadow-[0_0_35px_rgba(45,216,196,0.2)] z-10'
                  : 'bg-[#1d2025] border border-[#3b4a47] h-full hover:border-[#58f5e0]/50'
              }`}
            >
              {/* Most Popular Badge */}
              {plan.isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#2dd8c4] text-[#005a50] font-bold text-[10px] px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Most Popular</span>
                </div>
              )}

              <h3
                className={`font-['Manrope'] text-2xl font-bold mb-2 ${
                  plan.isPopular ? 'text-[#58f5e0]' : 'text-[#e1e2ea]'
                }`}
              >
                {plan.name}
              </h3>
              <p className="text-[15px] text-[#bacac6] mb-6 pb-6 border-b border-[#3b4a47]/50">
                {plan.tagline}
              </p>

              {/* Price display */}
              <div className="mb-8 flex items-end gap-1">
                <span className="font-['Manrope'] text-4xl sm:text-5xl font-extrabold text-[#e1e2ea] tracking-tight">
                  {price === 0 ? 'Free' : `$${price}`}
                </span>
                {price > 0 && (
                  <span className="text-[#bacac6] text-sm mb-1.5">
                    /month {billingCycle === 'yearly' && '(billed annually)'}
                  </span>
                )}
              </div>

              {/* Feature Checklist */}
              <ul className="flex flex-col gap-4 mb-8 flex-1">
                {plan.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className={`flex items-center gap-3 text-[15px] ${
                      plan.isPopular ? 'text-[#e1e2ea] font-medium' : 'text-[#bacac6]'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-5 h-5 flex-shrink-0 ${
                        plan.isPopular
                          ? 'text-[#58f5e0] fill-[#58f5e0]/20'
                          : 'text-[#58f5e0]'
                      }`}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              <button
                onClick={() => onSelectPlan(plan, billingCycle)}
                className={`w-full text-center text-xs uppercase tracking-wider font-bold py-3.5 rounded-full transition-all cursor-pointer ${
                  plan.isPopular
                    ? 'bg-[#2dd8c4] text-[#005a50] hover:scale-95 shadow-[0_0_20px_rgba(45,216,196,0.3)]'
                    : 'text-[#e1e2ea] border border-[#3b4a47] hover:bg-[#32353b] hover:border-[#58f5e0]'
                }`}
              >
                {plan.ctaText}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
