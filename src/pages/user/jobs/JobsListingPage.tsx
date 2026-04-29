import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Search, MapPin, DollarSign, Clock, Filter, ArrowLeft, Sparkles, Building2, Zap, ChevronLeft } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { PageContainer } from '../../../components/shared/PageContainer';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { PageHeader } from '../../../components/shared/PageHeader';

interface Job {
    id: string;
    title: string;
    description: string;
    requirements: string;
    salary_range: string;
    location: string;
    job_type: string;
    created_at: string;
    company_name?: string;
}

export const JobsListingPage = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const { data, error } = await supabase
                    .from('jobs')
                    .select('*')
                    .eq('status', 'Open')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                if (data) setJobs(data);
            } catch (error) {
                console.error('Error fetching jobs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    const filteredJobs = jobs.filter(j =>
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (j.description && j.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) {
        return <LoadingSpinner fullPage message="جاري البحث عن وظائف تناسب طموحاتك..." />;
    }

    return (
        <PageContainer maxWidth="xl">
            <PageHeader 
                badge={
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-black tracking-widest uppercase">
                        <Sparkles className="w-3 h-3" />
                        بوابتك لمستقبل مهني مشرق
                    </div>
                }
                title={
                    <>فرص العمل <span className="text-brand-primary">والوظائف</span></>
                }
                description="اكتشف فرصاً جديدة للنمو والتميز في مسارك المهني مع نخبة الشركات الزراعية."
                actions={
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-[400px] group">
                            <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-brand-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="ابحث عن المسمى الوظيفي..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pr-14 pl-6 py-5 bg-white border border-border-subtle rounded-3xl focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary outline-none transition-all shadow-xl shadow-slate-200/50 font-bold text-slate-700 placeholder:text-slate-300"
                            />
                        </div>
                        <button className="p-5 bg-white border border-border-subtle text-text-secondary rounded-2xl hover:bg-surface-primary transition-all shadow-lg shadow-slate-200/50 group">
                            <Filter className="w-6 h-6 group-hover:text-brand-primary transition-colors" />
                        </button>
                    </div>
                }
            />

            <AnimatePresence mode="wait">
                {filteredJobs.length > 0 ? (
                    <motion.div 
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-20"
                    >
                        {filteredJobs.map((job, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                key={job.id}
                                className="bg-white rounded-[2.5rem] sm:rounded-[40px] border border-border-subtle p-6 sm:p-8 lg:p-10 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-brand-primary/10 hover:border-brand-primary/20 hover:-translate-y-2 transition-all duration-500 group flex flex-col relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-surface-primary rounded-bl-[80px] -z-0 group-hover:bg-brand-primary/5 transition-colors duration-500" />
                                
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-6 sm:mb-8">
                                        <div className="p-3 sm:p-4 bg-surface-primary rounded-2xl sm:rounded-3xl group-hover:bg-brand-primary group-hover:text-white transition-all duration-500 group-hover:scale-110 shadow-inner">
                                            <Briefcase className="w-6 h-6 sm:w-7 sm:h-7 text-brand-primary group-hover:text-white" />
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="bg-white/80 backdrop-blur-md border border-border-subtle text-text-muted px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                                                {job.job_type}
                                            </span>
                                            {index === 0 && (
                                                <div className="flex items-center gap-1 text-[10px] font-black text-amber-500 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-tighter">
                                                    <Zap className="w-3 h-3 fill-amber-500" />
                                                    عاجل
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-black text-text-primary text-xl sm:text-2xl mb-3 sm:mb-4 line-clamp-1 group-hover:text-brand-primary transition-colors duration-300">
                                            {job.title}
                                        </h3>

                                        <div className="flex items-center gap-2 mb-6 text-text-muted font-bold text-sm">
                                            <Building2 className="w-4 h-4" />
                                            {job.company_name || 'شركة زراعية رائدة'}
                                        </div>

                                        <p className="text-text-secondary text-sm sm:text-base mb-8 sm:mb-10 line-clamp-2 leading-relaxed font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                                            {job.description || 'لا يوجد وصف متاح لهذه الوظيفة حالياً. تواصل معنا للمزيد من التفاصيل.'}
                                        </p>

                                        <div className="space-y-5 mb-10">
                                            <div className="flex items-center gap-4 text-sm text-slate-700 font-black group/item">
                                                <div className="w-10 h-10 rounded-2xl bg-surface-primary flex items-center justify-center group-hover/item:bg-brand-primary-light/20 transition-colors shadow-sm">
                                                    <MapPin className="w-5 h-5 text-brand-primary" />
                                                </div>
                                                {job.location || 'غير محدد'}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-slate-700 font-black group/item">
                                                <div className="w-10 h-10 rounded-2xl bg-surface-primary flex items-center justify-center group-hover/item:bg-brand-primary-light/20 transition-colors shadow-sm">
                                                    <DollarSign className="w-5 h-5 text-brand-primary" />
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span>{job.salary_range || 'حسب الاتفاق'}</span>
                                                    {!job.salary_range?.includes('ج.م') && job.salary_range && <span className="text-[10px] uppercase">ج.م</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-slate-50 pt-8 mt-auto">
                                        <div className="flex items-center gap-2 text-slate-300 font-black text-[10px] uppercase tracking-tighter">
                                            <Clock className="w-4 h-4" />
                                            نُشر {new Date(job.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}
                                        </div>
                                        <Link
                                            to={`/jobs/${job.id}`}
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-bg text-white hover:bg-brand-primary rounded-2xl text-xs font-black transition-all duration-300 group/btn"
                                        >
                                            التفاصيل
                                            <ChevronLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-24 bg-white rounded-[40px] border border-border-subtle shadow-2xl shadow-slate-200/50 max-w-2xl mx-auto mt-12 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-surface-primary rounded-bl-full" />
                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-surface-primary rounded-[30px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <Briefcase className="w-12 h-12 text-slate-200" />
                            </div>
                            <h3 className="text-3xl font-black text-text-primary mb-4">لا يوجد وظائف متاحة</h3>
                            <p className="text-text-secondary font-bold text-lg max-w-sm mx-auto leading-relaxed">نعتذر، لم يتم العثور على أي وظائف تطابق بحثك حالياً. يرجى المحاولة بكلمات مفتاحية مختلفة.</p>
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="mt-10 px-10 py-4 bg-brand-primary text-white rounded-2xl font-black shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                عرض كل الوظائف
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </PageContainer>
    );
};




