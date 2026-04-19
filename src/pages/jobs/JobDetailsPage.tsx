import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Briefcase, ArrowRight, MapPin, DollarSign, Clock, Send, FileText, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface Job {
    id: string;
    employer_id: string;
    title: string;
    description: string;
    requirements: string;
    salary_range: string;
    location: string;
    job_type: string;
    created_at: string;
}

export const JobDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [showApplyForm, setShowApplyForm] = useState(false);

    const [applyForm, setApplyForm] = useState({
        resume_url: '',
        cover_letter: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);

    useEffect(() => {
        const fetchJobAndApplicationStatus = async () => {
            if (!id) return;
            try {
                // Fetch Job
                const { data: jobData, error: jobError } = await supabase
                    .from('jobs')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (jobError) throw jobError;
                setJob(jobData);

                // Check if already applied
                if (user) {
                    const { data: appData, error: appError } = await supabase
                        .from('job_applications')
                        .select('id')
                        .eq('job_id', id)
                        .eq('applicant_id', user.id)
                        .maybeSingle();

                    if (appError) throw appError;
                    if (appData) setHasApplied(true);
                }

            } catch (error) {
                console.error('Error fetching job details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobAndApplicationStatus();
    }, [id, user]);

    const handleSubmitApplication = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error('يرجى تسجيل الدخول أولاً للتقديم');
            navigate('/login');
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase.from('job_applications').insert([{
                job_id: id,
                applicant_id: user.id,
                resume_url: applyForm.resume_url,
                cover_letter: applyForm.cover_letter
            }]);

            if (error) throw error;
            toast.success('تم تقديم طلب التوظيف بنجاح!');
            setHasApplied(true);
            setShowApplyForm(false);
        } catch (error: any) {
            toast.error('حدث خطأ أثناء التقديم');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-32">
                <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="text-center py-32">
                <h2 className="text-2xl font-bold text-slate-700">لم يتم العثور على الوظيفة</h2>
                <Link to="/jobs" className="text-emerald-600 hover:underline mt-4 inline-block">العودة لقائمة الوظائف</Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <Link to="/jobs" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-medium mb-8 transition-colors">
                <ArrowRight className="w-5 h-5" />
                العودة للوظائف
            </Link>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                <div className="p-8 border-b border-slate-100 bg-slate-50 relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 text-slate-100 opacity-50 pointer-events-none transform rotate-12">
                        <Briefcase className="w-48 h-48" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-white text-emerald-600 px-4 py-1.5 rounded-full text-sm font-bold border border-emerald-100 shadow-sm">
                                    {job.job_type}
                                </span>
                                <span className="text-sm text-slate-500 font-medium">
                                    نُشرت بتاريخ: {new Date(job.created_at).toLocaleDateString('ar-EG')}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">{job.title}</h1>
                            <div className="flex flex-wrap gap-6 text-sm font-bold text-slate-600">
                                <div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-slate-400" /> {job.location || 'العمل عن بعد / غير محدد'}</div>
                                <div className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-slate-400" /> {job.salary_range || 'يعتمد على الخبرة'}</div>
                                <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-slate-400" /> دوام كامل</div>
                            </div>
                        </div>

                        <div className="w-full md:w-auto shrink-0 mt-4 md:mt-0">
                            {hasApplied ? (
                                <div className="flex items-center justify-center gap-2 px-8 py-4 bg-emerald-50 text-emerald-600 font-bold rounded-xl border border-emerald-100">
                                    <CheckCircle2 className="w-5 h-5" />
                                    لقد قمت بالتقديم
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowApplyForm(!showApplyForm)}
                                    className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95"
                                >
                                    <Send className="w-5 h-5" />
                                    قدم الآن
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 mb-4">وصف الوظيفة</h3>
                        <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                            {job.description || 'لا يوجد وصف تفصيلي.'}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-black text-slate-800 mb-4">المتطلبات</h3>
                        <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            {job.requirements || 'لا توجد متطلبات محددة.'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Apply Form Section */}
            {showApplyForm && !hasApplied && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden mb-8" id="apply-form">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                        <FileText className="w-6 h-6 text-emerald-600" />
                        <h2 className="text-xl font-black text-slate-800">نموذج التقديم</h2>
                    </div>
                    <form onSubmit={handleSubmitApplication} className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">رابط السيرة الذاتية (URL) <span className="text-red-500">*</span></label>
                            <input
                                type="url"
                                required
                                value={applyForm.resume_url}
                                onChange={(e) => setApplyForm({ ...applyForm, resume_url: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                placeholder="https://drive.google.com/... أو رابط حسابك على لينكدإن"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">رسالة تعريفية (Cover Letter)</label>
                            <textarea
                                rows={5}
                                value={applyForm.cover_letter}
                                onChange={(e) => setApplyForm({ ...applyForm, cover_letter: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                                placeholder="تحدث باختصار عن مؤهلاتك ولماذا أنت الأنسب لهذه الوظيفة..."
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setShowApplyForm(false)}
                                className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                            >
                                {isSubmitting ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <Send className="w-5 h-5" />}
                                إرسال الطلب
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};
