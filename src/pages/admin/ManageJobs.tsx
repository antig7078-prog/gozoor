import { useEffect, useState } from 'react';
import { jobsService } from '../../services/jobsService';
import { Briefcase, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PageContainer } from '../../components/shared/PageContainer';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { PageHeader } from '../../components/shared/PageHeader';
import { ConfirmModal } from '../../components/shared/ConfirmModal';

interface Job {
    id: string;
    title: string;
    job_type: string;
    status: string;
    created_at: string;
}

export const ManageJobs = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; jobId: string | null; isLoading: boolean }>({
        isOpen: false,
        jobId: null,
        isLoading: false
    });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const { data, error } = await jobsService.getJobs();

            if (error) throw new Error(error);
            if (data) setJobs(data);
        } catch (error: any) {
            console.error('Error fetching jobs:', error);
            toast.error(error.message || 'حدث خطأ أثناء جلب الوظائف');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        setDeleteModal({ isOpen: true, jobId: id, isLoading: false });
    };

    const confirmDelete = async () => {
        if (!deleteModal.jobId) return;
        setDeleteModal(prev => ({ ...prev, isLoading: true }));
        try {
            const { error } = await jobsService.deleteJob(deleteModal.jobId);
            if (error) throw new Error(error);

            toast.success('تم حذف الوظيفة بنجاح');
            setJobs(jobs.filter(j => j.id !== deleteModal.jobId));
            setDeleteModal({ isOpen: false, jobId: null, isLoading: false });
        } catch (error: any) {
            console.error('Error deleting job:', error);
            toast.error(error.message || 'حدث خطأ أثناء الحذف');
            setDeleteModal(prev => ({ ...prev, isLoading: false }));
        }
    };

    if (loading) {
        return <LoadingSpinner fullPage message="جاري تحميل الوظائف..." />;
    }

    return (
        <PageContainer maxWidth="xl" noPadding>
            <PageHeader 
                title="إدارة الوظائف"
                description="مراقبة الوظائف المعروضة في المنصة"
                icon={Briefcase}
            />

            <div className="bg-white rounded-[var(--radius-card)] border border-border-default shadow-sm overflow-hidden">
                <div className="overflow-x-auto hide-scrollbar">
                    <table className="w-full text-right border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-surface-primary border-b border-border-default">
                                <th className="px-6 py-5 font-black text-text-primary">الوظيفة</th>
                                <th className="px-6 py-5 font-black text-text-primary">نوع الدوام</th>
                                <th className="px-6 py-5 font-black text-text-primary">الحالة</th>
                                <th className="px-6 py-5 font-black text-text-primary">تاريخ النشر</th>
                                <th className="px-6 py-5 font-black text-text-primary text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {jobs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-text-muted font-bold">
                                        لا توجد وظائف حالياً في المنصة
                                    </td>
                                </tr>
                            ) : (
                                jobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-brand-primary-light/10 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="font-black text-text-primary text-base md:text-lg">{job.title}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] md:text-xs font-black bg-slate-100 text-slate-700 whitespace-nowrap">
                                                {job.job_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] md:text-xs font-black whitespace-nowrap ${
                                                job.status === 'Open' 
                                                    ? 'bg-brand-primary-light text-brand-primary shadow-sm shadow-brand-primary/10' 
                                                    : 'bg-slate-100 text-text-secondary'
                                            }`}>
                                                {job.status === 'Open' ? 'مفتوحة' : 'مغلقة'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-bold text-text-secondary whitespace-nowrap">
                                            {new Date(job.created_at).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleDelete(job.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-[var(--radius-button)] transition-all"
                                                    title="حذف الوظيفة"
                                                    aria-label={`حذف الوظيفة ${job.title}`}
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, jobId: null, isLoading: false })}
                onConfirm={confirmDelete}
                isLoading={deleteModal.isLoading}
                title="حذف الوظيفة"
                message="هل أنت متأكد من حذف هذه الوظيفة؟ لا يمكن التراجع عن هذا الإجراء."
                confirmText="حذف الآن"
                cancelText="تراجع"
                type="danger"
            />
        </PageContainer>
    );
};
