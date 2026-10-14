import {
  BookOpen,
  Check,
  Globe,
  Plus,
  Sparkles,
  Trash2,
  Video,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { courseService } from '../services/courseService';
import { Course, UserProfile } from '../types';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onCreateSuccess: (course: Course) => void;
}

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
  isOpen,
  onClose,
  user,
  onCreateSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'coding' | 'math' | 'physics' | 'chemistry' | 'career'>('coding');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [price, setPrice] = useState<number>(499);
  const [isFree, setIsFree] = useState<boolean>(false);
  const [language, setLanguage] = useState('English / Hindi');
  const [thumbnailUrl, setThumbnailUrl] = useState(
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [lessons, setLessons] = useState<
    Array<{ title: string; duration: string; videoUrl: string; isFreePreview: boolean; description: string }>
  >([
    {
      title: '1. Course Introduction & Core Fundamentals',
      duration: '15:00',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      isFreePreview: true,
      description: 'Overview of the syllabus and foundations.',
    },
    {
      title: '2. Deep Dive Into Architecture & Hands-on Examples',
      duration: '22:30',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      isFreePreview: false,
      description: 'Building practical code blocks and exercises.',
    },
  ]);

  if (!isOpen) return null;

  const handleAddLesson = () => {
    setLessons((prev) => [
      ...prev,
      {
        title: `${prev.length + 1}. New Lesson Module`,
        duration: '18:00',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        isFreePreview: false,
        description: 'Comprehensive walkthrough and exercises.',
      },
    ]);
  };

  const handleRemoveLesson = (idx: number) => {
    if (lessons.length <= 1) return;
    setLessons((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const created = await courseService.createCourse(user.id, {
        title,
        subtitle,
        description,
        category,
        difficulty,
        price: Number(price),
        isFree,
        language,
        thumbnailUrl,
        lessons: lessons.map((l) => ({
          title: l.title,
          description: l.description,
          videoUrl: l.videoUrl,
          isFreePreview: l.isFreePreview,
        })),
        publish: true,
      });

      onCreateSuccess(created);
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create course. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#191c21] border border-[#3b4a47] w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl relative text-[#e1e2ea] animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-[#bacac6] hover:text-white p-1.5 rounded-lg hover:bg-[#272a30] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#58f5e0]/20 flex items-center justify-center text-[#58f5e0]">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Create New Course / Masterclass</h2>
            <p className="text-xs text-[#bacac6]">
              Publish structured multi-lesson long-form video courses with free previews and paid unlocks.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          {/* Title */}
          <div>
            <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1.5">
              Course Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Modern System Design & Cloud Architecture"
              className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1.5">
              Subtitle (Tagline)
            </label>
            <input
              type="text"
              required
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Master distributed caching, microservices, and high-scale backends"
              className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1.5">
              Description
            </label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a comprehensive summary of what students will achieve in this masterclass."
              className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          {/* Category, Difficulty & Language */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="coding">💻 Coding</option>
                <option value="math">📐 Math</option>
                <option value="physics">⚡ Physics</option>
                <option value="chemistry">🧪 Chemistry</option>
                <option value="career">🚀 Career Prep</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1.5">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1.5">
                Language
              </label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Pricing Config */}
          <div className="bg-[#111319] border border-[#272a30] p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-white">Course Pricing</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFree(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    !isFree
                      ? 'bg-[#58f5e0] text-[#005a50]'
                      : 'text-[#bacac6] hover:text-white'
                  }`}
                >
                  Paid (₹)
                </button>
                <button
                  type="button"
                  onClick={() => setIsFree(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    isFree
                      ? 'bg-emerald-500 text-white'
                      : 'text-[#bacac6] hover:text-white'
                  }`}
                >
                  Free Course
                </button>
              </div>
            </div>

            {!isFree && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[#58f5e0]">₹ Price:</span>
                <input
                  type="number"
                  min={99}
                  step={100}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-40 bg-[#191c21] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3 py-1.5 text-sm font-bold text-white focus:outline-none"
                />
                <span className="text-xs text-[#bacac6]">
                  (Recommended: ₹499, ₹999, ₹1,499)
                </span>
              </div>
            )}
          </div>

          {/* Curriculum Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase font-bold text-white tracking-wider">
                Lessons Curriculum ({lessons.length} Lessons)
              </h3>
              <button
                type="button"
                onClick={handleAddLesson}
                className="text-xs font-bold text-[#58f5e0] flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Lesson</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {lessons.map((lesson, idx) => (
                <div
                  key={idx}
                  className="bg-[#111319] border border-[#272a30] p-3.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex-1 space-y-2 w-full">
                    <input
                      type="text"
                      value={lesson.title}
                      onChange={(e) => {
                        const newL = [...lessons];
                        newL[idx].title = e.target.value;
                        setLessons(newL);
                      }}
                      className="w-full bg-[#191c21] border border-[#3b4a47] rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-[#58f5e0]"
                      placeholder="Lesson title..."
                    />
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-[#bacac6] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={lesson.isFreePreview}
                          onChange={(e) => {
                            const newL = [...lessons];
                            newL[idx].isFreePreview = e.target.checked;
                            setLessons(newL);
                          }}
                          className="accent-[#58f5e0] rounded"
                        />
                        <span>Free Preview Video (Non-enrolled can watch)</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveLesson(idx)}
                    disabled={lessons.length === 1}
                    className="text-rose-400 hover:text-rose-300 p-2 rounded-lg hover:bg-rose-500/10 disabled:opacity-20 cursor-pointer"
                    title="Delete Lesson"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
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
              className="px-6 py-2.5 bg-[#2dd8c4] text-[#005a50] rounded-xl font-bold text-xs uppercase hover:scale-95 transition-transform shadow-[0_0_15px_rgba(45,216,196,0.3)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Masterclass Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
