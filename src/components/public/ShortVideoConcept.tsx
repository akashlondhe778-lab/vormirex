import { ArrowRight, BookOpen, Check, Code, Film, Play, Sparkles, UserCheck, Video, Zap } from 'lucide-react';
import React from 'react';

interface ShortVideoConceptProps {
  onStartLearning: () => void;
}

export const ShortVideoConcept: React.FC<ShortVideoConceptProps> = ({ onStartLearning }) => {
  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 max-w-7xl mx-auto border-t border-[#272a30]">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#3b4a47] bg-[#191c21] mb-4">
          <span className="text-[11px] uppercase font-bold tracking-wider text-[#58f5e0]">
            The Core Innovation
          </span>
        </div>
        <h2 className="font-['Manrope'] text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-5">
          Short Video → Full Course → Real Learning
        </h2>
        <p className="text-base sm:text-lg text-[#bacac6] leading-relaxed">
          How Vormirex bridges the gap between quick micro-content and structured deep mastery.
        </p>
      </div>

      <div className="bg-[#191c21] border border-[#3b4a47]/60 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Narrative */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#58f5e0]/10 border border-[#58f5e0]/30 text-[#58f5e0] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Educator Funnel</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              Micro-Teasers that lead directly into Certified Masterclasses
            </h3>

            <p className="text-sm sm:text-base text-[#bacac6] leading-relaxed">
              On traditional social platforms, short videos leave you hanging with no structured path. On Vormirex, every educational short video is linked to an extensive, structured course by the same verified creator.
            </p>

            {/* Example Walkthrough Box */}
            <div className="bg-[#111319] border border-[#272a30] rounded-2xl p-5 space-y-3.5">
              <h4 className="text-xs uppercase font-extrabold tracking-wider text-[#58f5e0]">
                Real Student Journey Example:
              </h4>

              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex items-start gap-3 text-[#e1e2ea]">
                  <div className="w-5 h-5 rounded-full bg-[#58f5e0]/20 text-[#58f5e0] flex items-center justify-center font-bold text-[10px] mt-0.5 shrink-0">
                    1
                  </div>
                  <div>
                    <span className="font-semibold text-white">Student scrolls reels & watches:</span>
                    <p className="text-[#bacac6] text-xs mt-0.5">"Python List Comprehension in 30 Seconds" with real syntax and memory breakdown.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-[#e1e2ea]">
                  <div className="w-5 h-5 rounded-full bg-[#ccbdff]/20 text-[#ccbdff] flex items-center justify-center font-bold text-[10px] mt-0.5 shrink-0">
                    2
                  </div>
                  <div>
                    <span className="font-semibold text-white">Sees contextual CTA card:</span>
                    <p className="text-[#bacac6] text-xs mt-0.5">"Want to learn Python completely? → View Full Course with Dr. Vikram Desai"</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-[#e1e2ea]">
                  <div className="w-5 h-5 rounded-full bg-[#f59e0b]/20 text-[#f59e0b] flex items-center justify-center font-bold text-[10px] mt-0.5 shrink-0">
                    3
                  </div>
                  <div>
                    <span className="font-semibold text-white">Enrolls in full masterclass:</span>
                    <p className="text-[#bacac6] text-xs mt-0.5">Continues with structured 18-lesson curriculum, interactive coding tasks, and earns 400 XP + Certificate.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onStartLearning}
                className="px-6 py-3 bg-[#2dd8c4] hover:bg-[#58f5e0] text-[#005a50] rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(45,216,196,0.3)] hover:scale-95 transition-all cursor-pointer"
              >
                <span>Try It Yourself</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Visual Interactive Mockup */}
          <div className="lg:col-span-6 bg-[#111319] border border-[#272a30] rounded-2xl p-5 relative">
            <div className="space-y-4">
              {/* Step 1 Mock Reel View */}
              <div className="border border-[#3b4a47]/50 rounded-2xl bg-[#161922] p-4 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#58f5e0] animate-ping" />
                    <span className="font-bold text-white">Short Video Reel</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#2dd8c4]/20 text-[#58f5e0] font-mono text-[10px]">
                    #PythonBasics
                  </span>
                </div>

                <div className="bg-black/50 rounded-xl p-3.5 border border-[#272a30] space-y-2">
                  <p className="text-xs text-[#bacac6] font-mono">
                    <span className="text-[#ccbdff]"># 30-Sec Snippet</span><br />
                    squares = [x**2 <span className="text-[#58f5e0]">for</span> x <span className="text-[#58f5e0]">in</span> range(10)]
                  </p>
                  <div className="p-2.5 bg-[#191c21] rounded-lg border border-[#58f5e0]/40 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#bacac6] block">Hook to Complete Course</span>
                      <span className="text-xs font-bold text-[#58f5e0]">Master Python & DSA Full Course</span>
                    </div>
                    <span className="text-[10px] font-bold bg-[#58f5e0] text-[#005a50] px-2.5 py-1 rounded-md">
                      View Course
                    </span>
                  </div>
                </div>
              </div>

              {/* Connecting Graphic */}
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#bacac6]">
                <div className="h-[1px] flex-1 bg-[#272a30]" />
                <span className="text-[10px] uppercase font-mono text-[#58f5e0] px-2 py-0.5 rounded bg-[#191c21] border border-[#272a30]">
                  Instant Enrollment
                </span>
                <div className="h-[1px] flex-1 bg-[#272a30]" />
              </div>

              {/* Step 2 Mock Masterclass View */}
              <div className="border border-[#3b4a47]/50 rounded-2xl bg-[#161922] p-4">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#ccbdff]" />
                    <span>Complete Masterclass</span>
                  </span>
                  <span className="text-[#58f5e0] font-bold text-xs">18 Video Lessons</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-[#111319] rounded-lg border border-[#272a30] flex items-center justify-between">
                    <span className="text-white font-medium">Lesson 1: List Comprehension & Generator Expressions</span>
                    <span className="text-[10px] text-[#2dd8c4] font-bold">Free Preview</span>
                  </div>
                  <div className="p-2.5 bg-[#111319] rounded-lg border border-[#272a30] flex items-center justify-between text-[#bacac6]">
                    <span>Lesson 2: Algorithm Complexity & Big-O Notation</span>
                    <span className="text-[10px] bg-[#272a30] px-2 py-0.5 rounded">Enrolled Only</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
