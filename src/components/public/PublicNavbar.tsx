import { ArrowRight, BookOpen, GraduationCap, Menu, Sparkles, User, X } from 'lucide-react';
import React, { useState } from 'react';
import { VormirexLogo } from '../VormirexLogo';

interface PublicNavbarProps {
  onNavigate: (route: string) => void;
  onOpenLogin: () => void;
  onOpenSignup: (role?: 'student' | 'teacher') => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  onNavigate,
  onOpenLogin,
  onOpenSignup,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    } else {
      onNavigate('/');
      setTimeout(() => {
        const target = document.getElementById(sectionId);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#111319]/90 backdrop-blur-xl border-b border-[#272a30]/80 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-3 text-left group cursor-pointer"
            id="public-logo-btn"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#191c21] border border-[#3b4a47] flex items-center justify-center shadow-[0_0_20px_rgba(88,245,224,0.2)] group-hover:border-[#58f5e0] group-hover:shadow-[0_0_25px_rgba(88,245,224,0.35)] transition-all">
              <VormirexLogo size={24} variant="gradient" withGlow />
            </div>
            <div>
              <span className="font-['Manrope'] font-black text-xl tracking-wider text-white flex items-center gap-1.5">
                VORMIREX
                <span className="w-2 h-2 rounded-full bg-[#58f5e0] inline-block animate-pulse" />
              </span>
              <span className="text-[10px] text-[#bacac6] tracking-widest block uppercase font-mono -mt-0.5">
                Turn Scroll Into Learning
              </span>
            </div>
          </button>
        </div>

        {/* Public Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#191c21]/90 border border-[#272a30] px-3 py-1.5 rounded-full">
          <button
            onClick={() => scrollToSection('hero')}
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#bacac6] hover:text-white hover:bg-[#272a30]/60 transition-all cursor-pointer"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection('why-vormirex')}
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#bacac6] hover:text-white hover:bg-[#272a30]/60 transition-all cursor-pointer"
          >
            Why Vormirex
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#bacac6] hover:text-white hover:bg-[#272a30]/60 transition-all cursor-pointer"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection('public-courses')}
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#bacac6] hover:text-white hover:bg-[#272a30]/60 transition-all cursor-pointer"
          >
            Courses
          </button>
          <button
            onClick={() => scrollToSection('for-teachers')}
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#ccbdff] hover:text-white hover:bg-[#272a30]/60 transition-all cursor-pointer flex items-center gap-1"
          >
            <span>For Teachers</span>
          </button>
        </nav>

        {/* Auth CTA Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={onOpenLogin}
            className="px-4 py-2 text-xs font-bold text-[#e1e2ea] hover:text-white hover:bg-[#191c21] border border-transparent hover:border-[#3b4a47] rounded-full transition-all cursor-pointer"
            id="nav-login-btn"
          >
            Login
          </button>
          <button
            onClick={() => onOpenSignup('student')}
            className="px-5 py-2.5 bg-[#2dd8c4] hover:bg-[#58f5e0] text-[#005a50] font-bold text-xs uppercase tracking-wider rounded-full shadow-[0_0_20px_rgba(45,216,196,0.3)] hover:shadow-[0_0_30px_rgba(45,216,196,0.5)] hover:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            id="nav-create-account-btn"
          >
            <span>Create Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2.5 rounded-xl bg-[#191c21] border border-[#272a30] text-[#bacac6] hover:text-white cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#16191f] border-b border-[#272a30] px-6 py-5 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-2">
            <button
              onClick={() => scrollToSection('hero')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-[#bacac6] hover:bg-[#1f232b] hover:text-white"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('why-vormirex')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-[#bacac6] hover:bg-[#1f232b] hover:text-white"
            >
              Why Vormirex
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-[#bacac6] hover:bg-[#1f232b] hover:text-white"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('public-courses')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-[#bacac6] hover:bg-[#1f232b] hover:text-white"
            >
              Courses
            </button>
            <button
              onClick={() => scrollToSection('for-teachers')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-[#ccbdff] hover:bg-[#1f232b]"
            >
              For Teachers
            </button>
          </div>

          <div className="pt-4 border-t border-[#272a30] flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLogin();
              }}
              className="w-full py-2.5 rounded-xl border border-[#3b4a47] text-xs font-bold text-white text-center hover:bg-[#1f232b]"
            >
              Login
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSignup('student');
              }}
              className="w-full py-3 rounded-xl bg-[#2dd8c4] text-[#005a50] text-xs font-bold uppercase tracking-wider text-center shadow-[0_0_15px_rgba(45,216,196,0.3)]"
            >
              Create Account
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
