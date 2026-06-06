import React, { useEffect, useState } from 'react';
import { notificationService, type Notification } from '../../../services/notificationService';
import { useAuth } from '../../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  Trash2,
  AlertCircle,
  MessageSquare,
  Briefcase,
  ShoppingBag,
  Info,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await notificationService.getNotifications();
      if (fetchError) {
        setError(fetchError);
      } else {
        setNotifications(data || []);
      }
    } catch (err) {
      setError('فشل في تحميل الإشعارات. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string, link?: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      if (link) {
        navigate(link);
      }
    } catch (err) {
      toast.error('حدث خطأ أثناء تحديث حالة الإشعار.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success('تم تحديد جميع الإشعارات كمقروءة.');
    } catch (err) {
      toast.error('فشل في تحديث الإشعارات.');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent trigger markAsRead redirect
    try {
      const { error: deleteError } = await notificationService.deleteNotification(id);
      if (deleteError) throw new Error(deleteError);
      
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('تم حذف الإشعار بنجاح.');
    } catch (err) {
      toast.error('فشل في حذف الإشعار.');
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return { Icon: CheckCircle, color: 'text-emerald-500 bg-emerald-50 border-emerald-100' };
      case 'warning':
        return { Icon: AlertTriangle, color: 'text-amber-500 bg-amber-50 border-amber-100' };
      case 'message':
        return { Icon: MessageSquare, color: 'text-sky-500 bg-sky-50 border-sky-100' };
      case 'application':
        return { Icon: Briefcase, color: 'text-purple-500 bg-purple-50 border-purple-100' };
      case 'order':
        return { Icon: ShoppingBag, color: 'text-rose-500 bg-rose-50 border-rose-100' };
      default:
        return { Icon: Info, color: 'text-slate-500 bg-slate-50 border-slate-100' };
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center py-20 text-center px-4" dir="rtl">
        <AlertCircle className="w-16 h-16 text-amber-500 mb-4" />
        <h2 className="text-xl font-black text-slate-800 mb-1">يجب تسجيل الدخول أولاً</h2>
        <p className="text-slate-400 text-sm max-w-sm">يرجى تسجيل الدخول لعرض وتلقي إشعارات الحساب.</p>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir="rtl">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <div className="p-2.5 bg-brand-primary/10 rounded-2xl text-brand-primary shadow-inner">
              <Bell className="w-6 h-6" />
            </div>
            <span>الإشعارات والتنبيهات</span>
          </h1>
          <p className="text-xs text-slate-450 font-bold mt-1">تتبع التفاعلات ورسائل العملاء وطلبات التوظيف والبيع والشراء.</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-black rounded-2xl transition-all self-start sm:self-auto"
          >
            <Check className="w-4 h-4" />
            <span>تحديد الكل كمقروء</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-slate-100 rounded-3xl p-5 animate-pulse flex items-center gap-4">
              <div className="w-11 h-11 bg-slate-200 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/4" />
                <div className="h-3 bg-slate-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="text-slate-800 font-bold">{error}</p>
          <button
            onClick={fetchNotifications}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white rounded-2xl text-sm font-bold mx-auto shadow-md hover:bg-brand-primary-hover transition-colors"
          >
            <RefreshCw className="w-4.5 h-4.5" />
            إعادة المحاولة
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl text-slate-400">
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="font-black text-slate-850 text-base mb-1">صندوق الإشعارات فارغ</h3>
          <p className="text-xs">لا توجد لديك أي إشعارات أو تنبيهات غير مقروءة في الوقت الحالي.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm divide-y divide-slate-100">
          {notifications.map((notif) => {
            const { Icon, color } = getNotificationIcon(notif.type);
            const isClickable = !!notif.link;

            return (
              <div
                key={notif.id}
                onClick={() => handleMarkAsRead(notif.id, notif.link)}
                className={`flex items-start gap-4 p-5 transition-all duration-200 ${
                  notif.is_read ? 'opacity-70 bg-white' : 'bg-slate-50/50 hover:bg-slate-50'
                } ${isClickable ? 'cursor-pointer' : ''}`}
              >
                {/* Type Icon Badge */}
                <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className={`text-sm font-black text-slate-800 ${notif.is_read ? '' : 'text-brand-primary font-black'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-bold shrink-0">
                      {formatDate(notif.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-650 leading-relaxed">
                    {notif.content}
                  </p>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => handleDelete(e, notif.id)}
                  className="p-2 text-slate-450 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all shrink-0 align-self-center"
                  aria-label="حذف التنبيه"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
