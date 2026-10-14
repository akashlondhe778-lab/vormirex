import { Bookmark, Heart, MessageCircle, Share2, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { communityService } from '../../services/communityService';
import { CommunityPost, PostComment, UserProfile } from '../../types';
import { AchievementCertificateCard } from './AchievementCertificateCard';

interface PostCardProps {
  post: CommunityPost;
  currentUser: UserProfile;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onShowToast: (msg: string) => void;
  onOpenAuthorProfile: (authorId: string) => void;
  onDelete?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  onLike,
  onSave,
  onShowToast,
  onOpenAuthorProfile,
  onDelete,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const isOwnPost = post.authorId === currentUser.id;

  useEffect(() => {
    if (!showComments) return;
    setLoadingComments(true);
    communityService
      .getComments(post.id)
      .then(setComments)
      .catch(() => onShowToast('Could not load comments.'))
      .finally(() => setLoadingComments(false));
  }, [showComments, post.id]);

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/app/community?post=${post.id}`);
    onShowToast('🔗 Post link copied to clipboard!');
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    try {
      const comment = await communityService.addComment(post.id, currentUser.id, commentInput.trim());
      setComments((prev) => [...prev, comment]);
      setCommentInput('');
    } catch {
      onShowToast('Failed to post comment.');
    }
  };

  return (
    <div className="bg-[#191c21] border border-[#272a30] rounded-2xl p-4 sm:p-5 space-y-3">
      {/* Author */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onOpenAuthorProfile(post.authorId)}
          className="flex items-center gap-2.5 text-left cursor-pointer group"
        >
          <img
            src={post.authorAvatar}
            alt={post.authorName}
            className="w-9 h-9 rounded-full object-cover border border-[#58f5e0]/40"
          />
          <div>
            <h4 className="text-xs font-bold text-white group-hover:text-[#58f5e0] transition-colors">{post.authorName}</h4>
            <span className="text-[10px] text-[#bacac6]">
              {post.authorUsername ? `@${post.authorUsername} • ` : ''}
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
        </button>
        {isOwnPost && onDelete && (
          <button
            onClick={() => onDelete(post.id)}
            className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            title="Delete post"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <p className="text-sm text-[#e1e2ea] leading-relaxed whitespace-pre-wrap">{post.content}</p>

      {post.type === 'achievement' && post.certificate ? (
        <AchievementCertificateCard certificate={post.certificate} studentName={post.authorName} compact />
      ) : post.type === 'video' && post.videoUrl ? (
        <div className="rounded-xl overflow-hidden border border-[#272a30] bg-black">
          <video src={post.videoUrl} controls playsInline className="w-full max-h-[480px] object-contain" />
        </div>
      ) : (
        post.imageUrl && (
          <div className="rounded-xl overflow-hidden border border-[#272a30]">
            <img src={post.imageUrl} alt="" className="w-full max-h-[480px] object-cover" />
          </div>
        )
      )}

      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span key={tag} className="text-[10px] text-[#58f5e0] bg-[#58f5e0]/10 px-1.5 py-0.5 rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Engagement bar */}
      <div className="flex items-center gap-5 pt-2 border-t border-[#272a30]">
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors ${
            post.isLiked ? 'text-rose-400' : 'text-[#bacac6] hover:text-rose-400'
          }`}
        >
          <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
          <span>{post.likesCount}</span>
        </button>
        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#bacac6] hover:text-white cursor-pointer transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{post.commentsCount}</span>
        </button>
        <button
          onClick={() => onSave(post.id)}
          className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors ${
            post.isSaved ? 'text-[#58f5e0]' : 'text-[#bacac6] hover:text-[#58f5e0]'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-current' : ''}`} />
          <span>{post.savesCount}</span>
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#bacac6] hover:text-white cursor-pointer transition-colors ml-auto"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="pt-3 border-t border-[#272a30] space-y-3">
          {loadingComments ? (
            <p className="text-[11px] text-[#bacac6] text-center py-2">Loading comments…</p>
          ) : comments.length === 0 ? (
            <p className="text-[11px] text-[#bacac6] text-center py-2">No comments yet. Start the discussion!</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-2.5 items-start">
                <img src={c.userAvatar} alt={c.userName} className="w-7 h-7 rounded-full object-cover border border-[#3b4a47]" />
                <div className="flex-1 bg-[#111319] p-2.5 rounded-xl border border-[#272a30]">
                  <span className="text-[11px] font-bold text-white">{c.userName}</span>
                  <p className="text-xs text-[#e1e2ea] mt-0.5">{c.comment}</p>
                </div>
              </div>
            ))
          )}
          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Add a thoughtful comment..."
              className="flex-1 bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-[#2dd8c4] text-[#005a50] rounded-xl text-xs font-bold hover:scale-95 transition-transform cursor-pointer"
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
