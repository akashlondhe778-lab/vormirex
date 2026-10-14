import { XPActivity } from '../types';
import { mapXpActivitiesToWeeklySeries } from './mappers';
import { supabase } from './supabaseClient';
import { DbStudentStats, DbXpActivity } from './dbTypes';

class XpService {
  /** Direct, non-lesson XP grants (daily login, quiz completion, streak
   * bonus). Routed through the award_xp() Postgres function so the ledger +
   * student_stats stay consistent and de-duplicated — never insert into
   * xp_activities directly (RLS blocks it anyway; see 010_rls.sql). */
  async awardXp(
    studentId: string,
    activityType: 'quiz_completed' | 'daily_login' | 'streak_bonus',
    amount: number,
    referenceId?: string
  ) {
    const { data, error } = await supabase.rpc('award_xp', {
      p_student_id: studentId,
      p_activity_type: activityType,
      p_xp_amount: amount,
      p_reference_id: referenceId ?? null,
    });
    if (error) throw error;
    return Array.isArray(data) ? data[0] : data;
  }

  async getWeeklyXpSeries(studentId: string): Promise<XPActivity[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('xp_activities')
      .select('*')
      .eq('student_id', studentId)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: true });
    if (error) throw error;
    return mapXpActivitiesToWeeklySeries((data || []) as DbXpActivity[]);
  }

  async getStats(studentId: string): Promise<DbStudentStats | null> {
    const { data, error } = await supabase.from('student_stats').select('*').eq('student_id', studentId).maybeSingle();
    if (error) throw error;
    return data as DbStudentStats | null;
  }
}

export const xpService = new XpService();
