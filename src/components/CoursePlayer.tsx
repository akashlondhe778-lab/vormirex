import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Award,
  BookOpen,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Flame,
  Lock,
  MessageSquare,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Course, Lesson, UserProfile } from '../types';
import { VormirexLogo } from './VormirexLogo';

interface CoursePlayerProps {
  course: Course;
  user: UserProfile;
  initialLessonIndex?: number;
  onBack: () => void;
  onCompleteLesson: (lessonId: string, xpReward: number) => void;
  onOpenDoubtTutor: (context: string) => void;
  onEnrollOrBuy: (course: Course) => void;
}

export const CoursePlayer: React.FC<CoursePlayerProps> = ({
  course,
  user,
  initialLessonIndex = 0,
  onBack,
  onCompleteLesson,
  onOpenDoubtTutor,
  onEnrollOrBuy,
}) => {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(initialLessonIndex);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'notes' | 'discussion'>('notes');
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeLesson: Lesson = course.lessons[currentLessonIndex] || course.lessons[0];
  const isEnrolled = user.enrolledCourseIds?.includes(course.id);
  const isLessonLocked = !isEnrolled && !activeLesson.isFreePreview;
  const isLessonCompleted = user.completedLessonIds?.includes(activeLesson.id);

  const completedCount = course.lessons.filter((l) =>
    user.completedLessonIds?.includes(l.id)
  ).length;
  const progressPercent = Math.round(
    (completedCount / (course.lessons.length || 1)) * 100
  );

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [currentLessonIndex, playbackSpeed]);

  const handleToggleComplete = () => {
    if (!isLessonCompleted) {
      onCompleteLesson(activeLesson.id, activeLesson.xpReward || 20);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#58f5e0', '#2dd8c4', '#ccbdff'],
        });
      } catch {}
    }
  };

  const handleNextLesson = () => {
    if (currentLessonIndex < course.lessons.length - 1) {
      setCurrentLessonIndex((prev) => prev + 1);
    }
  };

  const handlePrevLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0e14] text-[#e1e2ea] flex flex-col select-none">
    {/* Top Player Navbar */}
      <header className="bg-[#111319] border-b border-[#272a30] px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs uppercase font-bold text-[#bacac6] hover:text-[#58f5e0] transition-colors p-1.5 rounded-lg hover:bg-[#1d2025] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit Course</span>
          </button>
          <div className="h-4 w-[1px] bg-[#272a30]" />
          <div className="flex items-center gap-2 min-w-0">
            <VormirexLogo size={18} variant="gradient" />
            <h2 className="text-xs sm:text-sm font-bold text-white truncate">
              {course.title}
            </h2>
          </div>
        </div>

        {/* Progress & XP indicator */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold">
            <span className="text-[#bacac6]">Progress:</span>
            <div className="w-24 bg-[#272a30] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#58f5e0] h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[#58f5e0] font-mono">{progressPercent}%</span>
          </div>

          <button
            onClick={() => onOpenDoubtTutor(`I have a doubt regarding Lesson: "${activeLesson.title}" in course "${course.title}"`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1d2025] hover:bg-[#272a30] text-[#58f5e0] border border-[#58f5e0]/30 text-xs font-bold transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask AI Doubt</span>
          </button>
        </div>
      </header>

      {/* Main Player Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 min-h-0">
        {/* Left 3 Columns: Video Player + Controls + Study Notes */}
        <div className="lg:col-span-3 flex flex-col bg-black border-r border-[#272a30] overflow-y-auto">
          {/* Video Container */}
          <div className="relative aspect-video w-full bg-black flex items-center justify-center">
            {isLessonLocked ? (
              <div className="absolute inset-0 bg-[#111319]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#58f5e0]/15 border border-[#58f5e0]/40 flex items-center justify-center text-[#58f5e0]">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Lesson Locked • Enroll to Access
                </h3>
                <p className="text-xs text-[#bacac6] max-w-md">
                  This lesson is part of the full curriculum for <span className="text-white font-semibold">{course.title}</span>.
                </p>
                <button
                  onClick={() => onEnrollOrBuy(course)}
                  className="px-6 py-3 bg-[#2dd8c4] text-[#005a50] rounded-full font-bold text-xs uppercase hover:scale-95 transition-transform shadow-[0_0_20px_rgba(45,216,196,0.3)] cursor-pointer"
                >
                  {course.isFree ? 'Enroll Free' : `Buy Course – ₹${course.price}`}
                </button>
              </div>
            ) : (
              <video
                ref={videoRef}
                src={activeLesson.videoUrl}
                controls
                playsInline
                className="w-full h-full object-contain"
              />
            )}
          </div>

          {/* Player Toolbar */}
          <div className="p-4 bg-[#111319] border-b border-[#272a30] flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold text-[#58f5e0] px-2 py-0.5 bg-[#58f5e0]/10 rounded border border-[#58f5e0]/20">
                  Lesson {currentLessonIndex + 1} of {course.lessons.length}
                </span>
                <span className="text-xs font-mono text-[#bacac6]">
                  {activeLesson.duration}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white">
                {activeLesson.title}
              </h1>
            </div>

            {/* Actions: Mark Complete & Speed */}
            <div className="flex items-center gap-3">
              {/* Playback Speed Switcher */}
              <div className="flex items-center bg-[#1d2025] rounded-xl p-1 border border-[#272a30] text-xs font-mono">
                {[1, 1.25, 1.5, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                      playbackSpeed === spd
                        ? 'bg-[#58f5e0] text-[#005a50] font-bold'
                        : 'text-[#bacac6] hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              {/* Mark Complete Button */}
              {!isLessonLocked && (
                <button
                  onClick={handleToggleComplete}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                    isLessonCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-[#2dd8c4] text-[#005a50] hover:scale-95 shadow-[0_0_15px_rgba(45,216,196,0.3)]'
                  }`}
                >
                  {isLessonCompleted ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Completed (+{activeLesson.xpReward || 20} XP)</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark Lesson Complete (+{activeLesson.xpReward || 20} XP)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Navigation Bar (Prev / Next) */}
          <div className="px-4 py-3 bg-[#161920] border-b border-[#272a30] flex items-center justify-between">
            <button
              onClick={handlePrevLesson}
              disabled={currentLessonIndex === 0}
              className="flex items-center gap-1 text-xs font-semibold text-[#bacac6] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Lesson</span>
            </button>

            <button
              onClick={handleNextLesson}
              disabled={currentLessonIndex === course.lessons.length - 1}
              className="flex items-center gap-1 text-xs font-bold text-[#58f5e0] hover:underline disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Next Lesson</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Study Notes & Lesson Resources Tab */}
          <div className="p-6 space-y-4">
            <div className="flex gap-4 border-b border-[#272a30] pb-2">
              <button
                onClick={() => setActiveTab('notes')}
                className={`text-xs font-bold uppercase pb-1 border-b-2 cursor-pointer ${
                  activeTab === 'notes'
                    ? 'border-[#58f5e0] text-[#58f5e0]'
                    : 'border-transparent text-[#bacac6]'
                }`}
              >
                Key Takeaways & Notes
              </button>
              <button
                onClick={() => setActiveTab('discussion')}
                className={`text-xs font-bold uppercase pb-1 border-b-2 cursor-pointer ${
                  activeTab === 'discussion'
                    ? 'border-[#58f5e0] text-[#58f5e0]'
                    : 'border-transparent text-[#bacac6]'
                }`}
              >
                Lesson Discussion
              </button>
            </div>

            {activeTab === 'notes' ? (
              <div className="bg-[#14161c] p-4 rounded-xl border border-[#272a30] space-y-3">
                <p className="text-xs text-[#e1e2ea] leading-relaxed">
                  {activeLesson.description}
                </p>
                {activeLesson.notes && (
                  <div className="p-3 bg-[#1d2025] rounded-lg border border-[#3b4a47] text-xs text-[#bacac6] font-mono leading-relaxed">
                    💡 <span className="text-[#58f5e0] font-bold">Pro Tip:</span> {activeLesson.notes}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#14161c] p-6 rounded-xl border border-[#272a30] text-center space-y-3">
                <MessageSquare className="w-8 h-8 text-[#58f5e0] mx-auto opacity-75" />
                <h4 className="text-xs font-bold text-white">
                  Have a question about this lesson?
                </h4>
                <p className="text-xs text-[#bacac6]">
                  Ask Vormirex AI Tutor or post for your classmates.
                </p>
                <button
                  onClick={() => onOpenDoubtTutor(`Please explain the concept in "${activeLesson.title}" with a step-by-step example.`)}
                  className="px-4 py-2 bg-[#58f5e0]/15 text-[#58f5e0] rounded-lg border border-[#58f5e0]/30 text-xs font-bold hover:bg-[#58f5e0]/25 transition-all cursor-pointer"
                >
                  Start Instant AI Discussion
                </button>
              </div>
            )}

            {/* Course Finished Certificate Banner */}
            {progressPercent === 100 && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#191c21] to-[#142621] border border-[#58f5e0] flex items-center justify-between gap-4 animate-in zoom-in duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#58f5e0]/20 flex items-center justify-center text-[#58f5e0]">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      🎉 Course 100% Completed!
                    </h3>
                    <p className="text-xs text-[#bacac6]">
                      You have earned verified mastery in {course.title}.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => alert(`Certificate of Completion issued to ${user.name} for ${course.title}!`)}
                  className="px-4 py-2 bg-[#58f5e0] text-[#005a50] rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(88,245,224,0.3)]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Certificate</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Lesson List Sidebar */}
        <div className="lg:col-span-1 bg-[#14161c] p-4 flex flex-col h-full overflow-y-auto">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#272a30]">
            <h3 className="text-xs uppercase font-bold text-white tracking-wider">
              Curriculum Lessons
            </h3>
            <span className="text-xs font-mono text-[#58f5e0]">
              {completedCount}/{course.lessons.length} Done
            </span>
          </div>

          <div className="space-y-2 flex-1">
            {course.lessons.map((lesson, idx) => {
              const isCurrent = idx === currentLessonIndex;
              const isCompleted = user.completedLessonIds?.includes(lesson.id);
              const isLocked = !isEnrolled && !lesson.isFreePreview;

              return (
                <button
                  key={lesson.id}
                  onClick={() => setCurrentLessonIndex(idx)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                    isCurrent
                      ? 'bg-[#58f5e0]/10 border-[#58f5e0] text-white shadow-[0_0_12px_rgba(88,245,224,0.15)]'
                      : isCompleted
                      ? 'bg-[#191c21] border-[#272a30] text-[#bacac6]'
                      : isLocked
                      ? 'bg-[#111319] border-[#1d2025] opacity-50'
                      : 'bg-[#191c21] border-[#272a30] text-[#bacac6] hover:border-[#3b4a47]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-xs flex-shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isCurrent
                          ? 'bg-[#58f5e0] text-[#005a50] font-bold'
                          : isLocked
                          ? 'bg-[#272a30] text-[#bacac6]'
                          : 'bg-[#272a30] text-[#bacac6]'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : isLocked ? (
                        <Lock className="w-3 h-3" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-[#58f5e0]' : 'text-white'}`}>
                        {lesson.title}
                      </p>
                      <p className="text-[10px] text-[#bacac6] font-mono">
                        {lesson.duration}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
