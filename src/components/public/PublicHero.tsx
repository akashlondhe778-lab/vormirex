import { ArrowRight, BookOpen, CheckCircle, Compass, Flame, Play, Sparkles, TrendingUp, Zap } from 'lucide-react';
import React from 'react';
import { VormirexLogo } from '../VormirexLogo';

interface PublicHeroProps {
  onStartLearning: () => void;
  onExploreVormirex: () => void;
  onOpenTeacherSignup: () => void;
}

export const PublicHero: React.FC<PublicHeroProps> = ({
  onStartLearning,
  onExploreVormirex,
  onOpenTeacherSignup,
}) => {
  return (
    <section id="hero" className="relative pt-16 md:pt-24 pb-20 md:pb-28 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] md:w-[950px] h-[450px] bg-[#58f5e0] opacity-[0.05] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-[#ccbdff] opacity-[0.04] blur-[130px] rounded-full pointer-events-none" />

      {/* Pill Eyebrow */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#3b4a47] bg-[#191c21] mb-8 hover:border-[#58f5e0]/60 transition-colors shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-[#58f5e0]" />
        <span className="text-[11px] uppercase tracking-wider font-bold text-[#bacac6]">
          The Next-Gen Social Learning Platform
        </span>
      </div>

      {/* Main Hero Headline */}
      <h1 className="font-['Manrope'] text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] max-w-5xl mb-6 text-[#e1e2ea]">
        Turn Your Scroll Into <br className="hidden sm:block" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#58f5e0] via-[#2dd8c4] to-[#ccbdff] inline-block relative">
          Learning.
          <div className="absolute bottom-1 left-0 w-full h-2.5 bg-[#58f5e0]/20 -z-10 rounded-full" />
        </span>
      </h1>

      {/* Supporting Text */}
      <p className="text-base sm:text-lg md:text-xl text-[#bacac6] max-w-3xl mb-10 leading-relaxed font-normal">
        Learn through short educational videos, explore complete courses, and turn every minute of scrolling into real progress.
      </p>

      {/* Hero Action CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 z-10 relative">
        <button
          onClick={onStartLearning}
          className="w-full sm:w-auto text-xs uppercase tracking-wider font-extrabold bg-[#2dd8c4] hover:bg-[#58f5e0] text-[#005a50] px-8 py-4 rounded-full hover:scale-95 transition-all flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(45,216,196,0.35)] hover:shadow-[0_0_35px_rgba(45,216,196,0.5)] cursor-pointer group"
          id="hero-start-learning-btn"
        >
          <span>Start Learning</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={onExploreVormirex}
          className="w-full sm:w-auto text-xs uppercase tracking-wider font-bold bg-[#191c21] hover:bg-[#272a30] text-[#e1e2ea] border border-[#3b4a47] hover:border-[#58f5e0]/50 px-7 py-4 rounded-full hover:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          id="hero-explore-btn"
        >
          <Compass className="w-4 h-4 text-[#58f5e0]" />
          <span>Explore Vormirex</span>
        </button>
      </div>

      {/* Visual Product Showcase Graphic */}
      <div className="w-full max-w-5xl bg-[#191c21]/90 border border-[#3b4a47]/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-left backdrop-blur-sm">
        {/* Top window bar */}
        <div className="flex items-center justify-between pb-5 border-b border-[#272a30] mb-6">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 mr-2">
              <div className="w-3 h-3 rounded-full bg-[#ef4444]/80" />
              <div className="w-3 h-3 rounded-full bg-[#f59e0b]/80" />
              <div className="w-3 h-3 rounded-full bg-[#2dd8c4]/80" />
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#111319] border border-[#272a30]">
              <VormirexLogo size={14} variant="gradient" />
              <span className="text-[11px] font-mono text-[#bacac6]">vormirex.com/app/feed</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#58f5e0] bg-[#58f5e0]/10 px-3 py-1 rounded-full border border-[#58f5e0]/20">
            <Flame className="w-3.5 h-3.5 fill-current text-[#f59e0b]" />
            <span>Active Learners: 48,200+</span>
          </div>
        </div>

        {/* Dual Pillar Preview */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Micro Reel Preview Card */}
          <div className="md:col-span-5 bg-[#111319] border border-[#272a30] rounded-2xl p-4 relative overflow-hidden group">
            <div className="relative aspect-[9/14] rounded-xl overflow-hidden bg-black flex flex-col justify-between p-4 shadow-inner">
              <img
                src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80"
                alt="Micro Python Lesson"
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

              {/* Top Reel Badge */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-2.5 py-1 bg-[#2dd8c4] text-[#005a50] text-[10px] font-black uppercase rounded-full tracking-wider">
                  30-Sec Micro Lesson
                </span>
                <span className="text-[11px] text-white/90 font-mono bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                  0:30
                </span>
              </div>

              {/* Reel Content Overlay */}
              <div className="relative z-10 space-y-2">
                <p className="text-white font-bold text-sm leading-snug drop-shadow-md">
                  "Python List Comprehension in 30 Seconds"
                </p>
                <div className="bg-[#191c21]/90 backdrop-blur-md border border-[#58f5e0]/40 rounded-xl p-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#bacac6] block">Want complete mastery?</span>
                    <span className="text-xs font-bold text-[#58f5e0]">View Python Masterclass</span>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-[#58f5e0] text-[#005a50] flex items-center justify-center font-bold">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 text-center">
              <span className="text-xs font-semibold text-[#bacac6]">
                1. Scroll & discover bite-sized concepts
              </span>
            </div>
          </div>

          {/* Transition Arrow / Explainer */}
          <div className="md:col-span-2 flex flex-col items-center justify-center text-center py-2">
            <div className="w-10 h-10 rounded-full bg-[#2dd8c4]/15 border border-[#2dd8c4]/40 flex items-center justify-center text-[#58f5e0] mb-2 shadow-[0_0_15px_rgba(45,216,196,0.2)]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#58f5e0]">
              Seamless Hook
            </span>
            <span className="text-[10px] text-[#bacac6] mt-0.5">Short Reel → Full Masterclass</span>
          </div>

          {/* Full Course Preview Card */}
          <div className="md:col-span-5 bg-[#111319] border border-[#272a30] rounded-2xl p-4 relative">
            <div className="rounded-xl overflow-hidden bg-[#161920] border border-[#3b4a47]/50 p-4 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRMabCrhzYGEAPunNCKP3lTLsPY7edkb3ZSxv702tLa-yBlTRiS75Rku5ucYEuKcz1t9WFfGCtMHTVdvmHwUcLdMWCX8wRF1sHnD8excTSo9DNbsouO2EFeZ3pAgaTaQ64ufcSyB2TL7dHapPleutt_ole7e6a2O31mOTX_GLCbT27WdFvM3ox9SQssKTB2H-Q5gibtm3q-lyv-ferMIzR9Nkl3NyP1DBOdVO8LfAx_sQGJRbjuyuc"
                  alt="Dr. Vikram Desai"
                  className="w-10 h-10 rounded-full object-cover border border-[#58f5e0]"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">Full-Stack Python & Algorithms</h4>
                  <p className="text-[11px] text-[#bacac6]">Dr. Vikram Desai • 4.9 ★ (3,400+ students)</p>
                </div>
              </div>

              {/* Progress & Syllabus Preview */}
              <div className="space-y-2 bg-[#111319] p-3 rounded-xl border border-[#272a30]">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#e1e2ea]">Interactive Syllabus</span>
                  <span className="text-[#58f5e0]">18 Lessons • 6.5 Hrs</span>
                </div>
                <div className="w-full h-1.5 bg-[#272a30] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#2dd8c4] to-[#58f5e0] w-[65%]" />
                </div>
                <div className="space-y-1.5 pt-1 text-[11px] text-[#bacac6]">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <CheckCircle className="w-3.5 h-3.5 text-[#2dd8c4]" />
                    <span>01. Python Memory & List Comprehension</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Play className="w-3.5 h-3.5 text-[#58f5e0]" />
                    <span>02. Dynamic Programming & Recursion</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onStartLearning}
                className="w-full py-2.5 rounded-xl bg-[#2dd8c4]/15 hover:bg-[#2dd8c4]/25 text-[#58f5e0] border border-[#2dd8c4]/40 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Unlock Masterclasses with Free Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="mt-3 text-center">
              <span className="text-xs font-semibold text-[#bacac6]">
                2. Dive into complete courses & build true mastery
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
