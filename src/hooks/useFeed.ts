import { useCallback, useEffect, useState } from 'react';
import { videoService } from '../services/videoService';
import { ShortVideo } from '../types';

export function useFeed(userId: string | undefined) {
  const [videos, setVideos] = useState<ShortVideo[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await videoService.listFeed(userId);
      setVideos(data);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { videos, setVideos, loading, reload };
}
