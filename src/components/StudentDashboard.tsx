import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Flame,
  GraduationCap,
  Play,
  PlayCircle,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { MOCK_ACHIEVEMENTS, MOCK_XP_ACTIVITIES } from '../data/edtechData';
import { Course, UserProfile } from '../types';

interface StudentDashboardProps {
  user: UserProfile;
  courses: Course[];
  onNavigateToCourse: (courseId: string) => void;
  onOpenPlayer: (course: Course) => void;
  onOpenStudio: (tab?: string) => void;
  onOpenProfile: () => void;
  onBrowseCourses: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  courses,
  onNavigateToCourse,
  onOpenPlayer,
  onOpenStudio,
  onOpenProfile,
  onBrowseCourses,
}) => {
  const [courseFilter, setCourseFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

  const enrolledCourses = courses.filter((c) =>
    user.enrolledCourseIds?.includes(c.id)
  );

  const activeCourse = enrolledCourses[0] || courses[0];

  const filteredEnrolledCourses = enrolledCourses.filter((c) => {
    const doneLessons = c.lessons.filter((l) =>
      user.completedLessonIds?.includes(l.id)
    ).length;
    const isCompleted = doneLessons === c.lessons.length && c.lessons.length > 0;

    if (courseFilter === 'completed') return isCompleted;
    if (courseFilter === 'in_progress') return !isCompleted;
    return true;
  });

  const totalLessonsDone = user.completedLessonIds?.length || 0;
  const coursesCompletedCount = enrolledCourses.filter(
    (c) =>
      c.lessons.every((l) => user.completedLessonIds?.includes(l.id)) &&
      c.lessons.length > 0
  ).length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 select-none space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#191c21] via-[#161a22] to-[#121d20] border border-[#3b4a47] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-[#58f5e0] px-3 py-1 bg-[#58f5e0]/10 rounded-full border border-[#58f5e0]/20 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Level {user.level} Quantum Scholar</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user.name} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#bacac6] max-w-xl">
            You're on a <span className="text-[#f59e0b] font-bold">{user.streakDays}-Day study streak!</span> Complete today's quest to reach Level {user.level + 1}.
          </p>
        </div>

        {/* Quick CTA Actions */}
        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={() => onOpenStudio('tutor')}
            className="px-4 py-2.5 bg-[#2dd8c4] text-[#005a50] rounded-xl font-bold text-xs uppercase hover:scale-95 transition-transform shadow-[0_0_15px_rgba(45,216,196,0.25)] flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Tutor Studio</span>
          </button>
          <button
            onClick={() => onOpenStudio('quiz')}
            className="px-4 py-2.5 bg-[#1d2025] hover:bg-[#272a30] text-[#ccbdff] border border-[#ccbdff]/30 rounded-xl font-bold text-xs uppercase transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Adaptive Quiz</span>
          </button>
        </div>
      </div>

      {/* 4 Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#191c21] border border-[#272a30] rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#58f5e0] mb-2">
            <span className="text-xs uppercase font-bold text-[#bacac6]">Total XP</span>
            <Trophy className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-white">{user.currentXp.toLocaleString()}</div>
          <p className="text-[11px] text-[#bacac6] mt-1">
            {user.nextLevelXp - user.currentXp} XP to Level {user.level + 1}
          </p>
        </div>

        <div className="bg-[#191c21] border border-[#272a30] rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#f59e0b] mb-2">
            <span className="text-xs uppercase font-bold text-[#bacac6]">Current Streak</span>
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div className="text-2xl font-extrabold text-white">{user.streakDays} Days</div>
          <p className="text-[11px] text-[#58f5e0] mt-1 font-semibold">Active habit streak</p>
        </div>

        <div className="bg-[#191c21] border border-[#272a30] rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#ccbdff] mb-2">
            <span className="text-xs uppercase font-bold text-[#bacac6]">Lessons Finished</span>
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-white">{totalLessonsDone}</div>
          <p className="text-[11px] text-[#bacac6] mt-1">Across enrolled courses</p>
        </div>

        <div className="bg-[#191c21] border border-[#272a30] rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs uppercase font-bold text-[#bacac6]">Learning Hours</span>
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-white">{user.learningHours || 24.5}h</div>
          <p className="text-[11px] text-emerald-400 mt-1 font-semibold">+4.2h this week</p>
        </div>
      </div>

      {/* Main Grid: Recharts XP Line Chart + Continue Learning Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Activity Line Chart (Recharts) */}
        <div className="lg:col-span-2 bg-[#191c21] border border-[#272a30] rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-[#58f5e0]" />
                <span>Weekly XP Velocity & Study Curve</span>
              </h3>
              <p className="text-xs text-[#bacac6]">Track your daily learning consistency & performance</p>
            </div>
            <span className="text-xs font-mono bg-[#111319] text-[#58f5e0] px-2.5 py-1 rounded-lg border border-[#3b4a47]">
              +3,150 XP Weekly
            </span>
          </div>

          {/* Recharts Component */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_XP_ACTIVITIES}>
                <defs>
                  <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#58f5e0" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#58f5e0" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#272a30" vertical={false} />
                <XAxis dataKey="day" stroke="#bacac6" tick={{ fontSize: 11 }} />
                <YAxis stroke="#bacac6" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111319',
                    border: '1px solid #3b4a47',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#e1e2ea',
                  }}
                  formatter={(val: any) => [`${val} XP`, 'Daily XP']}
                />
                <Area
                  type="monotone"
                  dataKey="xp"
                  stroke="#58f5e0"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorXp)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Continue Learning Highlight Card */}
        <div className="lg:col-span-1 bg-[#191c21] border border-[#3b4a47] rounded-3xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[11px] uppercase font-bold text-[#58f5e0] tracking-wider block mb-2">
              ⚡ Resume Learning
            </span>
            <div className="relative h-32 rounded-xl overflow-hidden mb-3 border border-[#272a30]">
              <img
                src={activeCourse.thumbnailUrl}
                alt={activeCourse.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <button
                  onClick={() => onOpenPlayer(activeCourse)}
                  className="w-10 h-10 rounded-full bg-[#58f5e0] text-[#005a50] flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_15px_rgba(88,245,224,0.4)] cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </button>
              </div>
            </div>

            <h4 className="text-sm font-bold text-white line-clamp-1">{activeCourse.title}</h4>
            <p className="text-xs text-[#bacac6] mt-0.5">By {activeCourse.teacherName}</p>

            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-[#bacac6]">
                <span>Progress</span>
                <span className="text-[#58f5e0]">
                  {Math.round(
                    (activeCourse.lessons.filter((l) =>
                      user.completedLessonIds?.includes(l.id)
                    ).length /
                      activeCourse.lessons.length) *
                      100
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-[#272a30] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#58f5e0] h-full rounded-full"
                  style={{
                    width: `${Math.round(
                      (activeCourse.lessons.filter((l) =>
                        user.completedLessonIds?.includes(l.id)
                      ).length /
                        activeCourse.lessons.length) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => onOpenPlayer(activeCourse)}
            className="w-full py-2.5 bg-[#2dd8c4] text-[#005a50] rounded-xl font-bold text-xs uppercase hover:scale-95 transition-transform shadow-[0_0_15px_rgba(45,216,196,0.25)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Continue Lesson</span>
          </button>
        </div>
      </div>

      {/* My Enrolled Courses Section */}
      <div className="bg-[#191c21] border border-[#272a30] rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#58f5e0]" />
              <span>My Enrolled Masterclasses ({enrolledCourses.length})</span>
            </h3>
            <p className="text-xs text-[#bacac6]">Access your registered courses & track syllabus completion</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 bg-[#111319] p-1 rounded-xl border border-[#272a30] text-xs font-semibold">
            {(['all', 'in_progress', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setCourseFilter(f)}
                className={`px-3 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                  courseFilter === f
                    ? 'bg-[#58f5e0] text-[#005a50] font-bold'
                    : 'text-[#bacac6] hover:text-white'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {filteredEnrolledCourses.length === 0 ? (
          <div className="py-12 text-center bg-[#111319] rounded-2xl border border-[#272a30] space-y-3">
            <BookOpen className="w-10 h-10 text-[#3b4a47] mx-auto" />
            <h4 className="text-sm font-bold text-white">No courses in this view</h4>
            <p className="text-xs text-[#bacac6]">Explore thousands of interactive topics created by top educators.</p>
            <button
              onClick={onBrowseCourses}
              className="px-4 py-2 bg-[#2dd8c4] text-[#005a50] rounded-full font-bold text-xs uppercase hover:scale-95 cursor-pointer"
            >
              Browse Course Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEnrolledCourses.map((course) => {
              const doneCount = course.lessons.filter((l) =>
                user.completedLessonIds?.includes(l.id)
              ).length;
              const percent = Math.round((doneCount / (course.lessons.length || 1)) * 100);

              return (
                <div
                  key={course.id}
                  onClick={() => onOpenPlayer(course)}
                  className="bg-[#111319] border border-[#272a30] hover:border-[#58f5e0]/60 rounded-2xl overflow-hidden transition-all hover:-translate-y-1 p-4 flex flex-col justify-between group cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="relative h-32 rounded-xl overflow-hidden">
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute top-2 right-2">
                        <span className="text-[10px] uppercase font-bold bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[#58f5e0] border border-white/10">
                          {percent}% Done
                        </span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-[#58f5e0] transition-colors line-clamp-1">
                      {course.title}
                    </h4>

                    <div className="space-y-1">
                      <div className="w-full bg-[#272a30] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#58f5e0] h-full rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-[#bacac6]">
                        <span>{doneCount} of {course.lessons.length} lessons done</span>
                        <span className="font-mono">{percent}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#272a30] flex items-center justify-between text-xs font-semibold text-[#58f5e0]">
                    <span>Resume Course</span>
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Achievements Highlight */}
      <div className="bg-[#191c21] border border-[#272a30] rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#58f5e0]" />
            <h3 className="text-base font-bold text-white">Recent Achievements & Badges</h3>
          </div>
          <button
            onClick={onOpenProfile}
            className="text-xs font-bold text-[#58f5e0] hover:underline cursor-pointer"
          >
            View All Badges ({MOCK_ACHIEVEMENTS.length})
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {MOCK_ACHIEVEMENTS.slice(0, 6).map((ach) => (
            <div
              key={ach.id}
              className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-between gap-2 ${
                ach.unlocked
                  ? 'bg-[#111319] border-[#58f5e0]/40'
                  : 'bg-[#14161c] border-[#272a30] opacity-50'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  ach.unlocked ? 'bg-[#58f5e0]/20 text-[#58f5e0]' : 'bg-[#272a30] text-[#bacac6]'
                }`}
              >
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-[11px] font-bold text-white truncate max-w-[110px]">
                  {ach.title}
                </h5>
                <span className="text-[9px] uppercase font-bold text-[#bacac6]">
                  {ach.rarity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
