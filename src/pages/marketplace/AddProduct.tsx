import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Store, Loader2, ArrowRight, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
        <div className="max-w-4xl mx-auto py-8" dir="rtl">
            <Link to="/user-products" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-medium mb-8 transition-colors">
                <ArrowRight className="w-5 h-5" />
                الرجوع إلى منتجاتي
            </Link>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                            <Store className="w-7 h-7 text-emerald-600" />
                            إضافة منتج جديد
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium">قم بإدخال بيانات المنتج ليتم عرضه في متجر المنصة.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700">اسم المنتج <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                placeholder="مثال: حقيبة لابتوب جلدية"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">السعر (بالدولار) <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                name="price"
                                required
                                min="0.01"
                                step="0.01"
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                placeholder="مثال: 45.00"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">الكمية المتوفرة (المخزون) <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                name="stock"
                                required
                                min="1"
                                value={formData.stock}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                placeholder="مثال: 10"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700">التصنيف</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                            >
                                <option value="">اختر تصنيفاً...</option>
                                <option value="إلكترونيات">إلكترونيات</option>
                                <option value="كتب وملازم">كتب وملازم</option>
                                <option value="ملابس">ملابس</option>
                                <option value="خدمات رقمية">خدمات رقمية</option>
                                <option value="أخرى">أخرى</option>
                            </select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700">وصف المنتج</label>
                            <textarea
                                name="description"
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                                placeholder="اكتب تفاصيل ومميزات المنتج..."
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700">رابط صورة المنتج (URL)</label>
                            <div className="flex gap-4">
                                <input
                                    type="url"
                                    name="image_url"
                                    value={formData.image_url}
                                    onChange={handleChange}
                                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                        <Link
                            to="/user-products"
                            className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                        >
                            إلغاء
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                            نشر المنتج
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
