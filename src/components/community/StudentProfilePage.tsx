import { ArrowLeft, Award, BookMarked, Code2, Flame, Grid, Link as LinkIcon, MapPin, Trophy, User as UserIcon, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { achievementService } from '../../services/achievementService';
import { certificateService } from '../../services/certificateService';
import { communityService } from '../../services/communityService';
import { projectService } from '../../services/projectService';
import { socialProfileService } from '../../services/socialProfileService';
import { Achievement, CommunityPost, CourseCertificate, StudentProject, StudentPublicProfile, UserProfile } from '../../types';
import { AchievementCertificateCard } from './AchievementCertificateCard';
import { FollowListModal } from './FollowListModal';
import { PostCard } from './PostCard';
import { ProjectCard } from './ProjectCard';

interface StudentProfilePageProps {
  profileId: string;
  viewer: UserProfile;
  onBack: () => void;
  onShowToast: (msg: string) => void;
  onOpenProfile: (userId: string) => void;
}

type ProfileTab = 'posts' | 'achievements' | 'projects' | 'about';

export const StudentProfilePage: React.FC<StudentProfilePageProps> = ({ profileId, viewer, onBack, onShowToast, onOpenProfile }) => {
  const [profile, setProfile] = useState<StudentPublicProfile | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [certificates, setCertificates] = useState<CourseCertificate[]>([]);
  const [projects, setProjects] = useState<StudentProject[]>([]);
  const [tab, setTab] = useState<ProfileTab>('posts');
  const [loading, setLoading] = useState(true);
  const [followListMode, setFollowListMode] = useState<'followers' | 'following' | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      socialProfileService.getPublicProfile(profileId, viewer.id),
      communityService.listByAuthor(profileId),
      achievementService.listForStudent(profileId),
      certificateService.listForStudent(profileId),
      projectService.listByAuthor(profileId),
    ])
      .then(([p, pts, achs, certs, projs]) => {
        setProfile(p);
        setPosts(pts);
        setAchievements(achs.filter((a) => a.unlocked));
        setCertificates(certs);
        setProjects(projs);
      })
      .catch(() => onShowToast('Could not load this profile.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  const handleToggleFollow = async () => {
    if (!profile) return;
    const currentlyFollowing = profile.isFollowedByMe;
    setProfile({ ...profile, isFollowedByMe: !currentlyFollowing, followersCount: profile.followersCount + (currentlyFollowing ? -1 : 1) });
    try {
      await socialProfileService.toggleFollow(viewer.id, profileId, currentlyFollowing);
    } catch {
      load();
    }
  };

  const handleListToggleFollow = async (targetId: string, currentlyFollowing: boolean) => {
    await socialProfileService.toggleFollow(viewer.id, targetId, currentlyFollowing);
    if (targetId === profileId) load();
  };

  const handleLike = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const currentlyLiked = post.isLiked;
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, isLiked: !currentlyLiked, likesCount: p.likesCount + (currentlyLiked ? -1 : 1) } : p)));
    try {
      await communityService.toggleLike(postId, viewer.id, currentlyLiked);
    } catch {
      load();
    }
  };

  const handleSave = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const currentlySaved = post.isSaved;
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, isSaved: !currentlySaved, savesCount: p.savesCount + (currentlySaved ? -1 : 1) } : p)));
    try {
      await communityService.toggleSave(postId, viewer.id, currentlySaved);
    } catch {
      load();
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await communityService.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch {
      onShowToast('Failed to delete post.');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await projectService.deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch {
      onShowToast('Failed to delete project.');
    }
  };

  const handleCopyProfileLink = () => {
    const url = profile?.username
      ? `${window.location.origin}/app/community/profile?u=${profile.username}`
      : `${window.location.origin}/app/community/profile`;
    navigator.clipboard.writeText(url);
    onShowToast('🔗 Profile link copied!');
  };

  if (loading || !profile) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-10 text-center">
        <p className="text-xs text-[#bacac6]">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-0 py-4 space-y-6 select-none">
      <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold text-[#bacac6] hover:text-[#58f5e0] transition-colors cursor-pointer">
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Header */}
      <div className="bg-[#191c21] border border-[#3b4a47] rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <img src={profile.avatarUrl} alt={profile.name} className="w-20 h-20 rounded-3xl object-cover border-2 border-[#58f5e0] shadow-[0_0_20px_rgba(88,245,224,0.3)]" />
            <div className="space-y-1">
              <h1 className="text-xl font-extrabold text-white">{profile.name}</h1>
              {profile.username && <p className="text-xs text-[#58f5e0]">@{profile.username}</p>}
              {profile.bio && <p className="text-xs text-[#bacac6] max-w-md">{profile.bio}</p>}
              <div className="flex items-center gap-3 text-[11px] text-[#bacac6] flex-wrap">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {profile.location}
                  </span>
                )}
                {profile.educationLevel && (
                  <span className="flex items-center gap-1">
                    <BookMarked className="w-3 h-3" />
                    {profile.educationLevel}
                  </span>
                )}
                <span className="flex items-center gap-1 text-[#f59e0b]">
                  <Flame className="w-3 h-3 fill-current" />
                  {profile.streakDays}d streak
                </span>
                <span className="flex items-center gap-1 text-[#ccbdff]">
                  <Zap className="w-3 h-3 fill-current" />
                  Level {profile.level}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyProfileLink}
              className="p-2.5 rounded-xl border border-[#272a30] text-[#bacac6] hover:border-[#58f5e0] hover:text-[#58f5e0] transition-all cursor-pointer"
              title="Copy profile link"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            {!profile.isOwnProfile && (
              <button
                onClick={handleToggleFollow}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase transition-all cursor-pointer ${
                  profile.isFollowedByMe
                    ? 'bg-[#191c21] text-[#58f5e0] border border-[#58f5e0]/40 hover:border-rose-400 hover:text-rose-400'
                    : 'bg-[#2dd8c4] text-[#005a50] hover:scale-95 shadow-[0_0_15px_rgba(45,216,196,0.25)]'
                }`}
              >
                {profile.isFollowedByMe ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        {profile.interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.interests.map((interest) => (
              <span key={interest} className="text-[10px] text-[#58f5e0] bg-[#58f5e0]/10 px-2 py-0.5 rounded-full border border-[#58f5e0]/20">
                {interest}
              </span>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 pt-2 border-t border-[#272a30]">
          <div className="text-center">
            <p className="text-lg font-extrabold text-white">{profile.postsCount}</p>
            <p className="text-[10px] uppercase font-bold text-[#bacac6]">Posts</p>
          </div>
          <button onClick={() => setFollowListMode('followers')} className="text-center cursor-pointer">
            <p className="text-lg font-extrabold text-white">{profile.followersCount}</p>
            <p className="text-[10px] uppercase font-bold text-[#bacac6]">Followers</p>
          </button>
          <button onClick={() => setFollowListMode('following')} className="text-center cursor-pointer">
            <p className="text-lg font-extrabold text-white">{profile.followingCount}</p>
            <p className="text-[10px] uppercase font-bold text-[#bacac6]">Following</p>
          </button>
          <div className="text-center">
            <p className="text-lg font-extrabold text-white">{achievements.length + certificates.length}</p>
            <p className="text-[10px] uppercase font-bold text-[#bacac6]">Achievements</p>
          </div>
        </div>

        {/* Contribution stats */}
        <div className="flex items-center gap-4 text-[11px] text-[#bacac6] flex-wrap">
          <span>{profile.questionsAskedCount} questions asked</span>
          <span>•</span>
          <span>{profile.answersGivenCount} answers given</span>
          <span>•</span>
          <span className="text-[#58f5e0] font-semibold">{profile.acceptedAnswersCount} accepted answers</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#191c21] p-1 rounded-xl border border-[#272a30] w-fit">
        {([
          { id: 'posts', label: 'Posts', icon: Grid },
          { id: 'achievements', label: 'Achievements', icon: Award },
          { id: 'projects', label: 'Projects', icon: Code2 },
          { id: 'about', label: 'About', icon: UserIcon },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              tab === id ? 'bg-[#58f5e0] text-[#005a50]' : 'text-[#bacac6] hover:text-white'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'posts' && (
        posts.length === 0 ? (
          <div className="bg-[#191c21] border border-[#272a30] rounded-2xl p-10 text-center">
            <p className="text-xs text-[#bacac6]">No posts yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={viewer}
                onLike={handleLike}
                onSave={handleSave}
                onShowToast={onShowToast}
                onOpenAuthorProfile={onOpenProfile}
                onDelete={profile.isOwnProfile ? handleDeletePost : undefined}
              />
            ))}
          </div>
        )
      )}

      {tab === 'achievements' && (
        achievements.length === 0 && certificates.length === 0 ? (
          <div className="bg-[#191c21] border border-[#272a30] rounded-2xl p-10 text-center">
            <p className="text-xs text-[#bacac6]">No achievements unlocked yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {certificates.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs uppercase font-bold text-[#f59e0b] tracking-wider">Official Vormirix Certificates</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {certificates.map((cert) => (
                    <AchievementCertificateCard key={cert.id} certificate={cert} studentName={profile.name} compact />
                  ))}
                </div>
              </div>
            )}

            {achievements.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs uppercase font-bold text-[#58f5e0] tracking-wider">Badges</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((ach) => (
                    <div key={ach.id} className="p-4 rounded-2xl border bg-[#111319] border-[#58f5e0]/40 flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 bg-[#58f5e0]/20 text-[#58f5e0] border border-[#58f5e0]/40">
                        <Trophy className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{ach.title}</h4>
                        <p className="text-[11px] text-[#bacac6] leading-relaxed">{ach.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      )}

      {tab === 'projects' && (
        projects.length === 0 ? (
          <div className="bg-[#191c21] border border-[#272a30] rounded-2xl p-10 text-center">
            <p className="text-xs text-[#bacac6]">No projects showcased yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                canDelete={profile.isOwnProfile}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        )
      )}

      {tab === 'about' && (
        <div className="bg-[#191c21] border border-[#272a30] rounded-2xl p-6 space-y-3">
          <div>
            <h4 className="text-[11px] uppercase font-bold text-[#bacac6] mb-1">Bio</h4>
            <p className="text-sm text-[#e1e2ea]">{profile.bio || 'No bio yet.'}</p>
          </div>
          <div>
            <h4 className="text-[11px] uppercase font-bold text-[#bacac6] mb-1">Education</h4>
            <p className="text-sm text-[#e1e2ea]">{profile.educationLevel || 'Not specified.'}</p>
          </div>
          <div>
            <h4 className="text-[11px] uppercase font-bold text-[#bacac6] mb-1">Location</h4>
            <p className="text-sm text-[#e1e2ea]">{profile.location || 'Not specified.'}</p>
          </div>
        </div>
      )}

      {followListMode && (
        <FollowListModal
          isOpen
          onClose={() => setFollowListMode(null)}
          profileId={profileId}
          viewerId={viewer.id}
          mode={followListMode}
          onOpenProfile={onOpenProfile}
          onToggleFollow={handleListToggleFollow}
        />
      )}
    </div>
  );
};
