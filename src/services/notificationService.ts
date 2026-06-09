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

const LOCAL_STORAGE_KEY = 'gozoor_notifications';

const getLocalNotifications = (userId: string): Notification[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      const initial = notificationService.getMockNotifications(userId);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const all: Notification[] = JSON.parse(raw);
    return all.filter((n: Notification) => n.user_id === userId);
  } catch {
    return [];
  }
};

const saveLocalNotifications = (userId: string, notifications: Notification[]) => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    let all: Notification[] = raw ? JSON.parse(raw) : [];
    // Remove existing notifications for this user
    all = all.filter((n: Notification) => n.user_id !== userId);
    // Combine remaining and new notifications
    all = [...all, ...notifications];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Error saving local notifications:', err);
  }
};

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
        // Fallback to local storage if relation doesn't exist
        if (error.code === 'PGRST116' || error.message.includes('relation "notifications" does not exist') || error.code === '42P01') {
          console.warn('Notifications table does not exist in Supabase. Falling back to localStorage.');
          const localData = getLocalNotifications(user.id);
          // Sort descending
          localData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          return { data: localData, error: null };
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول لتحديث الإشعارات.');

      // Try database update
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .select()
        .maybeSingle();

      if (error) {
        if (error.code === '42P01' || error.message.includes('relation "notifications" does not exist')) {
          const localData = getLocalNotifications(user.id);
          const updated = localData.map(n => n.id === notificationId ? { ...n, is_read: true } : n);
          saveLocalNotifications(user.id, updated);
          return { data: updated.find(n => n.id === notificationId), error: null };
        }
        throw error;
      }
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

      // Try database update
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
        .select();

      if (error) {
        if (error.code === '42P01' || error.message.includes('relation "notifications" does not exist')) {
          const localData = getLocalNotifications(user.id);
          const updated = localData.map(n => ({ ...n, is_read: true }));
          saveLocalNotifications(user.id, updated);
          return { data: updated, error: null };
        }
        throw error;
      }
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول لتحديث الإشعارات.');

      // Try database delete
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        if (error.code === '42P01' || error.message.includes('relation "notifications" does not exist')) {
          const localData = getLocalNotifications(user.id);
          const updated = localData.filter(n => n.id !== notificationId);
          saveLocalNotifications(user.id, updated);
          return { error: null };
        }
        throw error;
      }
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
      // Try database insertion
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

      if (error) {
        if (error.code === '42P01' || error.message.includes('relation "notifications" does not exist')) {
          const newNotif: Notification = {
            id: 'local-' + Math.random().toString(36).substr(2, 9),
            user_id: params.userId,
            title: params.title,
            content: params.content,
            type: params.type,
            link: params.link,
            is_read: false,
            created_at: new Date().toISOString()
          };
          const localData = getLocalNotifications(params.userId);
          localData.unshift(newNotif);
          saveLocalNotifications(params.userId, localData);
          return { data: newNotif, error: null };
        }
        throw error;
      }
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
        content: 'تم تقديم طلب جديد لوظيفتك المعلنة "مطور واجهات ومصمم تجربة المستخدم".',
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
