import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { Briefcase, Clock, CheckCircle2, XCircle, FileText, ChevronLeft, MapPin, Sparkles, Zap, Search, Building2 } from 'lucide-react';
import { PageContainer } from '../../../components/shared/PageContainer';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { PageHeader } from '../../../components/shared/PageHeader';

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
        company_name?: string;
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
                        jobs ( title, employer_id, job_type, location, company_name )
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

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Pending': return { 
                icon: <Clock className="w-4 h-4" />, 
                text: 'قيد المراجعة', 
                classes: 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/50' 
            };
            case 'Reviewed': return { 
                icon: <Search className="w-4 h-4" />, 
                text: 'تمت المشاهدة', 
                classes: 'bg-blue-50 text-blue-600 border-blue-100 shadow-blue-100/50' 
            };
            case 'Accepted': return { 
                icon: <CheckCircle2 className="w-4 h-4" />, 
                text: 'مقبول (سيتم التواصل)', 
                classes: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20 shadow-brand-primary/10' 
            };
            case 'Rejected': return { 
                icon: <XCircle className="w-4 h-4" />, 
                text: 'تم الرفض', 
                classes: 'bg-red-50 text-red-600 border-red-100 shadow-red-100/50' 
            };
            default: return { 
                icon: <Clock className="w-4 h-4" />, 
                text: status, 
                classes: 'bg-surface-primary text-text-secondary border-border-subtle' 
            };
        }
    };

    if (loading) {
        return <LoadingSpinner fullPage message="جاري تحميل طلبات التوظيف الخاصة بك..." />;
    }

    return (
        <PageContainer maxWidth="md">
            <PageHeader 
                badge={
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-black tracking-widest uppercase">
                        <Sparkles className="w-3 h-3" />
                        مركز التوظيف الشخصي
                    </div>
                }
                title={
                    <>تتبع طلبات <span className="text-brand-primary">التوظيف</span></>
                }
                description="تابع حالة طلباتك وتواصل مع الشركات الزراعية التي تقدمت إليها."
                actions={
                    <div className="flex items-center gap-4 bg-white p-2 rounded-3xl border border-border-subtle shadow-xl shadow-slate-200/50">
                        <div className="flex -space-x-3 rtl:space-x-reverse p-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                                    <div className="w-full h-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                                        <Briefcase className="w-4 h-4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="pl-6 pr-2">
                            <div className="text-[10px] font-black text-text-muted uppercase tracking-widest">إجمالي الطلبات</div>
                            <div className="text-xl font-black text-text-primary">{applications.length} طلب</div>
                        </div>
                    </div>
                }
            />

            <AnimatePresence mode="wait">
                {applications.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-24 bg-white rounded-[40px] border border-border-subtle shadow-2xl shadow-slate-200/50 max-w-2xl mx-auto mt-12 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-surface-primary rounded-bl-full" />
                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-surface-primary rounded-[30px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <FileText className="w-12 h-12 text-slate-200" />
                            </div>
                            <h3 className="text-3xl font-black text-text-primary mb-4">لا يوجد طلبات حالياً</h3>
                            <p className="text-text-secondary font-bold text-lg max-w-sm mx-auto leading-relaxed mb-10">لم تقم بالتقديم على أي وظائف بعد. ابدأ رحلتك المهنية الآن واكتشف الفرص المتاحة.</p>
                            <Link 
                                to="/jobs" 
                                className="inline-flex items-center gap-3 px-10 py-4 bg-brand-primary text-white rounded-2xl font-black shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                <Zap className="w-5 h-5 fill-white" />
                                تصفح الوظائف المتاحة
                            </Link>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        layout
                        className="grid gap-6 mb-20"
                    >
                        {applications.map((app, index) => {
                            const status = getStatusStyles(app.status);
                            return (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    key={app.id} 
                                    className="bg-white rounded-[40px] border border-border-subtle p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-brand-primary/5 hover:border-brand-primary/10 transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-2 h-full bg-brand-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    
                                    <div className="flex-1 flex gap-6 items-center">
                                        <div className="hidden md:flex w-16 h-16 rounded-2xl bg-surface-primary items-center justify-center shrink-0 shadow-inner group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
                                            <Briefcase className="w-8 h-8 text-brand-primary group-hover:text-white" />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <span className="bg-surface-primary text-text-muted px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-border-subtle">
                                                    {app.jobs?.job_type}
                                                </span>
                                                <div className="flex items-center gap-2 text-[10px] text-slate-300 font-black uppercase tracking-tighter">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    قُدم {new Date(app.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <h3 className="font-black text-text-primary text-2xl mb-1 group-hover:text-brand-primary transition-colors duration-300">
                                                    {app.jobs?.title || 'وظيفة غير معروفة'}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-4 text-text-secondary text-sm font-bold opacity-80">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="w-4 h-4 text-brand-primary" />
                                                        {app.jobs?.company_name || 'شركة زراعية رائدة'}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-brand-primary" />
                                                        {app.jobs?.location || 'غير محدد'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-8 w-full md:w-auto pt-6 md:pt-0 border-t md:border-t-0 border-slate-50">
                                        <div className="space-y-2 text-right md:text-left">
                                            <div className="text-[10px] text-slate-300 font-black uppercase tracking-widest mr-1">حالة الطلب</div>
                                            <div className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border text-xs font-black shadow-sm transition-all ${status.classes}`}>
                                                {status.icon}
                                                {status.text}
                                            </div>
                                        </div>

                                        <Link
                                            to={`/jobs/${app.job_id}`}
                                            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-brand-bg text-white rounded-2xl font-black hover:bg-brand-primary transition-all shadow-xl shadow-slate-200 group/btn active:scale-95"
                                        >
                                            التفاصيل
                                            <ChevronLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </PageContainer>
    );
};




