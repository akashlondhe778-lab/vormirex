export interface Message {
  id: string;
  sender: 'vormi' | 'user';
  text: string;
  codeBlock?: string;
  mathFormula?: string;
  timestamp: string;
  suggestedAnswers?: string[];
  xpAwarded?: number;
}

export interface SubjectModule {
  id: string;
  title: string;
  subtitle: string;
  category: 'math' | 'coding' | 'science' | 'humanities';
  icon: string;
  accentColor: string;
  progress: number;
  tags: string[];
  description: string;
  currentLesson: string;
}

export interface RoadmapNode {
  id: string;
  title: string;
  level: number;
  status: 'completed' | 'current' | 'locked';
  xpReward: number;
  duration: string;
  topics: string[];
}

export interface Quest {
  id: string;
  title: string;
  subject: string;
  xp: number;
  rewardBadge?: string;
  completed: boolean;
  type: 'quiz' | 'chat' | 'problem' | 'streak';
  target: number;
  current: number;
}

export interface QuizQuestion {
  id: string;
  subject: string;
  difficulty: 'Novice' | 'Intermediate' | 'Master';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint: string;
  formula?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  unlockedAt?: string;
  isUnlocked: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  avatarUrl: string;
  bio?: string;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  streakDays: number;
  plan: 'Starter' | 'Pro' | 'Team';
  completedQuests: number;
  solvedDoubts: number;
  enrolledCourseIds: string[];
  completedLessonIds: string[];
  savedVideoIds: string[];
  followingTeacherIds: string[];
  learningHours?: number;
}

export interface VideoComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
  likes: number;
}

export interface ShortVideo {
  id: string;
  title: string;
  caption: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  category: 'coding' | 'math' | 'physics' | 'chemistry' | 'career' | 'tips';
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  teacherId: string;
  teacherName: string;
  teacherAvatar: string;
  teacherRole: string;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  sharesCount: number;
  savesCount: number;
  relatedCourseId?: string;
  relatedCourseTitle?: string;
  relatedCoursePrice?: number;
  createdAt: string;
  isLiked?: boolean;
  isSaved?: boolean;
  comments: VideoComment[];
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  duration: string;
  videoUrl: string;
  description: string;
  notes?: string;
  isFreePreview: boolean;
  order: number;
  xpReward: number;
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  longDescription?: string;
  thumbnailUrl: string;
  category: 'coding' | 'math' | 'physics' | 'chemistry' | 'career';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  teacherId: string;
  teacherName: string;
  teacherAvatar: string;
  teacherRole: string;
  teacherBio: string;
  rating: number;
  reviewCount: number;
  enrolledCount: number;
  price: number;
  isFree: boolean;
  language: string;
  estimatedDuration: string;
  whatYouWillLearn: string[];
  prerequisites: string[];
  lessons: Lesson[];
  certificateAvailable: boolean;
  isPublished: boolean;
  createdAt: string;
}

export interface PaymentOrder {
  id: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  currency: 'INR';
  status: 'created' | 'completed' | 'failed';
  orderDate: string;
  paymentMethod: 'UPI' | 'Card' | 'NetBanking';
}

export interface XPActivity {
  day: string;
  xp: number;
  hours: number;
  date: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'xp' | 'course' | 'quiz' | 'social';
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedDate?: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  avatarUrl: string;
  rating: number;
  isFeatured?: boolean;
}

export interface PricingPlan {
  id: 'starter' | 'pro' | 'team';
  name: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  isPopular?: boolean;
  features: string[];
  ctaText: string;
}
