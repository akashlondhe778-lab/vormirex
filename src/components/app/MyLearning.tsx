import {
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  Download,
  GraduationCap,
  Play,
  PlayCircle,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { Course, UserProfile } from '../../types';

interface MyLearningProps {
  user: UserProfile;
  courses: Course[];
  onOpenPlayer: (course: Course, lessonIndex?: number) => void;
  onBrowseCourses: () => void;
  onSelectCourse: (course: Course) => void;
}

export const MyLearning: React.FC<MyLearningProps> = ({
  user,
  courses,
  onOpenPlayer,
  onBrowseCourses,
  onSelectCourse,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'in_progress' | 'completed'>('all');

  const enrolledCourses = courses.filter((c) =>
    user.enrolledCourseIds?.includes(c.id)
  );

  const coursesWithProgress = enrolledCourses.map((c) => {
    const completedCount = c.lessons.filter((l) =>
      user.completedLessonIds?.includes(l.id)
    ).length;
    const totalLessons = c.lessons.length || 1;
    const percent = Math.min(100, Math.round((completedCount / totalLessons) * 100));
    const isCompleted = percent === 100;
    return {
      ...c,
      completedCount,
      totalLessons,
      percent,
      isCompleted,
    };
  });

  const filteredCourses = coursesWithProgress.filter((c) => {
    if (filterTab === 'in_progress') return !c.isCompleted;
    if (filterTab === 'completed') return c.isCompleted;
    return true;
  });

  const totalCertificates = coursesWithProgress.filter((c) => c.isCompleted).length;

  return (
    <div className="space-y-8 select-none pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <PlayCircle className="w-7 h-7 text-[#58f5e0]" />
            <span>My Learning Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#bacac6] mt-1">
            Track your active curriculum masterclasses, syllabus milestones, and completion certificates.
          </p>
        </div>

        {/* Stats pill */}
        <div className="flex items-center gap-3 bg-[#191c21] border border-[#272a30] px-4 py-2 rounded-2xl">
          <div className="text-center pr-3 border-r border-[#272a30]">
            <span className="text-[10px] text-[#bacac6] block">Enrolled</span>
            <span className="text-sm font-extrabold text-white">{enrolledCourses.length}</span>
          </div>
          <div className="text-center pl-1">
            <span className="text-[10px] text-[#58f5e0] block">Completed</span>
            <span className="text-sm font-extrabold text-[#58f5e0]">{totalCertificates}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-[#272a30] pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'all'
                ? 'bg-[#58f5e0] text-[#005a50] shadow-[0_0_12px_rgba(88,245,224,0.3)]'
                : 'text-[#bacac6] hover:bg-[#191c21] hover:text-white'
            }`}
          >
            All Courses ({enrolledCourses.length})
          </button>
          <button
            onClick={() => setFilterTab('in_progress')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'in_progress'
                ? 'bg-[#58f5e0] text-[#005a50] shadow-[0_0_12px_rgba(88,245,224,0.3)]'
                : 'text-[#bacac6] hover:bg-[#191c21] hover:text-white'
            }`}
          >
            In Progress ({coursesWithProgress.filter((c) => !c.isCompleted).length})
          </button>
          <button
            onClick={() => setFilterTab('completed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'completed'
                ? 'bg-[#58f5e0] text-[#005a50] shadow-[0_0_12px_rgba(88,245,224,0.3)]'
                : 'text-[#bacac6] hover:bg-[#191c21] hover:text-white'
            }`}
          >
            Completed ({totalCertificates})
          </button>
        </div>

        <button
          onClick={onBrowseCourses}
          className="text-xs font-bold text-[#58f5e0] hover:underline flex items-center gap-1"
        >
          <span>Explore Catalog +</span>
        </button>
      </div>

      {/* Courses List */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-[#191c21] border border-[#272a30] hover:border-[#3b4a47] rounded-3xl p-6 flex flex-col justify-between shadow-xl transition-all group"
            >
              <div>
                <div className="flex gap-4 mb-4">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-28 h-24 rounded-2xl object-cover shrink-0 border border-[#272a30]"
                  />
                  <div className="space-y-1.5 overflow-hidden flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#58f5e0] uppercase px-2 py-0.5 rounded bg-[#58f5e0]/10 border border-[#58f5e0]/20">
                        {course.category}
                      </span>
                      {course.isCompleted && (
                        <span className="text-[10px] font-bold text-[#f59e0b] flex items-center gap-1 bg-[#f59e0b]/10 px-2 py-0.5 rounded-full border border-[#f59e0b]/30">
                          <Trophy className="w-3 h-3 fill-current" />
                          <span>Certified</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-[#58f5e0] transition-colors leading-snug line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-[#bacac6] truncate">
                      Instructor: {course.teacherName}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-[#bacac6] line-clamp-2 leading-relaxed mb-4">
                  {course.description}
                </p>

                {/* Progress bar */}
                <div className="space-y-2 bg-[#111319] p-3.5 rounded-2xl border border-[#272a30]">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#bacac6]">
                      {course.completedCount} of {course.totalLessons} lessons finished
                    </span>
                    <span className="text-[#58f5e0] font-bold">{course.percent}% Complete</span>
                  </div>
                  <div className="w-full h-2 bg-[#191c21] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#2dd8c4] to-[#58f5e0] transition-all duration-500 rounded-full"
                      style={{ width: `${course.percent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-5 border-t border-[#272a30] flex items-center justify-between gap-3 mt-4">
                <button
                  onClick={() => onSelectCourse(course)}
                  className="px-3.5 py-2 rounded-xl bg-[#111319] hover:bg-[#161922] border border-[#3b4a47] text-xs font-bold text-white transition-all cursor-pointer"
                >
                  Syllabus Details
                </button>

                <button
                  onClick={() => onOpenPlayer(course, 0)}
                  className="px-5 py-2.5 rounded-xl bg-[#2dd8c4] hover:bg-[#58f5e0] text-[#005a50] text-xs font-extrabold flex items-center gap-2 shadow-[0_0_15px_rgba(45,216,196,0.25)] hover:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{course.isCompleted ? 'Review Lessons' : 'Continue Learning'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#191c21] border border-[#272a30] rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto">
          <BookOpen className="w-12 h-12 text-[#58f5e0] mx-auto opacity-60" />
          <h3 className="text-lg font-bold text-white">No courses in this filter</h3>
          <p className="text-xs text-[#bacac6]">
            {filterTab === 'completed'
              ? 'Complete all syllabus lessons to unlock your verified course certificate.'
              : 'You have not enrolled in any masterclasses yet. Check out our free and premium courses.'}
          </p>
          <button
            onClick={onBrowseCourses}
            className="px-6 py-2.5 bg-[#2dd8c4] text-[#005a50] font-extrabold text-xs uppercase rounded-full shadow-md"
          >
            Browse Courses Catalog
          </button>
        </div>
      )}
    </div>
  );
};
