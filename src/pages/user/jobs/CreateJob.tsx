import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { jobsService } from '../../../services/jobsService';
import { userService } from '../../../services/userService';
import { Briefcase, ArrowRight, Info, CheckCircle2, AlertTriangle, Plus, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { PageContainer } from '../../../components/shared/PageContainer';
import { PageHeader } from '../../../components/shared/PageHeader';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { sanitizeInput } from '../../../utils/sanitize';

const EGYPTIAN_GOVERNORATES = [
    'القاهرة', 'الجيزة', 'الإسكندرية', 'القليوبية', 'المنوفية', 'الشرقية', 'الغربية',
    'الدقهلية', 'دمياط', 'البحيرة', 'كفر الشيخ', 'الفيوم', 'بني سويف', 'المنيا',
    'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'البحر الأحمر', 'الوادى الجديد',
    'مطروح', 'شمال سيناء', 'جنوب سيناء', 'بورسعيد', 'الإسماعيلية', 'السويس'
];

const JOB_TYPES = [
    { value: 'Full-time', label: 'دوام كامل' },
    { value: 'Part-time', label: 'دوام جزئي' },
    { value: 'Contract', label: 'عقد عمل' },
    { value: 'Freelance', label: 'عمل حر' },
    { value: 'Remote', label: 'عمل عن بعد' },
    { value: 'Internship', label: 'تدريب' }
];

export const CreateJob = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingLimit, setIsLoadingLimit] = useState(true);
    const [isLimitReached, setIsLimitReached] = useState(false);
    const [jobsPostedToday, setJobsPostedToday] = useState(0);
    const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(true);
    const [hasMissingProfileInfo, setHasMissingProfileInfo] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        company_name: '',
        description: '',
        requirements: '',
        salary_range: '',
        location: '',
        job_type: 'Full-time' as 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Remote' | 'Internship',
        governorate: '',
        deadline: ''
    });

    const [skillInput, setSkillInput] = useState('');
    const [skills, setSkills] = useState<string[]>([]);

    useEffect(() => {
        const checkLimitAndVerification = async () => {
            if (!user) return;
            try {
                // Check verification status first
                const { data: profile } = await userService.getProfile(user.id);
                setVerificationStatus(profile?.verification_status || 'unverified');
                
                const hasMissing = !profile?.full_name?.trim() || !profile?.phone?.trim() || !profile?.whatsapp?.trim();
                setHasMissingProfileInfo(hasMissing);

                // Check limit
                const { isLimitReached: reached, count } = await jobsService.checkDailyLimit(user.id);
                setIsLimitReached(reached);
                setJobsPostedToday(count);
            } catch (error) {
                console.error('Error checking job limit/verification:', error);
            } finally {
                setIsVerifying(false);
                setIsLoadingLimit(false);
            }
        };

        checkLimitAndVerification();
    }, [user]);

    const handleAddSkill = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = skillInput.trim();
        if (trimmed && !skills.includes(trimmed)) {
            setSkills([...skills, trimmed]);
            setSkillInput('');
        }
    };

    const handleKeyDownSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const trimmed = skillInput.trim();
            if (trimmed && !skills.includes(trimmed)) {
                setSkills([...skills, trimmed]);
                setSkillInput('');
            }
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error('يجب تسجيل الدخول أولاً');
            return;
        }

        if (isLimitReached) {
            toast.error('لقد تجاوزت الحد الأقصى للنشر اليومي (10 وظائف).');
            return;
        }

        if (!formData.governorate) {
            toast.error('برجاء اختيار المحافظة');
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await jobsService.createJob({
                employer_id: user.id,
                title: sanitizeInput(formData.title),
                company_name: sanitizeInput(formData.company_name),
                description: sanitizeInput(formData.description),
                requirements: sanitizeInput(formData.requirements),
                salary_range: sanitizeInput(formData.salary_range),
                location: sanitizeInput(formData.location),
                job_type: formData.job_type,
                status: 'Open',
                skills: skills,
                deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
                governorate: formData.governorate
            });

            if (error) throw new Error(error);
            
            toast.success('تم نشر الوظيفة بنجاح!');
            navigate('/my-jobs');
        } catch (error: any) {
            toast.error(error.message || 'حدث خطأ أثناء إضافة الوظيفة');
            console.error(error);
        } finally {
            setIsSubmitting(false);
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
                    title="أنشر فرصة عمل جديدة"
                    description="أضف تفاصيل الوظيفة الشاغرة لتجد الكفاءات المناسبة لمشروعك أو شركتك."
                    icon={Briefcase}
                    actions={
                        <div className="w-full sm:w-auto font-black text-xs">
                            <Link
                                to="/my-jobs"
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-border-default text-text-secondary rounded-[var(--radius-button)] hover:bg-slate-50 transition-all shadow-sm w-full sm:w-auto"
                            >
                                <ArrowRight className="w-4 h-4" />
                                <span>الرجوع لوظائفي</span>
                            </Link>
                        </div>
                    }
                />

                {isVerifying ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 bg-white rounded-[2.5rem] border border-border-subtle shadow-sm">
                        <LoadingSpinner size="lg" />
                        <p className="text-text-muted font-bold">جاري التحقق من حالة توثيق حسابك...</p>
                    </div>
                ) : hasMissingProfileInfo ? (
                    <div className="bg-white border border-border-subtle rounded-[2.5rem] p-10 sm:p-16 text-center space-y-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/5 rounded-full blur-3xl" />
                        
                        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner relative z-10">
                            <AlertTriangle className="w-10 h-10 animate-pulse" />
                        </div>
                        
                        <div className="space-y-3 relative z-10 max-w-xl mx-auto">
                            <h3 className="text-2xl font-black text-text-primary">برجاء إكمال بياناتك الشخصية أولاً ⚠️</h3>
                            <p className="text-sm font-bold text-text-secondary leading-relaxed">
                                لتتمكن من نشر وظائف جديدة، يجب أولاً إكمال بياناتك الشخصية الأساسية (الاسم بالكامل، رقم الهاتف، ورقم الواتساب) في ملفك الشخصي.
                            </p>
                        </div>

                        <div className="pt-6 flex flex-col sm:flex-row justify-center gap-4 relative z-10 font-bold">
                            <Link
                                to="/profile"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-2xl shadow-lg shadow-brand-primary/20 transition-all text-sm font-black"
                            >
                                تحديث الملف الشخصي الآن
                            </Link>
                            <Link
                                to="/my-jobs"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-50 border border-slate-200 text-text-secondary hover:bg-slate-100 rounded-2xl shadow-sm transition-all text-sm"
                            >
                                العودة للخلف
                            </Link>
                        </div>
                    </div>
                ) : verificationStatus !== 'verified' ? (
                    <div className="bg-white border border-border-subtle rounded-[2.5rem] p-10 sm:p-16 text-center space-y-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/5 rounded-full blur-3xl" />
                        
                        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner relative z-10">
                            <AlertTriangle className="w-10 h-10 animate-pulse" />
                        </div>
                        
                        <div className="space-y-3 relative z-10 max-w-xl mx-auto">
                            <h3 className="text-2xl font-black text-text-primary">مطلوب توثيق الحساب وإثبات الهوية ⚠️</h3>
                            <p className="text-sm font-bold text-text-secondary leading-relaxed">
                                لتتمكن من نشر وظائف جديدة على المنصة، يجب أولاً توثيق حسابك وإثبات هويتك من خلال رفع صورة بطاقة الرقم القومي وملء بياناتك الشخصية الأساسية.
                            </p>
                            
                            {verificationStatus === 'pending' && (
                                <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-xs font-bold text-blue-700">
                                    ⏳ طلب التوثيق الخاص بك قيد المراجعة حالياً من قبل الإدارة. سيتم تفعيل حسابك فور الموافقة عليه.
                                </div>
                            )}

                            {verificationStatus === 'rejected' && (
                                <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-bold text-red-700">
                                    ❌ لقد تم رفض طلبك السابق. يرجى تعديل المستندات وإعادة تقديم الطلب من الملف الشخصي.
                                </div>
                            )}
                        </div>

                        <div className="pt-6 flex flex-col sm:flex-row justify-center gap-4 relative z-10 font-bold">
                            <Link
                                to="/profile"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-2xl shadow-lg shadow-brand-primary/20 transition-all text-sm font-black"
                            >
                                الانتقال لصفحة توثيق الحساب
                            </Link>
                            <Link
                                to="/my-jobs"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-50 border border-slate-200 text-text-secondary hover:bg-slate-100 rounded-2xl shadow-sm transition-all text-sm"
                            >
                                العودة للخلف
                            </Link>
                        </div>
                    </div>
                ) : isLoadingLimit ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
                        <LoadingSpinner size="lg" />
                        <p className="text-text-muted font-bold">جاري التحقق من حدود النشر اليومية...</p>
                    </div>
                ) : isLimitReached ? (
                    <div className="bg-red-50 border border-red-200 rounded-[2.5rem] p-8 text-center space-y-4 shadow-xl shadow-red-100/40">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-2xl font-black text-red-950">لقد بلغت الحد الأقصى اليومي!</h3>
                        <p className="text-sm font-bold text-red-700 max-w-lg mx-auto">
                            منصة جذور تمنع نشر أكثر من 10 وظائف يومياً لكل حساب للحفاظ على جودة المحتوى ومنع البريد العشوائي. برجاء الانتظار حتى الغد لنشر وظائف جديدة.
                        </p>
                        <div className="pt-4 font-black">
                            <Link
                                to="/my-jobs"
                                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-lg shadow-red-600/10 transition-all text-sm"
                            >
                                إدارة وظائفي الحالية
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-[2.5rem] border border-border-subtle shadow-xl shadow-slate-200/40 overflow-hidden">
                        
                        {/* Daily Limit Info Banner */}
                        <div className="p-6 sm:p-8 border-b border-slate-50 bg-brand-primary/5">
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-brand-primary/10 rounded-xl shrink-0 text-brand-primary">
                                    <Info className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-text-primary">حدود النشر اليومية</h3>
                                    <p className="text-sm text-text-muted font-bold mt-1">
                                        لقد قمت بنشر <span className="text-brand-primary font-black">{jobsPostedToday}</span> من أصل <span className="font-black">10</span> وظائف مسموح بها اليوم.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                
                                {/* Job Title */}
                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                                        المسمى الوظيفي
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full px-6 py-4 bg-surface-primary border border-border-subtle rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-text-primary"
                                        placeholder="مثال: مهندس زراعي متخصص في شبكات الري"
                                    />
                                </div>

                                {/* Company Name */}
                                <div className="space-y-3">
                                    <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                                        اسم الجهة أو الشركة
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="company_name"
                                        required
                                        value={formData.company_name}
                                        onChange={handleChange}
                                        className="w-full px-6 py-4 bg-surface-primary border border-border-subtle rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-text-primary"
                                        placeholder="مثال: مزارع جذور للتنمية الزراعية"
                                    />
                                </div>

                                {/* Job Type */}
                                <div className="space-y-3">
                                    <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                                        نوع العمل
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="job_type"
                                        value={formData.job_type}
                                        onChange={handleChange}
                                        className="w-full px-6 py-4 bg-surface-primary border border-border-subtle rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-text-primary"
                                    >
                                        {JOB_TYPES.map(type => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Governorate */}
                                <div className="space-y-3">
                                    <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                                        المحافظة
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="governorate"
                                        required
                                        value={formData.governorate}
                                        onChange={handleChange}
                                        className="w-full px-6 py-4 bg-surface-primary border border-border-subtle rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-text-primary"
                                    >
                                        <option value="">اختر المحافظة...</option>
                                        {EGYPTIAN_GOVERNORATES.map(gov => (
                                            <option key={gov} value={gov}>{gov}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Detailed Location */}
                                <div className="space-y-3">
                                    <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                                        مكان العمل بالتفصيل
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        required
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="w-full px-6 py-4 bg-surface-primary border border-border-subtle rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-text-primary"
                                        placeholder="مثال: طريق الإسماعيلية الصحراوي، الكيلو 70"
                                    />
                                </div>

                                {/* Salary Range */}
                                <div className="space-y-3">
                                    <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                                        الراتب المتوقع (اختياري)
                                    </label>
                                    <input
                                        type="text"
                                        name="salary_range"
                                        value={formData.salary_range}
                                        onChange={handleChange}
                                        className="w-full px-6 py-4 bg-surface-primary border border-border-subtle rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-text-primary"
                                        placeholder="مثال: 8,000 - 12,000 جنيه"
                                    />
                                </div>

                                {/* Deadline */}
                                <div className="space-y-3">
                                    <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                                        آخر موعد للتقديم (اختياري)
                                    </label>
                                    <input
                                        type="date"
                                        name="deadline"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={formData.deadline}
                                        onChange={handleChange}
                                        className="w-full px-6 py-4 bg-surface-primary border border-border-subtle rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-text-primary"
                                    />
                                </div>

                                {/* Skills Tag Input */}
                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                                        المهارات المطلوبة (اختياري)
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={skillInput}
                                            onChange={(e) => setSkillInput(e.target.value)}
                                            onKeyDown={handleKeyDownSkill}
                                            className="flex-1 px-6 py-4 bg-surface-primary border border-border-subtle rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-text-primary"
                                            placeholder="أدخل المهارة واضغط Enter أو زر الإضافة"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddSkill}
                                            className="px-5 bg-brand-primary text-white rounded-2xl hover:bg-brand-primary-hover transition-colors flex items-center justify-center shrink-0"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                    
                                    {/* Selected Skill Tags */}
                                    {skills.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {skills.map(skill => (
                                                <span
                                                    key={skill}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-full text-xs font-bold transition-all hover:bg-brand-primary/15"
                                                >
                                                    <span>{skill}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveSkill(skill)}
                                                        className="hover:bg-brand-primary/20 p-0.5 rounded-full text-brand-primary/80 hover:text-brand-primary"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Job Description */}
                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                                        وصف الوظيفة الشاغرة
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        required
                                        rows={6}
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full px-6 py-4 bg-surface-primary border border-border-subtle rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-text-primary resize-none leading-relaxed"
                                        placeholder="صف المهام والمسؤوليات الأساسية للوظيفة بوضوح وتفصيل..."
                                    />
                                </div>

                                {/* Requirements */}
                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                                        متطلبات وشروط المتقدم
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="requirements"
                                        required
                                        rows={6}
                                        value={formData.requirements}
                                        onChange={handleChange}
                                        className="w-full px-6 py-4 bg-surface-primary border border-border-subtle rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-text-primary resize-none leading-relaxed"
                                        placeholder="اذكر المؤهلات الدراسية، الخبرة، والاشتراطات الأساسية الأخرى..."
                                    />
                                </div>
                            </div>

                            {/* Form Action Controls */}
                            <div className="pt-8 border-t border-slate-50 flex flex-col sm:flex-row justify-end gap-4">
                                <Link
                                    to="/my-jobs"
                                    className="px-10 py-4 bg-surface-primary text-text-secondary rounded-2xl font-black text-sm hover:bg-slate-100 transition-all text-center order-2 sm:order-1"
                                >
                                    إلغاء
                                </Link>
                                <Button
                                    type="submit"
                                    isLoading={isSubmitting}
                                    variant="premium"
                                    size="lg"
                                    className="px-12 order-1 sm:order-2"
                                    icon={CheckCircle2}
                                >
                                    نشر فرصة العمل
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </motion.div>
        </PageContainer>
    );
};
