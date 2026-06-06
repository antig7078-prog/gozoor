import React from 'react';
import { MapPin, Briefcase, DollarSign, RefreshCw, X } from 'lucide-react';

export interface FilterState {
    governorate: string;
    job_type: string;
    category: string;
    salary_min: string;
}

interface JobFiltersProps {
    filters: FilterState;
    onChange: (filters: FilterState) => void;
    onReset: () => void;
    onClose?: () => void; // for mobile drawer
}

export const EGYPTIAN_GOVERNORATES = [
    'القاهرة',
    'الجيزة',
    'الإسكندرية',
    'القليوبية',
    'الدقهلية',
    'الغربية',
    'المنوفية',
    'الشرقية',
    'البحيرة',
    'كفر الشيخ',
    'دمياط',
    'بورسعيد',
    'الإسماعيلية',
    'السويس',
    'الفيوم',
    'بني سويف',
    'المنيا',
    'أسيوط',
    'سوهاج',
    'قنا',
    'الأقصر',
    'أسوان',
    'البحر الأحمر',
    'الوادي الجديد',
    'مطروح',
    'شمال سيناء',
    'جنوب سيناء'
];

export const JOB_TYPES = [
    { value: 'Full-time', label: 'دوام كامل (Full-time)' },
    { value: 'Part-time', label: 'دوام جزئي (Part-time)' },
    { value: 'Contract', label: 'تعاقد (Contract)' },
    { value: 'Freelance', label: 'عمل حر (Freelance)' },
    { value: 'Remote', label: 'عن بعد (Remote)' },
    { value: 'Internship', label: 'تدريب (Internship)' }
];

export const JOB_CATEGORIES = [
    'الهندسة الزراعية',
    'إدارة المزارع',
    'الري والصرف',
    'تربية الحيوان والدواجن',
    'الصناعات الغذائية',
    'المبيعات والتسويق الزراعي',
    'مكافحة الآفات والأسمدة',
    'البحث والتطوير',
    'تنسيق الحدائق (Landscaping)',
    'أخرى'
];

export const JobFilters: React.FC<JobFiltersProps> = ({
    filters,
    onChange,
    onReset,
    onClose
}) => {
    const handleSelectChange = (key: keyof FilterState, value: string) => {
        onChange({
            ...filters,
            [key]: value
        });
    };

    return (
        <div className="bg-white rounded-[2rem] sm:rounded-[30px] border border-border-subtle p-6 sm:p-8 shadow-xl shadow-slate-200/40 space-y-8">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <h3 className="font-black text-xl text-text-primary flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-brand-primary" />
                    تصفية الوظائف
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onReset}
                        className="text-text-muted hover:text-brand-primary flex items-center gap-1.5 text-xs font-black transition-colors"
                        title="إعادة ضبط"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        إعادة ضبط
                    </button>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-1 text-text-muted hover:text-text-primary rounded-lg lg:hidden"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Governorate Filter */}
            <div className="space-y-3">
                <label className="text-sm font-black text-text-primary flex items-center gap-2 pr-1">
                    <MapPin className="w-4 h-4 text-brand-primary" />
                    المحافظة
                </label>
                <select
                    value={filters.governorate}
                    onChange={(e) => handleSelectChange('governorate', e.target.value)}
                    className="w-full px-4 py-3.5 bg-surface-primary border border-border-subtle rounded-xl focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-inner"
                >
                    <option value="">كل المحافظات</option>
                    {EGYPTIAN_GOVERNORATES.map((gov) => (
                        <option key={gov} value={gov}>
                            {gov}
                        </option>
                    ))}
                </select>
            </div>

            {/* Job Type Filter */}
            <div className="space-y-3">
                <label className="text-sm font-black text-text-primary flex items-center gap-2 pr-1">
                    <Briefcase className="w-4 h-4 text-brand-primary" />
                    نوع العمل
                </label>
                <select
                    value={filters.job_type}
                    onChange={(e) => handleSelectChange('job_type', e.target.value)}
                    className="w-full px-4 py-3.5 bg-surface-primary border border-border-subtle rounded-xl focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-inner"
                >
                    <option value="">كل أنواع العمل</option>
                    {JOB_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Category Filter */}
            <div className="space-y-3">
                <label className="text-sm font-black text-text-primary flex items-center gap-2 pr-1">
                    <Briefcase className="w-4 h-4 text-brand-primary" />
                    المجال / التخصص
                </label>
                <select
                    value={filters.category}
                    onChange={(e) => handleSelectChange('category', e.target.value)}
                    className="w-full px-4 py-3.5 bg-surface-primary border border-border-subtle rounded-xl focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-inner"
                >
                    <option value="">كل المجالات</option>
                    {JOB_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
            </div>

            {/* Salary Range Filter */}
            <div className="space-y-3">
                <label className="text-sm font-black text-text-primary flex items-center gap-2 pr-1">
                    <DollarSign className="w-4 h-4 text-brand-primary" />
                    الحد الأدنى للراتب (ج.م)
                </label>
                <input
                    type="number"
                    value={filters.salary_min}
                    onChange={(e) => handleSelectChange('salary_min', e.target.value)}
                    placeholder="مثال: 5000"
                    min="0"
                    step="500"
                    className="w-full px-4 py-3.5 bg-surface-primary border border-border-subtle rounded-xl focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-inner"
                />
            </div>
        </div>
    );
};
