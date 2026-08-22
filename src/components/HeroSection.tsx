import { ArrowRight, Bot, Sparkles, Zap } from 'lucide-react';
import React from 'react';
import { InteractiveHeroChat } from './InteractiveHeroChat';

interface HeroSectionProps {
  onStartLearning: () => void;
  onGainXp: (amount: number) => void;
  onOpenSubject: (subjectId: string) => void;
  onOpenQuiz: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartLearning,
  onGainXp,
  onOpenSubject,
  onOpenQuiz,
}) => {
  return (
    <section className="relative pt-16 md:pt-24 pb-28 md:pb-36 px-6 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden">
      {/* Background Radial Glow Effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] md:w-[900px] h-[500px] bg-[#58f5e0] opacity-[0.04] blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-[#ccbdff] opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />

      {/* Eyebrow Pill */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#3b4a47] bg-[#191c21] mb-8 hover:border-[#58f5e0]/60 transition-colors shadow-sm">
        <Zap className="w-3.5 h-3.5 text-[#58f5e0] fill-current" />
        <span className="text-[11px] uppercase tracking-wider font-bold text-[#bacac6]">
          Powered by Advanced AI
        </span>
      </div>

      {/* Headline */}
      <h1 className="font-['Manrope'] text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-extrabold tracking-tight leading-[1.1] max-w-4xl mb-6 text-[#e1e2ea]">
        Learning That Feels Like <br className="hidden sm:block" />
        <span className="text-[#58f5e0] inline-block relative">
          Playing
          <div className="absolute bottom-1.5 left-0 w-full h-2.5 bg-[#58f5e0]/20 -z-10 rounded-full" />
        </span>
      </h1>

      {/* Subheadline */}
      <p className="text-base sm:text-lg md:text-[17px] text-[#bacac6] max-w-2xl mb-10 leading-relaxed font-normal">
        Your 24/7 personal AI tutor. Master complex subjects through interactive chats, gamified
        paths, and instant feedback. Stop studying, start playing.
      </p>

      {/* Hero Action CTA */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 z-10 relative">
        <button
          onClick={onStartLearning}
          className="text-xs uppercase tracking-wider font-bold bg-[#2dd8c4] text-[#005a50] px-8 py-4 rounded-full hover:scale-95 transition-all flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(45,216,196,0.35)] hover:shadow-[0_0_35px_rgba(45,216,196,0.5)] cursor-pointer group"
          id="hero-cta-btn"
        >
          <span>Start Learning Free</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Hero Interactive Visual Mockup */}
      <InteractiveHeroChat
        onGainXp={onGainXp}
        onOpenSubject={onOpenSubject}
        onOpenQuiz={onOpenQuiz}
      />
    </section>
  );
};
