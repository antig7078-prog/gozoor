import React, { useEffect, useState } from 'react';
import { messagingService } from '../../services/messagingService';
import { Mail } from 'lucide-react';

interface MessageNotificationBadgeProps {
  showIcon?: boolean;
  className?: string;
}

export const MessageNotificationBadge: React.FC<MessageNotificationBadgeProps> = ({
  showIcon = false,
  className = '',
}) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchUnreadCount = async () => {
    const { count } = await messagingService.getUnreadCount();
    setUnreadCount(count || 0);
  };

  useEffect(() => {
    fetchUnreadCount();

    // Check count periodically
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, []);

  if (unreadCount === 0) {
    return showIcon ? <Mail className={`w-5 h-5 ${className}`} /> : null;
  }

  return (
    <div className="relative inline-flex items-center" dir="rtl">
      {showIcon && <Mail className={`w-5 h-5 ${className}`} />}
      <span
        className={`bg-brand-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${
          showIcon ? 'absolute -top-1.5 -left-1.5' : className
        }`}
      >
        {unreadCount}
      </span>
    </div>
  );
};
