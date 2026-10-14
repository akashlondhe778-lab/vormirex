import { Image as ImageIcon, Sparkles, Video, X } from 'lucide-react';
import React, { useState } from 'react';
import { communityService } from '../../services/communityService';
import { storageService } from '../../services/storageService';
import { CommunityPost, UserProfile } from '../../types';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onCreateSuccess: (post: CommunityPost) => void;
}

const SUGGESTED_CATEGORIES = [
  'Study Tips', 'Coding', 'Mathematics', 'Science Facts', 'Interview Prep',
  'Exam Prep', 'Career Advice', 'Notes', 'Project', 'Motivation',
];

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB — short educational clips only

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, user, onCreateSuccess }) => {
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaKind, setMediaKind] = useState<'image' | 'video' | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleMediaSelect = (kind: 'image' | 'video') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const limit = kind === 'video' ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (file.size > limit) {
      setError(`${kind === 'video' ? 'Video' : 'Image'} must be smaller than ${limit / (1024 * 1024)}MB.`);
      return;
    }
    setError('');
    setMediaFile(file);
    setMediaKind(kind);
    setMediaPreview(URL.createObjectURL(file));
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaKind(null);
    setMediaPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Write something educational to share first.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      let imageUrl: string | undefined;
      let videoUrl: string | undefined;
      if (mediaFile && mediaKind) {
        const url = await storageService.upload('post-images', user.id, mediaFile);
        if (mediaKind === 'video') videoUrl = url;
        else imageUrl = url;
      }
      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      const post = await communityService.createPost(user.id, {
        type: videoUrl ? 'video' : imageUrl ? 'image' : 'text',
        content: content.trim(),
        imageUrl,
        videoUrl,
        tags,
      });
      onCreateSuccess(post);
      setContent('');
      setTagsInput('');
      clearMedia();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish post.');
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
          <div className="w-10 h-10 rounded-xl bg-[#58f5e0]/20 flex items-center justify-center text-[#58f5e0]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Share Something Educational</h2>
            <p className="text-xs text-[#bacac6]">Study tips, notes, tricks, or what you just learned.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium text-center">
              {error}
            </div>
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            maxLength={2000}
            placeholder="e.g. Here's a quick trick for solving recursion problems..."
            className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-[#bacac6]/50 outline-none resize-none"
          />

          {mediaPreview ? (
            <div className="relative rounded-xl overflow-hidden border border-[#272a30] bg-black">
              {mediaKind === 'video' ? (
                <video src={mediaPreview} controls className="w-full max-h-64 object-contain" />
              ) : (
                <img src={mediaPreview} alt="" className="w-full max-h-64 object-cover" />
              )}
              <button
                type="button"
                onClick={clearMedia}
                className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-dashed border-[#3b4a47] text-xs font-bold text-[#bacac6] hover:border-[#58f5e0] hover:text-[#58f5e0] cursor-pointer transition-all w-fit">
                <ImageIcon className="w-4 h-4" />
                <span>Add an image</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleMediaSelect('image')} />
              </label>
              <label className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-dashed border-[#3b4a47] text-xs font-bold text-[#bacac6] hover:border-[#ccbdff] hover:text-[#ccbdff] cursor-pointer transition-all w-fit">
                <Video className="w-4 h-4" />
                <span>Add a short video</span>
                <input type="file" accept="video/*" className="hidden" onChange={handleMediaSelect('video')} />
              </label>
            </div>
          )}

          <div>
            <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1.5">Tags</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Python, DSA, ExamTips"
              className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {SUGGESTED_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setTagsInput((prev) => (prev ? `${prev}, ${c}` : c))}
                  className="text-[10px] px-2 py-1 rounded-full bg-[#111319] border border-[#272a30] text-[#bacac6] hover:border-[#58f5e0] hover:text-[#58f5e0] transition-colors cursor-pointer"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#2dd8c4] text-[#005a50] rounded-xl font-bold text-xs uppercase hover:scale-95 transition-transform shadow-[0_0_15px_rgba(45,216,196,0.25)] cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Publishing...' : 'Publish Post'}
          </button>
        </form>
      </div>
    </div>
  );
};
