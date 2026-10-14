import { useCallback, useEffect, useState } from 'react';
import { xpService } from '../services/xpService';
import { XPActivity } from '../types';

/** Feeds the dashboard Recharts AreaChart — replaces the hardcoded
 * MOCK_XP_ACTIVITIES array with a real 7-day aggregation of xp_activities. */
export function useWeeklyXp(studentId: string | undefined) {
  const [series, setSeries] = useState<XPActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!studentId) {
      setSeries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await xpService.getWeeklyXpSeries(studentId);
      setSeries(data);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { series, loading, reload };
}
