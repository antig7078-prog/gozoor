import React, { useEffect, useState } from 'react';
import { messagingService } from '../../../services/messagingService';
import { ConversationList } from '../../../components/messaging/ConversationList';
import { ConversationView } from '../../../components/messaging/ConversationView';
import { NewConversationModal } from '../../../components/messaging/NewConversationModal';
import { useAuth } from '../../../contexts/AuthContext';
import type { Conversation } from '../../../types';
import { Plus, MessageSquare, RefreshCw, AlertCircle } from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await messagingService.getConversations();
      if (fetchError) {
        setError(fetchError);
      } else {
        setConversations(data || []);
      }
    } catch (err) {
      setError('حدث خطأ أثناء تحميل الرسائل. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();

    // Check periodically for updates
    const interval = setInterval(async () => {
      try {
        const { data } = await messagingService.getConversations();
        if (data) setConversations(data);
      } catch {}
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center py-20 text-center px-4" dir="rtl">
        <AlertCircle className="w-16 h-16 text-amber-500 mb-4" />
        <h2 className="text-xl font-black text-slate-800 mb-1">يجب تسجيل الدخول أولاً</h2>
        <p className="text-slate-400 text-sm max-w-sm">يرجى تسجيل الدخول لحسابك لتتمكن من مراسلة الأعضاء وعرض الرسائل.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm h-[75vh] flex flex-col md:flex-row relative" dir="rtl">
      {/* Search & List panel */}
      <div
        className={`w-full md:w-80 lg:w-96 shrink-0 flex flex-col border-l border-slate-200 h-full ${
          selectedConversationId ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* New Chat Button Row */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center shrink-0">
          <span className="text-sm font-black text-slate-650">ابدأ مراسلة جديدة</span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl text-xs font-bold transition-all duration-200 shadow-md shadow-brand-primary/10 hover:scale-103"
          >
            <Plus className="w-4 h-4" />
            <span>رسالة جديدة</span>
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mb-2" />
            <span className="text-slate-400 text-xs font-bold">جاري تحميل المحادثات...</span>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
            <p className="text-sm text-slate-850 font-bold mb-4">{error}</p>
            <button
              onClick={fetchConversations}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-bold shadow-md"
            >
              <RefreshCw className="w-4.5 h-4.5" />
              إعادة التحميل
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <ConversationList
              conversations={conversations}
              currentUserId={user.id}
              selectedConversationId={selectedConversationId}
              onSelectConversation={setSelectedConversationId}
            />
          </div>
        )}
      </div>

      {/* Main Conversation Window View */}
      <div className={`flex-1 h-full ${!selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
        {selectedConversationId ? (
          <ConversationView
            conversationId={selectedConversationId}
            currentUserId={user.id}
            onBack={() => setSelectedConversationId(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center p-8 text-center bg-slate-50/50">
            <div className="w-16 h-16 rounded-3xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-4 shadow-inner">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-850 mb-1">ابدأ المراسلة والمفاوضات</h3>
            <p className="text-slate-400 text-xs max-w-sm">
              اختر محادثة من القائمة الجانبية أو ابدأ محادثة جديدة للتواصل الفوري ومتابعة خدماتك أو صفقاتك الزراعية.
            </p>
          </div>
        )}
      </div>

      {/* New Conversation Modal Selector */}
      <NewConversationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConversationCreated={(id) => {
          setSelectedConversationId(id);
          fetchConversations();
        }}
      />
    </div>
  );
};
