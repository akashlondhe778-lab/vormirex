import { supabase } from './supabaseClient';

class EnrollmentService {
  /** Free courses only — paid courses must go through paymentService. Backed
   * by the enroll_free_course() Postgres function which re-checks is_free
   * server-side, so a tampered client can't enroll for free in a paid course. */
  async enrollFree(courseId: string) {
    const { data, error } = await supabase.rpc('enroll_free_course', { p_course_id: courseId });
    if (error) throw error;
    return data;
  }

  async isEnrolled(studentId: string, courseId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .in('payment_status', ['free', 'paid'])
      .maybeSingle();
    if (error) throw error;
    return Boolean(data);
  }
}

export const enrollmentService = new EnrollmentService();
