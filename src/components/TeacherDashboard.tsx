import {
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  Film,
  GraduationCap,
  Heart,
  IndianRupee,
  Plus,
  Share2,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  Upload,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Course, ShortVideo, UserProfile } from '../types';

interface TeacherDashboardProps {
  user: UserProfile;
  courses: Course[];
  videos: ShortVideo[];
  /** Current URL (e.g. "/app/teacher/videos") — used to keep the in-page
   * tab in sync with which sidebar/topbar item was clicked. Without this
   * the component had its own tab state completely disconnected from the
   * route: navigating to /app/teacher/videos changed the URL but nothing
   * ever called setActiveTab, so every nav item just showed whatever tab
   * happened to be active already. */
  activeRoute: string;
  onOpenCreateCourse: () => void;
  onOpenUploadVideo: () => void;
  onSelectCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onDeleteVideo: (videoId: string) => void;
}

function tabForRoute(route: string): 'courses' | 'videos' | 'revenue' {
  if (route === '/app/teacher/videos') return 'videos';
  // "Analytics" and "Revenue" are separate sidebar links but share one
  // combined "Revenue & Sales Analytics" tab in this view — there's no
  // separate analytics-only content to route to without adding new UI.
  if (route === '/app/teacher/revenue' || route === '/app/teacher/analytics') return 'revenue';
  // /app/teacher (Overview) and /app/teacher/courses both land on Courses.
  return 'courses';
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  user,
  courses,
  videos,
  activeRoute,
  onOpenCreateCourse,
  onOpenUploadVideo,
  onSelectCourse,
  onDeleteCourse,
  onDeleteVideo,
}) => {
  const [activeTab, setActiveTab] = useState<'courses' | 'videos' | 'revenue'>(() => tabForRoute(activeRoute));

  // Re-sync whenever the sidebar/topbar navigates to a different teacher
  // route; clicking the in-page tab buttons below still updates
  // immediately via setActiveTab without needing a URL change.
  useEffect(() => {
    setActiveTab(tabForRoute(activeRoute));
  }, [activeRoute]);

  // teacherId now comes straight from courses.teacher_id / short_videos.creator_id
  // (real Supabase Auth UUIDs — see VORMIRIX_BACKEND_PLAN.md). The old
  // fallback here (`user.id === 'teacher-1' || c.teacherName === user.name`)
  // was a demo-persona workaround that would have shown courses belonging to
  // a different teacher who happened to share a display name.
  const teacherCourses = courses.filter((c) => c.teacherId === user.id);
  const teacherVideos = videos.filter((v) => v.teacherId === user.id);

  const totalStudents = teacherCourses.reduce((acc, c) => acc + c.enrolledCount, 0);
  const totalRevenue = teacherCourses.reduce((acc, c) => acc + (c.isFree ? 0 : c.price * c.enrolledCount), 0);
  const totalViews = teacherVideos.reduce((acc, v) => acc + v.viewsCount, 0);
  const totalLikes = teacherVideos.reduce((acc, v) => acc + v.likesCount, 0);

  const revenueData = [
    { month: 'Jan', revenue: 45000, enrollments: 45 },
    { month: 'Feb', revenue: 68000, enrollments: 68 },
    { month: 'Mar', revenue: 89000, enrollments: 92 },
    { month: 'Apr', revenue: 112000, enrollments: 120 },
    { month: 'May', revenue: 145000, enrollments: 154 },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 select-none space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#191c21] via-[#1c1d29] to-[#121d20] border border-[#3b4a47] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-[#58f5e0] px-3 py-1 bg-[#58f5e0]/10 rounded-full border border-[#58f5e0]/20 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Verified Educator Studio</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Teacher Control Center • {user.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#bacac6] max-w-xl">
            Publish interactive masterclasses, upload educational reels, and track course sales analytics.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenUploadVideo}
            className="px-4 py-2.5 bg-[#1d2025] hover:bg-[#272a30] text-[#58f5e0] border border-[#58f5e0]/30 rounded-xl font-bold text-xs uppercase transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Film className="w-4 h-4" />
            <span>Upload Short Video</span>
          </button>
          <button
            onClick={onOpenCreateCourse}
            className="px-5 py-2.5 bg-[#2dd8c4] text-[#005a50] rounded-xl font-bold text-xs uppercase hover:scale-95 transition-transform shadow-[0_0_15px_rgba(45,216,196,0.25)] flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Masterclass</span>
          </button>
        </div>
      </div>

      {/* 4 Key Educator Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#191c21] border border-[#272a30] rounded-2xl p-5">
          <div className="flex items-center justify-between text-[#58f5e0] mb-2">
            <span className="text-xs uppercase font-bold text-[#bacac6]">Total Learners</span>
            <Users className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {totalStudents.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 font-semibold">+18% growth this month</p>
        </div>

        <div className="bg-[#191c21] border border-[#272a30] rounded-2xl p-5">
          <div className="flex items-center justify-between text-[#58f5e0] mb-2">
            <span className="text-xs uppercase font-bold text-[#bacac6]">Estimated Revenue</span>
            <IndianRupee className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            ₹{totalRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#58f5e0] mt-1 font-semibold">Direct LMS payout</p>
        </div>

        <div className="bg-[#191c21] border border-[#272a30] rounded-2xl p-5">
          <div className="flex items-center justify-between text-[#ccbdff] mb-2">
            <span className="text-xs uppercase font-bold text-[#bacac6]">Short Video Views</span>
            <Eye className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {totalViews.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#ccbdff] mt-1 font-semibold">{totalLikes} Reel likes</p>
        </div>

        <div className="bg-[#191c21] border border-[#272a30] rounded-2xl p-5">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs uppercase font-bold text-[#bacac6]">Instructor Rating</span>
            <Star className="w-5 h-5 fill-current" />
          </div>
          <div className="text-2xl font-extrabold text-white">4.92 ★</div>
          <p className="text-[11px] text-[#bacac6] mt-1">Based on 6,400+ reviews</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-[#272a30] flex gap-6">
        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'courses'
              ? 'border-[#58f5e0] text-[#58f5e0]'
              : 'border-transparent text-[#bacac6] hover:text-white'
          }`}
        >
          My Courses ({teacherCourses.length})
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'videos'
              ? 'border-[#58f5e0] text-[#58f5e0]'
              : 'border-transparent text-[#bacac6] hover:text-white'
          }`}
        >
          My Short Videos & Reels ({teacherVideos.length})
        </button>
        <button
          onClick={() => setActiveTab('revenue')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'revenue'
              ? 'border-[#58f5e0] text-[#58f5e0]'
              : 'border-transparent text-[#bacac6] hover:text-white'
          }`}
        >
          Revenue & Sales Analytics
        </button>
      </div>

      {/* TAB 1: My Courses */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm uppercase font-bold text-white tracking-wider">
              Active Masterclasses
            </h3>
            <button
              onClick={onOpenCreateCourse}
              className="text-xs font-bold text-[#58f5e0] flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Course</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teacherCourses.map((course) => (
              <div
                key={course.id}
                className="bg-[#191c21] border border-[#272a30] rounded-2xl overflow-hidden p-4 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="relative h-36 rounded-xl overflow-hidden mb-3">
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-black/70 backdrop-blur-md rounded text-[#58f5e0]">
                        {course.isFree ? 'Free' : `₹${course.price}`}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-white line-clamp-1">{course.title}</h4>
                  <p className="text-xs text-[#bacac6] mt-1">
                    {course.lessons.length} Lessons • {course.difficulty}
                  </p>

                  <div className="flex items-center justify-between text-xs text-[#bacac6] mt-3 pt-3 border-t border-[#272a30]">
                    <span>Learners: {course.enrolledCount.toLocaleString()}</span>
                    <span className="text-[#58f5e0] font-semibold">
                      {course.isFree ? 'Community' : `₹${(course.price * course.enrolledCount).toLocaleString()}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2">
                  <button
                    onClick={() => onSelectCourse(course)}
                    className="flex-1 py-1.5 bg-[#1d2025] hover:bg-[#272a30] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    View Curriculum
                  </button>
                  <button
                    onClick={() => onDeleteCourse(course.id)}
                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Delete Course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: My Short Videos */}
      {activeTab === 'videos' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm uppercase font-bold text-white tracking-wider">
              Published Short Videos & Micro-Lessons
            </h3>
            <button
              onClick={onOpenUploadVideo}
              className="text-xs font-bold text-[#58f5e0] flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload New Reel</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {teacherVideos.map((video) => (
              <div
                key={video.id}
                className="bg-[#191c21] border border-[#272a30] rounded-2xl overflow-hidden p-3.5 flex flex-col justify-between space-y-3"
              >
                <div className="relative h-44 rounded-xl overflow-hidden">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 right-2 flex justify-between text-[10px] text-white bg-black/60 backdrop-blur-md px-2 py-1 rounded-md">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-[#58f5e0]" />
                      {video.viewsCount.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-400 fill-current" />
                      {video.likesCount}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white line-clamp-2">{video.title}</h4>
                  <span className="text-[10px] text-[#58f5e0] uppercase font-semibold block mt-1">
                    #{video.category}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#272a30]">
                  <span className="text-[11px] text-[#bacac6]">{video.createdAt}</span>
                  <button
                    onClick={() => onDeleteVideo(video.id)}
                    className="text-rose-400 hover:text-rose-300 p-1"
                    title="Delete Video"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Revenue & Sales Analytics */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="bg-[#191c21] border border-[#272a30] rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#58f5e0]" />
                  <span>Monthly Revenue Trend (₹)</span>
                </h3>
                <p className="text-xs text-[#bacac6]">
                  Verified gross sales and recurring student enrollments
                </p>
              </div>
              <span className="text-sm font-mono font-bold text-[#58f5e0] bg-[#111319] px-3 py-1.5 rounded-xl border border-[#3b4a47]">
                Total: ₹{totalRevenue.toLocaleString()}
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#272a30" vertical={false} />
                  <XAxis dataKey="month" stroke="#bacac6" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#bacac6" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111319',
                      border: '1px solid #3b4a47',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: '#e1e2ea',
                    }}
                    formatter={(val: any) => [`₹${val.toLocaleString()}`, 'Gross Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#58f5e0" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
