import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, DollarSign, Clock, Building2, ChevronLeft, Users, AlertCircle, Trash2 } from 'lucide-react';
import { SkillTags } from './SkillTags';
import type { Job } from '../../types';

interface JobCardProps {
    job: Job;
    isOwner?: boolean;
    applicantCount?: number;
    onViewApplicants?: () => void;
    onClose?: () => void;
    onDelete?: () => void;
    isActionLoading?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({
    job,
    isOwner = false,
    applicantCount = 0,
    onViewApplicants,
    onClose,
    onDelete,
    isActionLoading = false
}) => {
    const isClosed = job.status === 'Closed';
    
    // Check if the deadline has passed
    const isExpired = job.deadline ? new Date(job.deadline) < new Date() : false;

    return (
        <div
            className={`bg-white rounded-[2.5rem] border p-6 sm:p-8 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-brand-primary/10 hover:border-brand-primary/20 hover:-translate-y-1 transition-all duration-300 group flex flex-col relative overflow-hidden ${
                isClosed || isExpired ? 'opacity-85 border-slate-200 bg-slate-50/50' : 'border-border-subtle'
            }`}
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-surface-primary rounded-bl-[80px] -z-0 group-hover:bg-brand-primary/5 transition-colors duration-500" />
            
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-surface-primary rounded-2xl group-hover:bg-brand-primary group-hover:text-white transition-all duration-500 group-hover:scale-110 shadow-inner">
                        <Briefcase className={`w-6 h-6 ${isClosed || isExpired ? 'text-slate-400' : 'text-brand-primary'} group-hover:text-white`} />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className="bg-white/90 backdrop-blur-sm border border-border-subtle text-text-muted px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                            {job.job_type}
                        </span>
                        {isClosed && (
                            <span className="bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded-full text-[10px] font-black">
                                مغلقة
                            </span>
                        )}
                        {!isClosed && isExpired && (
                            <span className="bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1 rounded-full text-[10px] font-black">
                                منتهية الصلاحية
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex-1">
                    <h3 className="font-black text-text-primary text-xl sm:text-2xl mb-2 line-clamp-1 group-hover:text-brand-primary transition-colors duration-300">
                        {job.title}
                    </h3>

                    <div className="flex items-center gap-2 mb-4 text-text-muted font-bold text-sm">
                        <Building2 className="w-4 h-4 text-brand-primary/70" />
                        {job.company_name || 'شركة زراعية رائدة'}
                    </div>

                    <p className="text-text-secondary text-sm mb-6 line-clamp-2 leading-relaxed font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                        {job.description || 'لا يوجد وصف متاح لهذه الوظيفة حالياً.'}
                    </p>

                    {/* Skill Tags */}
                    {job.skills && (
                        <div className="mb-6">
                            <SkillTags skills={job.skills} />
                        </div>
                    )}

                    <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-sm text-slate-700 font-black">
                            <MapPin className="w-4 h-4 text-brand-primary" />
                            <span>{job.governorate ? `${job.governorate}، ` : ''}{job.location || 'غير محدد'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-700 font-black">
                            <DollarSign className="w-4 h-4 text-brand-primary" />
                            <div className="flex items-center gap-1">
                                <span>{job.salary_range || 'حسب الاتفاق'}</span>
                                {!job.salary_range?.includes('ج.م') && job.salary_range && <span className="text-[10px] uppercase">ج.م</span>}
                            </div>
                        </div>
                        {job.deadline && (
                            <div className="flex items-center gap-3 text-sm text-slate-700 font-bold">
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                                <span className="text-xs text-text-secondary">
                                    آخر موعد للتقديم: {new Date(job.deadline).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {isOwner ? (
                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6 mt-auto">
                        {onViewApplicants ? (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    onViewApplicants();
                                }}
                                className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-bg font-black text-sm transition-colors"
                                disabled={isActionLoading}
                            >
                                <Users className="w-4 h-4" />
                                المتقدمون ({applicantCount})
                            </button>
                        ) : (
                            <Link
                                to={`/jobs/${job.id}/applicants`}
                                className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-bg font-black text-sm transition-colors"
                            >
                                <Users className="w-4 h-4" />
                                المتقدمون ({applicantCount})
                            </Link>
                        )}
                        
                        <div className="flex items-center gap-2">
                            {!isClosed && onClose && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onClose();
                                    }}
                                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-black transition-colors"
                                    disabled={isActionLoading}
                                >
                                    {isActionLoading ? 'جاري الإغلاق...' : 'إغلاق الوظيفة'}
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onDelete();
                                    }}
                                    className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-colors"
                                    disabled={isActionLoading}
                                    title="حذف الوظيفة"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                            <Link
                                to={`/jobs/${job.id}`}
                                className="inline-flex items-center justify-center gap-1 px-4 py-2 bg-surface-primary text-text-primary hover:bg-brand-primary hover:text-white rounded-xl text-xs font-black transition-all"
                            >
                                التفاصيل
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-auto">
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-tighter">
                            <Clock className="w-3.5 h-3.5" />
                            نُشر {new Date(job.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}
                        </div>
                        <Link
                            to={`/jobs/${job.id}`}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-bg text-white hover:bg-brand-primary rounded-xl text-xs font-black transition-all duration-300 group/btn"
                        >
                            التفاصيل
                            <ChevronLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};
