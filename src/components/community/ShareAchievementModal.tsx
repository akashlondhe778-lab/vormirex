import { Share2, X } from 'lucide-react';
import React, { useState } from 'react';
import { communityService } from '../../services/communityService';
import { CommunityPost, CourseCertificate, UserProfile } from '../../types';
import { AchievementCertificateCard } from './AchievementCertificateCard';

interface ShareAchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  certificates: CourseCertificate[];
  onShareSuccess: (post: CommunityPost) => void;
}

export const ShareAchievementModal: React.FC<ShareAchievementModalProps> = ({
  isOpen,
  onClose,
  user,
  certificates,
  onShareSuccess,
}) => {
  const [selectedId, setSelectedId] = useState<string>(certificates[0]?.id || '');
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const selected = certificates.find((c) => c.id === selectedId);

  const defaultCaption = selected
    ? `🎉 I completed ${selected.courseTitle}!\n\n🏆 Achievement earned from Vormirex\n\n#${selected.courseTitle.replace(/\s+/g, '')} #Vormirex #Learning #Achievement`
    : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) {
      setError('Pick an achievement to share first.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const post = await communityService.createPost(user.id, {
        type: 'achievement',
        content: caption.trim() || defaultCaption,
        certificateId: selected.id,
        tags: [],
      });
      onShareSuccess(post);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share achievement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#191c21] border border-[#3b4a47] w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
        <button onClick={onClose} className="absolute right-5 top-5 text-[#bacac6] hover:text-white p-1.5 rounded-lg hover:bg-[#272a30] transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/20 flex items-center justify-center text-[#f59e0b]">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Share Your Achievement</h2>
            <p className="text-xs text-[#bacac6]">Celebrate with the community — your followers will see it.</p>
          </div>
        </div>

        {certificates.length === 0 ? (
          <p className="text-xs text-[#bacac6] text-center py-8">
            You don't have any verified achievements yet — complete a course with a certificate to unlock this.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium text-center">
                {error}
              </div>
            )}

            <div>
              <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1.5">Which achievement?</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3 py-2.5 text-xs text-white outline-none"
              >
                {certificates.map((c) => (
                  <option key={c.id} value={c.id}>{c.courseTitle}</option>
                ))}
              </select>
            </div>

            {selected && <AchievementCertificateCard certificate={selected} studentName={user.name} compact />}

            <div>
              <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1.5">Caption</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={4}
                placeholder={defaultCaption}
                className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#bacac6]/50 outline-none resize-none"
              />
              <p className="text-[10px] text-[#bacac6]/70 mt-1">
                The achievement details themselves (course, verification code, issued date) can't be edited — only your caption.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#f59e0b] text-[#1a1812] rounded-xl font-bold text-xs uppercase hover:scale-95 transition-transform shadow-[0_0_15px_rgba(245,158,11,0.25)] cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Sharing...' : 'Share to Feed'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
