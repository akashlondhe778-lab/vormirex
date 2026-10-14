import { StudentPublicProfile } from '../types';
import { composeStudentPublicProfile } from './mappers';
import { supabase } from './supabaseClient';
import { DbProfile, DbStudentStats } from './dbTypes';

export interface FollowListEntry {
  id: string;
  name: string;
  username: string | null;
  avatarUrl: string;
  bio: string | null;
  isFollowedByMe: boolean;
}

class SocialProfileService {
  /** Resolves a shared profile link's `?u=username` into a profile id —
   * see the "Copy Profile Link" button in StudentProfilePage.tsx and its
   * resolution in App.tsx. */
  async getIdByUsername(username: string): Promise<string | null> {
    const { data, error } = await supabase.from('profiles').select('id').eq('username', username).maybeSingle();
    if (error) throw error;
    return data?.id ?? null;
  }


  async getPublicProfile(profileId: string, viewerId: string | undefined): Promise<StudentPublicProfile> {
    const [{ data: profile, error: profileError }, { data: stats }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', profileId).single(),
      supabase.from('student_stats').select('*').eq('student_id', profileId).maybeSingle(),
    ]);
    if (profileError || !profile) throw profileError || new Error('Profile not found');

    let isFollowedByMe = false;
    if (viewerId && viewerId !== profileId) {
      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', viewerId)
        .eq('following_id', profileId)
        .maybeSingle();
      isFollowedByMe = Boolean(data);
    }

    return composeStudentPublicProfile(profile as DbProfile, (stats as DbStudentStats) || null, isFollowedByMe, viewerId === profileId);
  }

  /** Reuses the same `follows` table videoService.toggleFollow already
   * writes to for student->teacher follows in the Reels feed — it's a
   * generic follower_id/following_id edge, not video-specific. */
  async toggleFollow(followerId: string, followingId: string, currentlyFollowing: boolean) {
    if (followerId === followingId) return;
    if (currentlyFollowing) {
      const { error } = await supabase.from('follows').delete().eq('follower_id', followerId).eq('following_id', followingId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('follows').insert({ follower_id: followerId, following_id: followingId });
      if (error && error.code !== '23505') throw error;
    }
  }

  async listFollowers(profileId: string, viewerId: string | undefined): Promise<FollowListEntry[]> {
    const { data, error } = await supabase
      .from('follows')
      .select('follower:profiles!follows_follower_id_fkey(*)')
      .eq('following_id', profileId);
    if (error) throw error;
    const profiles = ((data || []) as any[]).map((r) => r.follower as DbProfile).filter(Boolean);
    return this.toFollowListEntries(profiles, viewerId);
  }

  async listFollowing(profileId: string, viewerId: string | undefined): Promise<FollowListEntry[]> {
    const { data, error } = await supabase
      .from('follows')
      .select('followee:profiles!follows_following_id_fkey(*)')
      .eq('follower_id', profileId);
    if (error) throw error;
    const profiles = ((data || []) as any[]).map((r) => r.followee as DbProfile).filter(Boolean);
    return this.toFollowListEntries(profiles, viewerId);
  }

  private async toFollowListEntries(profiles: DbProfile[], viewerId: string | undefined): Promise<FollowListEntry[]> {
    if (profiles.length === 0) return [];
    let myFollowingSet = new Set<string>();
    if (viewerId) {
      const { data } = await supabase.from('follows').select('following_id').eq('follower_id', viewerId);
      myFollowingSet = new Set((data || []).map((f: any) => f.following_id));
    }
    return profiles.map((p) => ({
      id: p.id,
      name: p.full_name,
      username: p.username,
      avatarUrl: p.avatar_url || '',
      bio: p.bio,
      isFollowedByMe: myFollowingSet.has(p.id),
    }));
  }

  async searchStudents(query: string): Promise<FollowListEntry[]> {
    if (!query.trim()) return [];
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
      .limit(20);
    if (error) throw error;
    return ((data || []) as DbProfile[]).map((p) => ({
      id: p.id,
      name: p.full_name,
      username: p.username,
      avatarUrl: p.avatar_url || '',
      bio: p.bio,
      isFollowedByMe: false,
    }));
  }
}

export const socialProfileService = new SocialProfileService();
