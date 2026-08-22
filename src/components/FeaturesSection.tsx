import { BarChart3, Bot, BrainCircuit, CheckCircle2, ChevronRight, Compass, Flame, Gamepad2, HelpCircle, Map, Sparkles, Trophy, Zap } from 'lucide-react';
import React from 'react';

interface FeaturesSectionProps {
  onOpenStudioTab: (tab: 'tutor' | 'roadmap' | 'doubts' | 'quiz' | 'analytics' | 'gamification') => void;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ onOpenStudioTab }) => {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto" id="features">
      <div className="text-center mb-16">
        <span className="text-xs uppercase tracking-widest font-bold text-[#58f5e0] mb-3 inline-block">
          ✦ Core Features
        </span>
        <h2 className="font-['Manrope'] text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-[#e1e2ea]">
          Supercharge Your Study Sessions
        </h2>
        <p className="text-base sm:text-[17px] text-[#bacac6] max-w-2xl mx-auto font-normal leading-relaxed">
          Everything you need to master any subject, built natively into a modern, distraction-free
          environment.
        </p>
      </div>

      {/* Bento-style Grid matching the exact design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Feature 1: AI Tutor */}
        <div
          onClick={() => onOpenStudioTab('tutor')}
          className="group bg-[#1d2025] rounded-xl p-8 border border-[#32353b] hover:border-[#2dd8c4] transition-all duration-300 relative overflow-hidden cursor-pointer hover:-translate-y-1 shadow-lg"
          id="feature-ai-tutor"
        >
          <div className="absolute inset-0 bg-[#58f5e0]/0 group-hover:bg-[#58f5e0]/5 transition-colors duration-300" />
          <div className="w-12 h-12 rounded-lg bg-[#58f5e0]/15 flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform">
            <BrainCircuit className="w-6 h-6 text-[#58f5e0]" />
          </div>
          <div className="flex items-center justify-between mb-3 relative z-10">
            <h3 className="font-['Manrope'] text-xl font-bold text-[#e1e2ea] group-hover:text-[#58f5e0] transition-colors">
              AI Tutor
            </h3>
            <ChevronRight className="w-4 h-4 text-[#bacac6] group-hover:text-[#58f5e0] group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-[15px] leading-relaxed text-[#bacac6] relative z-10">
            Context-aware AI that understands your learning style and adapts explanations until you
            achieve a "eureka" moment.
          </p>
          <div className="mt-4 pt-4 border-t border-[#32353b]/60 flex items-center gap-2 text-xs font-semibold text-[#58f5e0]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Vormi Tutor</span>
          </div>
        </div>

        {/* Feature 2: Smart Roadmap */}
        <div
          onClick={() => onOpenStudioTab('roadmap')}
          className="group bg-[#1d2025] rounded-xl p-8 border border-[#32353b] hover:border-[#ccbdff] transition-all duration-300 relative overflow-hidden cursor-pointer hover:-translate-y-1 shadow-lg"
          id="feature-smart-roadmap"
        >
          <div className="absolute inset-0 bg-[#ccbdff]/0 group-hover:bg-[#ccbdff]/5 transition-colors duration-300" />
          <div className="w-12 h-12 rounded-lg bg-[#ccbdff]/15 flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform">
            <Map className="w-6 h-6 text-[#ccbdff]" />
          </div>
          <div className="flex items-center justify-between mb-3 relative z-10">
            <h3 className="font-['Manrope'] text-xl font-bold text-[#e1e2ea] group-hover:text-[#ccbdff] transition-colors">
              Smart Roadmap
            </h3>
            <ChevronRight className="w-4 h-4 text-[#bacac6] group-hover:text-[#ccbdff] group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-[15px] leading-relaxed text-[#bacac6] relative z-10">
            Dynamic syllabus generation. We analyze your goal and break it down into bite-sized,
            achievable daily quests.
          </p>
          <div className="mt-4 pt-4 border-t border-[#32353b]/60 flex items-center gap-2 text-xs font-semibold text-[#ccbdff]">
            <Compass className="w-3.5 h-3.5" />
            <span>Explore Syllabus Tree</span>
          </div>
        </div>

        {/* Feature 3: Instant Doubts */}
        <div
          onClick={() => onOpenStudioTab('doubts')}
          className="group bg-[#1d2025] rounded-xl p-8 border border-[#32353b] hover:border-[#aac0ff] transition-all duration-300 relative overflow-hidden cursor-pointer hover:-translate-y-1 shadow-lg"
          id="feature-instant-doubts"
        >
          <div className="absolute inset-0 bg-[#aac0ff]/0 group-hover:bg-[#aac0ff]/5 transition-colors duration-300" />
          <div className="w-12 h-12 rounded-lg bg-[#aac0ff]/15 flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform">
            <HelpCircle className="w-6 h-6 text-[#aac0ff]" />
          </div>
          <div className="flex items-center justify-between mb-3 relative z-10">
            <h3 className="font-['Manrope'] text-xl font-bold text-[#e1e2ea] group-hover:text-[#aac0ff] transition-colors">
              Instant Doubts
            </h3>
            <ChevronRight className="w-4 h-4 text-[#bacac6] group-hover:text-[#aac0ff] group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-[15px] leading-relaxed text-[#bacac6] relative z-10">
            Stuck at 2 AM? Snap a photo or type your question. Get instant, step-by-step resolution
            without waiting.
          </p>
          <div className="mt-4 pt-4 border-t border-[#32353b]/60 flex items-center gap-2 text-xs font-semibold text-[#aac0ff]">
            <Zap className="w-3.5 h-3.5" />
            <span>Snap & Solve Homework</span>
          </div>
        </div>

        {/* Feature 4: Adaptive Quizzes */}
        <div
          onClick={() => onOpenStudioTab('quiz')}
          className="group bg-[#1d2025] rounded-xl p-8 border border-[#32353b] hover:border-[#ffb4ab] transition-all duration-300 relative overflow-hidden cursor-pointer hover:-translate-y-1 shadow-lg"
          id="feature-adaptive-quizzes"
        >
          <div className="absolute inset-0 bg-[#ffb4ab]/0 group-hover:bg-[#ffb4ab]/5 transition-colors duration-300" />
          <div className="w-12 h-12 rounded-lg bg-[#ffb4ab]/15 flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-6 h-6 text-[#ffb4ab]" />
          </div>
          <div className="flex items-center justify-between mb-3 relative z-10">
            <h3 className="font-['Manrope'] text-xl font-bold text-[#e1e2ea] group-hover:text-[#ffb4ab] transition-colors">
              Adaptive Quizzes
            </h3>
            <ChevronRight className="w-4 h-4 text-[#bacac6] group-hover:text-[#ffb4ab] group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-[15px] leading-relaxed text-[#bacac6] relative z-10">
            Tests that evolve with you. Questions get harder as you improve, ensuring you're always
            challenged, never bored.
          </p>
          <div className="mt-4 pt-4 border-t border-[#32353b]/60 flex items-center gap-2 text-xs font-semibold text-[#ffb4ab]">
            <Zap className="w-3.5 h-3.5" />
            <span>Take Quick Test</span>
          </div>
        </div>

        {/* Feature 5: Progress Analytics */}
        <div
          onClick={() => onOpenStudioTab('analytics')}
          className="group bg-[#1d2025] rounded-xl p-8 border border-[#32353b] hover:border-[#5efae5] transition-all duration-300 relative overflow-hidden md:col-span-2 lg:col-span-1 cursor-pointer hover:-translate-y-1 shadow-lg"
          id="feature-progress-analytics"
        >
          <div className="absolute inset-0 bg-[#5efae5]/0 group-hover:bg-[#5efae5]/5 transition-colors duration-300" />
          <div className="w-12 h-12 rounded-lg bg-[#5efae5]/15 flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform">
            <BarChart3 className="w-6 h-6 text-[#5efae5]" />
          </div>
          <div className="flex items-center justify-between mb-3 relative z-10">
            <h3 className="font-['Manrope'] text-xl font-bold text-[#e1e2ea] group-hover:text-[#5efae5] transition-colors">
              Progress Analytics
            </h3>
            <ChevronRight className="w-4 h-4 text-[#bacac6] group-hover:text-[#5efae5] group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-[15px] leading-relaxed text-[#bacac6] relative z-10">
            Visualize your growth with deep insights. Identify weak spots before exams and track your
            study velocity over time.
          </p>
          <div className="mt-4 pt-4 border-t border-[#32353b]/60 flex items-center gap-2 text-xs font-semibold text-[#5efae5]">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>View Mastery Insights</span>
          </div>
        </div>

        {/* Feature 6: Gamification */}
        <div
          onClick={() => onOpenStudioTab('gamification')}
          className="group bg-[#1d2025] rounded-xl p-8 border border-[#32353b] hover:border-[#e7deff] transition-all duration-300 relative overflow-hidden lg:col-span-1 cursor-pointer hover:-translate-y-1 shadow-lg"
          id="feature-gamification"
        >
          <div className="absolute inset-0 bg-[#e7deff]/0 group-hover:bg-[#e7deff]/5 transition-colors duration-300" />
          <div className="w-12 h-12 rounded-lg bg-[#e7deff]/15 flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform">
            <Gamepad2 className="w-6 h-6 text-[#e7deff]" />
          </div>
          <div className="flex items-center justify-between mb-3 relative z-10">
            <h3 className="font-['Manrope'] text-xl font-bold text-[#e1e2ea] group-hover:text-[#e7deff] transition-colors">
              Gamification
            </h3>
            <ChevronRight className="w-4 h-4 text-[#bacac6] group-hover:text-[#e7deff] group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-[15px] leading-relaxed text-[#bacac6] relative z-10">
            Earn XP, unlock badges, and maintain streaks. We use game mechanics to make building
            study habits addictive.
          </p>
          <div className="mt-4 pt-4 border-t border-[#32353b]/60 flex items-center gap-2 text-xs font-semibold text-[#e7deff]">
            <Trophy className="w-3.5 h-3.5" />
            <span>Leaderboard & Badges</span>
          </div>
        </div>
      </div>
    </section>
  );
};
