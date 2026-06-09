import React, { useEffect, useState, useRef } from 'react';
import type { Conversation, Message } from '../../types';
import { messagingService } from '../../services/messagingService';
import { notificationService } from '../../services/notificationService';
import { MessageBubble } from './MessageBubble';
import { Send, User, ChevronRight, AlertCircle, RefreshCw, ShoppingBag, Briefcase, Settings, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ConversationViewProps {
  conversationId: string;
  currentUserId: string;
  onBack?: () => void;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  conversationId,
  currentUserId,
  onBack,
}) => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversationDetails = async () => {
    try {
      // Fetch details of conversation from Supabase
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select(`
          *,
          participant_1_profile:profiles!participant_1(*),
          participant_2_profile:profiles!participant_2(*)
        `)
        .eq('id', conversationId)
        .single();

      if (convError) throw convError;
      setConversation(convData as Conversation);

      // Fetch messages
      const { data: msgData, error: msgError } = await messagingService.getMessages(conversationId);
      if (msgError) throw new Error(msgError);
      setMessages(msgData || []);

      // Mark messages as read
      await messagingService.markAsRead(conversationId);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تحميل تفاصيل المحادثة.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchConversationDetails();

    // Subscribe to new messages in this conversation in real-time!
    const channel = supabase
      .channel(`conversation_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Fetch sender profile info for the new message
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', payload.new.sender_id)
            .single();

          const messageWithProfile: Message = {
            ...(payload.new as Message),
            sender_profile: senderProfile || undefined,
          };

          // Append only if it doesn't already exist in state
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === messageWithProfile.id);
            if (exists) return prev;
            return [...prev, messageWithProfile];
          });

          // Mark as read if user is viewing
          if (payload.new.sender_id !== currentUserId) {
            await messagingService.markAsRead(conversationId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Auto-scroll to bottom of messages container
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage(''); // Clear input immediately for responsiveness

    try {
      const { data, error: sendError } = await messagingService.sendMessage(conversationId, content);
      if (sendError) {
        setError(sendError);
        setNewMessage(content); // Restore input on error
      } else if (data) {
        // Fetch current user's profile info to attach to local message representation
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUserId)
          .single();

        const messageWithProfile: Message = {
          ...data,
          sender_profile: userProfile || undefined,
        };

        // Append to state manually to ensure instant, reliable delivery feedback
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === messageWithProfile.id);
          if (exists) return prev;
          return [...prev, messageWithProfile];
        });

        // Send a notification to the recipient of the message
        if (otherUser?.id) {
          notificationService.sendNotification({
            userId: otherUser.id,
            title: 'رسالة جديدة',
            content: `لقد أرسل لك ${userProfile?.full_name || 'أحد الأعضاء'} رسالة جديدة: "${content.slice(0, 40)}${content.length > 40 ? '...' : ''}"`,
            type: 'message',
            link: `/messages?conversationId=${conversationId}`
          }).catch(err => console.error('Error sending message notification:', err));
        }
      }
    } catch (err) {
      setError('تعذر إرسال الرسالة. يرجى التحقق من اتصالك بالإنترنت.');
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = (conv: Conversation) => {
    if (conv.participant_1 === currentUserId) {
      return conv.participant_2_profile;
    }
    return conv.participant_1_profile;
  };

  const getReputationText = (level?: string) => {
    switch (level) {
      case 'expert':
        return 'خبير';
      case 'trusted':
        return 'موثوق';
      case 'professional':
        return 'محترف';
      case 'active':
        return 'نشط';
      default:
        return 'مبتدئ';
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
        return 'موضوع عام';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center h-full bg-slate-50/50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mb-3"></div>
        <span className="text-slate-400 text-xs font-bold">جاري تحميل المحادثة...</span>
      </div>
    );
  }

  if (error && !conversation) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center h-full p-6 text-center bg-slate-50/50" dir="rtl">
        <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
        <p className="text-slate-800 font-bold mb-4">{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            fetchConversationDetails();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl text-sm font-bold shadow-md hover:bg-brand-primary-hover transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const otherUser = conversation ? getOtherParticipant(conversation) : null;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/40 overflow-hidden" dir="rtl">
      {/* Header bar */}
      <div className="bg-white px-5 py-4 border-b border-slate-100 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
              aria-label="العودة للمحادثات"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {otherUser?.avatar_url ? (
            <img
              src={otherUser.avatar_url}
              alt={otherUser.full_name || 'مستلم الرسالة'}
              className="w-11 h-11 rounded-xl object-cover border border-slate-150"
            />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
              <User className="w-5 h-5" />
            </div>
          )}

          <div>
            <h2 className="font-black text-slate-800 text-sm sm:text-base leading-tight">
              {otherUser?.full_name || 'مستخدم معتمد'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-black">
                {getReputationText(otherUser?.reputation_level)}
              </span>
            </div>
          </div>
        </div>

        {/* Conversation Context Title (High Contrast) */}
        {conversation?.context_title && (
          <div className="text-left">
            <span className="text-[9px] text-slate-400 font-black block tracking-widest uppercase">بخصوص</span>
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl px-3 py-1 mt-0.5 max-w-[180px] sm:max-w-[280px] truncate">
              {conversation.context_type === 'product' && <ShoppingBag className="w-3.5 h-3.5" />}
              {conversation.context_type === 'job' && <Briefcase className="w-3.5 h-3.5" />}
              {conversation.context_type === 'service' && <Settings className="w-3.5 h-3.5" />}
              {conversation.context_type !== 'product' && conversation.context_type !== 'job' && conversation.context_type !== 'service' && <MessageSquare className="w-3.5 h-3.5" />}
              <span className="text-xs font-black truncate">
                {getContextLabel(conversation.context_type)}: {conversation.context_title}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Messages Panel */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5 custom-scrollbar bg-slate-50/20">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 max-w-sm mx-auto p-4">
            <div className="w-12 h-12 rounded-full bg-slate-100/80 border border-slate-200/50 flex items-center justify-center mb-3">
              <MessageSquare className="w-5 h-5 text-slate-350" />
            </div>
            <p className="font-black text-sm text-slate-700 mb-1">ابدأ المحادثة الآن</p>
            <p className="text-xs font-semibold text-slate-400 leading-relaxed">كن مبادراً وأرسل رسالة ترحيبية لبدء التفاوض أو الاستفسار.</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              currentUserId={currentUserId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer message editor */}
      <div className="bg-white border-t border-slate-100 p-4 shrink-0 shadow-inner">
        <form onSubmit={handleSend} className="flex gap-3 items-center">
          <input
            type="text"
            placeholder="اكتب رسالتك وتفاصيل استفسارك هنا..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
            className="flex-1 px-4 py-3 bg-slate-50 hover:bg-slate-100 focus:bg-white rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary placeholder-slate-400 text-sm font-semibold text-slate-800 transition-all outline-none"
          />

          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-3.5 bg-brand-primary hover:bg-brand-primary-hover disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl shadow-md shadow-brand-primary/10 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shrink-0"
            aria-label="إرسال"
          >
            <Send className="w-5 h-5 rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
};
