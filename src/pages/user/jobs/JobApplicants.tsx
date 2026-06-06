import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { jobsService } from '../../../services/jobsService';
import { messagingService } from '../../../services/messagingService';
import { ApplicantCard } from '../../../components/jobs/ApplicantCard';
import { Briefcase, ArrowRight, UserCheck, Search, Users, AlertCircle, RefreshCw } from 'lucide-react';
import { PageContainer } from '../../../components/shared/PageContainer';
import { PageHeader } from '../../../components/shared/PageHeader';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import type { Job } from '../../../types';

export const JobApplicants = () => {
    const { id: jobId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [job, setJob] = useState<Job | null>(null);
    const [applicants, setApplicants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingAppId, setUpdatingAppId] = useState<string | null>(null);
    
    // Filter by status tab: 'all' | 'Pending' | 'Reviewed' | 'Accepted' | 'Rejected'
    const [activeTab, setActiveTab] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = async () => {
        if (!jobId || !user) return;
        setLoading(true);
        try {
            // 1. Fetch job details to verify ownership
            const { data: jobData, error: jobError } = await jobsService.getJobById(jobId);
            if (jobError) throw new Error(jobError);
            if (!jobData) throw new Error('الوظيفة غير موجودة');

            // Check if current user is the owner or an admin
            const isOwner = jobData.employer_id === user.id;
            const isAdmin = user.role === 'admin';
            
            if (!isOwner && !isAdmin) {
                toast.error('غير مصرح لك بعرض المتقدمين لهذه الوظيفة');
                navigate('/my-jobs');
                return;
            }

            setJob(jobData);

            // 2. Fetch applicants
            const { data: appsData, error: appsError } = await jobsService.getApplicants(jobId);
            if (appsError) throw new Error(appsError);
            setApplicants(appsData || []);
        } catch (error: any) {
            toast.error(error.message || 'حدث خطأ أثناء تحميل البيانات');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [jobId, user]);

    const handleUpdateStatus = async (applicationId: string, status: 'Reviewed' | 'Accepted' | 'Rejected') => {
        setUpdatingAppId(applicationId);
        try {
            const { error } = await jobsService.updateApplicationStatus(applicationId, status);
            if (error) throw new Error(error);
            
            toast.success('تم تحديث حالة الطلب بنجاح');
            setApplicants(prev => prev.map(app => 
                app.id === applicationId ? { ...app, status } : app
            ));
        } catch (error: any) {
            toast.error(error.message || 'حدث خطأ أثناء تحديث الحالة');
        } finally {
            setUpdatingAppId(null);
        }
    };

    const handleStartChat = async (applicantId: string, applicantName: string) => {
        if (!jobId || !job) return;
        
        const loadingToast = toast.loading('جاري بدء المحادثة مع المتقدم...');
        try {
            const { data, error } = await messagingService.startConversation({
                participantId: applicantId,
                contextType: 'job',
                contextId: jobId
            });

            if (error) throw new Error(error);
            
            toast.dismiss(loadingToast);
            toast.success(`تم بدء محادثة مع ${applicantName}`);
            
            // Redirect to conversations/messages
            if (data?.id) {
                navigate(`/messages?conversationId=${data.id}`);
            } else {
                navigate('/messages');
            }
        } catch (error: any) {
            toast.dismiss(loadingToast);
            toast.error(error.message || 'فشل بدء المحادثة');
            console.error(error);
        }
    };

    // Filter applicants list by tab status and search query (matches applicant name or cover letter)
    const filteredApplicants = applicants.filter(app => {
        const profile = app.applicant || {};
        const fullName = (profile.full_name || '').toLowerCase();
        const coverLetter = (app.cover_letter || '').toLowerCase();
        const query = searchQuery.toLowerCase();

        const matchesSearch = fullName.includes(query) || coverLetter.includes(query);
        const matchesTab = activeTab === 'all' || app.status === activeTab;

        return matchesSearch && matchesTab;
    });

    // Counts for tabs
    const counts = {
        all: applicants.length,
        Pending: applicants.filter(a => a.status === 'Pending').length,
        Reviewed: applicants.filter(a => a.status === 'Reviewed').length,
        Accepted: applicants.filter(a => a.status === 'Accepted').length,
        Rejected: applicants.filter(a => a.status === 'Rejected').length,
    };

    return (
        <PageContainer maxWidth="lg">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8 animate-fade-in"
            >
                <PageHeader
                    title={job ? `المتقدمون لوظيفة: ${job.title}` : 'المتقدمون للوظيفة'}
                    description={job ? `إدارة ومراجعة طلبات التوظيف المقدمة لـ ${job.company_name}` : 'إدارة ومراجعة طلبات التوظيف.'}
                    icon={Users}
                    actions={
                        <div className="w-full sm:w-auto font-black text-xs">
                            <Link
                                to="/my-jobs"
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-border-default text-text-secondary rounded-[var(--radius-button)] hover:bg-slate-50 transition-all shadow-sm w-full sm:w-auto"
                            >
                                <ArrowRight className="w-4 h-4" />
                                <span>الرجوع لإدارة وظائفي</span>
                            </Link>
                        </div>
                    }
                />

                {loading ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
                        <LoadingSpinner size="lg" />
                        <p className="text-text-muted font-bold">جاري تحميل طلبات التوظيف...</p>
                    </div>
                ) : applicants.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] border border-border-subtle p-12 text-center max-w-xl mx-auto shadow-xl shadow-slate-200/40">
                        <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-2xl font-black text-text-primary mb-2">لا يوجد متقدمون بعد</h3>
                        <p className="text-sm font-bold text-text-muted leading-relaxed">
                            لم يتقدم أي شخص لهذه الوظيفة حتى الآن. بمجرد أن يقوم الباحثون عن عمل بإرسال سيرهم الذاتية، ستظهر ملفاتهم هنا.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        
                        {/* Search and Tabs controls */}
                        <div className="bg-white border border-border-subtle rounded-3xl p-4 sm:p-6 shadow-md shadow-slate-100/40 space-y-4">
                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
                                
                                {/* Search input */}
                                <div className="relative w-full sm:max-w-md">
                                    <input
                                        type="text"
                                        placeholder="ابحث عن متقدم بالاسم أو المحتوى..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-6 pr-12 py-3 bg-surface-primary border border-border-subtle rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-sm text-text-primary"
                                    />
                                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                </div>

                                <button
                                    onClick={fetchData}
                                    className="p-2.5 hover:bg-slate-50 border border-slate-200 rounded-xl text-text-secondary transition-colors shrink-0 flex items-center gap-2 text-xs font-black"
                                    title="تحديث البيانات"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    تحديث
                                </button>
                            </div>

                            {/* Status Filter Tabs */}
                            <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                                <button
                                    onClick={() => setActiveTab('all')}
                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'all' ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/10' : 'bg-slate-50 hover:bg-slate-100 text-text-secondary border border-slate-200/60'}`}
                                >
                                    الكل ({counts.all})
                                </button>
                                <button
                                    onClick={() => setActiveTab('Pending')}
                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'Pending' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/10' : 'bg-amber-50/70 hover:bg-amber-100/70 text-amber-700 border border-amber-200/50'}`}
                                >
                                    قيد الانتظار ({counts.Pending})
                                </button>
                                <button
                                    onClick={() => setActiveTab('Reviewed')}
                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'Reviewed' ? 'bg-blue-500 text-white shadow-md shadow-blue-500/10' : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/50'}`}
                                >
                                    تمت المراجعة ({counts.Reviewed})
                                </button>
                                <button
                                    onClick={() => setActiveTab('Accepted')}
                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'Accepted' ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/10' : 'bg-brand-primary/10 hover:bg-brand-primary/15 text-brand-primary border border-brand-primary/20'}`}
                                >
                                    مقبول ({counts.Accepted})
                                </button>
                                <button
                                    onClick={() => setActiveTab('Rejected')}
                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'Rejected' ? 'bg-red-500 text-white shadow-md shadow-red-500/10' : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/50'}`}
                                >
                                    مرفوض ({counts.Rejected})
                                </button>
                            </div>
                        </div>

                        {/* Applicants List */}
                        {filteredApplicants.length === 0 ? (
                            <div className="bg-white rounded-[2.5rem] border border-border-subtle p-12 text-center shadow-md">
                                <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-4" />
                                <p className="text-sm font-bold text-text-muted">لا توجد طلبات مطابقة لخيارات التصفية الحالية.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                <AnimatePresence mode="popLayout">
                                    {filteredApplicants.map(app => (
                                        <motion.div
                                            key={app.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ApplicantCard
                                                application={{
                                                    ...app,
                                                    profiles: app.applicant // Map 'applicant' profiles to 'profiles' to match ApplicantCard expected props
                                                }}
                                                onUpdateStatus={(status) => handleUpdateStatus(app.id, status)}
                                                onMessage={() => handleStartChat(app.applicant_id, app.applicant?.full_name || 'المتقدم')}
                                                isUpdating={updatingAppId === app.id}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </PageContainer>
    );
};
