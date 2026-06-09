import React, { useState } from 'react';
import type { Conversation } from '../../types';
import { Search, User, Briefcase, ShoppingBag, Settings, MessageSquare, Plus } from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: string;
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation?: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentUserId,
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const getOtherParticipant = (conv: Conversation) => {
    if (conv.participant_1 === currentUserId) {
      return conv.participant_2_profile;
    }
    return conv.participant_1_profile;
  };

  const getContextStyles = (type?: string) => {
    switch (type) {
      case 'job':
        return {
          icon: Briefcase,
          bg: 'bg-indigo-50 border-indigo-150 text-indigo-700',
          label: 'وظيفة'
        };
      case 'product':
        return {
          icon: ShoppingBag,
          bg: 'bg-emerald-50 border-emerald-150 text-emerald-700',
          label: 'منتج'
        };
      case 'service':
        return {
          icon: Settings,
          bg: 'bg-amber-50 border-amber-150 text-amber-700',
          label: 'خدمة'
        };
      default:
        return {
          icon: MessageSquare,
          bg: 'bg-slate-50 border-slate-150 text-slate-700',
          label: 'عام'
        };
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const otherUser = getOtherParticipant(conv);
    const fullName = otherUser?.full_name?.toLowerCase() || '';
    const email = otherUser?.email?.toLowerCase() || '';
    const title = conv.context_title?.toLowerCase() || '';
    const term = searchTerm.toLowerCase();

    return fullName.includes(term) || email.includes(term) || title.includes(term);
  });

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white" dir="rtl">
      {/* Unified Search Header */}
      <div className="p-4 border-b border-slate-100 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-800">محادثاتي</h2>
          {onNewConversation && (
            <button
              onClick={onNewConversation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-xl text-xs font-black transition-all duration-150"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>مراسلة جديدة</span>
            </button>
          )}
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="البحث في الرسائل والموضوعات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all placeholder-slate-400 font-bold"
          />
          <Search className="absolute top-1/2 right-3.5 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Conversations Scroll Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100/50">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-16 text-slate-400 px-4">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
            <p className="font-black text-sm text-slate-500 mb-1">لا توجد محادثات</p>
            <p className="text-xs">لم نجد أي نتائج تطابق بحثك.</p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const otherUser = getOtherParticipant(conv);
            const isSelected = conv.id === selectedConversationId;
            const context = getContextStyles(conv.context_type);
            const ContextIcon = context.icon;
            
            // Check for unread state
            const hasUnread = conv.messages && conv.messages.length > 0 && 
                              conv.messages[0].sender_id !== currentUserId && 
                              !conv.messages[0].is_read;

            const lastMessageText = conv.messages && conv.messages.length > 0 
              ? conv.messages[0].content 
              : 'انقر لعرض المحادثة وبدء المراسلة...';

            return (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`w-full flex items-start gap-3.5 p-4 text-right transition-all duration-150 hover:bg-slate-50/80 border-r-4 border-transparent ${
                  isSelected ? 'bg-slate-50 border-r-4 border-brand-primary' : ''
                } ${hasUnread ? 'bg-brand-primary/3' : ''}`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  {otherUser?.avatar_url ? (
                    <img
                      src={otherUser.avatar_url}
                      alt={otherUser.full_name || 'مستخدم جذور'}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                      <User className="w-6 h-6" />
                    </div>
                  )}
                  {hasUnread && (
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex justify-between items-center gap-2">
                    <h3 className={`text-slate-800 text-sm truncate ${hasUnread ? 'font-black' : 'font-bold'}`}>
                      {otherUser?.full_name || 'مستخدم مجهول'}
                    </h3>
                    <span className={`text-[10px] shrink-0 ${hasUnread ? 'text-brand-primary font-black' : 'text-slate-400 font-bold'}`}>
                      {formatDate(conv.last_message_at)}
                    </span>
                  </div>

                  {/* Context Badge */}
                  {conv.context_type && conv.context_title && (
                    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black border max-w-full ${context.bg}`}>
                      <ContextIcon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        {context.label}: {conv.context_title}
                      </span>
                    </div>
                  )}

                  {/* Last message / Status */}
                  <p className={`text-xs truncate font-semibold leading-relaxed ${
                    hasUnread ? 'text-slate-900 font-black' : 'text-slate-450'
                  }`}>
                    {lastMessageText}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
