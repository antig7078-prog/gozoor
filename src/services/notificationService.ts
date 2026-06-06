import { supabase } from '../lib/supabase';
import { getFriendlyErrorMessage } from '../utils/error';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'message' | 'order' | 'application';
  link?: string;
  is_read: boolean;
  created_at: string;
}

export const notificationService = {
  /**
   * Fetch all notifications for the currently logged in user
   */
  async getNotifications() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول لعرض الإشعارات.');

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        // If the table doesn't exist, we return a fallback mock array so the app doesn't crash
        if (error.code === 'PGRST116' || error.message.includes('relation "notifications" does not exist')) {
          console.warn('Notifications table does not exist. Using mock data.');
          return { data: this.getMockNotifications(user.id), error: null };
        }
        throw error;
      }
      return { data: data as Notification[], error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Mark all notifications as read for current user
   */
  async markAllAsRead() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول لتحديث الإشعارات.');

      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Send a notification to a user
   */
  async sendNotification(params: {
    userId: string;
    title: string;
    content: string;
    type: 'info' | 'success' | 'warning' | 'message' | 'order' | 'application';
    link?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: params.userId,
          title: params.title,
          content: params.content,
          type: params.type,
          link: params.link || null
        }])
        .select()
        .single();

      if (error) throw error;
      return { data: data as Notification, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Mock data fallback for local demo when table is not migrated
   */
  getMockNotifications(userId: string): Notification[] {
    return [
      {
        id: 'mock-1',
        user_id: userId,
        title: 'رسالة جديدة',
        content: 'لقد أرسل لك أحمد علي رسالة بخصوص مشروع تطوير الواجهات.',
        type: 'message',
        link: '/messages',
        is_read: false,
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 mins ago
      },
      {
        id: 'mock-2',
        user_id: userId,
        title: 'طلب توظيف جديد',
        content: 'تم تقديم طلب جديد لوظيفتك المعلنة "مهندس زراعي".',
        type: 'application',
        link: '/my-jobs',
        is_read: false,
        created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString() // 2 hours ago
      },
      {
        id: 'mock-3',
        user_id: userId,
        title: 'إكمال الطلب',
        content: 'قام العميل بقبول تسليم طلبك رقم #1204 بنجاح.',
        type: 'order',
        link: '/service-orders',
        is_read: true,
        created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString() // 1 day ago
      },
      {
        id: 'mock-4',
        user_id: userId,
        title: 'مستوى سمعة جديد!',
        content: 'مبروك! لقد وصلت إلى مستوى سمعة "نشط" بمجموع نقاط 120.',
        type: 'success',
        link: '/profile',
        is_read: true,
        created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() // 3 days ago
      }
    ];
  }
};
