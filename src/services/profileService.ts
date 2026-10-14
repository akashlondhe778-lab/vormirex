import { UserProfile } from '../types';
import { composeUserProfile } from './mappers';
import { supabase } from './supabaseClient';
import { DbProfile, DbStudentStats } from './dbTypes';

class ProfileService {
  /** Loads a full UserProfile-shaped object for the given auth user id,
   * composing profile + stats + the array-shaped relations the existing
   * frontend types expect (enrolledCourseIds, completedLessonIds, etc). */
  async getFullProfile(userId: string): Promise<UserProfile> {
    const [{ data: profile, error: profileError }, { data: stats }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('student_stats').select('*').eq('student_id', userId).maybeSingle(),
    ]);

    if (profileError || !profile) {
      throw profileError || new Error('Profile not found');
    }

    const [{ data: enrollments }, { data: progress }, { data: saved }, { data: following }] = await Promise.all([
      supabase.from('enrollments').select('course_id').eq('student_id', userId),
      supabase.from('lesson_progress').select('lesson_id').eq('student_id', userId).eq('completed', true),
      supabase.from('saved_videos').select('video_id').eq('user_id', userId),
      supabase.from('follows').select('following_id').eq('follower_id', userId),
    ]);

    return composeUserProfile(
      profile as DbProfile,
      (stats as DbStudentStats) || null,
      (enrollments || []).map((e: any) => e.course_id),
      (progress || []).map((p: any) => p.lesson_id),
      (saved || []).map((s: any) => s.video_id),
      (following || []).map((f: any) => f.following_id)
    );
  }

  async updateProfile(
    userId: string,
    updates: {
      full_name?: string;
      bio?: string;
      avatar_url?: string;
      username?: string;
      plan?: 'Starter' | 'Pro' | 'Team';
      location?: string;
      education_level?: string;
      interests?: string[];
    }
  ) {
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
    if (error) throw error;
  }

  async getPublicProfile(userId: string): Promise<DbProfile | null> {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) throw error;
    return data as DbProfile | null;
  }
}

export const profileService = new ProfileService();
