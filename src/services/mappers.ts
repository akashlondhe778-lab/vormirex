import {
  Achievement,
  CommunityPost,
  Course,
  CourseCertificate,
  Lesson,
  PostComment,
  Question,
  QuestionAnswer,
  ShortVideo,
  StudentProject,
  StudentPublicProfile,
  UserProfile,
  VideoComment,
  XPActivity,
} from '../types';
import {
  DbAchievement,
  DbAnswer,
  DbCourse,
  DbCourseCertificate,
  DbLesson,
  DbPost,
  DbPostComment,
  DbProfile,
  DbProject,
  DbQuestion,
  DbShortVideo,
  DbStudentAchievement,
  DbStudentStats,
  DbVideoComment,
  DbXpActivity,
} from './dbTypes';

function secondsToDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds || 0));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${String(rem).padStart(2, '0')}`;
}

export function mapLesson(row: DbLesson): Lesson {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    duration: secondsToDuration(row.duration_seconds),
    videoUrl: row.video_url || '',
    description: row.description || '',
    notes: row.notes || undefined,
    isFreePreview: row.is_preview,
    order: row.lesson_order,
    xpReward: row.xp_reward,
  };
}

export function mapCourse(row: DbCourse): Course {
  const lessons = (row.course_lessons || [])
    .slice()
    .sort((a, b) => a.lesson_order - b.lesson_order)
    .map(mapLesson);

  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle || '',
    description: row.description || '',
    longDescription: row.long_description || undefined,
    thumbnailUrl: row.thumbnail_url || '',
    category: row.category,
    difficulty: row.difficulty,
    teacherId: row.teacher_id,
    teacherName: row.teacher?.full_name || 'Vormirex Educator',
    teacherAvatar: row.teacher?.avatar_url || '',
    teacherRole: row.teacher?.role === 'teacher' ? 'Verified Educator' : '',
    teacherBio: row.teacher?.bio || '',
    rating: row.rating,
    reviewCount: row.review_count,
    enrolledCount: row.students_count,
    price: row.price,
    isFree: row.is_free,
    language: row.language,
    estimatedDuration: `${lessons.length} Lessons`,
    whatYouWillLearn: row.what_you_will_learn,
    prerequisites: row.prerequisites,
    lessons,
    certificateAvailable: row.certificate_available,
    isPublished: row.status === 'published',
    createdAt: row.created_at,
  };
}

export function mapVideoComment(row: DbVideoComment): VideoComment {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user?.full_name || 'Vormirex Learner',
    userAvatar: row.user?.avatar_url || '',
    text: row.comment,
    timestamp: row.created_at,
    likes: 0,
  };
}

export function mapShortVideo(row: DbShortVideo, opts?: { isLiked?: boolean; isSaved?: boolean; comments?: VideoComment[] }): ShortVideo {
  return {
    id: row.id,
    title: row.title,
    caption: row.caption || '',
    description: row.description || '',
    videoUrl: row.video_url,
    thumbnailUrl: row.thumbnail_url || '',
    duration: secondsToDuration(row.duration_seconds),
    category: row.category,
    tags: row.tags,
    difficulty: row.difficulty,
    teacherId: row.creator_id,
    teacherName: row.creator?.full_name || 'Vormirex Creator',
    teacherAvatar: row.creator?.avatar_url || '',
    teacherRole: row.creator?.role === 'teacher' ? 'Course Instructor' : 'Student Creator',
    likesCount: row.likes_count,
    commentsCount: row.comments_count,
    viewsCount: row.views_count,
    sharesCount: row.shares_count,
    savesCount: row.saves_count,
    relatedCourseId: row.related_course_id || undefined,
    relatedCourseTitle: row.related_course?.title,
    relatedCoursePrice: row.related_course?.price,
    createdAt: row.created_at,
    isLiked: opts?.isLiked ?? false,
    isSaved: opts?.isSaved ?? false,
    comments: opts?.comments ?? [],
  };
}

export function mapAchievement(row: DbAchievement, unlockedMap: Map<string, DbStudentAchievement>): Achievement {
  const unlock = unlockedMap.get(row.id);
  return {
    id: row.id,
    title: row.name,
    description: row.description || '',
    icon: row.icon || 'award',
    category: row.category,
    unlocked: Boolean(unlock),
    progress: unlock ? row.requirement_value : 0,
    maxProgress: row.requirement_value,
    unlockedDate: unlock?.unlocked_at,
    rarity: row.rarity,
  };
}

export function mapXpActivitiesToWeeklySeries(rows: DbXpActivity[]): XPActivity[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const buckets: XPActivity[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.push({ day: days[d.getDay()], date: d.toISOString().slice(0, 10), xp: 0, hours: 0 });
  }

  const byDate = new Map(buckets.map((b) => [b.date, b]));
  for (const row of rows) {
    const date = row.created_at.slice(0, 10);
    const bucket = byDate.get(date);
    if (bucket) bucket.xp += row.xp_amount;
  }

  return buckets;
}

export interface ComposedUserProfile extends UserProfile {}

export function composeUserProfile(
  profile: DbProfile,
  stats: DbStudentStats | null,
  enrolledCourseIds: string[],
  completedLessonIds: string[],
  savedVideoIds: string[],
  followingTeacherIds: string[]
): ComposedUserProfile {
  return {
    id: profile.id,
    name: profile.full_name,
    email: profile.email,
    role: profile.role === 'admin' ? 'teacher' : profile.role,
    avatarUrl: profile.avatar_url || '',
    bio: profile.bio || undefined,
    username: profile.username || undefined,
    location: profile.location || undefined,
    educationLevel: profile.education_level || undefined,
    interests: profile.interests || [],
    level: stats?.level ?? 1,
    currentXp: stats?.total_xp ?? 0,
    nextLevelXp: stats?.next_level_xp ?? 500,
    streakDays: stats?.current_streak ?? 0,
    plan: profile.plan,
    // completedQuests/solvedDoubts back the AI Tutor / adaptive quiz mock
    // features, which are out of scope for this backend integration (see
    // VORMIREX_BACKEND_PLAN.md §1) — defaulted rather than fabricated.
    completedQuests: 0,
    solvedDoubts: 0,
    enrolledCourseIds,
    completedLessonIds,
    savedVideoIds,
    followingTeacherIds,
    learningHours: stats?.learning_hours ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Phase 1 Social / Community
// ---------------------------------------------------------------------------

export function composeStudentPublicProfile(
  profile: DbProfile,
  stats: DbStudentStats | null,
  isFollowedByMe: boolean,
  isOwnProfile: boolean
): StudentPublicProfile {
  return {
    id: profile.id,
    name: profile.full_name,
    username: profile.username,
    avatarUrl: profile.avatar_url || '',
    bio: profile.bio || undefined,
    location: profile.location || undefined,
    educationLevel: profile.education_level || undefined,
    interests: profile.interests || [],
    role: profile.role === 'admin' ? 'teacher' : profile.role,
    level: stats?.level ?? 1,
    currentXp: stats?.total_xp ?? 0,
    streakDays: stats?.current_streak ?? 0,
    followersCount: stats?.followers_count ?? 0,
    followingCount: stats?.following_count ?? 0,
    postsCount: stats?.posts_count ?? 0,
    questionsAskedCount: stats?.questions_asked_count ?? 0,
    answersGivenCount: stats?.answers_given_count ?? 0,
    acceptedAnswersCount: stats?.accepted_answers_count ?? 0,
    isFollowedByMe,
    isOwnProfile,
  };
}

export function mapCommunityPost(row: DbPost, opts?: { isLiked?: boolean; isSaved?: boolean }): CommunityPost {
  return {
    id: row.id,
    authorId: row.author_id,
    authorName: row.author?.full_name || 'Vormirex Student',
    authorAvatar: row.author?.avatar_url || '',
    authorUsername: row.author?.username ?? null,
    type: row.type,
    content: row.content,
    imageUrl: row.image_url || undefined,
    videoUrl: row.video_url || undefined,
    certificate: row.certificate ? mapCertificate(row.certificate) : undefined,
    tags: row.tags,
    likesCount: row.likes_count,
    commentsCount: row.comments_count,
    savesCount: row.saves_count,
    isLiked: opts?.isLiked ?? false,
    isSaved: opts?.isSaved ?? false,
    createdAt: row.created_at,
  };
}

export function mapCertificate(row: DbCourseCertificate): CourseCertificate {
  return {
    id: row.id,
    verificationCode: row.verification_code,
    studentId: row.student_id,
    courseId: row.course_id,
    courseTitle: row.course_title,
    score: row.score ?? undefined,
    issuedAt: row.issued_at,
  };
}

export function mapProject(row: DbProject): StudentProject {
  return {
    id: row.id,
    authorId: row.author_id,
    authorName: row.author?.full_name || 'Vormirex Student',
    authorAvatar: row.author?.avatar_url || '',
    title: row.title,
    description: row.description || undefined,
    technologies: row.technologies,
    imageUrl: row.image_url || undefined,
    demoUrl: row.demo_url || undefined,
    githubUrl: row.github_url || undefined,
    whatILearned: row.what_i_learned || undefined,
    createdAt: row.created_at,
  };
}

export function mapPostComment(row: DbPostComment): PostComment {
  return {
    id: row.id,
    postId: row.post_id,
    userId: row.user_id,
    userName: row.user?.full_name || 'Vormirex Student',
    userAvatar: row.user?.avatar_url || '',
    comment: row.comment,
    parentCommentId: row.parent_comment_id || undefined,
    createdAt: row.created_at,
  };
}

export function mapQuestion(row: DbQuestion): Question {
  return {
    id: row.id,
    authorId: row.author_id,
    authorName: row.author?.full_name || 'Vormirex Student',
    authorAvatar: row.author?.avatar_url || '',
    title: row.title,
    description: row.description || undefined,
    subject: row.subject || undefined,
    topic: row.topic || undefined,
    imageUrl: row.image_url || undefined,
    tags: row.tags,
    difficulty: row.difficulty,
    answersCount: row.answers_count,
    viewsCount: row.views_count,
    isResolved: row.is_resolved,
    acceptedAnswerId: row.accepted_answer_id || undefined,
    createdAt: row.created_at,
  };
}

export function mapAnswer(row: DbAnswer, isUpvotedByMe = false): QuestionAnswer {
  return {
    id: row.id,
    questionId: row.question_id,
    authorId: row.author_id,
    authorName: row.author?.full_name || 'Vormirex Student',
    authorAvatar: row.author?.avatar_url || '',
    content: row.content,
    upvotesCount: row.upvotes_count,
    isAccepted: row.is_accepted,
    isUpvotedByMe,
    createdAt: row.created_at,
  };
}
