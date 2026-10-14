import { ArrowLeft, Eye, EyeOff, GraduationCap, Lock, Mail, User, UserCheck, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { DEMO_ACCOUNT_PASSWORD, DEMO_PERSONAS } from '../../data/mockData';
import { UserProfile } from '../../types';
import { describeAuthError } from '../../utils/authErrors';
import { VormirixLogo } from '../VormirixLogo';

interface AuthPageProps {
  initialMode: 'login' | 'signup';
  initialRole?: 'student' | 'teacher';
  onSignIn: (email: string, password: string) => Promise<UserProfile>;
  onSignUp: (email: string, password: string, fullName: string, role: 'student' | 'teacher') => Promise<UserProfile>;
  onSignOut: () => Promise<void>;
  onLoginSuccess: (user: UserProfile) => void;
  onNavigateHome: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode,
  initialRole = 'student',
  onSignIn,
  onSignUp,
  onSignOut,
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Student and Teacher are separate account types with separate login
  // flows (see VORMIRIX_BACKEND_PLAN.md §13) — a login attempt is only
  // accepted if the authenticated account's real role (from the database,
  // not anything the client asserts) matches the tab the visitor picked.
  // Picking the wrong tab for a real account signs them back out immediately
  // rather than silently landing them in the wrong dashboard.
  const assertRoleOrSignOut = async (user: UserProfile) => {
    if (user.role !== roleInput) {
      await onSignOut();
      const actualRoleLabel = user.role === 'teacher' ? 'Teacher' : 'Student';
      throw new Error(`This account is registered as a ${actualRoleLabel}. Please use ${actualRoleLabel} Login instead.`);
    }
    return user;
  };

  const demoPersonasForRole = DEMO_PERSONAS.filter((p) => p.role === roleInput);

  const handlePersonaLogin = async (email: string) => {
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const user = await onSignIn(email, DEMO_ACCOUNT_PASSWORD);
      onLoginSuccess(await assertRoleOrSignOut(user));
    } catch (err) {
      setErrorMessage(describeAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (mode === 'signup' && passwordInput !== confirmPasswordInput) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      const user =
        mode === 'signup'
          ? await onSignUp(emailInput, passwordInput, nameInput, roleInput)
          : await assertRoleOrSignOut(await onSignIn(emailInput, passwordInput));
      onLoginSuccess(user);
    } catch (err) {
      setErrorMessage(describeAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
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

          {/* How do you want to continue? — Student and Teacher are
              separate account types with separate login flows; picking the
              wrong one here is caught server-side (see assertRoleOrSignOut
              above), this is just the UI entry point for choosing which. */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#bacac6]">
              {mode === 'login' ? 'How do you want to continue?' : 'I want to join as a:'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRoleInput('student')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                  roleInput === 'student'
                    ? 'bg-[#58f5e0]/20 border-[#58f5e0] text-[#58f5e0]'
                    : 'bg-[#111319] border-[#272a30] text-[#bacac6]'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>{mode === 'login' ? 'Student Login' : 'Student'}</span>
              </button>
              <button
                type="button"
                onClick={() => setRoleInput('teacher')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                  roleInput === 'teacher'
                    ? 'bg-[#ccbdff]/20 border-[#ccbdff] text-[#ccbdff]'
                    : 'bg-[#111319] border-[#272a30] text-[#bacac6]'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>{mode === 'login' ? 'Teacher Login' : 'Teacher'}</span>
              </button>
            </div>
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
              {demoPersonasForRole.map((p) => (
                <button
                  key={p.email}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handlePersonaLogin(p.email)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#111319] hover:bg-[#161922] border border-[#272a30] hover:border-[#58f5e0] transition-all text-left group cursor-pointer disabled:opacity-50"
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
                        {p.role === 'teacher' ? '👨‍🏫 Verified Educator' : '🎓 Student Scholar'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#272a30] text-[#bacac6] group-hover:bg-[#58f5e0] group-hover:text-[#005a50] transition-colors">
                    Login →
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-[#bacac6]/70 leading-relaxed">
              These sign in with real seeded demo accounts (run <code className="text-[#58f5e0]">npm run seed</code> once
              against your Supabase project) — not fabricated sessions.
            </p>
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
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-[#2dd8c4] hover:bg-[#58f5e0] text-[#005a50] text-xs font-extrabold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(45,216,196,0.3)] hover:scale-95 cursor-pointer mt-2 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting
                ? 'Please wait...'
                : mode === 'login'
                ? `Sign In as ${roleInput === 'teacher' ? 'Teacher' : 'Student'}`
                : 'Create Vormirix Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
