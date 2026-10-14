import {
  Award,
  Calendar,
  CheckCircle,
  Flame,
  GraduationCap,
  Lock,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import React from 'react';
import { Achievement, Course, UserProfile } from '../../types';

interface AchievementsViewProps {
  user: UserProfile;
  courses: Course[];
  /** Real unlock status from student_achievements (src/hooks/useAchievements.ts). */
  achievements: Achievement[];
  onNavigate: (route: string) => void;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({
  user,
  courses,
  achievements,
  onNavigate,
}) => {
  const completedCourses = courses.filter(
    (c) =>
      user.enrolledCourseIds?.includes(c.id) &&
      c.lessons.every((l) => user.completedLessonIds?.includes(l.id)) &&
      c.lessons.length > 0
  );

  const levelProgress = Math.min(
    100,
    Math.round((user.currentXp / (user.nextLevelXp || 4000)) * 100)
  );

  return (
    <div className="space-y-8 select-none pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Award className="w-7 h-7 text-[#f59e0b]" />
          <span>Achievements & Scholar Milestones</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#bacac6] mt-1">
          Gamified rewards earned through continuous study streaks, lesson completions, and quiz solutions.
        </p>
      </div>

      {/* Level Tier Hero Card */}
      <div className="bg-gradient-to-r from-[#191c21] via-[#161a22] to-[#1a1728] border border-[#3b4a47] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#ccbdff] px-3 py-1 bg-[#ccbdff]/15 rounded-full border border-[#ccbdff]/30 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-[#ccbdff]" />
                <span>Tier 3: Quantum Scholar</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Level {user.level} • {user.currentXp.toLocaleString()} Total XP
            </h2>

            <div className="space-y-2 max-w-xl">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#bacac6]">Progress to Level {user.level + 1}</span>
                <span className="text-[#58f5e0]">
                  {user.currentXp} / {user.nextLevelXp} XP ({levelProgress}%)
                </span>
              </div>
              <div className="w-full h-3 bg-[#111319] rounded-full overflow-hidden p-0.5 border border-[#272a30]">
                <div
                  className="h-full bg-gradient-to-r from-[#58f5e0] via-[#2dd8c4] to-[#ccbdff] rounded-full transition-all duration-500"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-[#bacac6]">
                Earn {(user.nextLevelXp - user.currentXp).toLocaleString()} more XP to unlock the <strong className="text-white">Mastery Crest</strong> badge.
              </p>
            </div>
          </div>

          <div className="bg-[#111319] border border-[#272a30] rounded-2xl p-5 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center text-[#f59e0b] mx-auto">
              <Flame className="w-7 h-7 fill-current" />
            </div>
            <div>
              <span className="text-2xl font-black text-white">{user.streakDays} Days</span>
              <p className="text-[11px] text-[#bacac6] uppercase font-bold tracking-wider">
                Active Study Streak
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-[#58f5e0]" />
          <span>Earned Scholar Badges</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {achievements.map((badge) => (
            <div
              key={badge.id}
              className={`p-5 rounded-2xl border transition-all ${
                badge.unlocked
                  ? 'bg-[#191c21] border-[#3b4a47] shadow-lg'
                  : 'bg-[#14171d]/60 border-[#272a30] opacity-60'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${
                    badge.unlocked
                      ? 'bg-[#2dd8c4]/20 border border-[#2dd8c4]/40 text-[#58f5e0]'
                      : 'bg-[#272a30] text-[#bacac6]'
                  }`}
                >
                  <Trophy className="w-6 h-6" />
                </div>

                <div className="space-y-1 overflow-hidden flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{badge.title}</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        badge.rarity === 'Legendary'
                          ? 'bg-[#f59e0b]/20 text-[#f59e0b]'
                          : badge.rarity === 'Epic'
                          ? 'bg-[#ccbdff]/20 text-[#ccbdff]'
                          : 'bg-[#58f5e0]/20 text-[#58f5e0]'
                      }`}
                    >
                      {badge.rarity}
                    </span>
                  </div>
                  <p className="text-xs text-[#bacac6] leading-relaxed">{badge.description}</p>
                  <div className="pt-2 text-[10px] font-semibold text-[#58f5e0]">
                    {badge.unlocked ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-[#2dd8c4]" />
                        <span>Unlocked • {badge.unlockedDate || 'Recent'}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[#bacac6]">
                        <Lock className="w-3 h-3" />
                        <span>Progress: {badge.progress}/{badge.maxProgress}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Certificates Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-[#ccbdff]" />
          <span>Course Completion Certificates</span>
        </h3>

        {completedCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {completedCourses.map((course) => (
              <div
                key={course.id}
                className="bg-[#191c21] border border-[#3b4a47] rounded-2xl p-5 flex items-center justify-between shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#ccbdff]/15 border border-[#ccbdff]/30 text-[#ccbdff] flex items-center justify-center">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{course.title}</h4>
                    <p className="text-xs text-[#bacac6]">Certified by {course.teacherName}</p>
                  </div>
                </div>

                <span className="px-3 py-1.5 rounded-xl bg-[#58f5e0]/20 text-[#58f5e0] text-xs font-bold border border-[#58f5e0]/40">
                  Verified
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#191c21] border border-[#272a30] rounded-2xl p-6 text-center space-y-2">
            <GraduationCap className="w-8 h-8 text-[#ccbdff] mx-auto opacity-50" />
            <p className="text-xs text-[#bacac6]">
              Complete 100% of any masterclass syllabus to generate your verified cryptographic certificate.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
