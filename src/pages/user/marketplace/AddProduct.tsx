import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { Store, ArrowRight, Info, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { PageContainer } from '../../../components/shared/PageContainer';
import { PageHeader } from '../../../components/shared/PageHeader';

export const AddProduct = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        stock: '1',
        category: '',
        image_url: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase.from('products').insert([{
                seller_id: user.id,
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock, 10),
                category: formData.category,
                image_url: formData.image_url
            }]);

            if (error) throw error;
            toast.success('تم إضافة المنتج بنجاح!');
            navigate('/user-products');
        } catch (error: any) {
            toast.error('حدث خطأ أثناء إضافة المنتج');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <PageContainer maxWidth="lg">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
            <PageHeader
                title="إضافة منتج جديد"
                description="قم بإضافة منتجك الجديد إلى سوق جذور وشاركه مع المجتمع الزراعي."
                icon={Store}
                actions={
                    <div className="w-full sm:w-auto">
                        <Link
                            to="/user-products"
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-border-default text-text-secondary rounded-[var(--radius-button)] font-black text-xs hover:bg-slate-50 transition-all shadow-sm w-full sm:w-auto"
                        >
                            <ArrowRight className="w-4 h-4" />
                            <span>الرجوع لمنتجاتي</span>
                        </Link>
                    </div>
                }
            />

                <div className="bg-white rounded-[var(--radius-card)] border border-border-subtle shadow-2xl shadow-slate-200/50 overflow-hidden">
                    <div className="p-8 md:p-12 border-b border-slate-50 bg-surface-primary/30">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                                <Info className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-text-primary">بيانات المتجر</h3>
                                <p className="text-text-muted font-bold mt-1">سيتم مراجعة منتجك من قبل الإدارة قبل ظهوره في المتجر العام لضمان الجودة.</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 md:p-12 space-y-8 md:space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                            {/* Title */}
                            <div className="space-y-3 md:col-span-2">
                                <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                                    اسم المنتج
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-surface-primary border border-border-subtle rounded-[var(--radius-button)] focus:bg-white focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-text-primary"
                                    placeholder="مثال: حقيبة لابتوب جلدية فاخرة"
                                />
                            </div>

                            {/* Price */}
                            <div className="space-y-3">
                                <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                                    السعر (ج.م)
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="price"
                                        required
                                        min="0.01"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full px-6 py-4 bg-surface-primary border border-border-subtle rounded-[var(--radius-button)] focus:bg-white focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-black text-text-primary pr-12"
                                        placeholder="0.00"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 font-black text-xs uppercase">EGP</div>
                                </div>
                            </div>

                            {/* Stock */}
                            <div className="space-y-3">
                                <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                                    الكمية المتوفرة
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="stock"
                                    required
                                    min="1"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-surface-primary border border-border-subtle rounded-[var(--radius-button)] focus:bg-white focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-black text-text-primary"
                                    placeholder="10"
                                />
                            </div>

                            {/* Category */}
                            <div className="space-y-3 md:col-span-2">
                                <label className="text-sm font-black text-slate-700 flex items-center gap-2">التصنيف</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-surface-primary border border-border-subtle rounded-[var(--radius-button)] focus:bg-white focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-text-primary appearance-none"
                                >
                                    <option value="">اختر تصنيفاً للمنتج...</option>
                                    <option value="إلكترونيات">إلكترونيات</option>
                                    <option value="كتب وملازم">كتب وملازم</option>
                                    <option value="ملابس">ملابس</option>
                                    <option value="خدمات رقمية">خدمات رقمية</option>
                                    <option value="أخرى">أخرى</option>
                                </select>
                            </div>

                            {/* Description */}
                            <div className="space-y-3 md:col-span-2">
                                <label className="text-sm font-black text-slate-700 flex items-center gap-2">وصف المنتج</label>
                                <textarea
                                    name="description"
                                    rows={5}
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-surface-primary border border-border-subtle rounded-[var(--radius-button)] focus:bg-white focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-text-primary resize-none leading-relaxed"
                                    placeholder="اكتب تفاصيل ومميزات المنتج بوضوح..."
                                />
                            </div>

                            {/* Image URL & Preview */}
                            <div className="space-y-3 md:col-span-2">
                                <label className="text-sm font-black text-slate-700 flex items-center gap-2">رابط صورة المنتج</label>
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1">
                                        <input
                                            type="url"
                                            name="image_url"
                                            value={formData.image_url}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 bg-surface-primary border border-border-subtle rounded-[var(--radius-button)] focus:bg-white focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-text-primary"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                        <p className="mt-2 text-[10px] text-text-muted font-bold uppercase tracking-wider">استخدم روابط مباشرة للصور (JPG, PNG)</p>
                                    </div>
                                    <div className="w-full md:w-32 h-32 md:h-32 bg-surface-primary rounded-2xl border-2 border-dashed border-border-subtle flex items-center justify-center overflow-hidden shrink-0">
                                        {formData.image_url ? (
                                            <img
                                                src={formData.image_url}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+URL';
                                                }}
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-slate-300">
                                                <ImageIcon className="w-8 h-8" />
                                                <span className="text-[10px] font-black uppercase">معاينة</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-10 border-t border-slate-50 flex flex-col sm:flex-row justify-end gap-4">
                            <Link
                                to="/user-products"
                                className="px-10 py-4 bg-surface-primary text-text-secondary rounded-[var(--radius-button)] font-black text-sm hover:bg-slate-100 transition-all text-center order-2 sm:order-1"
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
                                نشر المنتج للمراجعة
                            </Button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </PageContainer>
    );
};




