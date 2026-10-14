import { ShortVideo, VideoComment } from '../types';
import { mapShortVideo, mapVideoComment } from './mappers';
import { supabase } from './supabaseClient';
import { DbShortVideo, DbVideoComment } from './dbTypes';

const VIDEO_SELECT = `*, creator:profiles!short_videos_creator_id_fkey(*), related_course:courses(id, title, price)`;

class VideoService {
  async listFeed(userId?: string, category?: string): Promise<ShortVideo[]> {
    let query = supabase.from('short_videos').select(VIDEO_SELECT).eq('visibility', 'public').order('created_at', { ascending: false });
    if (category && category !== 'all') query = query.eq('category', category);
    const { data, error } = await query;
    if (error) throw error;
    const rows = (data || []) as unknown as DbShortVideo[];

    if (!userId || rows.length === 0) return rows.map((r) => mapShortVideo(r));

    const videoIds = rows.map((r) => r.id);
    const [{ data: likes }, { data: saves }] = await Promise.all([
      supabase.from('video_likes').select('video_id').eq('user_id', userId).in('video_id', videoIds),
      supabase.from('saved_videos').select('video_id').eq('user_id', userId).in('video_id', videoIds),
    ]);
    const likedSet = new Set((likes || []).map((l: any) => l.video_id));
    const savedSet = new Set((saves || []).map((s: any) => s.video_id));

    return rows.map((r) => mapShortVideo(r, { isLiked: likedSet.has(r.id), isSaved: savedSet.has(r.id) }));
  }

  async listByCreator(creatorId: string): Promise<ShortVideo[]> {
    const { data, error } = await supabase.from('short_videos').select(VIDEO_SELECT).eq('creator_id', creatorId).order('created_at', { ascending: false });
    if (error) throw error;
    return ((data || []) as unknown as DbShortVideo[]).map((r) => mapShortVideo(r));
  }

  async getComments(videoId: string): Promise<VideoComment[]> {
    const { data, error } = await supabase
      .from('video_comments')
      .select('*, user:profiles!video_comments_user_id_fkey(*)')
      .eq('video_id', videoId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return ((data || []) as unknown as DbVideoComment[]).map(mapVideoComment);
  }

  async addComment(videoId: string, userId: string, text: string): Promise<VideoComment> {
    const { data, error } = await supabase
      .from('video_comments')
      .insert({ video_id: videoId, user_id: userId, comment: text })
      .select('*, user:profiles!video_comments_user_id_fkey(*)')
      .single();
    if (error) throw error;
    return mapVideoComment(data as unknown as DbVideoComment);
  }

  async toggleLike(videoId: string, userId: string, currentlyLiked: boolean) {
    if (currentlyLiked) {
      const { error } = await supabase.from('video_likes').delete().eq('video_id', videoId).eq('user_id', userId);
      if (error) throw error;
    } else {
      // unique(video_id, user_id) makes a double-like a no-op error we can ignore.
      const { error } = await supabase.from('video_likes').insert({ video_id: videoId, user_id: userId });
      if (error && error.code !== '23505') throw error;
    }
  }

  async toggleSave(videoId: string, userId: string, currentlySaved: boolean) {
    if (currentlySaved) {
      const { error } = await supabase.from('saved_videos').delete().eq('video_id', videoId).eq('user_id', userId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('saved_videos').insert({ user_id: userId, video_id: videoId });
      if (error && error.code !== '23505') throw error;
    }
  }

  async toggleFollow(followerId: string, followingId: string, currentlyFollowing: boolean) {
    if (followerId === followingId) return; // constraint also enforces this server-side
    if (currentlyFollowing) {
      const { error } = await supabase.from('follows').delete().eq('follower_id', followerId).eq('following_id', followingId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('follows').insert({ follower_id: followerId, following_id: followingId });
      if (error && error.code !== '23505') throw error;
    }
  }

  async incrementViewCount(videoId: string) {
    const { error } = await supabase.rpc('increment_video_views', { p_video_id: videoId });
    if (error) console.warn('view count increment failed (non-fatal):', error.message);
  }

  async createVideo(
    creatorId: string,
    input: {
      title: string;
      caption: string;
      description: string;
      videoUrl: string;
      thumbnailUrl: string;
      category: ShortVideo['category'];
      difficulty: ShortVideo['difficulty'];
      tags: string[];
      relatedCourseId?: string;
    }
  ): Promise<ShortVideo> {
    const { data, error } = await supabase
      .from('short_videos')
      .insert({
        creator_id: creatorId,
        title: input.title,
        caption: input.caption,
        description: input.description,
        video_url: input.videoUrl,
        thumbnail_url: input.thumbnailUrl,
        category: input.category,
        difficulty: input.difficulty,
        tags: input.tags,
        related_course_id: input.relatedCourseId || null,
      })
      .select(VIDEO_SELECT)
      .single();
    if (error) throw error;
    return mapShortVideo(data as unknown as DbShortVideo);
  }

  async deleteVideo(videoId: string) {
    const { error } = await supabase.from('short_videos').delete().eq('id', videoId);
    if (error) throw error;
  }
}

export const videoService = new VideoService();
