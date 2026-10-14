import { Award, Code2, HelpCircle, Plus, Sparkles, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { certificateService } from '../../services/certificateService';
import { communityService, FeedTab } from '../../services/communityService';
import { qnaService } from '../../services/qnaService';
import { CommunityPost, CourseCertificate, Question, UserProfile } from '../../types';
import { AskDoubtModal } from './AskDoubtModal';
import { CreatePostModal } from './CreatePostModal';
import { CreateProjectModal } from './CreateProjectModal';
import { PostCard } from './PostCard';
import { QuestionCard } from './QuestionCard';
import { ShareAchievementModal } from './ShareAchievementModal';

interface CommunityPageProps {
  user: UserProfile;
  onShowToast: (msg: string) => void;
  onOpenProfile: (userId: string) => void;
  onOpenQuestion: (question: Question) => void;
}

type MainTab = 'feed' | 'questions';

export const CommunityPage: React.FC<CommunityPageProps> = ({ user, onShowToast, onOpenProfile, onOpenQuestion }) => {
  const [mainTab, setMainTab] = useState<MainTab>('feed');
  const [feedTab, setFeedTab] = useState<FeedTab>('for-you');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isAskDoubtOpen, setIsAskDoubtOpen] = useState(false);
  const [isShareAchievementOpen, setIsShareAchievementOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [myCertificates, setMyCertificates] = useState<CourseCertificate[]>([]);

  const loadFeed = () => {
    setLoading(true);
    communityService
      .listFeed(feedTab, user.id)
      .then(setPosts)
      .catch(() => onShowToast('Could not load the feed.'))
      .finally(() => setLoading(false));
  };

  const loadQuestions = () => {
    setLoading(true);
    qnaService
      .listQuestions()
      .then(setQuestions)
      .catch(() => onShowToast('Could not load questions.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (mainTab === 'feed') loadFeed();
    else loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainTab, feedTab]);

  useEffect(() => {
    certificateService.listForStudent(user.id).then(setMyCertificates).catch(() => {});
  }, [user.id]);

  const handleLike = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const currentlyLiked = post.isLiked;
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isLiked: !currentlyLiked, likesCount: p.likesCount + (currentlyLiked ? -1 : 1) } : p))
    );
    try {
      await communityService.toggleLike(postId, user.id, currentlyLiked);
    } catch {
      loadFeed();
    }
  };

  const handleSave = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const currentlySaved = post.isSaved;
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isSaved: !currentlySaved, savesCount: p.savesCount + (currentlySaved ? -1 : 1) } : p))
    );
    try {
      await communityService.toggleSave(postId, user.id, currentlySaved);
      onShowToast(currentlySaved ? 'Removed from saved posts.' : 'Saved for later!');
    } catch {
      loadFeed();
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await communityService.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      onShowToast('Post removed.');
    } catch {
      onShowToast('Failed to delete post.');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-0 py-4 space-y-6 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-[#58f5e0]" />
            <span>Community</span>
          </h1>
          <p className="text-xs text-[#bacac6] mt-0.5">Learn, ask, share, and grow together.</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsCreateMenuOpen((v) => !v)}
            className="px-4 py-2.5 bg-[#2dd8c4] text-[#005a50] rounded-xl text-xs font-bold flex items-center gap-1.5 hover:scale-95 transition-transform cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create</span>
          </button>

          {isCreateMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-[#191c21] border border-[#3b4a47] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in"
              onClick={() => setIsCreateMenuOpen(false)}
            >
              <button
                onClick={() => setIsCreatePostOpen(true)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-[#e1e2ea] hover:bg-[#272a30] transition-colors"
              >
                <Sparkles className="w-4 h-4 text-[#58f5e0]" />
                <span>Post or Short Video</span>
              </button>
              <button
                onClick={() => setIsAskDoubtOpen(true)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-[#e1e2ea] hover:bg-[#272a30] transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-[#ccbdff]" />
                <span>Ask a Doubt</span>
              </button>
              <button
                onClick={() => setIsCreateProjectOpen(true)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-[#e1e2ea] hover:bg-[#272a30] transition-colors"
              >
                <Code2 className="w-4 h-4 text-[#ccbdff]" />
                <span>Showcase a Project</span>
              </button>
              <button
                onClick={() => setIsShareAchievementOpen(true)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-[#e1e2ea] hover:bg-[#272a30] transition-colors"
              >
                <Award className="w-4 h-4 text-[#f59e0b]" />
                <span>Share an Achievement</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex bg-[#191c21] p-1 rounded-xl border border-[#272a30] w-fit">
        <button
          onClick={() => setMainTab('feed')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            mainTab === 'feed' ? 'bg-[#58f5e0] text-[#005a50]' : 'text-[#bacac6] hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Feed
        </button>
        <button
          onClick={() => setMainTab('questions')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            mainTab === 'questions' ? 'bg-[#58f5e0] text-[#005a50]' : 'text-[#bacac6] hover:text-white'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Ask & Solve
        </button>
      </div>

      {mainTab === 'feed' ? (
        <>
          {/* Feed sub-tabs */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            {(['for-you', 'following'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFeedTab(t)}
                className={`px-3 py-1.5 rounded-full capitalize transition-colors cursor-pointer ${
                  feedTab === t ? 'bg-[#58f5e0]/15 text-[#58f5e0] border border-[#58f5e0]/30' : 'text-[#bacac6] hover:text-white border border-transparent'
                }`}
              >
                {t === 'for-you' ? 'For You' : 'Following'}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-xs text-[#bacac6] text-center py-10">Loading your feed…</p>
          ) : posts.length === 0 ? (
            <div className="bg-[#191c21] border border-[#272a30] rounded-2xl p-10 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-[#3b4a47] mx-auto" />
              <h3 className="text-sm font-bold text-white">
                {feedTab === 'following' ? 'No posts from people you follow yet' : 'No posts yet'}
              </h3>
              <p className="text-xs text-[#bacac6]">Be the first to share something educational!</p>
              <button
                onClick={() => setIsCreatePostOpen(true)}
                className="px-4 py-2 bg-[#2dd8c4] text-[#005a50] rounded-full font-bold text-xs uppercase hover:scale-95 cursor-pointer"
              >
                Create a Post
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={user}
                  onLike={handleLike}
                  onSave={handleSave}
                  onShowToast={onShowToast}
                  onOpenAuthorProfile={onOpenProfile}
                  onDelete={handleDeletePost}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {loading ? (
            <p className="text-xs text-[#bacac6] text-center py-10">Loading questions…</p>
          ) : questions.length === 0 ? (
            <div className="bg-[#191c21] border border-[#272a30] rounded-2xl p-10 text-center space-y-3">
              <HelpCircle className="w-8 h-8 text-[#3b4a47] mx-auto" />
              <h3 className="text-sm font-bold text-white">No doubts posted yet</h3>
              <p className="text-xs text-[#bacac6]">Ask the first question and get the community solving together.</p>
              <button
                onClick={() => setIsAskDoubtOpen(true)}
                className="px-4 py-2 bg-[#ccbdff] text-[#111319] rounded-full font-bold text-xs uppercase hover:scale-95 cursor-pointer"
              >
                Ask a Doubt
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q) => (
                <QuestionCard key={q.id} question={q} onOpen={onOpenQuestion} />
              ))}
            </div>
          )}
        </>
      )}

      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        user={user}
        onCreateSuccess={(post) => {
          setPosts((prev) => [post, ...prev]);
          onShowToast('🎉 Post published to the community!');
        }}
      />

      <AskDoubtModal
        isOpen={isAskDoubtOpen}
        onClose={() => setIsAskDoubtOpen(false)}
        user={user}
        onCreateSuccess={(question) => {
          setQuestions((prev) => [question, ...prev]);
          setMainTab('questions');
          onShowToast('❓ Your doubt is live — the community can now help!');
        }}
      />

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        user={user}
        onCreateSuccess={() => {
          onShowToast('💻 Project published! Check it out on your Community Profile.');
        }}
      />

      <ShareAchievementModal
        isOpen={isShareAchievementOpen}
        onClose={() => setIsShareAchievementOpen(false)}
        user={user}
        certificates={myCertificates}
        onShareSuccess={(post) => {
          setPosts((prev) => [post, ...prev]);
          onShowToast('🏆 Achievement shared to the community feed!');
        }}
      />
    </div>
  );
};
