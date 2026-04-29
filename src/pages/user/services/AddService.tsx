import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { MonitorPlay, ChevronRight, Upload, Sparkles, Image as ImageIcon, DollarSign, Clock, Info } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { PageContainer } from '../../../components/shared/PageContainer';

export const AddService = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        delivery_time_days: '1',
        image_url: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase.from('services').insert([{
                freelancer_id: user.id,
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                delivery_time_days: parseInt(formData.delivery_time_days, 10),
                image_url: formData.image_url
            }]);

            if (error) throw error;
            toast.success('تمت إضافة الخدمة بنجاح!');
            navigate('/user-services');
        } catch (error: any) {
            toast.error('حدث خطأ أثناء إضافة الخدمة');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <PageContainer maxWidth="lg">
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
                            إضافة خدمة جديدة
                        </h1>
                        <p className="text-text-muted mt-3 font-bold text-lg">قدم خدماتك بأسعار تنافسية وابدأ بتحقيق دخل إضافي في جذور.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-10">
                    {/* Visual Preview Section */}
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
                                    placeholder="مثال: تصميم شعار احترافي وقابل للطباعة"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-sm font-black text-text-primary flex items-center gap-2 uppercase tracking-wider">
                                        السعر المتوقع
                                        <span className="text-brand-primary">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="price"
                                            required
                                            min="5"
                                            step="1"
                                            value={formData.price}
                                            onChange={handleChange}
                                            className="w-full pr-14 pl-16 py-4 bg-surface-primary border border-border-subtle rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary outline-none transition-all font-black text-text-primary"
                                            placeholder="50"
                                        />
                                        <DollarSign className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-black text-text-muted uppercase tracking-widest">ج.م</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-black text-text-primary flex items-center gap-2 uppercase tracking-wider">
                                        مدة التسليم
                                        <span className="text-brand-primary">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="delivery_time_days"
                                            required
                                            min="1"
                                            value={formData.delivery_time_days}
                                            onChange={handleChange}
                                            className="w-full pr-14 pl-16 py-4 bg-surface-primary border border-border-subtle rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary outline-none transition-all font-black text-text-primary"
                                            placeholder="3"
                                        />
                                        <Clock className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-black text-text-muted uppercase tracking-widest">أيام</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Image URL & Preview */}
                        <div className="space-y-6">
                            <label className="text-sm font-black text-text-primary flex items-center gap-2 uppercase tracking-wider">
                                صورة الخدمة
                                <span className="text-slate-300 font-bold">(رابط)</span>
                            </label>
                            <div className="aspect-[4/3] bg-surface-primary rounded-[30px] border-2 border-dashed border-border-default overflow-hidden flex flex-col items-center justify-center group relative shadow-inner">
                                <AnimatePresence mode="wait">
                                    {formData.image_url ? (
                                        <motion.img 
                                            key="preview"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            src={formData.image_url} 
                                            className="w-full h-full object-cover"
                                            onError={() => {
                                                toast.error('رابط الصورة غير صالح');
                                                setFormData({ ...formData, image_url: '' });
                                            }}
                                        />
                                    ) : (
                                        <motion.div 
                                            key="placeholder"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="text-center p-6 space-y-3"
                                        >
                                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm text-slate-300">
                                                <ImageIcon className="w-8 h-8" />
                                            </div>
                                            <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">معاينة الصورة</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <input
                                type="url"
                                name="image_url"
                                value={formData.image_url}
                                onChange={handleChange}
                                className="w-full px-5 py-3 bg-surface-primary border border-border-subtle rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all font-bold text-sm text-text-secondary placeholder:text-slate-300"
                                placeholder="https://example.com/cover.jpg"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-black text-text-primary flex items-center gap-2 uppercase tracking-wider">
                            وصف الخدمة
                            <span className="text-brand-primary">*</span>
                        </label>
                        <textarea
                            name="description"
                            required
                            rows={6}
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-6 py-4 bg-surface-primary border border-border-subtle rounded-[30px] focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary outline-none transition-all font-bold text-text-primary placeholder:text-slate-300 resize-none leading-relaxed"
                            placeholder="أخبر المشتري بالتفصيل ماذا ستقدم له مقابل هذه الخدمة، وما هي المهارات التي ستستخدمها لإنجاز العمل..."
                        />
                    </div>

                    <div className="p-6 bg-brand-primary/5 rounded-3xl border border-brand-primary/10 flex items-start gap-4">
                        <div className="p-2 bg-brand-primary/20 rounded-xl">
                            <Info className="w-5 h-5 text-brand-primary" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-text-primary font-black text-sm">نصيحة لجذب المشترين</p>
                            <p className="text-text-secondary text-sm font-bold">كلما كان الوصف دقيقاً ومفصلاً، زادت فرصة المشتري في اختيار خدمتك. لا تتردد في ذكر خبراتك السابقة.</p>
                        </div>
                    </div>

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
        </PageContainer>
    );
};




