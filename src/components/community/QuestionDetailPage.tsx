import { ArrowLeft, Award, Bookmark, CheckCircle2, ThumbsUp, Trophy } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { qnaService } from '../../services/qnaService';
import { Question, QuestionAnswer, UserProfile } from '../../types';

interface QuestionDetailPageProps {
  question: Question;
  user: UserProfile;
  onBack: () => void;
  onShowToast: (msg: string) => void;
  onOpenAuthorProfile: (authorId: string) => void;
  onQuestionUpdated: (question: Question) => void;
}

export const QuestionDetailPage: React.FC<QuestionDetailPageProps> = ({
  question,
  user,
  onBack,
  onShowToast,
  onOpenAuthorProfile,
  onQuestionUpdated,
}) => {
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerInput, setAnswerInput] = useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const isOwner = question.authorId === user.id;

  const loadAnswers = () => {
    setLoading(true);
    qnaService
      .listAnswers(question.id, user.id)
      .then(setAnswers)
      .catch(() => onShowToast('Could not load answers.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAnswers();
    qnaService.incrementViews(question.id).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id]);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerInput.trim()) return;
    setIsSubmittingAnswer(true);
    try {
      const answer = await qnaService.createAnswer(question.id, user.id, answerInput.trim());
      setAnswers((prev) => [...prev, answer]);
      setAnswerInput('');
      onShowToast('Your answer was posted!');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'Failed to post answer.');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleUpvote = async (answer: QuestionAnswer) => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.id === answer.id
          ? { ...a, isUpvotedByMe: !a.isUpvotedByMe, upvotesCount: a.upvotesCount + (a.isUpvotedByMe ? -1 : 1) }
          : a
      )
    );
    try {
      await qnaService.toggleUpvote(answer.id, user.id, answer.isUpvotedByMe);
    } catch {
      loadAnswers();
    }
  };

  const handleAccept = async (answer: QuestionAnswer) => {
    try {
      await qnaService.acceptAnswer(answer.id);
      onShowToast(`🏆 Marked ${answer.authorName}'s answer as accepted! They earned +50 XP.`);
      onQuestionUpdated({ ...question, isResolved: true, acceptedAnswerId: answer.id });
      loadAnswers();
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'Failed to accept answer.');
    }
  };

  const handleToggleSave = async () => {
    const next = !isSaved;
    setIsSaved(next);
    try {
      await qnaService.toggleSaveQuestion(question.id, user.id, !next);
    } catch {
      setIsSaved(!next);
    }
  };

  const sortedAnswers = [...answers].sort((a, b) => {
    if (a.isAccepted !== b.isAccepted) return a.isAccepted ? -1 : 1;
    return b.upvotesCount - a.upvotesCount;
  });

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-0 py-4 space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold text-[#bacac6] hover:text-[#58f5e0] transition-colors cursor-pointer">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Ask & Solve</span>
      </button>

      {/* Question */}
      <div className="bg-[#191c21] border border-[#3b4a47] rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => onOpenAuthorProfile(question.authorId)} className="flex items-center gap-2.5 cursor-pointer group">
            <img src={question.authorAvatar} alt={question.authorName} className="w-9 h-9 rounded-full object-cover border border-[#58f5e0]/40" />
            <div className="text-left">
              <h4 className="text-xs font-bold text-white group-hover:text-[#58f5e0] transition-colors">{question.authorName}</h4>
              <span className="text-[10px] text-[#bacac6]">{new Date(question.createdAt).toLocaleDateString()}</span>
            </div>
          </button>
          <button onClick={handleToggleSave} className={`p-2 rounded-xl border transition-colors cursor-pointer ${isSaved ? 'border-[#58f5e0] text-[#58f5e0]' : 'border-[#272a30] text-[#bacac6] hover:border-[#58f5e0]'}`}>
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        <h1 className="text-xl font-extrabold text-white leading-snug">{question.title}</h1>
        {question.description && <p className="text-sm text-[#bacac6] leading-relaxed whitespace-pre-wrap">{question.description}</p>}
        {question.imageUrl && (
          <div className="rounded-xl overflow-hidden border border-[#272a30]">
            <img src={question.imageUrl} alt="" className="w-full max-h-96 object-cover" />
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {question.subject && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#111319] text-[#bacac6] border border-[#272a30]">{question.subject}</span>}
          {question.tags.map((tag) => (
            <span key={tag} className="text-[10px] text-[#ccbdff] bg-[#ccbdff]/10 px-1.5 py-0.5 rounded">#{tag}</span>
          ))}
        </div>

        <div className="pt-3 border-t border-[#272a30] text-xs font-semibold text-[#58f5e0]">
          {answers.length} {answers.length === 1 ? 'student is' : 'students are'} discussing this question
        </div>
      </div>

      {/* Answers */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Answers & Explanations</h3>

        {loading ? (
          <p className="text-xs text-[#bacac6] text-center py-6">Loading discussion…</p>
        ) : sortedAnswers.length === 0 ? (
          <div className="bg-[#191c21] border border-[#272a30] rounded-2xl p-6 text-center">
            <p className="text-xs text-[#bacac6]">No answers yet — be the first student to help out!</p>
          </div>
        ) : (
          sortedAnswers.map((answer) => (
            <div
              key={answer.id}
              className={`rounded-2xl p-4 sm:p-5 space-y-3 border ${
                answer.isAccepted ? 'bg-[#58f5e0]/5 border-[#58f5e0]/50' : 'bg-[#191c21] border-[#272a30]'
              }`}
            >
              {answer.isAccepted && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#58f5e0]">
                  <Trophy className="w-4 h-4 fill-current" />
                  <span>Best Answer</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <button onClick={() => onOpenAuthorProfile(answer.authorId)} className="flex items-center gap-2.5 cursor-pointer group">
                  <img src={answer.authorAvatar} alt={answer.authorName} className="w-8 h-8 rounded-full object-cover border border-[#3b4a47]" />
                  <span className="text-xs font-bold text-white group-hover:text-[#58f5e0] transition-colors">{answer.authorName}</span>
                </button>
                <span className="text-[10px] text-[#bacac6]">{new Date(answer.createdAt).toLocaleDateString()}</span>
              </div>

              <p className="text-sm text-[#e1e2ea] leading-relaxed whitespace-pre-wrap">{answer.content}</p>

              <div className="flex items-center gap-3 pt-2 border-t border-[#272a30]">
                <button
                  onClick={() => handleUpvote(answer)}
                  className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                    answer.isUpvotedByMe ? 'text-[#58f5e0]' : 'text-[#bacac6] hover:text-[#58f5e0]'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${answer.isUpvotedByMe ? 'fill-current' : ''}`} />
                  <span>{answer.upvotesCount}</span>
                </button>

                {isOwner && !question.isResolved && (
                  <button
                    onClick={() => handleAccept(answer)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#005a50] bg-[#58f5e0] px-3 py-1.5 rounded-lg hover:scale-95 transition-transform cursor-pointer ml-auto"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Accept Answer</span>
                  </button>
                )}
                {answer.isAccepted && (
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#58f5e0] ml-auto">
                    <Award className="w-3.5 h-3.5" />
                    Accepted Answer
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Answer composer */}
      <form onSubmit={handleSubmitAnswer} className="bg-[#191c21] border border-[#272a30] rounded-2xl p-4 space-y-3">
        <label className="text-[11px] uppercase font-bold text-[#bacac6] block">Add your explanation or alternative method</label>
        <textarea
          value={answerInput}
          onChange={(e) => setAnswerInput(e.target.value)}
          rows={3}
          maxLength={3000}
          placeholder="Share how you'd solve this..."
          className="w-full bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-[#bacac6]/50 outline-none resize-none"
        />
        <button
          type="submit"
          disabled={isSubmittingAnswer}
          className="px-5 py-2.5 bg-[#2dd8c4] text-[#005a50] rounded-xl font-bold text-xs uppercase hover:scale-95 transition-transform cursor-pointer disabled:opacity-50"
        >
          {isSubmittingAnswer ? 'Posting...' : 'Post Answer'}
        </button>
      </form>
    </div>
  );
};
