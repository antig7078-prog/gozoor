import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { MonitorPlay, Loader2, ArrowRight, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
        <div className="max-w-4xl mx-auto py-8" dir="rtl">
            <Link to="/user-services" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-medium mb-8 transition-colors">
                <ArrowRight className="w-5 h-5" />
                الرجوع إلى خدماتي
            </Link>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                            <MonitorPlay className="w-7 h-7 text-emerald-600" />
                            إضافة خدمة جديدة
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium">قدم خدماتك بأسعار تنافسية وابدأ بتحقيق دخل إضافي.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700">عنوان الخدمة <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                placeholder="مثال: تصميم شعار احترافي وقابل للطباعة"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">السعر (بالدولار) <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                name="price"
                                required
                                min="5"
                                step="1"
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                placeholder="مثال: 50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">مدة التسليم (أيام) <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                name="delivery_time_days"
                                required
                                min="1"
                                value={formData.delivery_time_days}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                placeholder="مثال: 3"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700">وصف الخدمة <span className="text-red-500">*</span></label>
                            <textarea
                                name="description"
                                required
                                rows={5}
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                                placeholder="أخبر المشتري بالتفصيل ماذا ستقدم له مقابل هذه الخدمة..."
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700">رابط صورة معبرة عن الخدمة (اختياري)</label>
                            <input
                                type="url"
                                name="image_url"
                                value={formData.image_url}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                placeholder="https://example.com/cover.jpg"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                        <Link
                            to="/user-services"
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
                            نشر الخدمة
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
