import { Course } from '../types';
import { mapCourse } from './mappers';
import { supabase } from './supabaseClient';
import { DbCourse } from './dbTypes';

const COURSE_SELECT = `*, teacher:profiles!courses_teacher_id_fkey(*), course_lessons(*)`;

class CourseService {
  async listPublished(): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select(COURSE_SELECT)
      .eq('status', 'published')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as unknown as DbCourse[]).map(mapCourse);
  }

  async listByTeacher(teacherId: string): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select(COURSE_SELECT)
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as unknown as DbCourse[]).map(mapCourse);
  }

  async getById(courseId: string): Promise<Course | null> {
    const { data, error } = await supabase.from('courses').select(COURSE_SELECT).eq('id', courseId).maybeSingle();
    if (error) throw error;
    return data ? mapCourse(data as unknown as DbCourse) : null;
  }

  /** Teacher-only. RLS (courses_insert_own) enforces teacher_id = auth.uid(). */
  async createCourse(
    teacherId: string,
    input: {
      title: string;
      subtitle: string;
      description: string;
      category: Course['category'];
      difficulty: Course['difficulty'];
      price: number;
      isFree: boolean;
      language: string;
      thumbnailUrl: string;
      lessons: Array<{ title: string; description: string; videoUrl: string; isFreePreview: boolean; durationSeconds?: number; xpReward?: number }>;
      publish?: boolean;
    }
  ): Promise<Course> {
    const { data: course, error } = await supabase
      .from('courses')
      .insert({
        teacher_id: teacherId,
        title: input.title,
        subtitle: input.subtitle,
        description: input.description,
        category: input.category,
        difficulty: input.difficulty,
        price: input.isFree ? 0 : input.price,
        is_free: input.isFree,
        language: input.language,
        thumbnail_url: input.thumbnailUrl,
        status: input.publish ? 'published' : 'draft',
      })
      .select('id')
      .single();

    if (error || !course) throw error || new Error('Failed to create course');

    if (input.lessons.length > 0) {
      const lessonRows = input.lessons.map((lesson, idx) => ({
        course_id: course.id,
        title: lesson.title,
        description: lesson.description,
        video_url: lesson.videoUrl,
        duration_seconds: lesson.durationSeconds ?? 0,
        lesson_order: idx + 1,
        xp_reward: lesson.xpReward ?? 20 + idx * 10,
        is_preview: lesson.isFreePreview,
      }));
      const { error: lessonError } = await supabase.from('course_lessons').insert(lessonRows);
      if (lessonError) throw lessonError;
    }

    const created = await this.getById(course.id);
    if (!created) throw new Error('Course created but could not be reloaded');
    return created;
  }

  async publishCourse(courseId: string) {
    const { error } = await supabase.from('courses').update({ status: 'published' }).eq('id', courseId);
    if (error) throw error;
  }

  async deleteCourse(courseId: string) {
    const { error } = await supabase.from('courses').delete().eq('id', courseId);
    if (error) throw error;
  }
}

export const courseService = new CourseService();
