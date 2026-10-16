import confetti from 'canvas-confetti';
import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AchievementsView } from './components/app/AchievementsView';
import { AppSidebar } from './components/app/AppSidebar';
import { AppTopBar } from './components/app/AppTopBar';
import { MyLearning } from './components/app/MyLearning';
import { StudentHome } from './components/app/StudentHome';
import { AuthModal } from './components/AuthModal';
import { AuthPage } from './components/auth/AuthPage';
import { CommunityPage } from './components/community/CommunityPage';
import { QuestionDetailPage } from './components/community/QuestionDetailPage';
import { StudentProfilePage } from './components/community/StudentProfilePage';
import { CourseDetailPage } from './components/CourseDetailPage';
import { CoursePlayer } from './components/CoursePlayer';
import { CoursesCatalog } from './components/CoursesCatalog';
import { CreateCourseModal } from './components/CreateCourseModal';
import { Footer } from './components/Footer';
import { LegalModal } from './components/LegalModal';
import { PaymentModal } from './components/PaymentModal';
import { PublicLandingPage } from './components/public/PublicLandingPage';
import { PublicNavbar } from './components/public/PublicNavbar';
import { ReelsFeed } from './components/ReelsFeed';
import { StudentDashboard } from './components/StudentDashboard';
import { StudentProfile } from './components/StudentProfile';
import { StudioModal } from './components/StudioModal';
import { TeacherDashboard } from './components/TeacherDashboard';
import { UpgradeModal } from './components/UpgradeModal';
import { UploadVideoModal } from './components/UploadVideoModal';
import { useAchievements } from './hooks/useAchievements';
import { useAuth } from './hooks/useAuth';
import { useCourses, useTeacherCourses } from './hooks/useCourses';
import { useFeed } from './hooks/useFeed';
import { useWeeklyXp } from './hooks/useXP';
import { achievementService } from './services/achievementService';
import { courseService } from './services/courseService';
import { enrollmentService } from './services/enrollmentService';
import { profileService } from './services/profileService';
import { socialProfileService } from './services/socialProfileService';
import { progressService } from './services/progressService';
import { videoService } from './services/videoService';
import { xpService } from './services/xpService';
import { Course, PricingPlan, Question, ShortVideo, UserProfile } from './types';

