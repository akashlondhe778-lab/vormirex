import { useCallback, useEffect, useState } from 'react';
import { achievementService } from '../services/achievementService';
import { Achievement } from '../types';

export function useAchievements(studentId: string | undefined) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!studentId) {
      setAchievements([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await achievementService.listForStudent(studentId);
      setAchievements(data);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { achievements, loading, reload };
}
