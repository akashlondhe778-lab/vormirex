import { useCallback, useEffect, useState } from 'react';
import { courseService } from '../services/courseService';
import { Course } from '../types';

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await courseService.listPublished();
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { courses, setCourses, loading, error, reload };
}

export function useTeacherCourses(teacherId: string | undefined) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!teacherId) {
      setCourses([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await courseService.listByTeacher(teacherId);
      setCourses(data);
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { courses, setCourses, loading, reload };
}