export default function App() {
  // Authentication State: backed by real Supabase Auth (src/hooks/useAuth.ts).
  // null for unauthenticated visitors by default; session is restored from
  // Supabase on refresh instead of always logging out.
  const { user, loading: authLoading, signIn, signUp, signOut, refreshProfile } = useAuth();

  // Routing State
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const path = window.location.pathname;
    return path && path !== '' ? path : '/';
  });

  // Role input preset for signup
  const [authRolePreset, setAuthRolePreset] = useState<'student' | 'teacher'>('student');

  // Courses & Videos: loaded from Supabase (src/hooks/useCourses.ts,
  // src/hooks/useFeed.ts) instead of the static INITIAL_COURSES /
  // INITIAL_SHORT_VIDEOS mock arrays.
  const { courses, setCourses, reload: reloadCourses } = useCourses();
  const { videos, setVideos, reload: reloadFeed } = useFeed(user?.id);
  // Teacher's own courses regardless of draft/published/archived status —
  // the public `courses` list above only ever contains status='published'
  // rows (see courseService.listPublished), which would otherwise hide a
  // teacher's unpublished drafts from their own dashboard.
  const {
    courses: teacherCourses,
    setCourses: setTeacherCourses,
    reload: reloadTeacherCourses,
  } = useTeacherCourses(user?.role === 'teacher' ? user.id : undefined);
  const { series: weeklyXp } = useWeeklyXp(user?.id);
  const { achievements } = useAchievements(user?.id);

  // Selected entities for deep view
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [playerLessonIndex, setPlayerLessonIndex] = useState<number>(0);
  const [checkoutCourse, setCheckoutCourse] = useState<Course | null>(null);
  // Community / Social: selected question (Ask & Solve detail) and whose
  // public community profile is being viewed — defaults to the viewer's own
  // id when navigating to /app/community/profile with nothing selected.
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [communityProfileId, setCommunityProfileId] = useState<string | null>(null);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [studioTab, setStudioTab] = useState<string>('tutor');
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<PricingPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [isUploadVideoOpen, setIsUploadVideoOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | null>(null);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => {
      setToastNotification(null);
    }, 3500);
  };

  // Sync browser URL with routing
  const navigateTo = (route: string) => {
    setCurrentRoute(route);
    try {
      window.history.pushState({}, '', route);
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname || '/';
      setCurrentRoute(path);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // NOTE — no "are you logged in at all" guard here on purpose: per current
  // product direction, development access must never be blocked by an auth
  // gate. `useAuth` (src/hooks/useAuth.ts) silently signs into a seeded demo
  // account in dev mode when there's no real session, so `user` is
  // effectively always populated while developing. Re-add a redirect-to-
  // /login guard here when production authentication is turned on (see
  // VORMIREX_BACKEND_PLAN.md).
  //
  // The guard below is a DIFFERENT concern: once someone IS authenticated,
  // Student and Teacher are separate account types (see
  // VORMIREX_BACKEND_PLAN.md §13) and must not be able to wander into each
  // other's area via a typed-in URL. `/app/profile` is the one explicitly
  // shared page (both role menus link to it). This is a client-side UX
  // convenience only — the real enforcement is server-side: Supabase RLS
  // checks `profiles.role` on every write (see
  // supabase/migrations/013_role_security.sql), so even if someone bypassed
  // this redirect entirely they still couldn't read/write the other role's
  // data.
  const isTeacherRoute = (route: string) => route.startsWith('/app/teacher');
  const STUDENT_ONLY_ROUTES = [
    '/app',
    '/app/home',
    '/app/feed',
    '/app/courses',
    '/app/courses/detail',
    '/app/learn',
    '/app/learning',
    '/app/dashboard',
    '/app/achievements',
    '/app/community',
    '/app/community/question',
    '/app/community/profile',
  ];

  useEffect(() => {
    if (authLoading || !user) return;

    if (isTeacherRoute(currentRoute) && user.role !== 'teacher') {
      showToast('🔒 Teacher access only — redirected to your Student dashboard.');
      navigateTo('/app');
      return;
    }

    if (user.role === 'teacher' && STUDENT_ONLY_ROUTES.includes(currentRoute)) {
      showToast('🔒 That page is for Students — redirected to your Teacher dashboard.');
      navigateTo('/app/teacher');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoute, user, authLoading]);

  // Resolves a shared "Copy Profile Link" (?u=username) into a real profile
  // id when the community profile route is opened fresh (not just navigated
  // to in-session, where communityProfileId is already set via state).
  useEffect(() => {
    if (currentRoute !== '/app/community/profile') return;
    const params = new URLSearchParams(window.location.search);
    const username = params.get('u');
    if (!username) return;
    socialProfileService
      .getIdByUsername(username)
      .then((id) => {
        if (id) setCommunityProfileId(id);
        else showToast(`No student found with username @${username}.`);
      })
      .catch(() => showToast('Could not resolve that profile link.'))
      .finally(() => {
        params.delete('u');
        const cleanUrl = window.location.pathname + (params.toString() ? `?${params}` : '');
        window.history.replaceState({}, '', cleanUrl);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoute]);

  // Server-authoritative XP: writes to the xp_activities ledger via
  // award_xp() (see supabase/migrations/009_functions.sql), then reloads the
  // profile so currentXp/level reflect what the server actually recorded —
  // the client no longer computes or trusts its own XP math.
  const handleGainXp = async (amount: number, activityType: 'quiz_completed' | 'daily_login' | 'streak_bonus' = 'quiz_completed', referenceId?: string) => {
    if (!user) return;
    const prevLevel = user.level;
    try {
      const result = await xpService.awardXp(user.id, activityType, amount, referenceId);
      await refreshProfile();
      await achievementService.checkAndUnlock(user.id).catch(() => {});

      if (result?.leveled_up) {
        showToast(`🎉 Level Up! You reached Level ${result.level} Quantum Scholar!`);
        try {
          confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 }, colors: ['#58f5e0', '#2dd8c4', '#ccbdff'] });
        } catch {}
      } else if (result?.awarded) {
        showToast(`+${amount} XP Earned in study streak!`);
      }
      void prevLevel;
    } catch (err) {
      console.error('Failed to award XP', err);
    }
  };

  const handleLoginSuccess = (loggedUser: UserProfile) => {
    setIsAuthModalOpen(false);
    showToast(`Welcome back, ${loggedUser.name}! (${loggedUser.role === 'teacher' ? 'Teacher Studio' : 'Student Portal'})`);

    // Redirect to proper dashboard based on role
    if (loggedUser.role === 'teacher') {
      navigateTo('/app/teacher');
    } else {
      navigateTo('/app');
    }
  };

  const handleLogout = async () => {
    await signOut();
    showToast('Signed out of Vormirex.');
    navigateTo('/');
  };

  const handleOpenPlayer = (course: Course, lessonIndex: number = 0) => {
    if (!user) {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedCourse(course);
    setPlayerLessonIndex(lessonIndex);
    navigateTo('/app/learn');
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    if (user) {
      navigateTo('/app/courses/detail');
    } else {
      // In public view, course preview modal handles it
      setAuthModalMode('signup');
      setIsAuthModalOpen(true);
    }
  };

  const handleEnrollOrBuy = async (course: Course) => {
    if (!user) {
      setAuthModalMode('signup');
      setIsAuthModalOpen(true);
      return;
    }

    if (user.enrolledCourseIds?.includes(course.id)) {
      handleOpenPlayer(course, 0);
      return;
    }

    if (course.isFree) {
      // Free enroll — enroll_free_course() re-checks is_free server-side
      // (see 009_functions.sql), so a tampered client can't get free access
      // to a paid course this way.
      try {
        await enrollmentService.enrollFree(course.id);
        await Promise.all([refreshProfile(), reloadCourses()]);
        showToast(`🎉 Enrolled in "${course.title}" for Free!`);
        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 }, colors: ['#58f5e0', '#2dd8c4'] });
        } catch {}
        handleOpenPlayer(course, 0);
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Enrollment failed. Please try again.');
      }
    } else {
      // Paid course -> Open checkout modal (server-verified, see PaymentModal + paymentService)
      setCheckoutCourse(course);
    }
  };

  // Called by PaymentModal only after the verify-payment Edge Function has
  // confirmed the order server-side and finalize_payment() has already
  // created the paid enrollment row — this handler just refreshes local
  // state to reflect what the server already committed.
  const handlePaymentSuccess = async (course: Course) => {
    if (!user) return;
    await Promise.all([refreshProfile(), reloadCourses()]);
    showToast('🚀 Payment successful! Lifetime masterclass access unlocked.');
    setCheckoutCourse(null);
    if (selectedCourse && selectedCourse.id === course.id) {
      handleOpenPlayer(selectedCourse, 0);
    }
  };

  // Idempotent server-side (complete_lesson() re-checks enrollment/preview
  // access and only awards XP once per lesson, see 009_functions.sql) — the
  // xpReward param is now only used for an optimistic toast; the real amount
  // credited comes back from the server.
  const handleCompleteLesson = async (lessonId: string, xpReward: number) => {
    if (!user) return;
    if (user.completedLessonIds?.includes(lessonId)) return;

    try {
      const { alreadyCompleted, xpAwarded } = await progressService.completeLesson(lessonId);
      await refreshProfile();
      await achievementService.checkAndUnlock(user.id).catch(() => {});
      if (!alreadyCompleted) {
        showToast(`+${xpAwarded || xpReward} XP Earned! Lesson completed.`);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not mark lesson complete.');
    }
  };

  const handleCreateCourseSuccess = (newCourse: Course) => {
    setCourses((prev) => [newCourse, ...prev]);
    setTeacherCourses((prev) => [newCourse, ...prev]);
    showToast(`Masterclass "${newCourse.title}" published successfully!`);
    setIsCreateCourseOpen(false);
  };

  const handleUploadVideoSuccess = (newVideo: ShortVideo) => {
    setVideos((prev) => [newVideo, ...prev]);
    showToast(`Educational short video "${newVideo.title}" published to Reels!`);
    setIsUploadVideoOpen(false);
    navigateTo('/app/feed');
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await courseService.deleteCourse(courseId);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      setTeacherCourses((prev) => prev.filter((c) => c.id !== courseId));
      showToast('Course removed from your catalog.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete course.');
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    try {
      await videoService.deleteVideo(videoId);
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
      showToast('Short video removed from Reels feed.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete video.');
    }
  };

  const handleUpgradeSuccess = async (planName: 'Pro' | 'Team') => {
    if (!user) return;
    try {
      await profileService.updateProfile(user.id, { plan: planName });
      await refreshProfile();
      showToast(`🚀 Welcome to Vormirex ${planName}! All premium AI tools unlocked.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Upgrade failed. Please try again.');
    }
  };

  // ReelsFeed handlers — real like/save/comment/follow writes. Fixes the
  // prop-contract mismatch flagged in VORMIREX_BACKEND_PLAN.md (App.tsx
  // previously passed onGainXp/onOpenCourseDetail/onOpenDoubtSolver/
  // onOpenUpload props that ReelsFeed.tsx's actual interface never declared).
  const handleLikeVideo = async (videoId: string) => {
    if (!user) return;
    const video = videos.find((v) => v.id === videoId);
    const currentlyLiked = Boolean(video?.isLiked);
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, isLiked: !currentlyLiked, likesCount: v.likesCount + (currentlyLiked ? -1 : 1) } : v))
    );
    try {
      await videoService.toggleLike(videoId, user.id, currentlyLiked);
    } catch {
      await reloadFeed();
    }
  };

  const handleSaveVideo = async (videoId: string) => {
    if (!user) return;
    const video = videos.find((v) => v.id === videoId);
    const currentlySaved = Boolean(video?.isSaved);
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, isSaved: !currentlySaved, savesCount: v.savesCount + (currentlySaved ? -1 : 1) } : v))
    );
    try {
      await videoService.toggleSave(videoId, user.id, currentlySaved);
      showToast(currentlySaved ? 'Video removed from bookmarks' : 'Video saved to study bookmarks!');
    } catch {
      await reloadFeed();
    }
  };

  const handleAddComment = async (videoId: string, text: string) => {
    if (!user) return;
    try {
      const comment = await videoService.addComment(videoId, user.id, text);
      setVideos((prev) =>
        prev.map((v) => (v.id === videoId ? { ...v, comments: [...v.comments, comment], commentsCount: v.commentsCount + 1 } : v))
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to post comment.');
    }
  };

  const handleFollowTeacher = async (teacherId: string) => {
    if (!user) return;
    const currentlyFollowing = Boolean(user.followingTeacherIds?.includes(teacherId));
    try {
      await videoService.toggleFollow(user.id, teacherId, currentlyFollowing);
      await refreshProfile();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update follow status.');
    }
  };

  // Determine if we are on a public route or authenticated app route
  const isPublicRoute =
    !user ||
    currentRoute === '/' ||
    currentRoute === '/about' ||
    currentRoute === '/courses' ||
    currentRoute === '/login' ||
    currentRoute === '/signup';

  // Brief session-restore state only (Supabase session check / dev
  // auto-login, see src/hooks/useAuth.ts) — avoids a flash of the public
  // marketing page for a direct /app/* link before the real user resolves.
  // Reuses the app's existing color tokens rather than introducing new UI.
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#111319] text-[#e1e2ea] flex items-center justify-center font-sans">
        <div className="flex items-center gap-2.5 text-xs font-bold text-[#bacac6]">
          <div className="w-4 h-4 border-2 border-[#58f5e0] border-t-transparent rounded-full animate-spin" />
          <span>Loading Vormirex...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111319] text-[#e1e2ea] flex flex-col selection:bg-[#2dd8c4] selection:text-[#005a50] overflow-x-hidden font-sans">
      {/* Toast Notification Banner */}
      {toastNotification && (
        <div className="fixed top-6 right-6 z-50 bg-[#2dd8c4] text-[#005a50] font-black text-xs px-4 py-2.5 rounded-full shadow-[0_0_25px_rgba(45,216,196,0.5)] flex items-center gap-2 animate-in slide-in-from-right duration-200">
          <Sparkles className="w-4 h-4 fill-current" />
          <span>{toastNotification}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. PUBLIC MARKETING WEBSITE AREA (Unauthenticated / Public) */}
      {/* ========================================================= */}
      {(!user || isPublicRoute) && (
        <div className="min-h-screen flex flex-col justify-between">
          <PublicNavbar
            onNavigate={(route) => {
              if (route === '/') navigateTo('/');
              else navigateTo(route);
            }}
            onOpenLogin={() => navigateTo('/login')}
            onOpenSignup={(role) => {
              setAuthRolePreset(role || 'student');
              navigateTo('/signup');
            }}
          />

          <main className="flex-1">
            {/* Login Route */}
            {currentRoute === '/login' && (
              <AuthPage
                initialMode="login"
                initialRole={authRolePreset}
                onSignIn={signIn}
                onSignUp={signUp}
                onSignOut={signOut}
                onLoginSuccess={handleLoginSuccess}
                onNavigateHome={() => navigateTo('/')}
              />
            )}

            {/* Signup Route */}
            {currentRoute === '/signup' && (
              <AuthPage
                initialMode="signup"
                initialRole={authRolePreset}
                onSignIn={signIn}
                onSignUp={signUp}
                onSignOut={signOut}
                onLoginSuccess={handleLoginSuccess}
                onNavigateHome={() => navigateTo('/')}
              />
            )}

            {/* Public Landing Home */}
            {currentRoute !== '/login' && currentRoute !== '/signup' && (
              <PublicLandingPage
                courses={courses}
                onStartLearning={() => {
                  setAuthRolePreset('student');
                  navigateTo('/signup');
                }}
                onExploreVormirex={() => {
                  const elem = document.getElementById('how-it-works');
                  if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                }}
                onOpenTeacherSignup={() => {
                  setAuthRolePreset('teacher');
                  navigateTo('/signup');
                }}
                onOpenAuthForCourse={(course) => {
                  setSelectedCourse(course);
                  setAuthModalMode('signup');
                  setIsAuthModalOpen(true);
                }}
                onSelectPricingPlan={(plan, cycle) => {
                  // Guests have no account to upgrade yet — remember the
                  // plan they picked and send them to signup; existing
                  // in-app upgrade flow (UpgradeModal, triggered from
                  // StudioModal) reuses this same selectedPlanForUpgrade /
                  // billingCycle state once they're signed in.
                  setSelectedPlanForUpgrade(plan);
                  setBillingCycle(cycle);
                  setAuthRolePreset('student');
                  navigateTo('/signup');
                }}
              />
            )}
          </main>

          <Footer
            onOpenPrivacy={() => setLegalModalType('privacy')}
            onOpenTerms={() => setLegalModalType('terms')}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. AUTHENTICATED APPLICATION AREA (/app and /app/teacher) */}
      {/* ========================================================= */}
      {user && !isPublicRoute && (
        <div className="flex min-h-screen w-full bg-[#111319]">
          {/* Authenticated Desktop Sidebar */}
          <div className="hidden lg:block">
            <AppSidebar
              user={user}
              activeRoute={currentRoute}
              onNavigate={(route) => navigateTo(route)}
              onLogout={handleLogout}
              onOpenCreateCourse={() => setIsCreateCourseOpen(true)}
              onOpenUploadVideo={() => setIsUploadVideoOpen(true)}
              onOpenStudio={() => {
                setStudioTab('tutor');
                setIsStudioOpen(true);
              }}
            />
          </div>

          {/* Main App Container */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Authenticated Top Bar */}
            <AppTopBar
              user={user}
              activeRoute={currentRoute}
              onNavigate={(route) => navigateTo(route)}
              onOpenStudio={() => {
                setStudioTab('tutor');
                setIsStudioOpen(true);
              }}
              onLogout={handleLogout}
            />

            {/* Sub-View Routing inside App */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {/* ROUTE 1: Student Home */}
              {(currentRoute === '/app' || currentRoute === '/app/home') && user.role === 'student' && (
                <StudentHome
                  user={user}
                  courses={courses}
                  videos={videos}
                  onNavigate={(route) => navigateTo(route)}
                  onOpenPlayer={(course, idx) => handleOpenPlayer(course, idx)}
                  onSelectCourse={handleSelectCourse}
                  onOpenStudio={(tab) => {
                    setStudioTab(tab || 'tutor');
                    setIsStudioOpen(true);
                  }}
                />
              )}

              {/* ROUTE 2: Teacher Studio */}
              {(currentRoute === '/app/teacher' ||
                currentRoute === '/app/teacher/courses' ||
                currentRoute === '/app/teacher/videos' ||
                currentRoute === '/app/teacher/analytics' ||
                currentRoute === '/app/teacher/revenue' ||
                (currentRoute === '/app' && user.role === 'teacher')) && (
                <TeacherDashboard
                  user={user}
                  courses={teacherCourses}
                  videos={videos}
                  activeRoute={currentRoute}
                  onOpenCreateCourse={() => setIsCreateCourseOpen(true)}
                  onOpenUploadVideo={() => setIsUploadVideoOpen(true)}
                  onSelectCourse={handleSelectCourse}
                  onDeleteCourse={handleDeleteCourse}
                  onDeleteVideo={handleDeleteVideo}
                />
              )}

              {/* ROUTE 3: Short Video Reels Feed */}
              {currentRoute === '/app/feed' && (
                <ReelsFeed
                  videos={videos}
                  courses={courses}
                  user={user}
                  onLikeVideo={handleLikeVideo}
                  onSaveVideo={handleSaveVideo}
                  onAddComment={handleAddComment}
                  onFollowTeacher={handleFollowTeacher}
                  onNavigateToCourse={(courseId) => {
                    const matched = courses.find((c) => c.id === courseId);
                    if (matched) {
                      handleSelectCourse(matched);
                    } else {
                      navigateTo('/app/courses');
                    }
                  }}
                  onShowToast={showToast}
                />
              )}

              {/* ROUTE 4: Courses Catalog */}
              {currentRoute === '/app/courses' && (
                <CoursesCatalog
                  courses={courses}
                  user={user}
                  onSelectCourse={handleSelectCourse}
                  onEnrollOrBuy={handleEnrollOrBuy}
                />
              )}

              {/* ROUTE 5: Course Detail View */}
              {currentRoute === '/app/courses/detail' && selectedCourse && (
                <CourseDetailPage
                  course={selectedCourse}
                  user={user}
                  onBack={() => navigateTo('/app/courses')}
                  onEnrollOrBuy={handleEnrollOrBuy}
                  onStartLearning={(course, idx) => handleOpenPlayer(course, idx || 0)}
                />
              )}

              {/* ROUTE 6: Interactive LMS Course Player */}
              {currentRoute === '/app/learn' && selectedCourse && (
                <CoursePlayer
                  course={selectedCourse}
                  user={user}
                  initialLessonIndex={playerLessonIndex}
                  onBack={() => navigateTo('/app/courses')}
                  onCompleteLesson={handleCompleteLesson}
                  onOpenDoubtTutor={() => {
                    setStudioTab('tutor');
                    setIsStudioOpen(true);
                  }}
                  onEnrollOrBuy={handleEnrollOrBuy}
                />
              )}

              {/* ROUTE 7: My Learning Center */}
              {currentRoute === '/app/learning' && (
                <MyLearning
                  user={user}
                  courses={courses}
                  onOpenPlayer={handleOpenPlayer}
                  onBrowseCourses={() => navigateTo('/app/courses')}
                  onSelectCourse={handleSelectCourse}
                />
              )}

              {/* ROUTE 8: Student Dashboard & Analytics */}
              {currentRoute === '/app/dashboard' && (
                <StudentDashboard
                  user={user}
                  courses={courses}
                  weeklyXp={weeklyXp}
                  achievements={achievements}
                  onNavigateToCourse={(cId) => {
                    const matched = courses.find((c) => c.id === cId);
                    if (matched) handleSelectCourse(matched);
                  }}
                  onOpenPlayer={(course) => handleOpenPlayer(course, 0)}
                  onOpenStudio={(tab) => {
                    setStudioTab(tab || 'tutor');
                    setIsStudioOpen(true);
                  }}
                  onOpenProfile={() => navigateTo('/app/profile')}
                  onBrowseCourses={() => navigateTo('/app/courses')}
                />
              )}

              {/* ROUTE 9: Achievements & Milestones */}
              {currentRoute === '/app/achievements' && (
                <AchievementsView
                  user={user}
                  courses={courses}
                  achievements={achievements}
                  onNavigate={(route) => navigateTo(route)}
                />
              )}

              {/* ROUTE 11: Community Feed + Ask & Solve */}
              {currentRoute === '/app/community' && (
                <CommunityPage
                  user={user}
                  onShowToast={showToast}
                  onOpenProfile={(userId) => {
                    setCommunityProfileId(userId);
                    navigateTo('/app/community/profile');
                  }}
                  onOpenQuestion={(question) => {
                    setSelectedQuestion(question);
                    navigateTo('/app/community/question');
                  }}
                />
              )}

              {/* ROUTE 12: Question Detail (Ask & Solve) */}
              {currentRoute === '/app/community/question' && selectedQuestion && (
                <QuestionDetailPage
                  question={selectedQuestion}
                  user={user}
                  onBack={() => navigateTo('/app/community')}
                  onShowToast={showToast}
                  onOpenAuthorProfile={(authorId) => {
                    setCommunityProfileId(authorId);
                    navigateTo('/app/community/profile');
                  }}
                  onQuestionUpdated={setSelectedQuestion}
                />
              )}

              {/* ROUTE 13: Public Community Profile */}
              {currentRoute === '/app/community/profile' && (
                <StudentProfilePage
                  profileId={communityProfileId || user.id}
                  viewer={user}
                  onBack={() => navigateTo('/app/community')}
                  onShowToast={showToast}
                  onOpenProfile={(userId) => setCommunityProfileId(userId)}
                />
              )}

              {/* ROUTE 10: Student Profile */}
              {currentRoute === '/app/profile' && (
                <StudentProfile
                  user={user}
                  courses={courses}
                  achievements={achievements}
                  onUpdateUser={async (updated) => {
                    await profileService.updateProfile(user.id, {
                      full_name: updated.name,
                      username: updated.username,
                      bio: updated.bio,
                      avatar_url: updated.avatarUrl,
                      location: updated.location,
                      education_level: updated.educationLevel,
                      interests: updated.interests,
                    });
                    await refreshProfile();
                  }}
                  onOpenPlayer={(course) => handleOpenPlayer(course, 0)}
                  onShowToast={showToast}
                  onViewCommunityProfile={() => {
                    setCommunityProfileId(user.id);
                    navigateTo('/app/community/profile');
                  }}
                />
              )}
            </main>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* GLOBAL MODALS (Checkout, Studio, Modals) */}
      {/* ========================================================= */}

      {/* Razorpay Course Payment Modal */}
      {checkoutCourse && user && (
        <PaymentModal
          isOpen={true}
          onClose={() => setCheckoutCourse(null)}
          course={checkoutCourse}
          user={user}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Interactive Studio Workspace Modal */}
      {user && (
      <StudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        user={user}
        initialTab={studioTab}
        onGainXp={handleGainXp}
        onOpenUpgrade={() => {
          setIsStudioOpen(false);
          setIsUpgradeOpen(true);
        }}
      />
      )}

      {/* Quick Auth Modal for preview enroll buttons */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onSignIn={signIn}
        onSignUp={signUp}
        onSignOut={signOut}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Create Course Modal */}
      {user && (
        <CreateCourseModal
          isOpen={isCreateCourseOpen}
          onClose={() => setIsCreateCourseOpen(false)}
          user={user}
          onCreateSuccess={handleCreateCourseSuccess}
        />
      )}

      {/* Upload Video Modal */}
      {user && (
        <UploadVideoModal
          isOpen={isUploadVideoOpen}
          onClose={() => setIsUploadVideoOpen(false)}
          user={user}
          courses={courses}
          onUploadSuccess={handleUploadVideoSuccess}
        />
      )}

      {/* Upgrade / Checkout Modal */}
      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        selectedPlan={selectedPlanForUpgrade}
        billingCycle={billingCycle}
        onUpgradeSuccess={handleUpgradeSuccess}
      />

      {/* Legal Modal */}
      {legalModalType && (
        <LegalModal
          isOpen={true}
          type={legalModalType}
          onClose={() => setLegalModalType(null)}
        />
      )}
    </div>
  );
}
