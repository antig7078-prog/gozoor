import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Briefcase, Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';

interface Application {
    id: string;
    job_id: string;
    status: string;
    created_at: string;
    jobs: {
        title: string;
        employer_id: string;
        job_type: string;
        location: string;
    };
}

export const MyApplications = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplications = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('job_applications')
                    .select(`
                        id, status, created_at, job_id,
                        jobs ( title, employer_id, job_type, location )
                    `)
                    .eq('applicant_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                if (data) setApplications(data as any);
            } catch (error) {
                console.error('Error fetching applications:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, [user]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Pending': return <Clock className="w-5 h-5 text-amber-500" />;
            case 'Reviewed': return <FileText className="w-5 h-5 text-blue-500" />;
            case 'Accepted': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            case 'Rejected': return <XCircle className="w-5 h-5 text-red-500" />;
            default: return <Clock className="w-5 h-5 text-slate-500" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'Pending': return 'قيد المراجعة';
            case 'Reviewed': return 'تمت المشاهدة';
            case 'Accepted': return 'مقبول (سيتم التواصل معك)';
            case 'Rejected': return 'مرفوض';
            default: return status;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-8">
            <h1 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-3">
                <FileText className="w-8 h-8 text-emerald-600" />
                طلبات العمل الخاصة بي
            </h1>

            {applications.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
                    <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-700">لم تقم بالتقديم على أي وظائف بعد</h3>
                    <p className="text-slate-500 mt-2 mb-6">تصفح لوحة الوظائف وابحث عن الفرصة المناسبة لك.</p>
                    <Link to="/jobs" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors">
                        تصفح الوظائف
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {applications.map((app) => (
                        <div key={app.id} className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="bg-slate-50 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold border border-slate-100">
                                        {app.jobs?.job_type}
                                    </span>
                                    <span className="text-sm text-slate-500 font-medium">
                                        التقديم: {new Date(app.created_at).toLocaleDateString('ar-EG')}
                                    </span>
                                </div>
                                <h3 className="font-bold text-slate-800 text-xl mb-1">{app.jobs?.title || 'وظيفة غير معروفة'}</h3>
                                <p className="text-slate-500 text-sm font-medium">{app.jobs?.location || 'غير محدد'}</p>
                            </div>

                            <div className="flex items-center justify-between w-full md:w-auto gap-6 md:gap-12 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                                <div>
                                    <div className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">حالة الطلب</div>
                                    <div className={`flex items-center gap-2 font-bold ${app.status === 'Pending' ? 'text-amber-600' :
                                            app.status === 'Accepted' ? 'text-emerald-600' :
                                                app.status === 'Rejected' ? 'text-red-600' :
                                                    'text-blue-600'
                                        }`}>
                                        {getStatusIcon(app.status)}
                                        {getStatusText(app.status)}
                                    </div>
                                </div>

                                <Link
                                    to={`/jobs/${app.job_id}`}
                                    className="px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-colors"
                                >
                                    التفاصيل
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
