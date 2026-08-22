import {
  ArrowLeft,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Globe,
  GraduationCap,
  Lock,
  Play,
  PlayCircle,
  Shield,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { Course, UserProfile } from '../types';

interface CourseDetailPageProps {
  course: Course;
  user: UserProfile;
  onBack: () => void;
  onEnrollOrBuy: (course: Course) => void;
  onStartLearning: (course: Course, lessonIndex?: number) => void;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({
  course,
  user,
  onBack,
  onEnrollOrBuy,
  onStartLearning,
}) => {
  const isEnrolled = user.enrolledCourseIds?.includes(course.id);
  const [activeTab, setActiveTab] = useState<'curriculum' | 'instructor' | 'reviews'>('curriculum');

  const completedLessonsInCourse = course.lessons.filter((l) =>
    user.completedLessonIds?.includes(l.id)
  ).length;

  const progressPercent = Math.round(
    (completedLessonsInCourse / (course.lessons.length || 1)) * 100
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 select-none">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs uppercase font-bold text-[#bacac6] hover:text-[#58f5e0] transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Catalog</span>
      </button>

      {/* Main Grid: Info + Sticky Checkout Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Overview, Curriculum & Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Banner */}
          <div className="bg-[#191c21] border border-[#272a30] rounded-2xl p-6 sm:p-8 relative overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[11px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-[#58f5e0]/10 text-[#58f5e0] border border-[#58f5e0]/30">
                {course.category}
              </span>
              <span className="text-[11px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-[#ccbdff]/10 text-[#ccbdff] border border-[#ccbdff]/30">
                {course.difficulty} Level
              </span>
              <span className="text-[11px] text-[#bacac6] flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                {course.language}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 leading-snug">
              {course.title}
            </h1>

            <p className="text-sm text-[#bacac6] leading-relaxed mb-6">
              {course.longDescription || course.description}
            </p>

            {/* Metrics */}
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-[#272a30] text-xs text-[#bacac6]">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-current" />
                <span>{course.rating}</span>
                <span className="text-[#bacac6] font-normal">
                  ({course.reviewCount.toLocaleString()} ratings)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#58f5e0]" />
                <span>{course.enrolledCount.toLocaleString()} students enrolled</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#ccbdff]" />
                <span>{course.estimatedDuration}</span>
              </div>
            </div>
          </div>

          {/* What You Will Learn Card */}
          <div className="bg-[#191c21] border border-[#272a30] rounded-2xl p-6 sm:p-7">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#58f5e0]" />
              <span>What You Will Master in this Masterclass</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {course.whatYouWillLearn.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-[#e1e2ea]">
                  <Check className="w-4 h-4 text-[#58f5e0] flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tabbed Navigation */}
          <div className="border-b border-[#272a30] flex gap-6">
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'curriculum'
                  ? 'border-[#58f5e0] text-[#58f5e0]'
                  : 'border-transparent text-[#bacac6] hover:text-white'
              }`}
            >
              Course Curriculum ({course.lessons.length} Lessons)
            </button>
            <button
              onClick={() => setActiveTab('instructor')}
              className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'instructor'
                  ? 'border-[#58f5e0] text-[#58f5e0]'
                  : 'border-transparent text-[#bacac6] hover:text-white'
              }`}
            >
              Instructor Bio
            </button>
          </div>

          {/* Tab Contents: Curriculum */}
          {activeTab === 'curriculum' && (
            <div className="space-y-3">
              {course.lessons.map((lesson, idx) => {
                const isCompleted = user.completedLessonIds?.includes(lesson.id);
                const canWatch = isEnrolled || lesson.isFreePreview;

                return (
                  <div
                    key={lesson.id}
                    className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                      canWatch
                        ? 'bg-[#191c21] border-[#272a30] hover:border-[#58f5e0]/50'
                        : 'bg-[#14161c] border-[#20232a] opacity-75'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : canWatch
                            ? 'bg-[#58f5e0]/20 text-[#58f5e0] border border-[#58f5e0]/40'
                            : 'bg-[#272a30] text-[#bacac6]'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : canWatch ? (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="text-xs font-semibold text-white truncate">
                            {lesson.title}
                          </h4>
                          {lesson.isFreePreview && !isEnrolled && (
                            <span className="text-[10px] font-bold bg-[#58f5e0]/15 text-[#58f5e0] px-2 py-0.5 rounded border border-[#58f5e0]/30 whitespace-nowrap">
                              Free Preview
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#bacac6] truncate max-w-md">
                          {lesson.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs font-mono text-[#bacac6]">{lesson.duration}</span>
                      {canWatch ? (
                        <button
                          onClick={() => onStartLearning(course, idx)}
                          className="px-3 py-1 bg-[#2dd8c4] text-[#005a50] rounded-lg font-bold text-xs hover:scale-95 transition-transform cursor-pointer"
                        >
                          {isCompleted ? 'Replay' : 'Watch'}
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#bacac6] flex items-center gap-1">
                          <Lock className="w-3 h-3 text-[#bacac6]" />
                          <span>Locked</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab Contents: Instructor */}
          {activeTab === 'instructor' && (
            <div className="bg-[#191c21] border border-[#272a30] rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-start">
              <img
                src={course.teacherAvatar}
                alt={course.teacherName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#58f5e0]"
              />
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">{course.teacherName}</h3>
                <p className="text-xs font-semibold text-[#58f5e0]">{course.teacherRole}</p>
                <p className="text-xs text-[#bacac6] leading-relaxed">{course.teacherBio}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Enrollment Card */}
        <div className="lg:col-span-1">
          <div className="bg-[#191c21] border border-[#3b4a47] rounded-2xl p-6 sticky top-28 shadow-2xl space-y-6">
            {/* Preview Image */}
            <div className="relative h-44 rounded-xl overflow-hidden border border-[#272a30]">
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <button
                  onClick={() => onStartLearning(course, 0)}
                  className="w-12 h-12 rounded-full bg-[#58f5e0] text-[#005a50] flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_20px_rgba(88,245,224,0.4)] cursor-pointer"
                  title="Watch Free Preview"
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </button>
              </div>
            </div>

            {/* Price Tag */}
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-extrabold text-white">
                  {course.isFree ? 'Free' : `₹${course.price}`}
                </span>
                {!course.isFree && (
                  <span className="text-xs text-[#bacac6] line-through">
                    ₹{Math.round(course.price * 2.5)}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#58f5e0] font-semibold">
                {course.isFree
                  ? 'Open community masterclass'
                  : '🔥 60% Launch discount • Lifetime LMS access'}
              </p>
            </div>

            {/* Progress if Enrolled */}
            {isEnrolled && (
              <div className="bg-[#111319] p-3.5 rounded-xl border border-[#272a30] space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#bacac6]">Your Learning Progress</span>
                  <span className="text-[#58f5e0]">{progressPercent}%</span>
                </div>
                <div className="w-full bg-[#272a30] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#58f5e0] h-full transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#bacac6]">
                  {completedLessonsInCourse} of {course.lessons.length} lessons completed
                </p>
              </div>
            )}

            {/* Primary Action Button */}
            <button
              onClick={() => {
                if (isEnrolled) {
                  onStartLearning(course);
                } else {
                  onEnrollOrBuy(course);
                }
              }}
              className="w-full text-xs uppercase tracking-wider font-bold bg-[#2dd8c4] text-[#005a50] py-3.5 rounded-full hover:scale-95 transition-transform shadow-[0_0_20px_rgba(45,216,196,0.3)] flex items-center justify-center gap-2 cursor-pointer"
            >
              {isEnrolled ? (
                <>
                  <PlayCircle className="w-4 h-4" />
                  <span>Continue Course Player</span>
                </>
              ) : course.isFree ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Enroll in Free Course</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Buy Course – ₹{course.price}</span>
                </>
              )}
            </button>

            {/* Value Props */}
            <div className="border-t border-[#272a30] pt-4 space-y-2.5 text-xs text-[#bacac6]">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#58f5e0]" />
                <span>Full HD video lessons with speed controls</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#58f5e0]" />
                <span>Verified Certificate of Completion</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#58f5e0]" />
                <span>Code snippets, formula sheets & study notes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
