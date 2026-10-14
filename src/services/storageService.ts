import { supabase } from './supabaseClient';

export type StorageBucket =
  | 'avatars'
  | 'short-videos'
  | 'course-thumbnails'
  | 'course-videos'
  | 'lesson-thumbnails'
  | 'post-images';

class StorageService {
  /** Uploads under `${userId}/...` — storage RLS policies (011_storage.sql)
   * only allow writing inside your own uid-prefixed folder. */
  async upload(bucket: StorageBucket, userId: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop() || 'bin';
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
    if (error) throw error;

    if (bucket === 'course-videos') {
      // Private bucket — return the storage path, not a public URL. Resolve
      // to a playable URL on demand via getSignedUrl() once the caller has
      // confirmed the viewer has access (enrollment/ownership check).
      return path;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async getSignedUrl(bucket: StorageBucket, path: string, expiresInSeconds = 60 * 30): Promise<string> {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds);
    if (error) throw error;
    return data.signedUrl;
  }
}

export const storageService = new StorageService();
