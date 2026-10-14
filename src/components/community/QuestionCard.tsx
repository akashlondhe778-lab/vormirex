import { CheckCircle2, MessageCircle, Eye } from 'lucide-react';
import React from 'react';
import { Question } from '../../types';

interface QuestionCardProps {
  question: Question;
  onOpen: (question: Question) => void;
}

const DIFFICULTY_COLOR: Record<Question['difficulty'], string> = {
  Beginner: 'text-[#58f5e0] bg-[#58f5e0]/10 border-[#58f5e0]/30',
  Intermediate: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30',
  Advanced: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
};

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onOpen }) => {
  return (
    <button
      onClick={() => onOpen(question)}
      className="w-full text-left bg-[#191c21] border border-[#272a30] hover:border-[#ccbdff]/50 rounded-2xl p-4 sm:p-5 space-y-3 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <img src={question.authorAvatar} alt={question.authorName} className="w-7 h-7 rounded-full object-cover border border-[#3b4a47] shrink-0" />
          <span className="text-xs font-semibold text-[#bacac6] truncate">{question.authorName}</span>
        </div>
        {question.isResolved && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-[#58f5e0] shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Resolved
          </span>
        )}
      </div>

      <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">{question.title}</h3>

      <div className="flex flex-wrap items-center gap-1.5">
        {question.subject && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#111319] text-[#bacac6] border border-[#272a30]">
            {question.subject}
          </span>
        )}
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${DIFFICULTY_COLOR[question.difficulty]}`}>
          {question.difficulty}
        </span>
        {question.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="text-[10px] text-[#ccbdff] bg-[#ccbdff]/10 px-1.5 py-0.5 rounded">
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-4 text-[11px] text-[#bacac6] pt-1 border-t border-[#272a30]">
        <span className="flex items-center gap-1">
          <MessageCircle className="w-3.5 h-3.5" />
          {question.answersCount} {question.answersCount === 1 ? 'student is' : 'students are'} discussing
        </span>
        <span className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" />
          {question.viewsCount}
        </span>
      </div>
    </button>
  );
};
