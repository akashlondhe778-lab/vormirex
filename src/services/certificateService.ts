import { CourseCertificate } from '../types';
import { mapCertificate } from './mappers';
import { supabase } from './supabaseClient';
import { DbCourseCertificate } from './dbTypes';

class CertificateService {
  /** Official, Vormirix-issued certificates — NOT the same as the
   * rule-based `achievements` badges (see achievementService.ts). These are
   * only ever created by issue_course_certificate() when a course with
   * certificate_available is actually completed (009/016 migrations);
   * there is no client insert path at all. */
  async listForStudent(studentId: string): Promise<CourseCertificate[]> {
    const { data, error } = await supabase
      .from('course_certificates')
      .select('*')
      .eq('student_id', studentId)
      .order('issued_at', { ascending: false });
    if (error) throw error;
    return ((data || []) as DbCourseCertificate[]).map(mapCertificate);
  }

  /** Re-checks + issues if the student has actually completed the course
   * but a certificate wasn't auto-issued for some reason (e.g. completed
   * before certificate_available was turned on for that course). Safe to
   * call speculatively — re-verifies completion server-side and no-ops if
   * already issued or not actually eligible. */
  async ensureIssued(studentId: string, courseId: string): Promise<CourseCertificate | null> {
    const { data, error } = await supabase.rpc('issue_course_certificate', {
      p_student_id: studentId,
      p_course_id: courseId,
    });
    if (error) throw error;
    return data ? mapCertificate(data as DbCourseCertificate) : null;
  }
}

export const certificateService = new CertificateService();
