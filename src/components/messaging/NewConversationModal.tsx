import React, { useState } from 'react';
import { X, Search, User, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { messagingService } from '../../services/messagingService';
import type { Profile } from '../../types';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationCreated: (conversationId: string) => void;
}

export const NewConversationModal: React.FC<NewConversationModalProps> = ({
  isOpen,
  onClose,
  onConversationCreated,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    setProfiles([]);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول للبحث عن مستخدمين.');

      // Search profiles where full_name or email matches search term, excluding current user
      const { data, error: searchError } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(10);

      if (searchError) throw searchError;
      setProfiles((data as Profile[]) || []);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء البحث عن مستخدمين.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartConversation = async (participantId: string, name?: string) => {
    if (creating) return;
    setCreating(true);
    setError(null);

    try {
      const { data, error: startError } = await messagingService.startConversation({
        participantId,
        contextType: 'general',
        contextTitle: name ? `محادثة عامة مع ${name}` : undefined,
      });

      if (startError) {
        setError(startError);
      } else if (data) {
        onConversationCreated(data.id);
        onClose();
      }
    } catch (err) {
      setError('فشل في بدء المحادثة. يرجى المحاولة لاحقاً.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      {/* Background Overlay */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100 animate-scaleUp">
        {/* Header */}
        <div className="p-6 border-b border-slate-150 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-black text-slate-800">محادثة جديدة</h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-650 rounded-xl transition-all"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Area */}
        <div className="p-6 border-b border-slate-100">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary placeholder-slate-400 text-slate-800 transition-all"
              />
              <Search className="absolute top-1/2 right-3.5 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <button
              type="submit"
              disabled={loading || !searchTerm.trim()}
              className="px-6 py-3 bg-brand-primary hover:bg-brand-primary-hover disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl font-bold text-sm transition-all"
            >
              {loading ? 'بحث...' : 'بحث'}
            </button>
          </form>
        </div>

        {/* Profiles Results Scroll list */}
        <div className="flex-1 overflow-y-auto p-6 max-h-[40vh] custom-scrollbar min-h-[150px]">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-2 text-sm mb-4">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {profiles.length === 0 ? (
            <div className="text-center py-8 text-slate-400 flex flex-col items-center justify-center h-full">
              <User className="w-10 h-10 text-slate-300 mb-2" />
              <p className="font-bold text-sm mb-1">ابحث عن زميل عمل أو مزارع</p>
              <p className="text-xs">أدخل الاسم أو البريد الإلكتروني في شريط البحث أعلاه.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => handleStartConversation(profile.id, profile.full_name)}
                  disabled={creating}
                  className="w-full flex items-center justify-between p-3.5 border border-slate-150 rounded-2xl hover:bg-slate-50 text-right transition-all duration-150"
                >
                  <div className="flex items-center gap-3">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name || 'مستخدم جذور'}
                        className="w-10 h-10 rounded-2xl object-cover border border-slate-100 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{profile.full_name || 'مستشار جذور'}</h4>
                      <p className="text-xs text-slate-400 font-medium truncate max-w-[200px]">{profile.email}</p>
                    </div>
                  </div>
                  <span className="text-xs text-brand-primary font-bold hover:underline">مراسلة</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
