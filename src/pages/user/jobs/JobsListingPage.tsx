import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Search, Filter, Sparkles, AlertCircle, RefreshCw, Plus } from 'lucide-react';
import { jobsService } from '../../../services/jobsService';
import { JobFilters } from '../../../components/jobs/JobFilters';
import { JobCard } from '../../../components/jobs/JobCard';
import { PageContainer } from '../../../components/shared/PageContainer';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { PageHeader } from '../../../components/shared/PageHeader';
import { toast } from 'react-hot-toast';
import type { Job } from '../../../types';

export const JobsListingPage = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Filters state
    const [selectedGov, setSelectedGov] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedCat, setSelectedCat] = useState('');
    const [minSalary, setMinSalary] = useState('');

    const fetchJobs = async () => {
        setLoading(true);
        try {
            // Fetch Open jobs from API. Filter by job_type and governorate at SQL level
            const { data, error } = await jobsService.getJobs({
                status: 'Open',
                job_type: selectedType || undefined,
                governorate: selectedGov || undefined,
                search: searchQuery || undefined
            });

            if (error) throw new Error(error);
            setJobs(data || []);
        } catch (error: any) {
            toast.error(error.message || 'حدث خطأ أثناء تحميل الوظائف');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch when DB filters or search changes
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchJobs();
        }, 300); // Debounce search changes

        return () => clearTimeout(timer);
    }, [selectedGov, selectedType, searchQuery]);

    // Frontend post-filtering for filters not directly supported in SQL API (category and salary)
    const filteredJobs = jobs.filter(job => {
        // Category check
        if (selectedCat) {
            const hasCategoryMatch = 
                (job.title && job.title.includes(selectedCat)) ||
                (job.description && job.description.includes(selectedCat)) ||
                (job.requirements && job.requirements.includes(selectedCat));
            if (!hasCategoryMatch) return false;
        }

        // Salary range check
        if (minSalary) {
            const minSalVal = parseInt(minSalary, 10);
            if (!isNaN(minSalVal)) {
                // Extract numbers from salary_range text (e.g. "8000 - 12000" or "8,000")
                const salaryNumbers = (job.salary_range || '').match(/\d+/g);
                if (salaryNumbers && salaryNumbers.length > 0) {
                     const maxVal = Math.max(...salaryNumbers.map(n => parseInt(n, 10)));
                     if (maxVal < minSalVal) return false;
                } else if (job.salary_range) {
                     // If salary is specified but not numeric, don't filter out by default
                } else {
                     // If no salary info is specified, filter out if user requested minimum
                     return false;
                }
            }
        }

        return true;
    });

    const handleClearFilters = () => {
        setSelectedGov('');
        setSelectedType('');
        setSelectedCat('');
        setMinSalary('');
        setSearchQuery('');
    };

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
                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                        <Link
                            to="/jobs/create"
                            className="flex items-center justify-center gap-2 px-6 py-4 bg-brand-primary text-white rounded-3xl hover:bg-brand-primary-hover font-black text-xs hover:shadow-lg hover:shadow-brand-primary/20 transition-all text-center order-first sm:w-auto w-full"
                        >
                            <Plus className="w-4 h-4" />
                            <span>أنشر وظيفة</span>
                        </Link>
                        <div className="relative flex-1 md:w-[320px] min-w-[200px] group">
                            <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-brand-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="ابحث عن المسمى الوظيفي..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pr-14 pl-6 py-4.5 bg-white border border-border-subtle rounded-3xl focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary outline-none transition-all shadow-xl shadow-slate-200/50 font-bold text-slate-700 placeholder:text-slate-300"
                            />
                        </div>
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-4.5 border rounded-2xl transition-all shadow-lg shadow-slate-200/50 group ${showFilters ? 'bg-brand-primary border-brand-primary text-white' : 'bg-white border-border-subtle text-text-secondary hover:bg-surface-primary'}`}
                            title="تصفية النتائج"
                        >
                            <Filter className={`w-5.5 h-5.5 ${showFilters ? 'text-white' : 'group-hover:text-brand-primary transition-colors'}`} />
                        </button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-20 items-start">
                {/* Collapsible/Toggleable Filters Sidebar */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -20 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -20 }}
                            className="lg:col-span-1 lg:sticky lg:top-24 w-full overflow-hidden"
                        >
                            <JobFilters
                                filters={{
                                    governorate: selectedGov,
                                    job_type: selectedType,
                                    category: selectedCat,
                                    salary_min: minSalary
                                }}
                                onChange={(newFilters) => {
                                    setSelectedGov(newFilters.governorate);
                                    setSelectedType(newFilters.job_type);
                                    setSelectedCat(newFilters.category);
                                    setMinSalary(newFilters.salary_min);
                                }}
                                onReset={handleClearFilters}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Jobs Listing grid */}
                <div className={`${showFilters ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-6 transition-all duration-300`}>
                    
                    {loading ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                            <LoadingSpinner size="lg" />
                            <p className="text-text-muted font-bold">جاري تحميل أحدث الوظائف...</p>
                        </div>
                    ) : filteredJobs.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                            <AnimatePresence mode="popLayout">
                                {filteredJobs.map((job) => (
                                    <motion.div
                                        key={job.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <JobCard job={job} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-20 bg-white rounded-[2.5rem] border border-border-subtle shadow-xl shadow-slate-200/40 max-w-xl mx-auto"
                        >
                            <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Briefcase className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-2xl font-black text-text-primary mb-2">لا توجد وظائف مطابقة</h3>
                            <p className="text-text-muted font-bold text-sm max-w-sm mx-auto leading-relaxed mb-6">
                                لم نجد أي وظائف تطابق خيارات التصفية الحالية. جرب تغيير الفلاتر أو استخدام كلمات بحث مختلفة.
                            </p>
                            <button 
                                onClick={handleClearFilters}
                                className="px-8 py-3 bg-brand-primary text-white rounded-xl text-xs font-black shadow-md shadow-brand-primary/10 transition-transform active:scale-95"
                            >
                                إعادة تعيين الفلاتر
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        </PageContainer>
    );
};
