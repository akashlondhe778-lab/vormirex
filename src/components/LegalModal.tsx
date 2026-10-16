import { Shield, X } from 'lucide-react';
import React from 'react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms';
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#191c21] border border-[#3b4a47] w-full max-w-2xl max-h-[80vh] rounded-2xl p-6 shadow-2xl flex flex-col relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#bacac6] hover:text-[#e1e2ea] p-1.5 rounded-lg hover:bg-[#272a30] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-[#58f5e0]/20 flex items-center justify-center text-[#58f5e0]">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-['Manrope'] font-bold text-xl text-[#e1e2ea]">
            {type === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto chat-scroll pr-2 text-xs leading-relaxed text-[#bacac6] flex flex-col gap-4">
          {type === 'privacy' ? (
            <>
              <p>
                <strong>1. Data Collection:</strong> Vormirex adheres strictly to global student data privacy
                standards (including FERPA, COPPA, and GDPR principles). We only store your study progress,
                XP badges, and quest history.
              </p>
              <p>
                <strong>2. AI Ethics & Model Safety:</strong> Student chat transcripts are processed through
                secure, isolated model containers and are never sold or used for public ad targeting.
              </p>
              <p>
                <strong>3. Homework Problem OCR:</strong> Photos uploaded for instant doubt resolution are
                encrypted in transit and automatically pruned after synthesis.
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>1. Educational Purpose:</strong> Vormirex is designed to supplement and accelerate
                human learning through guided discovery, Socratic dialogue, and interactive feedback.
              </p>
              <p>
                <strong>2. Fair Usage:</strong> Unlimited tutoring on Pro/Team plans is subject to human-paced
                interaction rate limits to preserve low latency for all active students.
              </p>
              <p>
                <strong>3. Subscriptions:</strong> Memberships renew automatically and can be cancelled with one
                click at any time from your account settings.
              </p>
            </>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-[#272a30] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#2dd8c4] text-[#005a50] text-xs font-bold hover:scale-95 transition-transform"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
