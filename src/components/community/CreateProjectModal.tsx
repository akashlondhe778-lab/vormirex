import { Code2, Image as ImageIcon, X } from 'lucide-react';
import React, { useState } from 'react';
import { projectService } from '../../services/projectService';
import { storageService } from '../../services/storageService';
import { StudentProject, UserProfile } from '../../types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onCreateSuccess: (project: StudentProject) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, user, onCreateSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techInput, setTechInput] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [whatILearned, setWhatILearned] = useState('');
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
      setError('Give your project a title first.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        imageUrl = await storageService.upload('post-images', user.id, imageFile);
      }
      const project = await projectService.createProject(user.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        technologies: techInput.split(',').map((t) => t.trim()).filter(Boolean),
        imageUrl,
        demoUrl: demoUrl.trim() || undefined,
        githubUrl: githubUrl.trim() || undefined,
        whatILearned: whatILearned.trim() || undefined,
      });
      onCreateSuccess(project);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish project.');
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
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Showcase a Project</h2>
            <p className="text-xs text-[#bacac6]">Build your public learning portfolio.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium text-center">
              {error}
            </div>
          )}

          <div>
            <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1.5">Project Name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AI Chatbot"
              className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-[#bacac6]/50 outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What does it do?"
              className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#bacac6]/50 outline-none resize-none"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1.5">Technologies</label>
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              placeholder="Python, FastAPI, RAG"
              className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1.5">Demo Link</label>
              <input
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1.5">GitHub Link</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase font-bold text-[#bacac6] block mb-1.5">What I Learned</label>
            <input
              type="text"
              value={whatILearned}
              onChange={(e) => setWhatILearned(e.target.value)}
              placeholder="e.g. How to design retrieval-augmented pipelines"
              className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden border border-[#272a30]">
              <img src={imagePreview} alt="" className="w-full max-h-56 object-cover" />
              <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-dashed border-[#3b4a47] text-xs font-bold text-[#bacac6] hover:border-[#58f5e0] hover:text-[#58f5e0] cursor-pointer transition-all w-fit">
              <ImageIcon className="w-4 h-4" />
              <span>Add a screenshot (optional)</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            </label>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#ccbdff] text-[#111319] rounded-xl font-bold text-xs uppercase hover:scale-95 transition-transform shadow-[0_0_15px_rgba(204,189,255,0.25)] cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Publishing...' : 'Publish Project'}
          </button>
        </form>
      </div>
    </div>
  );
};
