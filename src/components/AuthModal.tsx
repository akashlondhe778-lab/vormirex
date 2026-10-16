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
import { DEMO_ACCOUNT_PASSWORD, DEMO_PERSONAS } from '../data/mockData';
import { authService } from '../services/authService';
import { UserProfile } from '../types';
import { describeAuthError } from '../utils/authErrors';
import { VormirixLogo } from './VormirixLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onSignIn: (email: string, password: string) => Promise<UserProfile>;
  onSignUp: (email: string, password: string, fullName: string, role: 'student' | 'teacher') => Promise<UserProfile>;
  onSignOut: () => Promise<void>;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSignIn,
  onSignUp,
  onSignOut,
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Student and Teacher are separate account types — see the matching
  // helper + comment in AuthPage.tsx for the full rationale.
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
      onClose();
    } catch (err) {
      setErrorMessage(describeAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitCustom = async (e: React.FormEvent) => {
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
      onClose();
    } catch (err) {
      setErrorMessage(describeAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
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
            {demoPersonasForRole.map((p) => (
              <button
                key={p.email}
                type="button"
                disabled={isSubmitting}
                onClick={() => handlePersonaLogin(p.email)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#111319] hover:bg-[#272a30] border border-[#272a30] hover:border-[#58f5e0] transition-all text-left group cursor-pointer disabled:opacity-50"
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
                      {p.role} {p.role === 'teacher' ? '👨‍🏫 Instructor' : '🎓 Student'}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold text-[#58f5e0] px-2 py-0.5 rounded bg-[#58f5e0]/10 border border-[#58f5e0]/30">
                  Select
                </span>
              </button>
            ))}
          </div>
          {errorMessage && (
            <p className="text-[10px] text-red-400 mt-2">{errorMessage}</p>
          )}
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

          {/* Account type — Student and Teacher are separate account
              types with separate login flows, chosen before credentials on
              both Sign In and Create Account (see assertRoleOrSignOut above
              for how a mismatch is handled). */}
          <div>
            <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1.5">
              {mode === 'login' ? 'How do you want to continue?' : 'I want to join as a'}
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
                <span>{mode === 'login' ? 'Student Login' : 'Student'}</span>
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
                <span>{mode === 'login' ? 'Teacher Login' : 'Teacher / Educator'}</span>
              </button>
            </div>
          </div>

          {mode === 'signup' && (
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
                placeholder="name@vormirix.edu"
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
                onClick={async () => {
                  if (!emailInput) {
                    setErrorMessage('Enter your email address first, then tap Forgot Password.');
                    return;
                  }
                  try {
                    await authService.resetPasswordForEmail(emailInput);
                    setErrorMessage('');
                    alert('Password reset link sent — check your inbox.');
                  } catch (err) {
                    setErrorMessage(describeAuthError(err));
                  }
                }}
                className="text-[11px] text-[#58f5e0] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 text-xs uppercase tracking-wider font-bold bg-[#2dd8c4] text-[#005a50] py-3 rounded-full hover:scale-95 transition-transform shadow-[0_0_15px_rgba(45,216,196,0.25)] cursor-pointer disabled:opacity-50 disabled:hover:scale-100"
          >
            {isSubmitting
              ? 'Please wait...'
              : mode === 'login'
              ? `Log In as ${roleInput === 'teacher' ? 'Teacher' : 'Student'}`
              : 'Create Account & Start Learning'}
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
