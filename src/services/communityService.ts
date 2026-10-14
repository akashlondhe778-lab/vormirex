import { CommunityPost, PostComment } from '../types';
import { mapCommunityPost, mapPostComment } from './mappers';
import { supabase } from './supabaseClient';
import { DbPost, DbPostComment } from './dbTypes';

const POST_SELECT = `*, author:profiles!posts_author_id_fkey(*), certificate:course_certificates(*)`;

export type FeedTab = 'following' | 'for-you';

class CommunityService {
  /** "Following" = posts by people the viewer follows (reuses the generic
   * `follows` table). "For You" = everyone's posts, newest first — a real
   * ranking/personalization pass is Phase 2+; this is the honest MVP. */
  async listFeed(tab: FeedTab, viewerId: string | undefined, page = 0, pageSize = 20): Promise<CommunityPost[]> {
    let query = supabase
      .from('posts')
      .select(POST_SELECT)
      .order('created_at', { ascending: false })
      .range(page * pageSize, page * pageSize + pageSize - 1);

    if (tab === 'following' && viewerId) {
      const { data: following } = await supabase.from('follows').select('following_id').eq('follower_id', viewerId);
      const followingIds = (following || []).map((f: any) => f.following_id);
      if (followingIds.length === 0) return [];
      query = query.in('author_id', followingIds);
    }

    const { data, error } = await query;
    if (error) throw error;
    const rows = (data || []) as unknown as DbPost[];
    if (!viewerId || rows.length === 0) return rows.map((r) => mapCommunityPost(r));

    const postIds = rows.map((r) => r.id);
    const [{ data: likes }, { data: saves }] = await Promise.all([
      supabase.from('post_likes').select('post_id').eq('user_id', viewerId).in('post_id', postIds),
      supabase.from('saved_posts').select('post_id').eq('user_id', viewerId).in('post_id', postIds),
    ]);
    const likedSet = new Set((likes || []).map((l: any) => l.post_id));
    const savedSet = new Set((saves || []).map((s: any) => s.post_id));

    return rows.map((r) => mapCommunityPost(r, { isLiked: likedSet.has(r.id), isSaved: savedSet.has(r.id) }));
  }

  async listByAuthor(authorId: string): Promise<CommunityPost[]> {
    const { data, error } = await supabase
      .from('posts')
      .select(POST_SELECT)
      .eq('author_id', authorId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return ((data || []) as unknown as DbPost[]).map((r) => mapCommunityPost(r));
  }

  async createPost(
    authorId: string,
    input: {
      type: 'text' | 'image' | 'video' | 'achievement';
      content: string;
      imageUrl?: string;
      videoUrl?: string;
      certificateId?: string;
      tags: string[];
    }
  ): Promise<CommunityPost> {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: authorId,
        type: input.type,
        content: input.content,
        image_url: input.imageUrl || null,
        video_url: input.videoUrl || null,
        certificate_id: input.certificateId || null,
        tags: input.tags,
      })
      .select(POST_SELECT)
      .single();
    if (error) throw error;
    return mapCommunityPost(data as unknown as DbPost);
  }

  async deletePost(postId: string) {
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) throw error;
  }

  async toggleLike(postId: string, userId: string, currentlyLiked: boolean) {
    if (currentlyLiked) {
      const { error } = await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
      if (error && error.code !== '23505') throw error;
    }
  }

  async toggleSave(postId: string, userId: string, currentlySaved: boolean) {
    if (currentlySaved) {
      const { error } = await supabase.from('saved_posts').delete().eq('post_id', postId).eq('user_id', userId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('saved_posts').insert({ user_id: userId, post_id: postId });
      if (error && error.code !== '23505') throw error;
    }
  }

  async getComments(postId: string): Promise<PostComment[]> {
    const { data, error } = await supabase
      .from('post_comments')
      .select('*, user:profiles!post_comments_user_id_fkey(*)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return ((data || []) as unknown as DbPostComment[]).map(mapPostComment);
  }

  async addComment(postId: string, userId: string, text: string, parentCommentId?: string): Promise<PostComment> {
    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, user_id: userId, comment: text, parent_comment_id: parentCommentId || null })
      .select('*, user:profiles!post_comments_user_id_fkey(*)')
      .single();
    if (error) throw error;
    return mapPostComment(data as unknown as DbPostComment);
  }
}

export const communityService = new CommunityService();
