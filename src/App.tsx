import confetti from 'canvas-confetti';
import { Award, Bot, CheckCircle, Sparkles, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { AchievementsView } from './components/app/AchievementsView';
import { AppSidebar } from './components/app/AppSidebar';
import { AppTopBar } from './components/app/AppTopBar';
import { MyLearning } from './components/app/MyLearning';
import { StudentHome } from './components/app/StudentHome';
import { AuthModal } from './components/AuthModal';
import { AuthPage } from './components/auth/AuthPage';
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
import { INITIAL_COURSES, INITIAL_SHORT_VIDEOS } from './data/edtechData';
import { INITIAL_USER, TEACHER_USER } from './data/mockData';
import { Course, PricingPlan, ShortVideo, UserProfile } from './types';

export default function App() {
  // Authentication State: null for unauthenticated visitors by default
  const [user, setUser] = useState<UserProfile | null>(null);

  // Routing State
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const path = window.location.pathname;
    return path && path !== '' ? path : '/';
  });

  // Role input preset for signup
  const [authRolePreset, setAuthRolePreset] = useState<'student' | 'teacher'>('student');

  // Courses & Videos state
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [videos, setVideos] = useState<ShortVideo[]>(INITIAL_SHORT_VIDEOS);

  // Selected entities for deep view
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [playerLessonIndex, setPlayerLessonIndex] = useState<number>(0);
  const [checkoutCourse, setCheckoutCourse] = useState<Course | null>(null);

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

  // Route protection guard
  useEffect(() => {
    if (currentRoute.startsWith('/app') && !user) {
      showToast('🔒 Please sign in to access the Vormirix learning area.');
      navigateTo('/login');
    }
  }, [currentRoute, user]);

  const handleGainXp = (amount: number) => {
    if (!user) return;
    setUser((prev) => {
      if (!prev) return null;
      const newXp = prev.currentXp + amount;
      let newLevel = prev.level;
      let nextLevelXp = prev.nextLevelXp;

      if (newXp >= prev.nextLevelXp) {
        newLevel += 1;
        nextLevelXp = Math.floor(prev.nextLevelXp * 1.3);
        showToast(`🎉 Level Up! You reached Level ${newLevel} Quantum Scholar!`);
        try {
          confetti({
            particleCount: 100,
            spread: 90,
            origin: { y: 0.5 },
            colors: ['#58f5e0', '#2dd8c4', '#ccbdff'],
          });
        } catch {}
      } else {
        showToast(`+${amount} XP Earned in study streak!`);
      }

      return {
        ...prev,
        currentXp: newXp,
        level: newLevel,
        nextLevelXp: nextLevelXp,
      };
    });
  };

  const handleLoginSuccess = (loggedUser: UserProfile) => {
    setUser(loggedUser);
    setIsAuthModalOpen(false);
    showToast(`Welcome back, ${loggedUser.name}! (${loggedUser.role === 'teacher' ? 'Teacher Studio' : 'Student Portal'})`);

    // Redirect to proper dashboard based on role
    if (loggedUser.role === 'teacher') {
      navigateTo('/app/teacher');
    } else {
      navigateTo('/app');
    }
  };

  const handleLogout = () => {
    setUser(null);
    showToast('Signed out of Vormirix.');
    navigateTo('/');
  };

  const handleSwitchRole = () => {
    if (!user) return;
    if (user.role === 'student') {
      setUser(TEACHER_USER);
      navigateTo('/app/teacher');
      showToast('Switched to Verified Educator persona (Dr. Vikram Desai)');
    } else {
      setUser(INITIAL_USER);
      navigateTo('/app');
      showToast('Switched to Student Scholar persona (Rahul Sharma)');
    }
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

  const handleEnrollOrBuy = (course: Course) => {
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
      // Free enroll instantly
      setUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          enrolledCourseIds: [...(prev.enrolledCourseIds || []), course.id],
        };
      });
      setCourses((prev) =>
        prev.map((c) =>
          c.id === course.id ? { ...c, enrolledCount: c.enrolledCount + 1 } : c
        )
      );
      showToast(`🎉 Enrolled in "${course.title}" for Free!`);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#58f5e0', '#2dd8c4'],
        });
      } catch {}
      handleOpenPlayer(course, 0);
    } else {
      // Paid course -> Open Razorpay checkout modal
      setCheckoutCourse(course);
    }
  };

  const handlePaymentSuccess = (courseId: string) => {
    if (!user) return;
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        enrolledCourseIds: [...(prev.enrolledCourseIds || []), courseId],
      };
    });
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId ? { ...c, enrolledCount: c.enrolledCount + 1 } : c
      )
    );
    showToast('🚀 Payment successful! Lifetime masterclass access unlocked.');
    setCheckoutCourse(null);
    if (selectedCourse && selectedCourse.id === courseId) {
      handleOpenPlayer(selectedCourse, 0);
    }
  };

  const handleCompleteLesson = (lessonId: string, xpReward: number) => {
    if (!user) return;
    if (!user.completedLessonIds?.includes(lessonId)) {
      setUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          completedLessonIds: [...(prev.completedLessonIds || []), lessonId],
        };
      });
      handleGainXp(xpReward);
    }
  };

  const handleCreateCourseSuccess = (newCourse: Course) => {
    setCourses((prev) => [newCourse, ...prev]);
    showToast(`Masterclass "${newCourse.title}" published successfully!`);
    setIsCreateCourseOpen(false);
  };

  const handleUploadVideoSuccess = (newVideo: ShortVideo) => {
    setVideos((prev) => [newVideo, ...prev]);
    showToast(`Educational short video "${newVideo.title}" published to Reels!`);
    setIsUploadVideoOpen(false);
    navigateTo('/app/feed');
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    showToast('Course removed from your catalog.');
  };

  const handleDeleteVideo = (videoId: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== videoId));
    showToast('Short video removed from Reels feed.');
  };

  const handleUpgradeSuccess = (planName: 'Pro' | 'Team') => {
    if (!user) return;
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        plan: planName,
      };
    });
    showToast(`🚀 Welcome to Vormirix ${planName}! All premium AI tools unlocked.`);
  };

  // Determine if we are on a public route or authenticated app route
  const isPublicRoute =
    !user ||
    currentRoute === '/' ||
    currentRoute === '/about' ||
    currentRoute === '/courses' ||
    currentRoute === '/login' ||
    currentRoute === '/signup';

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
                onLoginSuccess={handleLoginSuccess}
                onNavigateHome={() => navigateTo('/')}
              />
            )}

            {/* Signup Route */}
            {currentRoute === '/signup' && (
              <AuthPage
                initialMode="signup"
                initialRole={authRolePreset}
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
                onExploreVormirix={() => {
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
              onSwitchRole={handleSwitchRole}
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
              onSwitchRole={handleSwitchRole}
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
                  courses={courses}
                  videos={videos}
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
                  user={user}
                  onGainXp={handleGainXp}
                  onOpenCourseDetail={(courseId) => {
                    const matched = courses.find((c) => c.id === courseId);
                    if (matched) {
                      handleSelectCourse(matched);
                    } else {
                      navigateTo('/app/courses');
                    }
                  }}
                  onOpenDoubtSolver={() => {
                    setStudioTab('tutor');
                    setIsStudioOpen(true);
                  }}
                  onOpenUpload={() => setIsUploadVideoOpen(true)}
                  onSaveVideo={(videoId) => {
                    setUser((prev) => {
                      if (!prev) return null;
                      const isSaved = prev.savedVideoIds?.includes(videoId);
                      const updated = isSaved
                        ? prev.savedVideoIds?.filter((id) => id !== videoId)
                        : [...(prev.savedVideoIds || []), videoId];
                      showToast(isSaved ? 'Video removed from bookmarks' : 'Video saved to study bookmarks!');
                      return { ...prev, savedVideoIds: updated };
                    });
                  }}
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
                  onNavigate={(route) => navigateTo(route)}
                />
              )}

              {/* ROUTE 10: Student Profile */}
              {currentRoute === '/app/profile' && (
                <StudentProfile
                  user={user}
                  courses={courses}
                  onUpdateUser={(updated) => setUser((prev) => (prev ? { ...prev, ...updated } : null))}
                  onOpenPlayer={(course) => handleOpenPlayer(course, 0)}
                  onShowToast={showToast}
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
      {checkoutCourse && (
        <PaymentModal
          isOpen={true}
          onClose={() => setCheckoutCourse(null)}
          course={checkoutCourse}
          user={user || INITIAL_USER}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Interactive Studio Workspace Modal */}
      <StudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        user={user || INITIAL_USER}
        initialTab={studioTab}
        onGainXp={handleGainXp}
        onOpenUpgrade={() => {
          setIsStudioOpen(false);
          setIsUpgradeOpen(true);
        }}
      />

      {/* Quick Auth Modal for preview enroll buttons */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
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
