import React, { useState } from 'react';
import type { Conversation } from '../../types';
import { Search, User, Briefcase, ShoppingBag, Settings, MessageSquare } from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: string;
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentUserId,
  selectedConversationId,
  onSelectConversation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const getOtherParticipant = (conv: Conversation) => {
    if (conv.participant_1 === currentUserId) {
      return conv.participant_2_profile;
    }
    return conv.participant_1_profile;
  };

  const getContextIcon = (type?: string) => {
    switch (type) {
      case 'job':
        return Briefcase;
      case 'product':
        return ShoppingBag;
      case 'service':
        return Settings;
      default:
        return MessageSquare;
    }
  };

  const getContextLabel = (type?: string) => {
    switch (type) {
      case 'job':
        return 'وظيفة';
      case 'product':
        return 'منتج';
      case 'service':
        return 'خدمة';
      default:
        return 'عام';
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
      
      // If today, show time. If earlier, show date.
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full border-l border-slate-200 bg-white" dir="rtl">
      {/* Search Header */}
      <div className="p-4 border-b border-slate-200 space-y-3">
        <h2 className="text-xl font-black text-slate-800">محادثاتي</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="البحث في الرسائل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all placeholder-slate-400"
          />
          <Search className="absolute top-1/2 right-3.5 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Conversations Scroll Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12 text-slate-400 px-4">
            <p className="font-bold mb-1">لا توجد محادثات</p>
            <p className="text-xs">لم نجد أي نتائج تطابق بحثك.</p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const otherUser = getOtherParticipant(conv);
            const isSelected = conv.id === selectedConversationId;
            const ContextIcon = getContextIcon(conv.context_type);

            return (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`w-full flex items-start gap-3 p-4 text-right transition-all duration-150 hover:bg-slate-50 ${
                  isSelected ? 'bg-slate-50 border-r-4 border-brand-primary' : ''
                }`}
              >
                {/* Avatar */}
                {otherUser?.avatar_url ? (
                  <img
                    src={otherUser.avatar_url}
                    alt={otherUser.full_name || 'مستخدم جذور'}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-100 shrink-0 shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex justify-between items-center gap-2">
                    <h3 className="font-bold text-slate-800 text-sm truncate">
                      {otherUser?.full_name || 'مستخدم مجهول'}
                    </h3>
                    <span className="text-[10px] text-slate-450 shrink-0">
                      {formatDate(conv.last_message_at)}
                    </span>
                  </div>

                  {/* Context Badge */}
                  {conv.context_type && conv.context_title && (
                    <div className="inline-flex items-center gap-1 bg-slate-100 text-slate-650 px-2 py-0.5 rounded-lg text-[10px] font-black border border-slate-200 max-w-full">
                      <ContextIcon className="w-3 h-3 shrink-0 text-slate-500" />
                      <span className="truncate">
                        {getContextLabel(conv.context_type)}: {conv.context_title}
                      </span>
                    </div>
                  )}

                  {/* Last message / Status */}
                  <p className="text-xs text-slate-400 truncate font-medium">
                    انقر لعرض المحادثة وبدء المراسلة...
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
