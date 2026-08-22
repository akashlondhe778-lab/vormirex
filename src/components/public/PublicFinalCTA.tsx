import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import React from 'react';
import { VormirixLogo } from '../VormirixLogo';

interface PublicFinalCTAProps {
  onStartLearning: () => void;
}

export const PublicFinalCTA: React.FC<PublicFinalCTAProps> = ({ onStartLearning }) => {
  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 max-w-7xl mx-auto border-t border-[#272a30]">
      <div className="relative rounded-3xl bg-gradient-to-b from-[#191c21] via-[#161a22] to-[#111319] border border-[#3b4a47] p-8 sm:p-16 text-center overflow-hidden shadow-2xl">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#58f5e0] opacity-10 blur-[130px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-[#111319] border border-[#3b4a47] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(88,245,224,0.3)]">
            <VormirixLogo size={32} variant="gradient" withGlow />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#58f5e0]/30 bg-[#58f5e0]/10">
            <Zap className="w-3.5 h-3.5 text-[#58f5e0] fill-current" />
            <span className="text-[11px] uppercase font-extrabold tracking-wider text-[#58f5e0]">
              Start For Free Today
            </span>
          </div>

          <h2 className="font-['Manrope'] text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Your next scroll could <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#58f5e0] via-[#2dd8c4] to-[#ccbdff]">
              change your future.
            </span>
          </h2>

          <p className="text-base sm:text-xl text-[#bacac6] font-medium leading-relaxed max-w-2xl mx-auto">
            Stop scrolling without gaining anything. <br className="hidden sm:block" />
            <strong className="text-white font-bold">Start scrolling with purpose.</strong>
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartLearning}
              className="w-full sm:w-auto px-10 py-4 rounded-full bg-[#2dd8c4] hover:bg-[#58f5e0] text-[#005a50] font-black text-sm uppercase tracking-wider shadow-[0_0_35px_rgba(45,216,196,0.4)] hover:shadow-[0_0_45px_rgba(45,216,196,0.6)] hover:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
              id="final-cta-btn"
            >
              <span>Start Learning</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <p className="text-xs text-[#bacac6] pt-2">
            No credit card required • Instant access to free educational reels & starter courses
          </p>
        </div>
      </div>
    </section>
  );
};
