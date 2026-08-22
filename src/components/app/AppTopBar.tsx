import {
  Award,
  BookOpen,
  ChevronDown,
  Film,
  Flame,
  LayoutDashboard,
  LogOut,
  Menu,
  RotateCcw,
  Search,
  Sparkles,
  User,
  X,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { UserProfile } from '../../types';

interface AppTopBarProps {
  user: UserProfile;
  activeRoute: string;
  onNavigate: (route: string) => void;
  onOpenStudio: () => void;
  onSwitchRole: () => void;
  onLogout: () => void;
  onSearchQuery?: (q: string) => void;
}

export const AppTopBar: React.FC<AppTopBarProps> = ({
  user,
  activeRoute,
  onNavigate,
  onOpenStudio,
  onSwitchRole,
  onLogout,
  onSearchQuery,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isTeacher = user.role === 'teacher';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchQuery && searchInput.trim()) {
      onSearchQuery(searchInput.trim());
    }
    if (activeRoute !== '/app/courses' && !isTeacher) {
      onNavigate('/app/courses');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#111319]/90 backdrop-blur-xl border-b border-[#272a30] px-4 sm:px-6 h-18 flex items-center justify-between gap-4 select-none">
      {/* Left: Mobile hamburger & Search input */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl bg-[#191c21] border border-[#272a30] text-[#bacac6] hover:text-white"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Global Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-[#bacac6]" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={
              isTeacher
                ? 'Search students, courses or reel metrics...'
                : 'Search courses, Python DSA, Calculus reels...'
            }
            className="w-full bg-[#191c21] border border-[#272a30] focus:border-[#58f5e0] rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder:text-[#bacac6]/60 outline-none transition-colors"
          />
        </form>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Ask AI Doubt Tutor Button */}
        {!isTeacher && (
          <button
            onClick={onOpenStudio}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#58f5e0]/10 hover:bg-[#58f5e0]/20 border border-[#58f5e0]/30 text-xs font-bold text-[#58f5e0] transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Tutor</span>
          </button>
        )}

        {/* Streak & XP Badges */}
        <div className="hidden sm:flex items-center gap-2 bg-[#191c21] border border-[#272a30] px-3 py-1.5 rounded-full text-xs font-bold">
          <div
            className="flex items-center gap-1 text-[#f59e0b] cursor-pointer"
            title="Daily Study Streak"
            onClick={() => onNavigate('/app/profile')}
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>{user.streakDays}d</span>
          </div>
          <div className="w-[1px] h-3 bg-[#272a30]" />
          <div
            className="flex items-center gap-1 text-[#58f5e0] cursor-pointer"
            title="XP Level Points"
            onClick={() => onNavigate('/app/profile')}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{user.currentXp} XP</span>
          </div>
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#58f5e0] transition-all cursor-pointer"
          >
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border border-[#58f5e0]"
            />
            <ChevronDown className="w-3.5 h-3.5 text-[#bacac6]" />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-[#191c21] border border-[#3b4a47] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in"
              onClick={() => setDropdownOpen(false)}
            >
              <div className="px-3 py-2 border-b border-[#272a30]">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-[#58f5e0] capitalize">
                  {user.role} • Level {user.level}
                </p>
              </div>

              <div className="py-1 space-y-1">
                <button
                  onClick={() => onNavigate('/app/profile')}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#e1e2ea] hover:bg-[#272a30] transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-[#bacac6]" />
                  <span>My Profile & Stats</span>
                </button>

                {!isTeacher && (
                  <button
                    onClick={() => onNavigate('/app/learning')}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#e1e2ea] hover:bg-[#272a30] transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#bacac6]" />
                    <span>My Learning</span>
                  </button>
                )}

                <button
                  onClick={onSwitchRole}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#ccbdff] hover:bg-[#272a30] transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#ccbdff]" />
                  <span>Switch to {isTeacher ? 'Student View' : 'Teacher View'}</span>
                </button>
              </div>

              <div className="pt-1 border-t border-[#272a30]">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-18 bg-[#16191f] border-b border-[#272a30] px-6 py-5 space-y-3 z-40 animate-in slide-in-from-top-4">
          <div className="space-y-1">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate(isTeacher ? '/app/teacher' : '/app');
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-white hover:bg-[#1f232b]"
            >
              🏠 Home
            </button>
            {!isTeacher && (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('/app/feed');
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-white hover:bg-[#1f232b]"
                >
                  🎬 Reels Feed
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('/app/courses');
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-white hover:bg-[#1f232b]"
                >
                  📚 Courses
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('/app/learning');
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-white hover:bg-[#1f232b]"
                >
                  ▶️ My Learning
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('/app/dashboard');
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-white hover:bg-[#1f232b]"
                >
                  📊 Dashboard
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('/app/achievements');
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-white hover:bg-[#1f232b]"
                >
                  🏆 Achievements
                </button>
              </>
            )}
          </div>
          <div className="pt-3 border-t border-[#272a30] flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onSwitchRole();
              }}
              className="w-full py-2.5 rounded-xl bg-[#191c21] border border-[#3b4a47] text-xs font-bold text-[#ccbdff]"
            >
              Switch Persona ({isTeacher ? 'Teacher' : 'Student'})
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}
              className="w-full py-2 rounded-xl text-xs font-bold text-red-400"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
