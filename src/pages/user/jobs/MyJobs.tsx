import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { jobsService } from '../../../services/jobsService';
import { JobCard } from '../../../components/jobs/JobCard';
import { Briefcase, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { PageContainer } from '../../../components/shared/PageContainer';
import { PageHeader } from '../../../components/shared/PageHeader';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../lib/supabase';
import type { Job } from '../../../types';

export const MyJobs = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [applicantCounts, setApplicantCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchJobsAndCounts = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await jobsService.getMyJobs(user.id);
            if (error) throw new Error(error);

            const jobsList = data || [];
            setJobs(jobsList);

            if (jobsList.length > 0) {
                const jobIds = jobsList.map(j => j.id);
                const { data: appsData, error: appsError } = await supabase
                    .from('job_applications')
                    .select('job_id')
                    .in('job_id', jobIds);

                if (!appsError && appsData) {
                    const counts: Record<string, number> = {};
                    appsData.forEach(app => {
                        counts[app.job_id] = (counts[app.job_id] || 0) + 1;
                    });
                    setApplicantCounts(counts);
                }
            }
        } catch (error: any) {
            toast.error(error.message || 'حدث خطأ أثناء تحميل الوظائف');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobsAndCounts();
    }, [user]);

    const handleCloseJob = async (jobId: string) => {
        if (window.confirm('هل أنت متأكد من إغلاق التقديم لهذه الوظيفة؟ لا يمكن إعادة فتحها لاحقاً.')) {
            setActionLoading(jobId);
            try {
                const { error } = await jobsService.closeJob(jobId);
                if (error) throw new Error(error);
                toast.success('تم إغلاق التقديم بنجاح');
                setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'Closed' } : j));
            } catch (error: any) {
                toast.error(error.message || 'فشل إغلاق الوظيفة');
            } finally {
                setActionLoading(null);
            }
        }
    };

    const handleDeleteJob = async (jobId: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الوظيفة نهائياً؟ سيتم حذف جميع طلبات التقديم المرتبطة بها أيضاً.')) {
            setActionLoading(jobId);
            try {
                const { error } = await jobsService.deleteJob(jobId);
                if (error) throw new Error(error);
                toast.success('تم حذف الوظيفة بنجاح');
                setJobs(prev => prev.filter(j => j.id !== jobId));
            } catch (error: any) {
                toast.error(error.message || 'فشل حذف الوظيفة');
            } finally {
                setActionLoading(null);
            }
        }
    };

    return (
        <PageContainer maxWidth="lg">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8 animate-fade-in"
            >
                <PageHeader
                    title="إدارة وظائفي المعروضة"
                    description="تابع حالة الوظائف التي قمت بنشرها، واطلع على قائمة المتقدمين والطلبات الواردة."
                    icon={Briefcase}
                    actions={
                        <div className="w-full sm:w-auto font-black text-xs">
                            <Link
                                to="/jobs/create"
                                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-[var(--radius-button)] font-black text-xs hover:shadow-lg hover:shadow-brand-primary/20 transition-all w-full sm:w-auto"
                            >
                                <Plus className="w-4 h-4" />
                                <span>نشر وظيفة جديدة</span>
                            </Link>
                        </div>
                    }
                />

                {loading ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
                        <LoadingSpinner size="lg" />
                        <p className="text-text-muted font-bold">جاري تحميل وظائفك المعروضة...</p>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] border border-border-subtle p-12 text-center max-w-xl mx-auto shadow-xl shadow-slate-200/40">
                        <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Briefcase className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-2xl font-black text-text-primary mb-2">لم تقم بنشر أي وظائف بعد</h3>
                        <p className="text-sm font-bold text-text-muted mb-8 leading-relaxed">
                            هل تبحث عن كفاءات وخبرات زراعية جديدة لمشروعك؟ يمكنك البدء بنشر أول فرصة عمل الآن مجاناً!
                        </p>
                        <div className="font-black text-sm">
                            <Link
                                to="/jobs/create"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-brand-primary text-white rounded-2xl hover:bg-brand-primary-hover shadow-lg shadow-brand-primary/10 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                <span>انشر أول وظيفة الآن</span>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-text-primary">
                                إجمالي الوظائف المعروضة: <span className="text-brand-primary">{jobs.length}</span>
                            </h3>
                            <button
                                onClick={fetchJobsAndCounts}
                                className="p-2 hover:bg-slate-50 border border-slate-200 rounded-lg text-text-secondary transition-colors"
                                title="تحديث البيانات"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <AnimatePresence mode="popLayout">
                                {jobs.map(job => (
                                    <motion.div
                                        key={job.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <JobCard
                                            job={job}
                                            isOwner={true}
                                            applicantCount={applicantCounts[job.id] || 0}
                                            onViewApplicants={() => navigate(`/jobs/${job.id}/applicants`)}
                                            onClose={() => handleCloseJob(job.id)}
                                            onDelete={() => handleDeleteJob(job.id)}
                                            isActionLoading={actionLoading === job.id}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </motion.div>
        </PageContainer>
    );
};
