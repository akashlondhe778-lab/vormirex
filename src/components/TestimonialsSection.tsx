import { MessageSquare, Star, StarHalf } from 'lucide-react';
import React from 'react';
import { TESTIMONIALS } from '../data/mockData';

export const TestimonialsSection: React.FC = () => {
  return (
    <section
      className="py-24 bg-[#191c21] border-y border-[#3b4a47]/30 relative overflow-hidden"
      id="testimonials"
    >
      {/* Decorative background ambient glow */}
      <div className="absolute right-0 bottom-0 w-[450px] h-[450px] bg-[#ccbdff]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-widest font-bold text-[#ccbdff] mb-3 inline-flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Testimonials</span>
          </span>
          <h2 className="font-['Manrope'] text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-[#e1e2ea]">
            Loved by Students Everywhere
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {TESTIMONIALS.map((item, idx) => (
            <div
              key={idx}
              className={`bg-[#1d2025] p-8 rounded-xl border border-[#3b4a47] flex flex-col justify-between transition-all duration-300 hover:border-[#58f5e0]/60 ${
                item.isFeatured
                  ? 'md:-translate-y-4 shadow-2xl shadow-black/60 border-[#58f5e0]/40'
                  : 'shadow-xl'
              }`}
            >
              <div>
                {/* 5-Star Rating */}
                <div className="flex gap-1 text-[#58f5e0] mb-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                  {item.rating === 5 ? (
                    <Star className="w-5 h-5 fill-current" />
                  ) : (
                    <StarHalf className="w-5 h-5 fill-current" />
                  )}
                </div>

                {/* Quote Text */}
                <p className="text-base md:text-[17px] text-[#e1e2ea] mb-8 italic leading-relaxed font-normal">
                  {item.quote}
                </p>
              </div>

              {/* Author & Avatar */}
              <div className="flex items-center gap-4 pt-4 border-t border-[#3b4a47]/40">
                <img
                  src={item.avatarUrl}
                  alt={item.name}
                  className="w-12 h-12 rounded-full object-cover border border-[#3b4a47] ring-2 ring-[#58f5e0]/20"
                />
                <div>
                  <h4 className="text-sm uppercase tracking-wider font-bold text-[#e1e2ea]">
                    {item.name}
                  </h4>
                  <p className="text-xs text-[#bacac6]">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
