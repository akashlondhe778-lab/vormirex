import {
  Bookmark,
  Check,
  ChevronDown,
  ChevronUp,
  Flame,
  GraduationCap,
  Heart,
  MessageCircle,
  Pause,
  Play,
  Send,
  Share2,
  Sparkles,
  UserCheck,
  UserPlus,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Course, ShortVideo, UserProfile } from '../types';

interface ReelsFeedProps {
  videos: ShortVideo[];
  courses: Course[];
  user: UserProfile;
  onLikeVideo: (videoId: string) => void;
  onSaveVideo: (videoId: string) => void;
  onAddComment: (videoId: string, text: string) => void;
  onFollowTeacher: (teacherId: string) => void;
  onNavigateToCourse: (courseId: string) => void;
  onShowToast: (msg: string) => void;
}

export const ReelsFeed: React.FC<ReelsFeedProps> = ({
  videos,
  courses,
  user,
  onLikeVideo,
  onSaveVideo,
  onAddComment,
  onFollowTeacher,
  onNavigateToCourse,
  onShowToast,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [expandedCaption, setExpandedCaption] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const filteredVideos =
    selectedCategory === 'all'
      ? videos
      : videos.filter((v) => v.category === selectedCategory);

  const activeVideo = filteredVideos[currentIndex] || filteredVideos[0];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [currentIndex, selectedCategory]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredVideos.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    onShowToast('🔗 Reel link copied to clipboard!');
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !activeVideo) return;
    onAddComment(activeVideo.id, commentInput.trim());
    setCommentInput('');
    onShowToast('Comment added successfully!');
  };

  if (!activeVideo) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <Sparkles className="w-12 h-12 text-[#58f5e0] mb-3" />
        <h3 className="text-xl font-bold text-white mb-1">No Short Videos in this Category</h3>
        <p className="text-sm text-[#bacac6] mb-4">Try switching categories or check back soon.</p>
        <button
          onClick={() => setSelectedCategory('all')}
          className="px-4 py-2 bg-[#2dd8c4] text-[#005a50] rounded-full font-bold text-xs uppercase"
        >
          View All Shorts
        </button>
      </div>
    );
  }

  const isLiked = activeVideo.isLiked;
  const isSaved = user.savedVideoIds?.includes(activeVideo.id);
  const isFollowing = user.followingTeacherIds?.includes(activeVideo.teacherId);
  const relatedCourse = courses.find((c) => c.id === activeVideo.relatedCourseId);

  return (
    <div className="w-full max-w-4xl mx-auto py-4 px-3 md:px-6 flex flex-col items-center select-none">
      {/* Top Filter Chips */}
      <div className="w-full max-w-md flex items-center gap-2 overflow-x-auto pb-3 mb-2 scrollbar-none">
        {[
          { id: 'all', label: '✨ All Shorts' },
          { id: 'coding', label: '💻 Coding Tips' },
          { id: 'math', label: '📐 Math Tricks' },
          { id: 'physics', label: '⚡ Physics' },
          { id: 'career', label: '🚀 Career / Prep' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              setCurrentIndex(0);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-[#58f5e0] text-[#005a50] shadow-[0_0_12px_rgba(88,245,224,0.3)]'
                : 'bg-[#191c21] text-[#bacac6] hover:text-white border border-[#272a30]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Reel Viewport Container */}
      <div className="relative w-full max-w-[420px] h-[78vh] min-h-[580px] max-h-[760px] bg-black rounded-2xl overflow-hidden border border-[#3b4a47] shadow-2xl flex items-center justify-center">
        {/* Video Player */}
        <video
          ref={videoRef}
          src={activeVideo.videoUrl}
          poster={activeVideo.thumbnailUrl}
          loop
          playsInline
          muted={isMuted}
          onClick={togglePlay}
          className="w-full h-full object-cover cursor-pointer"
        />

        {/* Play/Pause Overlay indicator when clicked */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white cursor-pointer z-10 transition-transform active:scale-90"
          >
            <Play className="w-8 h-8 fill-current ml-1" />
          </button>
        )}

        {/* Top Control Overlay */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20 pointer-events-auto">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs">
            <Flame className="w-3.5 h-3.5 text-[#58f5e0]" />
            <span className="font-bold text-white capitalize">{activeVideo.category}</span>
            <span className="text-white/40">•</span>
            <span className="text-[11px] text-white/80">{activeVideo.difficulty}</span>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Right Floating Actions Bar */}
        <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4 z-20">
          {/* Like */}
          <button
            onClick={() => onLikeVideo(activeVideo.id)}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-lg ${
                isLiked
                  ? 'bg-rose-500 text-white shadow-rose-500/40'
                  : 'bg-black/50 text-white hover:bg-black/70 border border-white/15'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </div>
            <span className="text-[11px] font-bold text-white drop-shadow-md">
              {activeVideo.likesCount}
            </span>
          </button>

          {/* Comments */}
          <button
            onClick={() => setShowComments(true)}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-black/50 text-white hover:bg-black/70 border border-white/15 backdrop-blur-md flex items-center justify-center transition-all shadow-lg">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-white drop-shadow-md">
              {activeVideo.comments.length}
            </span>
          </button>

          {/* Bookmark / Save */}
          <button
            onClick={() => onSaveVideo(activeVideo.id)}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-lg ${
                isSaved
                  ? 'bg-[#58f5e0] text-[#005a50]'
                  : 'bg-black/50 text-white hover:bg-black/70 border border-white/15'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </div>
            <span className="text-[11px] font-bold text-white drop-shadow-md">
              {activeVideo.savesCount}
            </span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-black/50 text-white hover:bg-black/70 border border-white/15 backdrop-blur-md flex items-center justify-center transition-all shadow-lg">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-white drop-shadow-md">Share</span>
          </button>
        </div>

        {/* Bottom Metadata & Related Course Banner */}
        <div className="absolute left-0 right-0 bottom-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent z-20 text-left pointer-events-auto">
          {/* Creator Details */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <img
                src={activeVideo.teacherAvatar}
                alt={activeVideo.teacherName}
                className="w-9 h-9 rounded-full object-cover border border-[#58f5e0]"
              />
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1">
                  {activeVideo.teacherName}
                </h4>
                <span className="text-[10px] text-[#bacac6]">{activeVideo.teacherRole}</span>
              </div>
            </div>

            <button
              onClick={() => onFollowTeacher(activeVideo.teacherId)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
                isFollowing
                  ? 'bg-[#191c21] text-[#58f5e0] border border-[#58f5e0]/40'
                  : 'bg-[#2dd8c4] text-[#005a50] hover:scale-95'
              }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Follow</span>
                </>
              )}
            </button>
          </div>

          {/* Caption & Title */}
          <h3 className="text-sm font-semibold text-white leading-snug mb-1">
            {activeVideo.title}
          </h3>
          <p
            onClick={() => setExpandedCaption(!expandedCaption)}
            className={`text-xs text-white/80 cursor-pointer ${
              expandedCaption ? '' : 'line-clamp-2'
            }`}
          >
            {activeVideo.caption}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {activeVideo.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] text-[#58f5e0] bg-[#58f5e0]/10 px-1.5 py-0.5 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Related Course Call to Action */}
          {relatedCourse && (
            <div className="mt-3 p-2.5 rounded-xl bg-[#191c21]/95 border border-[#58f5e0]/40 backdrop-blur-md flex items-center justify-between gap-2 shadow-lg">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#58f5e0]/20 flex items-center justify-center text-[#58f5e0] flex-shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-[#58f5e0] tracking-wider">
                    Learn Full Concept
                  </p>
                  <p className="text-xs font-semibold text-white truncate">
                    {relatedCourse.title}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigateToCourse(relatedCourse.id)}
                className="flex-shrink-0 px-3 py-1.5 bg-[#2dd8c4] hover:bg-[#58f5e0] text-[#005a50] font-bold text-xs rounded-lg transition-transform hover:scale-105 shadow-[0_0_10px_rgba(45,216,196,0.3)] cursor-pointer"
              >
                {relatedCourse.isFree ? 'Enroll Free' : `₹${relatedCourse.price}`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Up / Down Navigation Controls */}
      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-2.5 rounded-full bg-[#191c21] border border-[#3b4a47] text-white hover:border-[#58f5e0] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Previous Reel"
        >
          <ChevronUp className="w-5 h-5" />
        </button>

        <span className="text-xs font-mono text-[#bacac6]">
          {currentIndex + 1} / {filteredVideos.length}
        </span>

        <button
          onClick={handleNext}
          disabled={currentIndex === filteredVideos.length - 1}
          className="p-2.5 rounded-full bg-[#191c21] border border-[#3b4a47] text-white hover:border-[#58f5e0] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Next Reel"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Comments Drawer Modal */}
      {showComments && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#191c21] border border-[#3b4a47] w-full max-w-md h-[70vh] sm:rounded-2xl rounded-t-2xl flex flex-col p-4 shadow-2xl relative animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#272a30]">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#58f5e0]" />
                <h3 className="font-bold text-sm text-white">
                  Comments ({activeVideo.comments.length})
                </h3>
              </div>
              <button
                onClick={() => setShowComments(false)}
                className="p-1 rounded-lg text-[#bacac6] hover:text-white hover:bg-[#272a30]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comment List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3">
              {activeVideo.comments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-[#bacac6] text-xs">
                  <MessageCircle className="w-8 h-8 text-[#3b4a47] mb-2" />
                  <span>No comments yet. Be the first to start the educational discussion!</span>
                </div>
              ) : (
                activeVideo.comments.map((comm) => (
                  <div key={comm.id} className="flex gap-2.5 items-start">
                    <img
                      src={comm.userAvatar}
                      alt={comm.userName}
                      className="w-7 h-7 rounded-full object-cover border border-[#3b4a47]"
                    />
                    <div className="flex-1 bg-[#111319] p-2.5 rounded-xl border border-[#272a30]">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-white">{comm.userName}</span>
                        <span className="text-[10px] text-[#bacac6]">{comm.timestamp}</span>
                      </div>
                      <p className="text-xs text-[#e1e2ea]">{comm.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            <form
              onSubmit={handleCommentSubmit}
              className="pt-2 border-t border-[#272a30] flex gap-2"
            >
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Ask a question or share a thought..."
                className="flex-1 bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
              <button
                type="submit"
                className="p-2.5 bg-[#2dd8c4] text-[#005a50] rounded-xl hover:scale-95 font-bold transition-transform cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
