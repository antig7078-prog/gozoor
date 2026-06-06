import React, { useEffect, useState, useRef } from 'react';
import type { Conversation, Message } from '../../types';
import { messagingService } from '../../services/messagingService';
import { MessageBubble } from './MessageBubble';
import { Send, User, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
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

          setMessages((prev) => [...prev, messageWithProfile]);

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

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center h-full bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mb-2"></div>
        <span className="text-slate-450 text-xs font-bold">جاري تحميل المحادثة...</span>
      </div>
    );
  }

  if (error && !conversation) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center h-full p-6 text-center bg-slate-50" dir="rtl">
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
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden" dir="rtl">
      {/* Header bar */}
      <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between shadow-sm shrink-0">
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
              className="w-10 h-10 rounded-2xl object-cover border border-slate-100"
            />
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
              <User className="w-5 h-5" />
            </div>
          )}

          <div>
            <h2 className="font-bold text-slate-800 text-sm leading-tight">
              {otherUser?.full_name || 'مستخدم مجهول'}
            </h2>
            {otherUser?.reputation_level && (
              <span className="text-[10px] text-slate-450 font-medium">
                مستوى السمعة:{' '}
                {otherUser.reputation_level === 'expert'
                  ? 'خبير'
                  : otherUser.reputation_level === 'trusted'
                  ? 'موثوق'
                  : otherUser.reputation_level === 'professional'
                  ? 'محترف'
                  : otherUser.reputation_level === 'active'
                  ? 'نشط'
                  : 'مبتدئ'}
              </span>
            )}
          </div>
        </div>

        {/* Conversation Context Title */}
        {conversation?.context_title && (
          <div className="hidden sm:block text-left">
            <span className="text-[10px] text-slate-400 font-bold block">موضوع المراسلة:</span>
            <span className="text-xs font-black text-slate-700 bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5 max-w-[200px] truncate block">
              {conversation.context_title}
            </span>
          </div>
        )}
      </div>

      {/* Messages Panel */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 custom-scrollbar bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 max-w-sm mx-auto">
            <p className="font-bold mb-1">ابدأ المحادثة الآن</p>
            <p className="text-xs">كن مبادراً وأرسل رسالة ترحيبية لبدء التفاوض أو الاستفسار.</p>
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
      <div className="bg-white border-t border-slate-200 p-4 shrink-0">
        <form onSubmit={handleSend} className="flex gap-3 items-center">
          <input
            type="text"
            placeholder="اكتب رسالتك هنا..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary placeholder-slate-400 text-sm text-slate-800 bg-slate-50/50 transition-all"
          />

          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-4 py-3 bg-brand-primary hover:bg-brand-primary-hover disabled:bg-slate-200 disabled:text-slate-450 text-white rounded-2xl shadow-md shadow-brand-primary/10 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shrink-0"
            aria-label="إرسال"
          >
            <Send className="w-5 h-5 rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
};
