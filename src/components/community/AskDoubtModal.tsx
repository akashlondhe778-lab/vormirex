import { HelpCircle, Image as ImageIcon, X } from 'lucide-react';
import React, { useState } from 'react';
import { qnaService } from '../../services/qnaService';
import { storageService } from '../../services/storageService';
import { Question, UserProfile } from '../../types';

interface AskDoubtModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onCreateSuccess: (question: Question) => void;
}

const SUBJECTS = ['Mathematics', 'Python', 'Physics', 'Chemistry', 'Computer Science', 'DSA', 'Career', 'Other'];

export const AskDoubtModal: React.FC<AskDoubtModalProps> = ({ isOpen, onClose, user, onCreateSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [topic, setTopic] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [difficulty, setDifficulty] = useState<Question['difficulty']>('Beginner');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError('Image must be smaller than 8MB.');
      return;
    }
    setError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Ask your question in the title field first.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        imageUrl = await storageService.upload('post-images', user.id, imageFile);
      }
      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      const question = await qnaService.createQuestion(user.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        subject,
        topic: topic.trim() || undefined,
        imageUrl,
        tags,
        difficulty,
      });
      onCreateSuccess(question);
      setTitle('');
      setDescription('');
      setTopic('');
      setTagsInput('');
      setImageFile(null);
      setImagePreview(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post your question.');
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
          <div className="w-10 h-10 rounded-xl bg-[#ccbdff]/20 flex items-center justify-center text-[#ccbdff]">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Ask a Doubt</h2>
            <p className="text-xs text-[#bacac6]">Get help from students across the community.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium text-center">
              {error}
            </div>
          )}

          <div>
            <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1.5">Your Question</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={300}
              placeholder="e.g. Why do we use recursion in this problem?"
              className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-[#bacac6]/50 outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1.5">Details (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={3000}
              placeholder="Add more context — what have you tried so far?"
              className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#bacac6]/50 outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1.5">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3 py-2.5 text-xs text-white outline-none"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1.5">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Question['difficulty'])}
                className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3 py-2.5 text-xs text-white outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1.5">Topic & Tags</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Topic, e.g. Recursion"
              className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3 py-2 text-xs text-white focus:outline-none mb-2"
            />
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="#Python, #DSA, #Recursion"
              className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden border border-[#272a30]">
              <img src={imagePreview} alt="" className="w-full max-h-56 object-cover" />
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-dashed border-[#3b4a47] text-xs font-bold text-[#bacac6] hover:border-[#58f5e0] hover:text-[#58f5e0] cursor-pointer transition-all w-fit">
              <ImageIcon className="w-4 h-4" />
              <span>Attach a screenshot (optional)</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            </label>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#ccbdff] text-[#111319] rounded-xl font-bold text-xs uppercase hover:scale-95 transition-transform shadow-[0_0_15px_rgba(204,189,255,0.25)] cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Posting...' : 'Post Your Doubt'}
          </button>
        </form>
      </div>
    </div>
  );
};
