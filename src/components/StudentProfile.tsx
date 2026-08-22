import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Edit2,
  Flame,
  GraduationCap,
  Sparkles,
  Trophy,
  User,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { MOCK_ACHIEVEMENTS } from '../data/edtechData';
import { Course, UserProfile } from '../types';

interface StudentProfileProps {
  user: UserProfile;
  courses: Course[];
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onOpenPlayer: (course: Course) => void;
  onShowToast: (msg: string) => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({
  user,
  courses,
  onUpdateUser,
  onOpenPlayer,
  onShowToast,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');

  const enrolledCourses = courses.filter((c) =>
    user.enrolledCourseIds?.includes(c.id)
  );

  const completedCourses = enrolledCourses.filter((c) =>
    c.lessons.every((l) => user.completedLessonIds?.includes(l.id)) && c.lessons.length > 0
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ name, bio });
    setIsEditing(false);
    onShowToast('Profile updated successfully!');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 select-none space-y-8">
      {/* Profile Header Card */}
      <div className="bg-[#191c21] border border-[#3b4a47] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-24 h-24 rounded-3xl object-cover border-2 border-[#58f5e0] shadow-[0_0_20px_rgba(88,245,224,0.3)]"
          />

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">{user.name}</h1>
              <span className="text-[11px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-[#58f5e0]/15 text-[#58f5e0] border border-[#58f5e0]/30">
                {user.role === 'teacher' ? 'Educator' : 'Student Scholar'}
              </span>
              <span className="text-[11px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-[#ccbdff]/15 text-[#ccbdff] border border-[#ccbdff]/30">
                Level {user.level}
              </span>
            </div>
            <p className="text-xs text-[#bacac6] max-w-xl">
              {user.bio || 'Computer Science & Mathematics learner on Vormirix AI Arena.'}
            </p>
            <p className="text-[11px] text-[#bacac6]/70">{user.email}</p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-[#1d2025] hover:bg-[#272a30] text-white border border-[#3b4a47] rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
        >
          <Edit2 className="w-4 h-4" />
          <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
        </button>
      </div>

      {/* Edit Profile Form if Toggled */}
      {isEditing && (
        <form
          onSubmit={handleSave}
          className="bg-[#191c21] border border-[#58f5e0]/40 rounded-3xl p-6 space-y-4 animate-in fade-in"
        >
          <h3 className="text-sm font-bold text-[#58f5e0] uppercase tracking-wider">
            Edit Scholar Profile
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#111319] border border-[#3b4a47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#58f5e0]"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1">
                Bio & Academic Interests
              </label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-[#111319] border border-[#3b4a47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#58f5e0]"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-[#2dd8c4] text-[#005a50] rounded-xl text-xs font-bold uppercase hover:scale-95 transition-transform"
          >
            Save Changes
          </button>
        </form>
      )}

      {/* 4 Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#191c21] border border-[#272a30] rounded-2xl p-5">
          <div className="flex items-center justify-between text-[#58f5e0] mb-2">
            <span className="text-xs uppercase font-bold text-[#bacac6]">Total XP</span>
            <Trophy className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-white">{user.currentXp.toLocaleString()}</div>
        </div>

        <div className="bg-[#191c21] border border-[#272a30] rounded-2xl p-5">
          <div className="flex items-center justify-between text-[#f59e0b] mb-2">
            <span className="text-xs uppercase font-bold text-[#bacac6]">Streak Record</span>
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div className="text-2xl font-extrabold text-white">{user.streakDays} Days</div>
        </div>

        <div className="bg-[#191c21] border border-[#272a30] rounded-2xl p-5">
          <div className="flex items-center justify-between text-[#ccbdff] mb-2">
            <span className="text-xs uppercase font-bold text-[#bacac6]">Completed Lessons</span>
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {user.completedLessonIds?.length || 0}
          </div>
        </div>

        <div className="bg-[#191c21] border border-[#272a30] rounded-2xl p-5">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs uppercase font-bold text-[#bacac6]">Certificates Earned</span>
            <Award className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-white">{completedCourses.length}</div>
        </div>
      </div>

      {/* Achievements Gallery */}
      <div className="bg-[#191c21] border border-[#272a30] rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-[#58f5e0]" />
            <span>Badges & Gamification Showcase</span>
          </h3>
          <p className="text-xs text-[#bacac6]">Earn XP and complete learning milestones to unlock badges.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_ACHIEVEMENTS.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${
                ach.unlocked
                  ? 'bg-[#111319] border-[#58f5e0]/40 shadow-lg'
                  : 'bg-[#14161c] border-[#272a30] opacity-50'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  ach.unlocked
                    ? 'bg-[#58f5e0]/20 text-[#58f5e0] border border-[#58f5e0]/40'
                    : 'bg-[#272a30] text-[#bacac6]'
                }`}
              >
                <Award className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold text-white truncate">{ach.title}</h4>
                  <span className="text-[9px] uppercase font-bold text-[#58f5e0] px-1.5 py-0.5 rounded bg-[#58f5e0]/10 border border-[#58f5e0]/20">
                    {ach.rarity}
                  </span>
                </div>
                <p className="text-[11px] text-[#bacac6] leading-relaxed mb-2">{ach.description}</p>
                <div className="flex items-center justify-between text-[10px] text-[#bacac6]">
                  <span>{ach.unlocked ? `Unlocked ${ach.unlockedDate || 'recently'}` : 'In Progress'}</span>
                  <span>{ach.progress}/{ach.maxProgress}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certificates Section */}
      <div className="bg-[#191c21] border border-[#272a30] rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-[#58f5e0]" />
          <span>Issued Course Certificates</span>
        </h3>

        {completedCourses.length === 0 ? (
          <div className="p-6 bg-[#111319] rounded-2xl border border-[#272a30] text-center space-y-2">
            <GraduationCap className="w-8 h-8 text-[#3b4a47] mx-auto" />
            <p className="text-xs text-[#bacac6]">
              Complete all lessons in any enrolled course to receive a verified Vormirix Certificate.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedCourses.map((course) => (
              <div
                key={course.id}
                className="bg-[#111319] border border-[#58f5e0]/40 p-4 rounded-2xl flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{course.title}</h4>
                  <p className="text-[11px] text-[#bacac6]">Issued by {course.teacherName}</p>
                </div>
                <button
                  onClick={() => alert(`Certificate verification link for ${course.title} copied!`)}
                  className="px-3 py-1.5 bg-[#58f5e0] text-[#005a50] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
