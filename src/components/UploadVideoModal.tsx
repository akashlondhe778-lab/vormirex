import {
  Film,
  GraduationCap,
  Sparkles,
  Tag,
  UploadCloud,
  Video,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { videoService } from '../services/videoService';
import { Course, ShortVideo, UserProfile } from '../types';

interface UploadVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  courses: Course[];
  onUploadSuccess: (video: ShortVideo) => void;
}

export const UploadVideoModal: React.FC<UploadVideoModalProps> = ({
  isOpen,
  onClose,
  user,
  courses,
  onUploadSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'coding' | 'math' | 'physics' | 'chemistry' | 'career' | 'tips'>('coding');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [tagsInput, setTagsInput] = useState('React, Coding, WebDev');
  const [relatedCourseId, setRelatedCourseId] = useState<string>(courses[0]?.id || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80'
  );
  const [selectedSampleVideo, setSelectedSampleVideo] = useState(
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const created = await videoService.createVideo(user.id, {
        title,
        caption,
        description,
        videoUrl: selectedSampleVideo,
        thumbnailUrl,
        category,
        difficulty,
        tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
        relatedCourseId: relatedCourseId || undefined,
      });

      onUploadSuccess(created);
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to upload video. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#191c21] border border-[#3b4a47] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl relative text-[#e1e2ea] animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-[#bacac6] hover:text-white p-1.5 rounded-lg hover:bg-[#272a30] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#58f5e0]/20 flex items-center justify-center text-[#58f5e0]">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Upload Educational Short Video</h2>
            <p className="text-xs text-[#bacac6]">
              Publish 30s-60s micro-lessons that appear instantly on the Vormirix Reels Feed.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {/* Video Preview & Source */}
          <div>
            <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1.5">
              Select Video Clip Source
            </label>
            <select
              value={selectedSampleVideo}
              onChange={(e) => setSelectedSampleVideo(e.target.value)}
              className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
            >
              <option value="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4">
                📹 Clip 1: Coding & Tech Insights (HD MP4)
              </option>
              <option value="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4">
                📹 Clip 2: Math & Geometry Concepts (HD MP4)
              </option>
              <option value="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4">
                📹 Clip 3: Physics & Science Phenomena (HD MP4)
              </option>
              <option value="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4">
                📹 Clip 4: Problem Solving & Algorithms (HD MP4)
              </option>
            </select>
          </div>

          {/* Video Title */}
          <div>
            <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1.5">
              Video Title (Hook)
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Stop using nested loops! 3x faster trick ⚡"
              className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
            />
          </div>

          {/* Caption */}
          <div>
            <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1.5">
              Caption & Hashtags
            </label>
            <textarea
              required
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Here is how hash maps reduce O(N^2) to O(1) in interviews! #coding #dsa #python"
              className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          {/* Category & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
              >
                <option value="coding">💻 Coding</option>
                <option value="math">📐 Mathematics</option>
                <option value="physics">⚡ Physics</option>
                <option value="chemistry">🧪 Chemistry</option>
                <option value="career">🚀 Career / Interviews</option>
                <option value="tips">💡 Study Tips</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1.5">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Related Course Link (for CTA) */}
          <div>
            <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1.5 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-[#58f5e0]" />
              <span>Link to Related Full Course (Conversion CTA)</span>
            </label>
            <select
              value={relatedCourseId}
              onChange={(e) => setRelatedCourseId(e.target.value)}
              className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
            >
              <option value="">None (Stand-alone Short)</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.isFree ? 'Free' : `₹${c.price}`})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-[#bacac6] mt-1">
              Students watching this reel will see a "Learn Complete Concept" button redirecting to your course!
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1.5">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. algorithms, python, interview, tips"
              className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          {/* Submit CTA */}
          {submitError && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium text-center">
              {submitError}
            </div>
          )}
          <div className="pt-4 border-t border-[#272a30] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold uppercase text-[#bacac6] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#2dd8c4] text-[#005a50] rounded-xl font-bold text-xs uppercase hover:scale-95 transition-transform shadow-[0_0_15px_rgba(45,216,196,0.3)] disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isSubmitting ? 'Publishing Reel...' : 'Publish to Reels Feed'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
