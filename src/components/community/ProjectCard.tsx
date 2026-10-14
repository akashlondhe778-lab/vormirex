import { ExternalLink, Github, Trash2 } from 'lucide-react';
import React from 'react';
import { StudentProject } from '../../types';

interface ProjectCardProps {
  project: StudentProject;
  canDelete?: boolean;
  onDelete?: (projectId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, canDelete, onDelete }) => {
  return (
    <div className="bg-[#191c21] border border-[#272a30] rounded-2xl overflow-hidden flex flex-col">
      {project.imageUrl && (
        <div className="aspect-video bg-black">
          <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4 space-y-2.5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-bold text-white">{project.title}</h4>
          {canDelete && onDelete && (
            <button onClick={() => onDelete(project.id)} className="p-1 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0" title="Delete project">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {project.description && <p className="text-xs text-[#bacac6] leading-relaxed line-clamp-3">{project.description}</p>}

        {project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.technologies.map((tech) => (
              <span key={tech} className="text-[10px] font-semibold text-[#ccbdff] bg-[#ccbdff]/10 px-1.5 py-0.5 rounded">
                {tech}
              </span>
            ))}
          </div>
        )}

        {project.whatILearned && (
          <p className="text-[11px] text-[#58f5e0] italic">💡 {project.whatILearned}</p>
        )}

        <div className="flex items-center gap-3 pt-2 mt-auto border-t border-[#272a30]">
          {project.demoUrl && (
            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] font-bold text-[#58f5e0] hover:underline">
              <ExternalLink className="w-3 h-3" />
              Live Demo
            </a>
          )}
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] font-bold text-[#bacac6] hover:text-white">
              <Github className="w-3 h-3" />
              Code
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
