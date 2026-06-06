import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userService } from '../../../services/userService';
import { marketplaceService } from '../../../services/marketplaceService';
import { useAuth } from '../../../contexts/AuthContext';
import { MonitorPlay, ChevronRight, Upload, Sparkles, Image as ImageIcon, DollarSign, Clock, Info, HelpCircle, Layers, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { PageContainer } from '../../../components/shared/PageContainer';
import { ImageUpload } from '../../../components/shared/ImageUpload';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { sanitizeInput, sanitizeUrl } from '../../../utils/sanitize';

export const AddService = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);

    useEffect(() => {
        const checkProfile = async () => {
            if (!user) return;
            try {
                const { data, error } = await userService.getProfile(user.id);

                if (error) throw new Error(error);

                if (data && (!data.full_name || !data.phone || !data.whatsapp)) {
                    toast.error('برجاء إكمال بياناتك (الاسم، رقم الهاتف، والواتساب) في ملفك الشخصي أولاً قبل إضافة خدمات.', {
                        duration: 5000,
                        icon: '⚠️'
                    });
                    setTimeout(() => navigate('/profile'), 2000);
                }
            } catch (error) {
                console.error('Error checking profile:', error);
            } finally {
                setProfileLoading(false);
            }
        };

        checkProfile();
    }, [user, navigate]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'استشارات زراعية',
        image_url: '',
        // Basic Package
        basic_desc: '',
        basic_price: '',
        basic_delivery: '2',
        basic_revisions: '1',
        // Standard Package
        standard_desc: '',
        standard_price: '',
        standard_delivery: '4',
        standard_revisions: '3',
        // Premium Package
        premium_desc: '',
        premium_price: '',
        premium_delivery: '7',
        premium_revisions: '5'
    });

    const categories = [
        'استشارات زراعية',
        'خدمات تقنية وبرمجة',
        'تسويق زراعي ومبيعات',
        'تصميم وصناعة محتوى',
        'إدارة مزارع ومشاريع',
        'أخرى'
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error('يجب تسجيل الدخول أولاً');
            return;
        }

        const basicPrice = parseFloat(formData.basic_price);
        const standardPrice = parseFloat(formData.standard_price);
        const premiumPrice = parseFloat(formData.premium_price);

        if (isNaN(basicPrice) || basicPrice <= 0) {
            toast.error('يرجى إدخال سعر صحيح للباقة الأساسية');
            return;
        }
        if (isNaN(standardPrice) || standardPrice <= 0) {
            toast.error('يرجى إدخال سعر صحيح للباقة القياسية');
            return;
        }
        if (isNaN(premiumPrice) || premiumPrice <= 0) {
            toast.error('يرجى إدخال سعر صحيح للباقة المميزة');
            return;
        }

        if (!formData.basic_desc.trim()) {
            toast.error('يرجى إدخال وصف الباقة الأساسية');
            return;
        }
        if (!formData.standard_desc.trim()) {
            toast.error('يرجى إدخال وصف الباقة القياسية');
            return;
        }
        if (!formData.premium_desc.trim()) {
            toast.error('يرجى إدخال وصف الباقة المميزة');
            return;
        }

        setIsSubmitting(true);
        try {
            const packages = [
                {
                    name: 'الأساسية',
                    description: sanitizeInput(formData.basic_desc),
                    price: basicPrice,
                    delivery_time_days: parseInt(formData.basic_delivery, 10),
                    revisions: parseInt(formData.basic_revisions, 10) || 0
                },
                {
                    name: 'القياسية',
                    description: sanitizeInput(formData.standard_desc),
                    price: standardPrice,
                    delivery_time_days: parseInt(formData.standard_delivery, 10),
                    revisions: parseInt(formData.standard_revisions, 10) || 0
                },
                {
                    name: 'المميزة',
                    description: sanitizeInput(formData.premium_desc),
                    price: premiumPrice,
                    delivery_time_days: parseInt(formData.premium_delivery, 10),
                    revisions: parseInt(formData.premium_revisions, 10) || 0
                }
            ];

             const { error: insertError } = await marketplaceService.createService({
                title: sanitizeInput(formData.title),
                description: sanitizeInput(formData.description),
                category: formData.category,
                price: basicPrice, // base price maps to Basic package
                delivery_time_days: parseInt(formData.basic_delivery, 10), // base delivery maps to Basic package
                image_url: sanitizeUrl(formData.image_url),
                packages: packages,
                freelancer_id: user.id
            });

            if (insertError) throw new Error(insertError);
            
            toast.success('تمت إضافة الخدمة والباقات بنجاح!');
            navigate('/user-services');
        } catch (err: any) {
            console.error('Error adding service:', err);
            const errorMessage = err.message || 'حدث خطأ أثناء إضافة الخدمة';
            toast.error(errorMessage === 'New row violates row level security policy for table "services".' 
                ? 'ليس لديك صلاحية لإضافة خدمة. تأكد من تفعيل حسابك.' 
                : errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <PageContainer maxWidth="lg">
            {profileLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <LoadingSpinner size="lg" />
                    <p className="text-text-muted font-bold">جاري التحقق من بيانات ملفك الشخصي...</p>
                </div>
            ) : (
                <>
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-10"
                >
                    <Link 
                        to="/user-services" 
                        className="group inline-flex items-center gap-3 px-5 py-2.5 bg-white border border-border-subtle rounded-full text-text-secondary hover:text-brand-primary hover:border-brand-primary/20 font-black text-sm transition-all shadow-sm"
                    >
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        الرجوع إلى خدماتي
                    </Link>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[40px] border border-border-subtle shadow-2xl shadow-slate-200/50 overflow-hidden"
                >
                    <div className="p-10 border-b border-slate-50 bg-surface-primary/50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-bl-full -mr-16 -mt-16"></div>
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-black tracking-widest uppercase mb-4">
                                <Sparkles className="w-3 h-3" />
                                بائع خدمات محترف
                            </div>
                            <h1 className="text-3xl font-black text-text-primary flex items-center gap-4">
                                <div className="p-3 bg-brand-primary rounded-2xl shadow-lg shadow-brand-primary/20">
                                    <MonitorPlay className="w-6 h-6 text-white" />
                                </div>
                                إضافة خدمة جديدة بـ 3 مستويات
                            </h1>
                            <p className="text-text-muted mt-3 font-bold text-lg">حدد باقات خدمتك (الأساسية، القياسية، والمميزة) لتمنح عملائك خيارات مرنة تناسب احتياجاتهم.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-10 space-y-10">
                        {/* Core Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-8">
                                <div className="space-y-3">
                                    <label className="text-sm font-black text-text-primary flex items-center gap-2 uppercase tracking-wider">
                                        عنوان الخدمة
                                        <span className="text-brand-primary">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full px-6 py-4 bg-surface-primary border border-border-subtle rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary outline-none transition-all font-bold text-text-primary placeholder:text-slate-300"
                                        placeholder="مثال: تقديم استشارة زراعية متكاملة لتحسين إنتاجية المحاصيل"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-black text-text-primary flex items-center gap-2 uppercase tracking-wider">
                                        تصنيف الخدمة
                                        <span className="text-brand-primary">*</span>
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-6 py-4 bg-surface-primary border border-border-subtle rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary outline-none transition-all font-bold text-text-primary"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <ImageUpload 
                                onUpload={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                                defaultValue={formData.image_url}
                                label="صورة الخدمة"
                            />
                        </div>

                        {/* General Description */}
                        <div className="space-y-3">
                            <label className="text-sm font-black text-text-primary flex items-center gap-2 uppercase tracking-wider">
                                وصف عام للخدمة
                                <span className="text-brand-primary">*</span>
                            </label>
                            <textarea
                                name="description"
                                required
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-surface-primary border border-border-subtle rounded-[30px] focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary outline-none transition-all font-bold text-text-primary placeholder:text-slate-300 resize-none leading-relaxed"
                                placeholder="اكتب وصفاً تفصيلياً يوضح جوهر الخدمة، مهاراتك وخبراتك العامة التي ستطبقها..."
                            />
                        </div>

                        {/* 3-Tier Packages System */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                <Layers className="w-6 h-6 text-brand-primary" />
                                <h3 className="text-xl font-black text-text-primary">باقات الخدمة (3 مستويات)</h3>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Basic Package */}
                                <div className="border border-emerald-100 bg-emerald-50/10 rounded-[32px] p-6 space-y-6 relative overflow-hidden transition-all hover:shadow-lg">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full -mr-8 -mt-8"></div>
                                    <div className="flex justify-between items-center relative z-10">
                                        <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black">
                                            الأساسية (Basic)
                                        </span>
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500">وصف الباقة</label>
                                            <textarea
                                                name="basic_desc"
                                                required
                                                rows={3}
                                                value={formData.basic_desc}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-semibold text-text-primary resize-none placeholder:text-slate-300"
                                                placeholder="ماذا سيحصل عليه المشتري في الباقة الأساسية؟"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-500">السعر (ج.م)</label>
                                                <input
                                                    type="number"
                                                    name="basic_price"
                                                    required
                                                    min="5"
                                                    value={formData.basic_price}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-black text-text-primary"
                                                    placeholder="50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-500">التسليم (أيام)</label>
                                                <input
                                                    type="number"
                                                    name="basic_delivery"
                                                    required
                                                    min="1"
                                                    value={formData.basic_delivery}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-black text-text-primary"
                                                    placeholder="2"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500">عدد التعديلات</label>
                                            <input
                                                type="number"
                                                name="basic_revisions"
                                                required
                                                min="0"
                                                value={formData.basic_revisions}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-black text-text-primary"
                                                placeholder="1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Standard Package */}
                                <div className="border border-blue-100 bg-blue-50/10 rounded-[32px] p-6 space-y-6 relative overflow-hidden transition-all hover:shadow-lg">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full -mr-8 -mt-8"></div>
                                    <div className="flex justify-between items-center relative z-10">
                                        <span className="px-3.5 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-black">
                                            القياسية (Standard)
                                        </span>
                                        <CheckCircle2 className="w-5 h-5 text-blue-500" />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500">وصف الباقة</label>
                                            <textarea
                                                name="standard_desc"
                                                required
                                                rows={3}
                                                value={formData.standard_desc}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-text-primary resize-none placeholder:text-slate-300"
                                                placeholder="مزايا إضافية وتسليم أشمل مقارنة بالأساسية"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-500">السعر (ج.م)</label>
                                                <input
                                                    type="number"
                                                    name="standard_price"
                                                    required
                                                    min="5"
                                                    value={formData.standard_price}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-black text-text-primary"
                                                    placeholder="100"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-500">التسليم (أيام)</label>
                                                <input
                                                    type="number"
                                                    name="standard_delivery"
                                                    required
                                                    min="1"
                                                    value={formData.standard_delivery}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-black text-text-primary"
                                                    placeholder="4"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500">عدد التعديلات</label>
                                            <input
                                                type="number"
                                                name="standard_revisions"
                                                required
                                                min="0"
                                                value={formData.standard_revisions}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-black text-text-primary"
                                                placeholder="3"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Premium Package */}
                                <div className="border border-purple-100 bg-purple-50/10 rounded-[32px] p-6 space-y-6 relative overflow-hidden transition-all hover:shadow-lg">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full -mr-8 -mt-8"></div>
                                    <div className="flex justify-between items-center relative z-10">
                                        <span className="px-3.5 py-1.5 bg-purple-100 text-purple-800 rounded-full text-xs font-black">
                                            المميزة (Premium)
                                        </span>
                                        <CheckCircle2 className="w-5 h-5 text-purple-500" />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500">وصف الباقة</label>
                                            <textarea
                                                name="premium_desc"
                                                required
                                                rows={3}
                                                value={formData.premium_desc}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm font-semibold text-text-primary resize-none placeholder:text-slate-300"
                                                placeholder="أعلى جودة وتغطية كاملة مع دعم مستمر ومميز"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-500">السعر (ج.م)</label>
                                                <input
                                                    type="number"
                                                    name="premium_price"
                                                    required
                                                    min="5"
                                                    value={formData.premium_price}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm font-black text-text-primary"
                                                    placeholder="200"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-500">التسليم (أيام)</label>
                                                <input
                                                    type="number"
                                                    name="premium_delivery"
                                                    required
                                                    min="1"
                                                    value={formData.premium_delivery}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm font-black text-text-primary"
                                                    placeholder="7"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500">عدد التعديلات</label>
                                            <input
                                                type="number"
                                                name="premium_revisions"
                                                required
                                                min="0"
                                                value={formData.premium_revisions}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm font-black text-text-primary"
                                                placeholder="5"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="p-6 bg-brand-primary/5 rounded-3xl border border-brand-primary/10 flex items-start gap-4">
                            <div className="p-2 bg-brand-primary/20 rounded-xl">
                                <Info className="w-5 h-5 text-brand-primary" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-text-primary font-black text-sm">نصيحة لجذب المشترين</p>
                                <p className="text-text-secondary text-sm font-bold">باقة الأسعار المتدرجة تتيح لك الوصول لشرائح عملاء مختلفة. احرص على تمييز الباقة القياسية والمميزة بمميزات حقيقية وقيمة مضافة واضحة.</p>
                            </div>
                        </div>

                        {/* Submit Actions */}
                        <div className="pt-10 border-t border-slate-50 flex items-center justify-end gap-6">
                            <Link
                                to="/user-services"
                                className="text-text-muted hover:text-text-secondary font-black text-sm uppercase tracking-widest transition-colors"
                            >
                                إلغاء التغييرات
                            </Link>
                            <Button
                                type="submit"
                                isLoading={isSubmitting}
                                variant="premium"
                                size="lg"
                                className="px-12"
                                icon={Upload}
                            >
                                نشر الخدمة الآن
                            </Button>
                        </div>
                    </form>
                </motion.div>
                </>
            )}
        </PageContainer>
    );
};

