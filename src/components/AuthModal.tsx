import {
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  Sparkles,
  User,
  UserCheck,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { INITIAL_USER, TEACHER_USER } from '../data/mockData';
import { UserProfile } from '../types';
import { VormirixLogo } from './VormirixLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [roleInput, setRoleInput] = useState<'student' | 'teacher'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

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

  const handleSubmitCustom = (e: React.FormEvent) => {
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#191c21] border border-[#3b4a47] w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 text-[#e1e2ea]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#bacac6] hover:text-white p-1.5 rounded-lg hover:bg-[#272a30] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#111319] border border-[#3b4a47] flex items-center justify-center shadow-[0_0_15px_rgba(88,245,224,0.25)]">
            <VormirixLogo size={24} variant="gradient" withGlow />
          </div>
          <div>
            <h3 className="font-extrabold text-lg sm:text-xl text-white">
              {mode === 'login' ? 'Log In to Vormirix' : 'Create Vormirix Account'}
            </h3>
            <p className="text-xs text-[#bacac6]">
              {mode === 'login'
                ? 'Access your enrolled masterclasses, shorts feed & progress.'
                : 'Join 50,000+ students and educators.'}
            </p>
          </div>
        </div>

        {/* Quick 1-Click Persona Login */}
        <div className="my-5">
          <span className="text-[11px] uppercase tracking-wider font-bold text-[#58f5e0] mb-2.5 block">
            ⚡ Quick 1-Click Persona Login:
          </span>
          <div className="flex flex-col gap-2">
            {personas.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  onLoginSuccess(p);
                  onClose();
                }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#111319] hover:bg-[#272a30] border border-[#272a30] hover:border-[#58f5e0] transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={p.avatarUrl}
                    alt={p.name}
                    className="w-9 h-9 rounded-full object-cover border border-[#58f5e0]/40"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-[#58f5e0]">
                      {p.name}
                    </h4>
                    <p className="text-[10px] text-[#bacac6] capitalize">
                      {p.role} • Lv.{p.level} {p.role === 'teacher' ? '👨‍🏫 Instructor' : '🎓 Student'}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold text-[#58f5e0] px-2 py-0.5 rounded bg-[#58f5e0]/10 border border-[#58f5e0]/30">
                  Select
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-[#272a30]" />
          <span className="flex-shrink mx-3 text-[10px] uppercase tracking-wider text-[#bacac6]">
            Or enter credentials
          </span>
          <div className="flex-grow border-t border-[#272a30]" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmitCustom} className="space-y-3 mt-3">
          {errorMessage && (
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {mode === 'signup' && (
            <>
              {/* Role Selection */}
              <div>
                <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1.5">
                  I want to join as a
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRoleInput('student')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      roleInput === 'student'
                        ? 'bg-[#58f5e0]/15 border-[#58f5e0] text-[#58f5e0]'
                        : 'bg-[#111319] border-[#272a30] text-[#bacac6]'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRoleInput('teacher')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      roleInput === 'teacher'
                        ? 'bg-[#58f5e0]/15 border-[#58f5e0] text-[#58f5e0]'
                        : 'bg-[#111319] border-[#272a30] text-[#bacac6]'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Teacher / Educator</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#bacac6] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="name@vormirex.edu"
                className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#bacac6] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl pl-9 pr-9 py-2 text-xs text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#bacac6] hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#bacac6] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {mode === 'login' && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => alert('Password reset link sent to your registered email address!')}
                className="text-[11px] text-[#58f5e0] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-2 text-xs uppercase tracking-wider font-bold bg-[#2dd8c4] text-[#005a50] py-3 rounded-full hover:scale-95 transition-transform shadow-[0_0_15px_rgba(45,216,196,0.25)] cursor-pointer"
          >
            {mode === 'login' ? 'Log In & Continue' : 'Create Account & Start Learning'}
          </button>
        </form>

        {/* Switch Mode Footer */}
        <div className="text-center mt-4 pt-3 border-t border-[#272a30]">
          {mode === 'login' ? (
            <p className="text-xs text-[#bacac6]">
              Don't have an account?{' '}
              <button
                onClick={() => setMode('signup')}
                className="text-[#58f5e0] font-bold hover:underline ml-1 cursor-pointer"
              >
                Sign up free
              </button>
            </p>
          ) : (
            <p className="text-xs text-[#bacac6]">
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-[#58f5e0] font-bold hover:underline ml-1 cursor-pointer"
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
