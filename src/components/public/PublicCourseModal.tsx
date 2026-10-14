import { BookOpen, CheckCircle, Clock, Globe, Lock, Play, Sparkles, Star, Users, X } from 'lucide-react';
import React from 'react';
import { Course } from '../../types';

interface PublicCourseModalProps {
  course: Course | null;
  onClose: () => void;
  onEnroll: (course: Course) => void;
}

export const PublicCourseModal: React.FC<PublicCourseModalProps> = ({
  course,
  onClose,
  onEnroll,
}) => {
  if (!course) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#191c21] border border-[#3b4a47] rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header with image */}
        <div className="relative h-48 sm:h-56 w-full bg-black shrink-0">
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#191c21] via-black/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-all cursor-pointer"
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-3 py-1 bg-[#2dd8c4] text-[#005a50] text-xs font-black uppercase rounded-full tracking-wider">
              {course.isFree ? 'Free Course' : `₹${course.price.toLocaleString('en-IN')}`}
            </span>
            <span className="px-3 py-1 bg-black/70 text-white text-xs font-bold rounded-full backdrop-blur-sm">
              {course.category}
            </span>
          </div>

          <div className="absolute bottom-4 left-6 right-6">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              {course.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#bacac6] mt-1 line-clamp-1">
              {course.subtitle}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Educator & Meta Info */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#111319] border border-[#272a30]">
            <div className="flex items-center gap-3">
              <img
                src={course.teacherAvatar}
                alt={course.teacherName}
                className="w-10 h-10 rounded-full object-cover border border-[#58f5e0]"
              />
              <div>
                <h4 className="text-xs font-bold text-white">{course.teacherName}</h4>
                <p className="text-[11px] text-[#bacac6]">{course.teacherRole}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-[#bacac6]">
              <div className="flex items-center gap-1 text-[#f59e0b]">
                <Star className="w-4 h-4 fill-current" />
                <span>{course.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-[#58f5e0]" />
                <span>{course.enrolledCount.toLocaleString()} learners</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-[#ccbdff]" />
                <span>{course.estimatedDuration}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-[#58f5e0]">
              About This Masterclass
            </h4>
            <p className="text-xs sm:text-sm text-[#bacac6] leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Syllabus Lessons Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase font-extrabold tracking-wider text-[#58f5e0]">
                Curriculum ({course.lessons.length} Lessons)
              </h4>
              <span className="text-[11px] text-[#bacac6]">Full access requires account</span>
            </div>

            <div className="space-y-2">
              {course.lessons.map((lesson, idx) => (
                <div
                  key={lesson.id}
                  className="p-3 bg-[#111319] rounded-xl border border-[#272a30] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#bacac6] font-mono text-[11px] w-5">
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="text-white font-medium">{lesson.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#bacac6]">{lesson.duration}</span>
                    {lesson.isFreePreview ? (
                      <span className="text-[10px] font-bold text-[#2dd8c4] bg-[#2dd8c4]/15 px-2 py-0.5 rounded">
                        Free Preview
                      </span>
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-[#bacac6]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="p-5 bg-[#14171d] border-t border-[#272a30] flex items-center justify-between gap-4 shrink-0">
          <div>
            <span className="text-[10px] text-[#bacac6] block">Access Full Curriculum</span>
            <span className="text-sm font-extrabold text-white">
              {course.isFree ? '100% Free' : `₹${course.price.toLocaleString('en-IN')} Lifetime`}
            </span>
          </div>

          <button
            onClick={() => onEnroll(course)}
            className="px-6 py-3 rounded-full bg-[#2dd8c4] hover:bg-[#58f5e0] text-[#005a50] font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(45,216,196,0.3)] hover:scale-95 transition-all cursor-pointer"
          >
            {course.isFree ? 'Sign Up & Enroll Free' : 'Login to Enroll Masterclass'}
          </button>
        </div>
      </div>
    </div>
  );
};
