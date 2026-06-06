import React from 'react';
import type { Message } from '../../types';
import { Check, CheckCheck, AlertTriangle } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  currentUserId: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, currentUserId }) => {
  const isOwnMessage = message.sender_id === currentUserId;

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div
      className={`flex flex-col w-full ${isOwnMessage ? 'items-start' : 'items-end'}`}
      dir="rtl"
    >
      <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] group`}>
        {/* Message bubble wrapper */}
        <div
          className={`px-4 py-3 rounded-3xl text-sm leading-relaxed shadow-sm transition-all duration-200 ${
            isOwnMessage
              ? 'bg-brand-primary text-white rounded-tr-none'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none'
          } ${message.is_flagged ? 'border border-amber-300 bg-amber-50 dark:bg-amber-950/20 text-slate-800' : ''}`}
        >
          {/* Flagged Spam/Phone alert */}
          {message.is_flagged && (
            <div className="flex items-center gap-1.5 mb-2 p-2 bg-amber-100/50 dark:bg-amber-900/20 rounded-xl text-amber-700 text-[10px] font-bold border border-amber-200">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              <span>تحذير: تم رصد محتوى قد يخالف سياسة الاستخدام (مثل مشاركة أرقام الهواتف).</span>
            </div>
          )}

          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {/* Time and Read Receipts */}
        <div
          className={`flex items-center gap-1 mt-1 px-1 text-[10px] font-bold text-slate-400 ${
            isOwnMessage ? 'justify-start' : 'justify-end'
          }`}
        >
          <span>{formatTime(message.created_at)}</span>
          {isOwnMessage && (
            <span className="shrink-0">
              {message.is_read ? (
                <CheckCheck className="w-3.5 h-3.5 text-brand-primary" />
              ) : (
                <Check className="w-3.5 h-3.5 text-slate-300" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
