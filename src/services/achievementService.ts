import { Achievement } from '../types';
import { mapAchievement } from './mappers';
import { supabase } from './supabaseClient';
import { DbAchievement, DbStudentAchievement } from './dbTypes';

class AchievementService {
  async listForStudent(studentId: string): Promise<Achievement[]> {
    const [{ data: achievements, error: achError }, { data: unlocked, error: unlockError }] = await Promise.all([
      supabase.from('achievements').select('*').order('requirement_value', { ascending: true }),
      supabase.from('student_achievements').select('*').eq('student_id', studentId),
    ]);
    if (achError) throw achError;
    if (unlockError) throw unlockError;

    const unlockedMap = new Map<string, DbStudentAchievement>(
      ((unlocked || []) as DbStudentAchievement[]).map((u) => [u.achievement_id, u])
    );

    return ((achievements || []) as DbAchievement[]).map((a) => mapAchievement(a, unlockedMap));
  }

  /** Best-effort sweep — call after any XP-granting action. Safe to call
   * redundantly; the unique constraint on student_achievements prevents
   * duplicate unlocks even under concurrent calls. */
  async checkAndUnlock(studentId: string) {
    const { data, error } = await supabase.rpc('check_and_unlock_achievements', { p_student_id: studentId });
    if (error) throw error;
    return data;
  }
}

export const achievementService = new AchievementService();
