import React, { useState } from 'react';
import { Mail, MessageSquare, ExternalLink, Check, X, Eye, Star, Award, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

interface ApplicantCardProps {
    application: {
        id: string;
        job_id: string;
        applicant_id: string;
        resume_url: string;
        cover_letter?: string;
        status: string;
        created_at: string;
        profiles?: {
            full_name?: string;
            avatar_url?: string;
            reputation_points?: number;
            reputation_level?: string;
            overall_rating?: number;
        } | null;
    };
    onUpdateStatus: (status: 'Reviewed' | 'Accepted' | 'Rejected') => Promise<void>;
    onMessage: () => void;
    isUpdating: boolean;
}

export const ApplicantCard: React.FC<ApplicantCardProps> = ({
    application,
    onUpdateStatus,
    onMessage,
    isUpdating
}) => {
    const [showCoverLetter, setShowCoverLetter] = useState(false);
    const profile = application.profiles;
    const rating = profile?.overall_rating || 0;
    const repLevel = profile?.reputation_level || 'beginner';
    const repPoints = profile?.reputation_points || 0;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Pending':
                return <span className="px-3.5 py-1.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-xs font-black">قيد الانتظار</span>;
            case 'Reviewed':
                return <span className="px-3.5 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-xs font-black">تمت المراجعة</span>;
            case 'Accepted':
                return <span className="px-3.5 py-1.5 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-full text-xs font-black">مقبول</span>;
            case 'Rejected':
                return <span className="px-3.5 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-full text-xs font-black">مرفوض</span>;
            default:
                return <span className="px-3.5 py-1.5 bg-slate-50 text-slate-600 border border-slate-100 rounded-full text-xs font-black">{status}</span>;
        }
    };

    const getReputationLevelLabel = (level: string) => {
        switch (level) {
            case 'beginner': return 'مبتدئ';
            case 'active': return 'نشط';
            case 'professional': return 'محترف';
            case 'trusted': return 'موثوق';
            case 'expert': return 'خبير';
            default: return level;
        }
    };

    const getReputationColor = (level: string) => {
        switch (level) {
            case 'expert': return 'bg-purple-50 text-purple-600 border-purple-100';
            case 'trusted': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'professional': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'active': return 'bg-amber-50 text-amber-600 border-amber-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <div className="bg-white rounded-[2rem] border border-border-subtle p-6 sm:p-8 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-brand-primary/5 transition-all group relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                
                {/* Applicant Bio Profile */}
                <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-primary/10 to-brand-accent/10 border border-brand-primary/15 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile?.full_name || 'صورة المتقدم'} className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-brand-primary font-black text-2xl">
                                {(profile?.full_name || 'م')[0]}
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="text-xl font-black text-text-primary">{profile?.full_name || 'متقدم غير معروف'}</h4>
                            {getStatusBadge(application.status)}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-text-muted">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-brand-primary/70" />
                                <span>تقدّم في: {new Date(application.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>

                            {rating > 0 && (
                                <div className="flex items-center gap-1 bg-amber-50/70 text-amber-600 px-2 py-0.5 rounded border border-amber-100/50">
                                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                    <span>{rating.toFixed(1)}</span>
                                </div>
                            )}

                            <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] ${getReputationColor(repLevel)}`}>
                                <Award className="w-3.5 h-3.5" />
                                <span>{getReputationLevelLabel(repLevel)} ({repPoints} نقطة)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Action Buttons */}
                <div className="flex flex-wrap gap-2 w-full md:w-auto shrink-0">
                    <button
                        onClick={onMessage}
                        className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white rounded-xl text-xs font-black transition-all"
                        title="بدء تواصل عبر المحادثات"
                    >
                        <MessageSquare className="w-4 h-4" />
                        تواصل
                    </button>
                    
                    <a
                        href={application.resume_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-text-secondary rounded-xl text-xs font-black border border-slate-200 transition-all"
                    >
                        <ExternalLink className="w-4 h-4" />
                        السيرة الذاتية
                    </a>
                </div>
            </div>

            {/* Application Cover Letter */}
            {application.cover_letter && (
                <div className="mt-6 border-t border-slate-100 pt-6">
                    <button
                        onClick={() => setShowCoverLetter(!showCoverLetter)}
                        className="flex items-center justify-between w-full text-right text-sm font-black text-slate-600 hover:text-brand-primary transition-colors pr-1"
                    >
                        <span>الرسالة التعريفية (Cover Letter)</span>
                        {showCoverLetter ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    {showCoverLetter && (
                        <div className="mt-4 p-5 bg-surface-primary/50 border border-slate-100 rounded-2xl text-sm leading-relaxed text-text-secondary whitespace-pre-wrap font-bold relative">
                            {application.cover_letter}
                        </div>
                    )}
                </div>
            )}

            {/* Quick Status Modifiers */}
            {application.status !== 'Accepted' && application.status !== 'Rejected' && (
                <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap justify-end gap-3">
                    {application.status === 'Pending' && (
                        <button
                            disabled={isUpdating}
                            onClick={() => onUpdateStatus('Reviewed')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-black transition-colors"
                        >
                            <Eye className="w-3.5 h-3.5" />
                            تحديد كمشاهدة
                        </button>
                    )}
                    
                    <button
                        disabled={isUpdating}
                        onClick={() => onUpdateStatus('Accepted')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 hover:bg-brand-primary hover:text-white text-brand-primary rounded-xl text-xs font-black transition-all"
                    >
                        <Check className="w-3.5 h-3.5" />
                        قبول المتقدم
                    </button>

                    <button
                        disabled={isUpdating}
                        onClick={() => onUpdateStatus('Rejected')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 rounded-xl text-xs font-black transition-all"
                    >
                        <X className="w-3.5 h-3.5" />
                        رفض
                    </button>
                </div>
            )}
        </div>
    );
};
