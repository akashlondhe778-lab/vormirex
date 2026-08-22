import { ArrowLeft, ArrowRight, Bot, Check, Eye, EyeOff, GraduationCap, Lock, Mail, Sparkles, User, UserCheck, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { INITIAL_USER, TEACHER_USER } from '../../data/mockData';
import { UserProfile } from '../../types';
import { VormirixLogo } from '../VormirixLogo';

interface AuthPageProps {
  initialMode: 'login' | 'signup';
  initialRole?: 'student' | 'teacher';
  onLoginSuccess: (user: UserProfile) => void;
  onNavigateHome: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode,
  initialRole = 'student',
  onLoginSuccess,
  onNavigateHome,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [roleInput, setRoleInput] = useState<'student' | 'teacher'>(initialRole);
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const personas: UserProfile[] = [
    INITIAL_USER,
    {
      id: 'student-2',
      name: 'Ananya Patel',
      email: 'ananya.patel@vormirex.edu',
      role: 'student',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCxsrpqrGniGp3DNvY905_jh03qDvhYooKDn3jqVsdWctnS6CI72kTPskoJyyd7JJZgXAmqvLNxkIbpbYhPDglW9hiGFNC7htYvN6Z3VDuvK1W1xhkw18cn4xr8IM37l2oJMTumEQryS0mRQmFAuSYAdcrIpEyzG7Xug7bfJYOa3G9u2iVVUgH5nf1FJJVr2xUSLDAOlRvraCq4LEIXA7Y0EPEipoGHVPXqY-wjkIw58VDOOFP7xG_N',
      bio: 'High school senior practicing daily STEM problems and physics roadmaps.',
      level: 18,
      currentXp: 4890,
      nextLevelXp: 5500,
      streakDays: 24,
      plan: 'Pro',
      completedQuests: 62,
      solvedDoubts: 89,
      enrolledCourseIds: ['course-1', 'course-2'],
      completedLessonIds: ['c1-l1', 'c1-l2', 'c2-l1'],
      savedVideoIds: ['video-1', 'video-2'],
      followingTeacherIds: ['teacher-1'],
      learningHours: 36.0,
    },
    TEACHER_USER,
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (mode === 'signup' && passwordInput !== confirmPasswordInput) {
      setErrorMessage('Passwords do not match');
      return;
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: nameInput || (roleInput === 'teacher' ? 'Prof. Educator' : 'Scholar Student'),
      email: emailInput || (roleInput === 'teacher' ? 'educator@vormirex.edu' : 'student@vormirex.edu'),
      role: roleInput,
      avatarUrl:
        roleInput === 'teacher'
          ? TEACHER_USER.avatarUrl
          : INITIAL_USER.avatarUrl,
      bio:
        roleInput === 'teacher'
          ? 'Computer Science & STEM instructor on Vormirix LMS.'
          : 'Dedicated student learning full-stack and algorithms.',
      level: roleInput === 'teacher' ? 25 : 1,
      currentXp: roleInput === 'teacher' ? 8500 : 150,
      nextLevelXp: roleInput === 'teacher' ? 9000 : 500,
      streakDays: roleInput === 'teacher' ? 30 : 1,
      plan: 'Starter',
      completedQuests: 0,
      solvedDoubts: 0,
      enrolledCourseIds: ['course-3'],
      completedLessonIds: ['c3-l1'],
      savedVideoIds: [],
      followingTeacherIds: ['teacher-1'],
      learningHours: 1.5,
    };

    onLoginSuccess(newUser);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative select-none">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#58f5e0]/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full mx-auto space-y-6 relative z-10">
        {/* Back to marketing link */}
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#bacac6] hover:text-[#58f5e0] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Vormirix Home</span>
        </button>

        {/* Card */}
        <div className="bg-[#191c21] border border-[#3b4a47] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#111319] border border-[#3b4a47] flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(88,245,224,0.25)]">
              <VormirixLogo size={32} variant="gradient" withGlow />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {mode === 'login' ? 'Welcome Back to Vormirix' : 'Create Your Account'}
            </h2>
            <p className="text-xs text-[#bacac6]">
              {mode === 'login'
                ? 'Sign in to access your personalized feed, courses & study stats.'
                : 'Turn your scroll into learning. Join 50,000+ active learners.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-[#111319] p-1 rounded-xl border border-[#272a30]">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#58f5e0] text-[#005a50] shadow-sm'
                  : 'text-[#bacac6] hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[#58f5e0] text-[#005a50] shadow-sm'
                  : 'text-[#bacac6] hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Quick 1-Click Demo Personas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#58f5e0] flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Instant 1-Click Persona:</span>
              </span>
              <span className="text-[10px] text-[#bacac6]">Quick Demo</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {personas.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => onLoginSuccess(p)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#111319] hover:bg-[#161922] border border-[#272a30] hover:border-[#58f5e0] transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={p.avatarUrl}
                      alt={p.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#58f5e0]/40"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-[#58f5e0]">
                        {p.name}
                      </h4>
                      <p className="text-[10px] text-[#bacac6]">
                        {p.role === 'teacher' ? '👨‍🏫 Verified Educator' : `🎓 Student • Level ${p.level}`}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#272a30] text-[#bacac6] group-hover:bg-[#58f5e0] group-hover:text-[#005a50] transition-colors">
                    Login →
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#272a30]"></div>
            <span className="flex-shrink mx-3 text-[10px] text-[#bacac6] uppercase tracking-wider font-mono">
              Or with credentials
            </span>
            <div className="flex-grow border-t border-[#272a30]"></div>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium text-center">
                {errorMessage}
              </div>
            )}

            {/* Role selection for signup */}
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#bacac6]">I want to join as a:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRoleInput('student')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      roleInput === 'student'
                        ? 'bg-[#58f5e0]/20 border-[#58f5e0] text-[#58f5e0]'
                        : 'bg-[#111319] border-[#272a30] text-[#bacac6]'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleInput('teacher')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      roleInput === 'teacher'
                        ? 'bg-[#ccbdff]/20 border-[#ccbdff] text-[#ccbdff]'
                        : 'bg-[#111319] border-[#272a30] text-[#bacac6]'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Teacher</span>
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#bacac6]">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-[#bacac6]" />
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder={roleInput === 'teacher' ? 'Dr. Vikram Desai' : 'Rahul Sharma'}
                    className="w-full bg-[#111319] border border-[#272a30] focus:border-[#58f5e0] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-[#bacac6]/50 outline-none"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#bacac6]">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-[#bacac6]" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="scholar@vormirex.edu"
                  className="w-full bg-[#111319] border border-[#272a30] focus:border-[#58f5e0] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-[#bacac6]/50 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#bacac6]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-[#bacac6]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#111319] border border-[#272a30] focus:border-[#58f5e0] rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder:text-[#bacac6]/50 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#bacac6] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#bacac6]">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-[#bacac6]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#111319] border border-[#272a30] focus:border-[#58f5e0] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-[#bacac6]/50 outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#2dd8c4] hover:bg-[#58f5e0] text-[#005a50] text-xs font-extrabold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(45,216,196,0.3)] hover:scale-95 cursor-pointer mt-2"
            >
              {mode === 'login' ? 'Sign In to Vormirix' : 'Create Vormirix Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
