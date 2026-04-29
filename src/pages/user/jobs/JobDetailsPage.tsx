import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, MapPin, DollarSign, Clock, Send, FileText, CheckCircle2, ChevronRight, Building2, Sparkles, Zap, ChevronLeft, Calendar } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { toast } from 'react-hot-toast';
import { PageContainer } from '../../../components/shared/PageContainer';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';

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
    company_name?: string;
}

export const JobDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const requireAuth = useRequireAuth();

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
                const { data: jobData, error: jobError } = await supabase
                    .from('jobs')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (jobError) throw jobError;
                setJob(jobData);

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
        if (!requireAuth('سجّل دخولك الأول عشان تقدر تقدم على الوظيفة دي 💼')) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase.from('job_applications').insert([{
                job_id: id,
                applicant_id: user?.id,
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
        return <LoadingSpinner fullPage message="جاري تحميل تفاصيل الوظيفة..." />;
    }

    if (!job) {
        return (
            <PageContainer>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-32 bg-white rounded-[40px] border border-border-subtle shadow-2xl shadow-slate-200/50 max-w-2xl mx-auto"
                >
                    <div className="w-24 h-24 bg-surface-primary rounded-[30px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <Briefcase className="w-12 h-12 text-slate-200" />
                    </div>
                    <h2 className="text-3xl font-black text-text-primary mb-4">لم يتم العثور على الوظيفة</h2>
                    <p className="text-text-secondary mb-10 font-bold text-lg leading-relaxed">ربما تم حذف هذه الوظيفة أو أنها لم تعد متاحة حالياً.</p>
                    <Link 
                        to="/jobs" 
                        className="inline-flex items-center gap-3 px-10 py-5 bg-brand-primary text-white rounded-2xl font-black shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <ChevronRight className="w-5 h-5" />
                        العودة لقائمة الوظائف
                    </Link>
                </motion.div>
            </PageContainer>
        );
    }

    return (
        <PageContainer maxWidth="md">
            {/* Breadcrumb / Back Link */}
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 sm:mb-10"
            >
                <Link to="/jobs" className="inline-flex items-center gap-2 text-text-muted hover:text-brand-primary font-black transition-all group">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white border border-border-subtle flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all shadow-sm">
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-sm sm:text-base">العودة للوظائف المتاحة</span>
                </Link>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2rem] sm:rounded-[40px] border border-border-subtle shadow-2xl shadow-slate-200/40 overflow-hidden relative"
                    >
                        {/* Hero Header */}
                        <div className="relative p-6 sm:p-10 md:p-14 bg-surface-primary/50 border-b border-border-subtle overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="relative z-10">
                                <div className="flex flex-wrap items-center gap-3 mb-8">
                                    <span className="bg-brand-primary text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20">
                                        {job.job_type}
                                    </span>
                                    <div className="flex items-center gap-2 text-text-muted text-[10px] font-black uppercase tracking-widest bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-border-subtle">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(job.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}
                                    </div>
                                </div>

                                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-text-primary leading-tight mb-6 sm:mb-8">
                                    {job.title}
                                </h1>

                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white border border-border-subtle shadow-sm flex items-center justify-center text-brand-primary">
                                        <Building2 className="w-6 h-6 sm:w-8 sm:h-8" />
                                    </div>
                                    <div>
                                        <div className="text-text-muted text-[10px] font-black uppercase tracking-widest mb-0.5 sm:mb-1">الشركة المُعلنة</div>
                                        <div className="text-text-primary font-black text-lg sm:text-xl">{job.company_name || 'شركة زراعية رائدة'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-6 sm:p-10 md:p-14 space-y-10 sm:space-y-14">
                            <section>
                                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                                    <div className="w-1.5 h-8 sm:w-2 sm:h-10 bg-brand-primary rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                                    <h3 className="text-xl sm:text-2xl font-black text-text-primary">وصف الدور الوظيفي</h3>
                                </div>
                                <div className="text-text-secondary text-base sm:text-lg leading-relaxed whitespace-pre-wrap font-bold bg-surface-primary/30 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-50 relative overflow-hidden">
                                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl" />
                                    {job.description || 'لا يوجد وصف تفصيلي متاح لهذه الوظيفة حالياً.'}
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                                    <div className="w-1.5 h-8 sm:w-2 sm:h-10 bg-brand-primary rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                                    <h3 className="text-xl sm:text-2xl font-black text-text-primary">المتطلبات والمهارات المطلوبة</h3>
                                </div>
                                <div className="text-text-secondary text-base sm:text-lg leading-relaxed whitespace-pre-wrap bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-dashed border-border-subtle font-bold relative group">
                                    <div className="absolute top-6 left-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-brand-primary" />
                                    </div>
                                    {job.requirements || 'لم يتم تحديد متطلبات خاصة لهذه الوظيفة.'}
                                </div>
                            </section>
                        </div>
                    </motion.div>

                    {/* Apply Form Section */}
                    <AnimatePresence>
                        {showApplyForm && !hasApplied && (
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 30 }}
                                className="bg-white rounded-[40px] border-2 border-brand-primary/20 shadow-2xl shadow-brand-primary/10 overflow-hidden relative" 
                                id="apply-form"
                            >
                                <div className="p-6 sm:p-10 border-b border-slate-50 bg-brand-primary/[0.02] flex items-center gap-4 sm:gap-6">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand-primary rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/30">
                                        <Send className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-black text-text-primary">قدم الآن لهذه الوظيفة</h2>
                                        <p className="text-text-secondary text-sm sm:text-base font-bold">املأ بياناتك وسنتواصل معك في أقرب وقت</p>
                                    </div>
                                </div>
                                <form onSubmit={handleSubmitApplication} className="p-6 sm:p-10 md:p-14 space-y-8 sm:space-y-10">
                                    <div className="space-y-4">
                                        <label className="text-sm font-black text-text-primary block pr-2">رابط السيرة الذاتية (Google Drive / Dropbox) <span className="text-brand-primary">*</span></label>
                                        <div className="relative group">
                                            <FileText className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-brand-primary transition-colors" />
                                            <input
                                                type="url"
                                                required
                                                value={applyForm.resume_url}
                                                onChange={(e) => setApplyForm({ ...applyForm, resume_url: e.target.value })}
                                                className="w-full pr-16 pl-6 py-5 bg-surface-primary border border-border-subtle rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary outline-none transition-all font-bold placeholder:text-slate-300 shadow-inner"
                                                placeholder="https://drive.google.com/..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-sm font-black text-text-primary block pr-2">رسالة تعريفية إضافية</label>
                                        <textarea
                                            rows={6}
                                            value={applyForm.cover_letter}
                                            onChange={(e) => setApplyForm({ ...applyForm, cover_letter: e.target.value })}
                                            className="w-full px-6 py-5 bg-surface-primary border border-border-subtle rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary outline-none transition-all resize-none font-bold placeholder:text-slate-300 shadow-inner"
                                            placeholder="أخبرنا عن مهاراتك ولماذا أنت المرشح المثالي لهذه الوظيفة..."
                                        />
                                    </div>

                                    <div className="flex flex-col md:flex-row justify-end gap-5 pt-10 border-t border-slate-50">
                                        <button
                                            type="button"
                                            onClick={() => setShowApplyForm(false)}
                                            className="px-10 py-5 bg-slate-100 text-text-secondary rounded-2xl font-black hover:bg-slate-200 transition-all active:scale-95"
                                        >
                                            إلغاء
                                        </button>
                                        <Button
                                            type="submit"
                                            isLoading={isSubmitting}
                                            variant="premium"
                                            size="lg"
                                            fullWidth
                                            icon={Zap}
                                        >
                                            إرسال الطلب الآن
                                        </Button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sidebar Details */}
                <div className="space-y-10">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-[2rem] sm:rounded-[40px] border border-border-subtle p-6 sm:p-10 shadow-2xl shadow-slate-200/40 space-y-8 sm:space-y-10 lg:sticky lg:top-32"
                    >
                        <div className="space-y-6">
                            <h4 className="text-lg font-black text-text-primary flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-brand-primary" />
                                تفاصيل الوظيفة
                            </h4>
                            
                            <div className="space-y-6">
                                <div className="flex items-start gap-5 group">
                                    <div className="w-12 h-12 rounded-2xl bg-surface-primary flex items-center justify-center shrink-0 group-hover:bg-brand-primary/10 transition-colors shadow-inner">
                                        <MapPin className="w-6 h-6 text-brand-primary" />
                                    </div>
                                    <div>
                                        <div className="text-text-muted text-[10px] font-black uppercase tracking-widest mb-1">الموقع</div>
                                        <div className="text-text-primary font-black">{job.location || 'غير محدد'}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-5 group">
                                    <div className="w-12 h-12 rounded-2xl bg-surface-primary flex items-center justify-center shrink-0 group-hover:bg-brand-primary/10 transition-colors shadow-inner">
                                        <DollarSign className="w-6 h-6 text-brand-primary" />
                                    </div>
                                    <div>
                                        <div className="text-text-muted text-[10px] font-black uppercase tracking-widest mb-1">الراتب المتوقع</div>
                                        <div className="text-text-primary font-black">{job.salary_range || 'حسب الخبرة'}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-5 group">
                                    <div className="w-12 h-12 rounded-2xl bg-surface-primary flex items-center justify-center shrink-0 group-hover:bg-brand-primary/10 transition-colors shadow-inner">
                                        <Clock className="w-6 h-6 text-brand-primary" />
                                    </div>
                                    <div>
                                        <div className="text-text-muted text-[10px] font-black uppercase tracking-widest mb-1">نوع العقد</div>
                                        <div className="text-text-primary font-black">{job.job_type}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-10 border-t border-slate-50">
                            {hasApplied ? (
                                <div className="w-full flex items-center justify-center gap-3 py-5 bg-surface-primary text-brand-primary font-black rounded-3xl border border-brand-primary/20">
                                    <CheckCircle2 className="w-6 h-6" />
                                    تم تقديم طلبك بنجاح
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        if (!requireAuth('سجّل دخولك الأول عشان تقدر تقدم على الوظيفة دي 💼')) return;
                                        setShowApplyForm(true);
                                        setTimeout(() => document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
                                    }}
                                    className="w-full flex items-center justify-center gap-3 py-5 bg-brand-primary text-white font-black rounded-3xl shadow-xl shadow-brand-primary/20 hover:bg-brand-bg hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    تقدم للوظيفة الآن
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </motion.div>

                    {/* Quick Stats / Info */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-brand-bg rounded-[2rem] sm:rounded-[40px] p-6 sm:p-10 text-white relative overflow-hidden group shadow-2xl"
                    >
                        <div className="absolute -top-10 -left-10 w-32 h-32 bg-brand-primary/20 rounded-full blur-2xl group-hover:bg-brand-primary/30 transition-colors" />
                        <div className="relative z-10 space-y-6">
                            <h4 className="font-black text-xl mb-2 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-brand-primary" />
                                نصيحة جذور
                            </h4>
                            <p className="text-text-muted font-bold leading-relaxed text-sm">
                                الشركات تفضل المتقدمين الذين لديهم سير ذاتية محدثة وواضحة. تأكد من أن الرابط الذي تقدمه يعمل بشكل صحيح ومفتوح للجميع.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </PageContainer>
    );
};




