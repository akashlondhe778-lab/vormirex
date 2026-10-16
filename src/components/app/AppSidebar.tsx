import {
  Award,
  BarChart3,
  BookOpen,
  DollarSign,
  Film,
  Home,
  LayoutDashboard,
  LogOut,
  PlayCircle,
  PlusCircle,
  Sparkles,
  Upload,
  User,
  Users,
  Video,
} from 'lucide-react';
import React from 'react';
import { UserProfile } from '../../types';
import { VormirexLogo } from '../VormirexLogo';

interface AppSidebarProps {
  user: UserProfile;
  activeRoute: string;
  onNavigate: (route: string) => void;
  onLogout: () => void;
  onOpenCreateCourse: () => void;
  onOpenUploadVideo: () => void;
  onOpenStudio: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  user,
  activeRoute,
  onNavigate,
  onLogout,
  onOpenCreateCourse,
  onOpenUploadVideo,
  onOpenStudio,
}) => {
  const isTeacher = user.role === 'teacher';

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  const studentNavItems: NavItem[] = [
    { id: '/app', label: 'Home', icon: Home },
    { id: '/app/feed', label: 'Reels Feed', icon: Film, badge: '🔥 Shorts' },
    { id: '/app/community', label: 'Community', icon: Users, badge: '✨ New' },
    { id: '/app/courses', label: 'Courses', icon: BookOpen },
    { id: '/app/learning', label: 'My Learning', icon: PlayCircle },
    { id: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: '/app/achievements', label: 'Achievements', icon: Award },
    { id: '/app/profile', label: 'Profile', icon: User },
  ];

  const teacherNavItems: NavItem[] = [
    { id: '/app/teacher', label: 'Overview', icon: LayoutDashboard },
    { id: '/app/teacher/courses', label: 'My Courses', icon: BookOpen },
    { id: '/app/teacher/videos', label: 'My Videos', icon: Video },
    { id: '/app/teacher/analytics', label: 'Analytics', icon: BarChart3 },
    { id: '/app/teacher/revenue', label: 'Revenue', icon: DollarSign },
    { id: '/app/profile', label: 'Profile', icon: User },
  ];

  const navItems = isTeacher ? teacherNavItems : studentNavItems;

  return (
    <aside className="w-64 bg-[#14171e] border-r border-[#272a30] flex flex-col justify-between shrink-0 select-none min-h-screen sticky top-0 h-screen overflow-y-auto">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#272a30]">
        <button
          onClick={() => onNavigate(isTeacher ? '/app/teacher' : '/app')}
          className="flex items-center gap-3 text-left group cursor-pointer w-full"
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
              {isTeacher ? '👨‍🏫 Teacher Studio' : '🎓 Student Portal'}
            </span>
          </div>
        </button>
      </div>

      {/* Main Navigation Links */}
      <div className="p-4 space-y-1 flex-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-[#bacac6]">
          {isTeacher ? 'Educator Workspace' : 'Learning Menu'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeRoute === item.id ||
            (item.id === '/app' && activeRoute === '/app') ||
            (item.id === '/app/teacher' && activeRoute === '/app/teacher');

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? isTeacher
                    ? 'bg-[#ccbdff] text-[#111319] shadow-[0_0_15px_rgba(204,189,255,0.25)]'
                    : 'bg-[#58f5e0] text-[#005a50] shadow-[0_0_15px_rgba(88,245,224,0.3)]'
                  : 'text-[#bacac6] hover:text-white hover:bg-[#191c21]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && !isActive && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2dd8c4]/15 text-[#58f5e0] font-mono">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Teacher Quick Actions */}
        {isTeacher && (
          <div className="pt-4 mt-4 border-t border-[#272a30] space-y-2">
            <div className="px-3 text-[10px] uppercase font-bold tracking-wider text-[#ccbdff]">
              Quick Create
            </div>
            <button
              onClick={onOpenCreateCourse}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[#ccbdff]/15 hover:bg-[#ccbdff]/25 border border-[#ccbdff]/30 text-xs font-bold text-[#ccbdff] transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Masterclass</span>
            </button>
            <button
              onClick={onOpenUploadVideo}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[#2dd8c4]/15 hover:bg-[#2dd8c4]/25 border border-[#2dd8c4]/30 text-xs font-bold text-[#58f5e0] transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Short Reel</span>
            </button>
          </div>
        )}

        {/* AI Tutor Studio Trigger for Students */}
        {!isTeacher && (
          <div className="pt-4 mt-4 border-t border-[#272a30]">
            <button
              onClick={onOpenStudio}
              className="w-full p-3 rounded-2xl bg-gradient-to-br from-[#191c21] to-[#161f22] border border-[#58f5e0]/40 text-left group hover:border-[#58f5e0] transition-all cursor-pointer shadow-lg"
            >
              <div className="flex items-center gap-2 text-[#58f5e0] text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Doubt Tutor</span>
              </div>
              <p className="text-[11px] text-[#bacac6] group-hover:text-white leading-tight">
                Ask anything in Python, Math, or Physics 24/7.
              </p>
            </button>
          </div>
        )}
      </div>

      {/* User Info & Persona Switcher */}
      <div className="p-4 border-t border-[#272a30] space-y-3 bg-[#111319]/60">
        {/* User Card */}
        <div className="flex items-center gap-3">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-9 h-9 rounded-full object-cover border border-[#58f5e0]"
          />
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-bold text-white truncate">{user.name}</p>
            <p className="text-[10px] text-[#58f5e0] truncate capitalize">
              {user.role} • Level {user.level}
            </p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-[#bacac6] hover:text-red-400 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
