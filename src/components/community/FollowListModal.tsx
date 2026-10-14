import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { FollowListEntry, socialProfileService } from '../../services/socialProfileService';

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  viewerId: string;
  mode: 'followers' | 'following';
  onOpenProfile: (userId: string) => void;
  onToggleFollow: (targetId: string, currentlyFollowing: boolean) => Promise<void>;
}

export const FollowListModal: React.FC<FollowListModalProps> = ({
  isOpen,
  onClose,
  profileId,
  viewerId,
  mode,
  onOpenProfile,
  onToggleFollow,
}) => {
  const [entries, setEntries] = useState<FollowListEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    const loader = mode === 'followers' ? socialProfileService.listFollowers : socialProfileService.listFollowing;
    loader
      .call(socialProfileService, profileId, viewerId)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [isOpen, profileId, mode, viewerId]);

  if (!isOpen) return null;

  const handleToggle = async (entry: FollowListEntry) => {
    setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, isFollowedByMe: !e.isFollowedByMe } : e)));
    try {
      await onToggleFollow(entry.id, entry.isFollowedByMe);
    } catch {
      setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, isFollowedByMe: entry.isFollowedByMe } : e)));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#191c21] border border-[#3b4a47] w-full max-w-sm max-h-[80vh] overflow-y-auto rounded-3xl p-5 shadow-2xl relative animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white capitalize">{mode}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#bacac6] hover:text-white hover:bg-[#272a30]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-[#bacac6] text-center py-8">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-xs text-[#bacac6] text-center py-8">No {mode} yet.</p>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-[#111319] transition-colors">
                <button onClick={() => { onOpenProfile(entry.id); onClose(); }} className="flex items-center gap-2.5 min-w-0 cursor-pointer text-left">
                  <img src={entry.avatarUrl} alt={entry.name} className="w-10 h-10 rounded-full object-cover border border-[#3b4a47] shrink-0" />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{entry.name}</h4>
                    {entry.username && <p className="text-[10px] text-[#bacac6] truncate">@{entry.username}</p>}
                  </div>
                </button>
                {entry.id !== viewerId && (
                  <button
                    onClick={() => handleToggle(entry)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                      entry.isFollowedByMe
                        ? 'bg-[#191c21] text-[#58f5e0] border border-[#58f5e0]/40'
                        : 'bg-[#2dd8c4] text-[#005a50] hover:scale-95'
                    }`}
                  >
                    {entry.isFollowedByMe ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
