import { ArrowRight, BarChart3, DollarSign, Globe2, Sparkles, TrendingUp, Users, Video } from 'lucide-react';
import React from 'react';

interface ForTeachersSectionProps {
  onStartTeaching: () => void;
}

export const ForTeachersSection: React.FC<ForTeachersSectionProps> = ({ onStartTeaching }) => {
  const teacherBenefits = [
    {
      icon: Video,
      title: 'Upload Educational Short Videos',
      desc: 'Publish 30-60 second reels that showcase your teaching style and hook ambitious learners globally.',
    },
    {
      icon: Sparkles,
      title: 'Create Complete Courses',
      desc: 'Build structured, multi-module masterclasses with video lessons, downloadable resources, and quizzes.',
    },
    {
      icon: DollarSign,
      title: 'Offer Free or Paid Courses',
      desc: 'Monetize your knowledge with instant UPI & card payouts or offer free community courses to build brand authority.',
    },
    {
      icon: Users,
      title: 'Reach Thousands of Students',
      desc: 'Get organic algorithmic distribution through Vormirix educational reels and smart subject recommendations.',
    },
    {
      icon: BarChart3,
      title: 'Track Course & Reel Analytics',
      desc: 'Deep analytics on student watch-time, completion rates, reel conversions, and monthly revenue trends.',
    },
    {
      icon: Globe2,
      title: 'Build a Loyal Audience',
      desc: 'Gain followers, foster discussion in student forums, and establish your reputation as a premier educator.',
    },
  ];

  return (
    <section id="for-teachers" className="py-20 md:py-28 px-4 sm:px-6 max-w-7xl mx-auto border-t border-[#272a30]">
      <div className="bg-gradient-to-br from-[#191c21] via-[#14161f] to-[#121d20] border border-[#3b4a47] rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ccbdff]/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-[#ccbdff]/40 bg-[#ccbdff]/10 mb-4">
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#ccbdff]">
                For Verified Educators & Creators
              </span>
            </div>
            <h2 className="font-['Manrope'] text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Teach. Reach. Earn.
            </h2>
            <p className="text-base sm:text-lg text-[#bacac6] leading-relaxed">
              Transform your domain expertise into a thriving online education business. Use short videos as discovery hooks to drive enrollment into your premium masterclasses.
            </p>
          </div>

          {/* Grid of benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {teacherBenefits.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#111319]/80 border border-[#272a30] hover:border-[#3b4a47] rounded-2xl p-6 transition-all hover:-translate-y-1 shadow-md"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#ccbdff]/15 border border-[#ccbdff]/30 text-[#ccbdff] flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-[#bacac6] leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Callout & CTA */}
          <div className="bg-[#111319] border border-[#272a30] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-lg font-bold text-white">Join 1,200+ Educators on Vormirix</h4>
              <p className="text-xs sm:text-sm text-[#bacac6] mt-1">
                Zero platform hosting fees. Direct 85% creator revenue share. Full copyright ownership.
              </p>
            </div>

            <button
              onClick={onStartTeaching}
              className="px-8 py-3.5 bg-[#ccbdff] hover:bg-white text-[#111319] rounded-full font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(204,189,255,0.3)] hover:scale-95 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
              id="teacher-cta-btn"
            >
              <span>Start Teaching</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
