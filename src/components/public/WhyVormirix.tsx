import { BookOpen, CheckCircle2, Code2, Flame, GraduationCap, LineChart, Sparkles, Target, Zap } from 'lucide-react';
import React from 'react';

export const WhyVormirix: React.FC = () => {
  const pillars = [
    {
      icon: Sparkles,
      title: 'Learn in Micro-Bites',
      desc: 'Digest complex coding, math, physics, and science concepts in 30-60 second high-retention short videos.',
      accent: '#58f5e0',
    },
    {
      icon: Target,
      title: 'Practice & Reinforce',
      desc: 'Interactive concept check-ins, formula breakdowns, and live AI tutor instant clarification.',
      accent: '#ccbdff',
    },
    {
      icon: Code2,
      title: 'Build Practical Skills',
      desc: 'Learn actionable skills with real code snippets, mathematical derivations, and hands-on projects.',
      accent: '#2dd8c4',
    },
    {
      icon: Flame,
      title: 'Track Real Progress',
      desc: 'Earn gamified XP, maintain daily study streaks, level up your scholar rank, and view weekly learning curves.',
      accent: '#f59e0b',
    },
    {
      icon: GraduationCap,
      title: 'Complete Full Masterclasses',
      desc: 'Effortlessly transition from a 30-second teaser into an in-depth, structured masterclass with certificates.',
      accent: '#38bdf8',
    },
  ];

  return (
    <section id="why-vormirix" className="py-20 md:py-28 px-4 sm:px-6 max-w-7xl mx-auto border-t border-[#272a30]">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#3b4a47] bg-[#191c21] mb-4">
          <span className="text-[11px] uppercase font-bold tracking-wider text-[#58f5e0]">
            The Core Purpose
          </span>
        </div>
        <h2 className="font-['Manrope'] text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-5">
          Why Vormirix?
        </h2>
        <p className="text-base sm:text-lg text-[#bacac6] leading-relaxed">
          Instead of endless entertainment, use your scrolling time to build real knowledge, master hard concepts, and level up your career.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {pillars.map((pillar, idx) => {
          const Icon = pillar.icon;
          return (
            <div
              key={idx}
              className="bg-[#191c21]/80 hover:bg-[#1f232b] border border-[#272a30] hover:border-[#3b4a47] rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 shadow-lg"
            >
              <div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: `${pillar.accent}15`,
                    border: `1px solid ${pillar.accent}40`,
                    color: pillar.accent,
                  }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{pillar.title}</h3>
                <p className="text-xs text-[#bacac6] leading-relaxed">{pillar.desc}</p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#272a30]/60 flex items-center gap-1.5 text-[11px] font-semibold text-[#58f5e0]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero Slop. High Yield.</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
