import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Briefcase, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Loader } from '../../components/ui/Loader';

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

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setJobs(data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            toast.error('حدث خطأ أثناء جلب الوظائف');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه الوظيفة؟')) return;

        try {
            const { error } = await supabase.from('jobs').delete().eq('id', id);
            if (error) throw error;

            toast.success('تم حذف الوظيفة بنجاح');
            setJobs(jobs.filter(j => j.id !== id));
        } catch (error) {
            console.error('Error deleting job:', error);
            toast.error('حدث خطأ أثناء الحذف');
        }
    };

    if (loading) {
        return <Loader fullHeight size={48} />;
    }

    return (
        <div dir="rtl">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                    <Briefcase className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-800">إدارة الوظائف</h1>
                    <p className="text-slate-500 text-sm font-medium">مراقبة الوظائف المعروضة في المنصة</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-600">
                            <tr>
                                <th className="px-6 py-4 font-bold">الوظيفة</th>
                                <th className="px-6 py-4 font-bold">نوع الدوام</th>
                                <th className="px-6 py-4 font-bold">الحالة</th>
                                <th className="px-6 py-4 font-bold">تاريخ النشر</th>
                                <th className="px-6 py-4 font-bold text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {jobs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                                        لا توجد وظائف حالياً
                                    </td>
                                </tr>
                            ) : (
                                jobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-800">{job.title}</td>
                                        <td className="px-6 py-4 text-slate-600">{job.job_type}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${job.status === 'Open' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {job.status === 'Open' ? 'مفتوحة' : 'مغلقة'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-sm">
                                            {new Date(job.created_at).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleDelete(job.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="حذف الوظيفة"
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
        </div>
    );
};
