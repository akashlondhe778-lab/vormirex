// Hand-written row shapes mirroring supabase/migrations/*.sql. These are the
// "wire format" coming back from PostgREST — src/services/mappers.ts converts
// them into the existing frontend contracts from src/types.ts so components
// never need to know the DB layout changed.

export type UserRole = 'student' | 'teacher' | 'admin';

export interface DbProfile {
  id: string;
  full_name: string;
  username: string | null;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  education_level: string | null;
  interests: string[];
  role: UserRole;
  plan: 'Starter' | 'Pro' | 'Team';
  created_at: string;
  updated_at: string;
}

export interface DbStudentStats {
  student_id: string;
  total_xp: number;
  level: number;
  next_level_xp: number;
  current_streak: number;
  longest_streak: number;
  learning_hours: number;
  lessons_completed: number;
  courses_completed: number;
  followers_count: number;
  following_count: number;
  posts_count: number;
  questions_asked_count: number;
  answers_given_count: number;
  accepted_answers_count: number;
  last_activity_date: string | null;
}

export interface DbXpActivity {
  id: string;
  student_id: string;
  activity_type: 'lesson_completed' | 'quiz_completed' | 'daily_login' | 'course_completed' | 'streak_bonus';
  xp_amount: number;
  reference_id: string | null;
  created_at: string;
}

export interface DbCourse {
  id: string;
  teacher_id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  long_description: string | null;
  thumbnail_url: string | null;
  category: 'coding' | 'math' | 'physics' | 'chemistry' | 'career';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  language: string;
  price: number;
  is_free: boolean;
  status: 'draft' | 'published' | 'archived';
  rating: number;
  review_count: number;
  students_count: number;
  what_you_will_learn: string[];
  prerequisites: string[];
  certificate_available: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  teacher?: DbProfile | null;
  course_lessons?: DbLesson[];
}

export interface DbLesson {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  duration_seconds: number;
  lesson_order: number;
  xp_reward: number;
  is_preview: boolean;
  notes: string | null;
}

export interface DbEnrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: 'active' | 'completed' | 'cancelled';
  payment_status: 'free' | 'pending' | 'paid' | 'failed' | 'refunded';
  purchased_price: number;
  enrolled_at: string;
  completed_at: string | null;
}

export interface DbLessonProgress {
  id: string;
  student_id: string;
  lesson_id: string;
  watched_seconds: number;
  completed: boolean;
  completed_at: string | null;
}

export interface DbShortVideo {
  id: string;
  creator_id: string;
  title: string;
  caption: string | null;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number;
  category: 'coding' | 'math' | 'physics' | 'chemistry' | 'career' | 'tips';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  visibility: 'public' | 'unlisted' | 'private';
  related_course_id: string | null;
  views_count: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  saves_count: number;
  created_at: string;
  creator?: DbProfile | null;
  related_course?: { id: string; title: string; price: number } | null;
}

export interface DbVideoComment {
  id: string;
  video_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  user?: DbProfile | null;
}

export interface DbAchievement {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: 'streak' | 'xp' | 'course' | 'quiz' | 'social';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  requirement_type: string;
  requirement_value: number;
}

export interface DbStudentAchievement {
  id: string;
  student_id: string;
  achievement_id: string;
  unlocked_at: string;
}

export interface DbCoursePurchase {
  id: string;
  student_id: string;
  course_id: string;
  provider: string;
  provider_order_id: string;
  provider_payment_id: string | null;
  amount: number;
  currency: string;
  status: 'created' | 'pending' | 'completed' | 'failed' | 'refunded';
}

// ---------------------------------------------------------------------------
// Phase 1 Social / Community (supabase/migrations/015_social_community.sql)
// ---------------------------------------------------------------------------

export interface DbPost {
  id: string;
  author_id: string;
  type: 'text' | 'image' | 'video' | 'achievement';
  content: string;
  image_url: string | null;
  video_url: string | null;
  certificate_id: string | null;
  tags: string[];
  likes_count: number;
  comments_count: number;
  saves_count: number;
  created_at: string;
  updated_at: string;
  author?: DbProfile | null;
  certificate?: DbCourseCertificate | null;
}

export interface DbCourseCertificate {
  id: string;
  verification_code: string;
  student_id: string;
  course_id: string;
  course_title: string;
  score: number | null;
  issued_at: string;
}

export interface DbProject {
  id: string;
  author_id: string;
  title: string;
  description: string | null;
  technologies: string[];
  image_url: string | null;
  demo_url: string | null;
  github_url: string | null;
  what_i_learned: string | null;
  created_at: string;
  author?: DbProfile | null;
}

export interface DbPostComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id: string | null;
  comment: string;
  created_at: string;
  user?: DbProfile | null;
}

export interface DbQuestion {
  id: string;
  author_id: string;
  title: string;
  description: string | null;
  subject: string | null;
  topic: string | null;
  image_url: string | null;
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  answers_count: number;
  views_count: number;
  is_resolved: boolean;
  accepted_answer_id: string | null;
  created_at: string;
  author?: DbProfile | null;
}

export interface DbAnswer {
  id: string;
  question_id: string;
  author_id: string;
  content: string;
  upvotes_count: number;
  is_accepted: boolean;
  created_at: string;
  author?: DbProfile | null;
}
