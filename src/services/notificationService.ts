import { supabase } from './supabaseClient';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  referenceId: string | null;
  isRead: boolean;
  createdAt: string;
}

class NotificationService {
  async list(userId: string): Promise<AppNotification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data || []).map((n: any) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      referenceId: n.reference_id,
      isRead: n.is_read,
      createdAt: n.created_at,
    }));
  }

  async markRead(notificationId: string) {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
    if (error) throw error;
  }
}

export const notificationService = new NotificationService();
