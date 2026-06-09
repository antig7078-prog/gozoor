import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { messagingService } from '../../../services/messagingService';
import { ConversationList } from '../../../components/messaging/ConversationList';
import { ConversationView } from '../../../components/messaging/ConversationView';
import { NewConversationModal } from '../../../components/messaging/NewConversationModal';
import { useAuth } from '../../../contexts/AuthContext';
import { PageContainer } from '../../../components/shared/PageContainer';
import { PageHeader } from '../../../components/shared/PageHeader';
import type { Conversation } from '../../../types';
import { MessageSquare, RefreshCw, AlertCircle } from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const conversationIdParam = searchParams.get('conversationId');
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

  useEffect(() => {
    if (conversationIdParam) {
      setSelectedConversationId(conversationIdParam);
    }
  }, [conversationIdParam]);

  if (!user) {
    return (
      <PageContainer maxWidth="xl">
        <div className="flex flex-col justify-center items-center py-20 text-center px-4" dir="rtl">
          <AlertCircle className="w-16 h-16 text-amber-550 mb-4" />
          <h2 className="text-xl font-black text-slate-800 mb-1">يجب تسجيل الدخول أولاً</h2>
          <p className="text-slate-450 text-sm max-w-sm font-bold">يرجى تسجيل الدخول لحسابك لتتمكن من مراسلة الأعضاء وعرض الرسائل.</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        title="مركز الرسائل والمفاوضات"
        description="تواصل مباشرة مع المشترين والبائعين ومقدمي الخدمات لإنجاز أعمالك ومتابعة صفقاتك بسهولة وبشكل آمن."
        icon={MessageSquare}
      />

      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm h-[75vh] flex flex-col md:flex-row relative" dir="rtl">
        {/* Search & List panel */}
        <div
          className={`w-full md:w-80 lg:w-96 shrink-0 flex flex-col border-l border-slate-150 h-full ${
            selectedConversationId ? 'hidden md:flex' : 'flex'
          }`}
        >
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
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-brand-primary-hover transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
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
                onNewConversation={() => setIsModalOpen(true)}
              />
            </div>
          )}
        </div>

        {/* Main Conversation Window View */}
        <div className={`flex-1 h-full overflow-hidden ${!selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
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
              <p className="text-slate-450 text-xs font-bold max-w-sm leading-relaxed">
                اختر محادثة من القائمة الجانبية أو ابدأ محادثة جديدة للتواصل الفوري ومتابعة خدماتك أو صفقاتك بكل سهولة.
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
    </PageContainer>
  );
};
