import {
  Award,
  BookOpen,
  ChevronDown,
  Compass,
  Film,
  Flame,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Play,
  RotateCcw,
  Sparkles,
  User,
  UserCheck,
  X,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { VormirexLogo } from './VormirexLogo';

interface NavbarProps {
  user: UserProfile | null;
  activeTab: string;
  onNavigate: (tab: string) => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onLogout: () => void;
  onSwitchRole: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  onNavigate,
  onOpenAuth,
  onLogout,
  onSwitchRole,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { id: 'explore', label: 'Explore' },
    { id: 'reels', label: '🔥 Reels & Shorts' },
    { id: 'courses', label: 'Masterclasses' },
    { id: 'studio', label: 'AI Studio' },
    ...(user
      ? [
          {
            id: user.role === 'teacher' ? 'teacher-dashboard' : 'dashboard',
            label: user.role === 'teacher' ? '👨‍🏫 Teacher Studio' : '📊 Dashboard',
          },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#111319]/90 backdrop-blur-xl border-b border-[#3b4a47]/30 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('explore')}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-[#191c21] border border-[#3b4a47] flex items-center justify-center shadow-[0_0_15px_rgba(88,245,224,0.2)] group-hover:border-[#58f5e0] group-hover:shadow-[0_0_20px_rgba(88,245,224,0.35)] transition-all">
              <VormirexLogo size={22} variant="gradient" withGlow />
            </div>
            <div>
              <span className="font-['Manrope'] font-black text-lg tracking-wider text-white flex items-center gap-1">
                VORMIREX
                <span className="w-1.5 h-1.5 rounded-full bg-[#58f5e0] inline-block animate-pulse" />
              </span>
              <span className="text-[10px] text-[#bacac6] tracking-widest block uppercase font-mono -mt-0.5">
                AI EdTech Arena
              </span>
            </div>
          </button>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#191c21]/80 border border-[#272a30] p-1.5 rounded-full">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === item.id
                  ? 'bg-[#58f5e0] text-[#005a50] shadow-[0_0_12px_rgba(88,245,224,0.3)]'
                  : 'text-[#bacac6] hover:text-white hover:bg-[#272a30]/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Section: Streak/XP Pill, Role Switcher & Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Streak & XP Badges */}
              <div className="hidden sm:flex items-center gap-2 bg-[#191c21] border border-[#272a30] px-3 py-1.5 rounded-full text-xs font-bold">
                <div
                  className="flex items-center gap-1 text-[#f59e0b] cursor-pointer"
                  title="Daily Study Streak"
                  onClick={() => onNavigate('profile')}
                >
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{user.streakDays}d</span>
                </div>
                <div className="w-[1px] h-3 bg-[#272a30]" />
                <div
                  className="flex items-center gap-1 text-[#58f5e0] cursor-pointer"
                  title="XP Points"
                  onClick={() => onNavigate('profile')}
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>{user.currentXp} XP</span>
                </div>
              </div>

              {/* Quick Role Switcher Button */}
              <button
                onClick={onSwitchRole}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#191c21] hover:bg-[#272a30] border border-[#3b4a47] text-[11px] font-bold text-[#ccbdff] transition-all cursor-pointer"
                title="Switch between Student and Teacher demo views"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Role: {user.role === 'teacher' ? 'Teacher' : 'Student'}</span>
              </button>

              {/* User Avatar & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#58f5e0] transition-all cursor-pointer"
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-[#58f5e0]"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-[#bacac6]" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-[#191c21] border border-[#3b4a47] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-[#272a30]">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-[#58f5e0] capitalize">
                        {user.role} • Level {user.level}
                      </p>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <button
                        onClick={() =>
                          onNavigate(user.role === 'teacher' ? 'teacher-dashboard' : 'dashboard')
                        }
                        className="w-full text-left px-3 py-1.5 text-xs text-[#bacac6] hover:text-white hover:bg-[#272a30] rounded-lg font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-[#58f5e0]" />
                        <span>{user.role === 'teacher' ? 'Teacher Dashboard' : 'Student Dashboard'}</span>
                      </button>

                      <button
                        onClick={() => onNavigate('courses')}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#bacac6] hover:text-white hover:bg-[#272a30] rounded-lg font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-[#ccbdff]" />
                        <span>Enrolled Masterclasses</span>
                      </button>

                      <button
                        onClick={() => onNavigate('profile')}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#bacac6] hover:text-white hover:bg-[#272a30] rounded-lg font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5 text-[#58f5e0]" />
                        <span>Profile & Badges</span>
                      </button>

                      <button
                        onClick={onSwitchRole}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#ccbdff] hover:bg-[#272a30] rounded-lg font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Switch to {user.role === 'teacher' ? 'Student' : 'Teacher'} Role</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-[#272a30]">
                      <button
                        onClick={onLogout}
                        className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 rounded-full text-xs font-bold uppercase text-[#bacac6] hover:text-white transition-colors cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-4 py-2 rounded-full text-xs font-bold uppercase bg-[#2dd8c4] text-[#005a50] hover:scale-95 transition-transform shadow-[0_0_12px_rgba(45,216,196,0.3)] cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#bacac6] hover:text-white p-2 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#14161c] border-b border-[#272a30] p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === item.id
                  ? 'bg-[#58f5e0] text-[#005a50]'
                  : 'text-[#bacac6] hover:text-white hover:bg-[#191c21]'
              }`}
            >
              {item.label}
            </button>
          ))}

          {user && (
            <div className="pt-2 border-t border-[#272a30] flex flex-col gap-2">
              <button
                onClick={() => {
                  onSwitchRole();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-[#ccbdff]"
              >
                Switch Role (Current: {user.role})
              </button>
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-400"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
