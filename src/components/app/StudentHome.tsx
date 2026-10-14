import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  Clock,
  Compass,
  Film,
  Flame,
  GraduationCap,
  Play,
  PlayCircle,
  Sparkles,
  Star,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import React from 'react';
import { Course, ShortVideo, UserProfile } from '../../types';

interface StudentHomeProps {
  user: UserProfile;
  courses: Course[];
  videos: ShortVideo[];
  onNavigate: (route: string) => void;
  onOpenPlayer: (course: Course, lessonIndex?: number) => void;
  onSelectCourse: (course: Course) => void;
  onOpenStudio: (tab?: string) => void;
}

export const StudentHome: React.FC<StudentHomeProps> = ({
  user,
  courses,
  videos,
  onNavigate,
  onOpenPlayer,
  onSelectCourse,
  onOpenStudio,
}) => {
  // Get time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const enrolledCourses = courses.filter((c) =>
    user.enrolledCourseIds?.includes(c.id)
  );

  const activeCourse = enrolledCourses[0] || courses[0];

  // Recommended short videos
  const recommendedVideos = videos.slice(0, 4);

  // Recommended popular courses (not yet enrolled)
  const popularCourses = courses
    .filter((c) => !user.enrolledCourseIds?.includes(c.id))
    .slice(0, 3);

  return (
    <div className="space-y-8 select-none pb-12">
      {/* 1. Personalized Greeting Banner */}
      <div className="bg-gradient-to-r from-[#191c21] via-[#161a22] to-[#121f22] border border-[#3b4a47] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#58f5e0]/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-[#58f5e0] px-3 py-1 bg-[#58f5e0]/10 rounded-full border border-[#58f5e0]/20 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Level {user.level} Scholar</span>
              </span>
              <span className="text-xs font-bold text-[#f59e0b] px-3 py-1 bg-[#f59e0b]/10 rounded-full border border-[#f59e0b]/20 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{user.streakDays}-Day Streak</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {getGreeting()}, {user.name.split(' ')[0]} 👋
            </h1>
            <p className="text-xs sm:text-sm text-[#bacac6] max-w-xl">
              Ready to learn something new? Complete today's micro-lessons to keep your streak blazing!
            </p>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('/app/feed')}
              className="px-5 py-3 bg-[#2dd8c4] hover:bg-[#58f5e0] text-[#005a50] rounded-xl font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(45,216,196,0.3)] hover:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Film className="w-4 h-4" />
              <span>Watch Reels Feed</span>
            </button>

            <button
              onClick={() => onOpenStudio('tutor')}
              className="px-4 py-3 bg-[#191c21] hover:bg-[#272a30] text-[#e1e2ea] border border-[#3b4a47] rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#58f5e0]" />
              <span>Ask AI Doubt</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Continue Learning Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-[#58f5e0]" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Continue Learning
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/app/learning')}
            className="text-xs font-bold text-[#58f5e0] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Enrolled ({enrolledCourses.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {enrolledCourses.map((course) => {
              const completedCount = course.lessons.filter((l) =>
                user.completedLessonIds?.includes(l.id)
              ).length;
              const totalLessons = course.lessons.length || 1;
              const percent = Math.min(100, Math.round((completedCount / totalLessons) * 100));

              return (
                <div
                  key={course.id}
                  className="bg-[#191c21] border border-[#272a30] hover:border-[#3b4a47] rounded-2xl p-5 flex flex-col justify-between shadow-xl group transition-all"
                >
                  <div className="flex gap-4">
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-24 h-20 rounded-xl object-cover shrink-0 border border-[#272a30]"
                    />
                    <div className="space-y-1 overflow-hidden flex-1">
                      <span className="text-[10px] font-bold text-[#58f5e0] uppercase">
                        {course.category}
                      </span>
                      <h3 className="text-sm font-bold text-white truncate group-hover:text-[#58f5e0] transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-[11px] text-[#bacac6] truncate">
                        By {course.teacherName}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar & CTA */}
                  <div className="mt-4 pt-3 border-t border-[#272a30] space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#bacac6]">Progress</span>
                      <span className="text-[#58f5e0]">{percent}% Complete</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#111319] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#2dd8c4] to-[#58f5e0] transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => onOpenPlayer(course, 0)}
                        className="px-4 py-2 bg-[#2dd8c4] hover:bg-[#58f5e0] text-[#005a50] text-xs font-extrabold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Resume Lesson</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#191c21] border border-[#272a30] rounded-2xl p-8 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-[#58f5e0] mx-auto opacity-70" />
            <h3 className="text-base font-bold text-white">No Enrolled Courses Yet</h3>
            <p className="text-xs text-[#bacac6] max-w-sm mx-auto">
              Explore our masterclasses catalog to start learning full-stack development, math, and AI.
            </p>
            <button
              onClick={() => onNavigate('/app/courses')}
              className="px-5 py-2.5 bg-[#2dd8c4] text-[#005a50] text-xs font-extrabold rounded-full"
            >
              Browse Catalog
            </button>
          </div>
        )}
      </div>

      {/* 3. Recommended Educational Short Videos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-[#ccbdff]" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Recommended Short Videos
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/app/feed')}
            className="text-xs font-bold text-[#ccbdff] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Open Reels Feed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {recommendedVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => onNavigate('/app/feed')}
              className="group bg-[#191c21] border border-[#272a30] hover:border-[#58f5e0]/50 rounded-2xl overflow-hidden cursor-pointer shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="relative aspect-[9/13] bg-black">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                {/* Top Badge */}
                <div className="absolute top-2 left-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-sm">
                    {video.category}
                  </span>
                </div>

                {/* Play icon overlay on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-[#2dd8c4] text-[#005a50] flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Bottom title */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 space-y-1">
                  <p className="text-xs font-bold text-white line-clamp-2 leading-tight drop-shadow-sm">
                    {video.title}
                  </p>
                  <p className="text-[10px] text-[#bacac6]">{video.teacherName}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Popular Masterclasses Discovery */}
      {popularCourses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#f59e0b]" />
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Trending Masterclasses
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/app/courses')}
              className="text-xs font-bold text-[#58f5e0] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Explore All Courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {popularCourses.map((course) => (
              <div
                key={course.id}
                className="bg-[#191c21] border border-[#272a30] hover:border-[#3b4a47] rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl transition-all hover:-translate-y-1 group"
              >
                <div className="relative aspect-video w-full bg-black">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-0.5 bg-[#2dd8c4] text-[#005a50] text-[10px] font-black uppercase rounded-full">
                      {course.isFree ? 'Free' : `₹${course.price.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#bacac6] mb-1">
                      <span className="text-[#58f5e0] font-semibold">{course.category}</span>
                      <div className="flex items-center gap-1 text-[#f59e0b]">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{course.rating}</span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#58f5e0] transition-colors line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-xs text-[#bacac6] line-clamp-2 mt-1">
                      {course.subtitle}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#272a30] flex items-center justify-between">
                    <span className="text-[11px] text-[#bacac6]">By {course.teacherName}</span>
                    <button
                      onClick={() => onSelectCourse(course)}
                      className="px-3 py-1.5 bg-[#111319] hover:bg-[#2dd8c4] hover:text-[#005a50] text-xs font-bold text-white border border-[#3b4a47] rounded-lg transition-all cursor-pointer"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Your Progress Summary Card */}
      <div className="bg-[#191c21] border border-[#272a30] rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Your Weekly Study Velocity</h3>
            <p className="text-xs text-[#bacac6]">
              Keep completing daily quests to unlock Tier 4 Quantum Scholar credentials.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/app/dashboard')}
            className="px-4 py-2 rounded-xl bg-[#111319] border border-[#3b4a47] text-xs font-bold text-[#58f5e0] hover:bg-[#1f232b] transition-all cursor-pointer self-start sm:self-auto"
          >
            View Full Analytics →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#111319] p-4 rounded-2xl border border-[#272a30] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#bacac6]">Total XP</span>
            <p className="text-xl font-extrabold text-[#58f5e0]">{user.currentXp.toLocaleString()} XP</p>
          </div>
          <div className="bg-[#111319] p-4 rounded-2xl border border-[#272a30] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#bacac6]">Study Streak</span>
            <p className="text-xl font-extrabold text-[#f59e0b]">{user.streakDays} Days</p>
          </div>
          <div className="bg-[#111319] p-4 rounded-2xl border border-[#272a30] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#bacac6]">Learning Hours</span>
            <p className="text-xl font-extrabold text-[#ccbdff]">{user.learningHours || 24.5} hrs</p>
          </div>
          <div className="bg-[#111319] p-4 rounded-2xl border border-[#272a30] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#bacac6]">Lessons Completed</span>
            <p className="text-xl font-extrabold text-[#2dd8c4]">{user.completedLessonIds?.length || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
