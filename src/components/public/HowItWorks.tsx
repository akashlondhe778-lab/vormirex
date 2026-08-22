import { ArrowDown, Award, BookOpen, ChevronRight, Film, Flame, Play, Sparkles, TrendingUp, Zap } from 'lucide-react';
import React from 'react';

interface HowItWorksProps {
  onStartLearning: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onStartLearning }) => {
  const steps = [
    {
      stepNumber: '01',
      title: 'Scroll',
      subtitle: 'Discover educational short videos',
      desc: 'Browse a high-density vertical feed of 30-60 second micro-lessons in Python, Calculus, Quantum Physics, Chemistry, and System Design created by verified educators.',
      icon: Film,
      badgeColor: '#58f5e0',
      tag: 'Micro-Learning Discovery',
    },
    {
      stepNumber: '02',
      title: 'Learn',
      subtitle: 'Watch detailed lessons & courses',
      desc: 'When a short video sparks your interest, tap "Learn Complete Concept" to jump straight into comprehensive masterclasses with syllabus tracking, exercises, and free previews.',
      icon: BookOpen,
      badgeColor: '#ccbdff',
      tag: 'Structured Masterclasses',
    },
    {
      stepNumber: '03',
      title: 'Grow',
      subtitle: 'Earn XP, build streaks & track progress',
      desc: 'Complete video lessons, level up your scholar rank, earn badges, maintain daily study streaks, and inspect your analytical learning curve with weekly velocity stats.',
      icon: TrendingUp,
      badgeColor: '#f59e0b',
      tag: 'Gamified Mastery',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 px-4 sm:px-6 max-w-7xl mx-auto border-t border-[#272a30]">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#3b4a47] bg-[#191c21] mb-4">
          <span className="text-[11px] uppercase font-bold tracking-wider text-[#58f5e0]">
            Simple 3-Step Flow
          </span>
        </div>
        <h2 className="font-['Manrope'] text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-5">
          How Vormirix Works
        </h2>
        <p className="text-base sm:text-lg text-[#bacac6] leading-relaxed">
          Turning passive scrolling into an engaging, structured mastery pipeline in three seamless steps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-[#191c21] border border-[#272a30] hover:border-[#3b4a47] rounded-3xl p-8 relative flex flex-col justify-between shadow-xl group transition-all duration-300 hover:-translate-y-1.5"
            >
              {/* Step indicator number */}
              <div className="flex items-center justify-between mb-6">
                <span
                  className="font-mono text-3xl font-black opacity-40 group-hover:opacity-100 transition-opacity"
                  style={{ color: item.badgeColor }}
                >
                  {item.stepNumber}
                </span>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border"
                  style={{
                    backgroundColor: `${item.badgeColor}15`,
                    borderColor: `${item.badgeColor}40`,
                    color: item.badgeColor,
                  }}
                >
                  {item.tag}
                </span>
              </div>

              {/* Icon & Title */}
              <div className="mb-6 space-y-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: `${item.badgeColor}20`,
                    color: item.badgeColor,
                  }}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>{item.title}</span>
                </h3>
                <p className="text-sm font-semibold text-[#58f5e0]">{item.subtitle}</p>
                <p className="text-xs sm:text-sm text-[#bacac6] leading-relaxed">{item.desc}</p>
              </div>

              {/* Bottom detail pill */}
              <div className="pt-4 border-t border-[#272a30] flex items-center justify-between text-xs font-semibold text-[#bacac6]">
                <span>Step {idx + 1} of 3</span>
                <span className="text-[#58f5e0] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Ready to learn <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-14 text-center">
        <button
          onClick={onStartLearning}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#2dd8c4] hover:bg-[#58f5e0] text-[#005a50] font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(45,216,196,0.3)] hover:scale-95 transition-all cursor-pointer"
        >
          <span>Experience the Learning Flow</span>
          <Zap className="w-4 h-4 fill-current" />
        </button>
      </div>
    </section>
  );
};
