import { supabase } from './supabaseClient';

class ProgressService {
  /** Idempotent — calling this twice for the same lesson only awards XP once.
   * Access (enrolled or free-preview) and XP amount are both re-verified
   * server-side by the complete_lesson() Postgres function; the client's
   * `xpReward` value is never trusted directly. */
  async completeLesson(lessonId: string): Promise<{ alreadyCompleted: boolean; xpAwarded: number }> {
    const { data, error } = await supabase.rpc('complete_lesson', { p_lesson_id: lessonId });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    return { alreadyCompleted: row?.already_completed ?? false, xpAwarded: row?.xp_awarded ?? 0 };
  }

  async getCompletedLessonIds(studentId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('student_id', studentId)
      .eq('completed', true);
    if (error) throw error;
    return (data || []).map((r) => r.lesson_id);
  }
}

export const progressService = new ProgressService();
