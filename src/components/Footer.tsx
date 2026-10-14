import { Globe, MessageSquare, Shield, Sparkles } from 'lucide-react';
import React from 'react';
import { VormirixLogo } from './VormirixLogo';

interface FooterProps {
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacy, onOpenTerms }) => {
  return (
    <footer className="bg-[#0c0e14] border-t border-[#3b4a47]/30 text-sm">
      <div className="w-full py-16 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand Column */}
        <div className="flex flex-col gap-4 md:col-span-1">
          <a href="#" className="font-['Manrope'] text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#191c21] border border-[#3b4a47] flex items-center justify-center shadow-[0_0_15px_rgba(88,245,224,0.2)]">
              <VormirixLogo size={22} variant="gradient" withGlow />
            </div>
            <span>Vormirix</span>
          </a>
          <p className="text-[14px] text-[#bacac6] leading-relaxed opacity-85">
            © 2026 Vormirix Inc. Turn Your Scroll Into Learning.
          </p>
          <div className="flex gap-4 mt-2">
            <a
              href="#"
              className="w-9 h-9 rounded-full bg-[#191c21] border border-[#3b4a47] flex items-center justify-center text-[#bacac6] hover:text-[#58f5e0] hover:border-[#58f5e0] transition-colors"
              title="Global Network"
            >
              <Globe className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="w-9 h-9 rounded-full bg-[#191c21] border border-[#3b4a47] flex items-center justify-center text-[#bacac6] hover:text-[#58f5e0] hover:border-[#58f5e0] transition-colors"
              title="Community Forum"
            >
              <MessageSquare className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Links Column 1: Product */}
        <div className="flex flex-col gap-3.5">
          <h4 className="text-xs uppercase tracking-wider font-bold text-[#e1e2ea] mb-1">
            Product
          </h4>
          <a href="#features" className="text-[#bacac6] hover:text-[#58f5e0] transition-colors">
            Features
          </a>
          <a href="#pricing" className="text-[#bacac6] hover:text-[#58f5e0] transition-colors">
            Pricing
          </a>
          <a href="#how-it-works" className="text-[#bacac6] hover:text-[#58f5e0] transition-colors">
            Roadmap
          </a>
          <a href="#demo" className="text-[#bacac6] hover:text-[#58f5e0] transition-colors">
            Interactive AI Demo
          </a>
        </div>

        {/* Links Column 2: Community */}
        <div className="flex flex-col gap-3.5">
          <h4 className="text-xs uppercase tracking-wider font-bold text-[#e1e2ea] mb-1">
            Community
          </h4>
          <a href="#" className="text-[#bacac6] hover:text-[#58f5e0] transition-colors">
            Discord
          </a>
          <a href="#" className="text-[#bacac6] hover:text-[#58f5e0] transition-colors">
            Blog
          </a>
          <a href="#" className="text-[#bacac6] hover:text-[#58f5e0] transition-colors">
            Events
          </a>
          <a href="#" className="text-[#bacac6] hover:text-[#58f5e0] transition-colors">
            Student Ambassador
          </a>
        </div>

        {/* Links Column 3: Support & Legal */}
        <div className="flex flex-col gap-3.5">
          <h4 className="text-xs uppercase tracking-wider font-bold text-[#e1e2ea] mb-1">
            Support & Legal
          </h4>
          <a href="#" className="text-[#bacac6] hover:text-[#58f5e0] transition-colors">
            Help Center
          </a>
          <button
            onClick={onOpenPrivacy}
            className="text-left text-[#bacac6] hover:text-[#58f5e0] transition-colors cursor-pointer"
          >
            Privacy Policy
          </button>
          <button
            onClick={onOpenTerms}
            className="text-left text-[#bacac6] hover:text-[#58f5e0] transition-colors cursor-pointer"
          >
            Terms of Service
          </button>
          <span className="text-xs text-[#859490] mt-2">
            ISO 27001 & FERPA Compliant AI
          </span>
        </div>
      </div>
    </footer>
  );
};
