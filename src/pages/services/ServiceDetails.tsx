import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MonitorPlay, ShoppingCart, ArrowRight, Star, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useCartStore } from '../../lib/store/cartStore';

interface Service {
    id: string;
    freelancer_id: string;
    title: string;
    description: string;
    price: number;
    delivery_time_days: number;
    image_url: string;
    created_at: string;
}

export const ServiceDetails = () => {
    const { id } = useParams<{ id: string }>();
    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);

    const addItem = useCartStore((state) => state.addItem);

    useEffect(() => {
        const fetchService = async () => {
            if (!id) return;
            try {
                const { data, error } = await supabase
                    .from('services')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                if (data) setService(data);
            } catch (error) {
                console.error('Error fetching service details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchService();
    }, [id]);

    const addToCart = () => {
        if (!service) return;
        addItem({
            id: service.id,
            title: service.title,
            price: service.price,
            image_url: service.image_url
        });
        toast.success(`تمت إضافة ${service.title} إلى السلة!`);
    };

    if (loading) {
        return (
            <div className="flex justify-center py-32">
                <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="text-center py-32">
                <h2 className="text-2xl font-bold text-slate-700">لم يتم العثور على الخدمة</h2>
                <Link to="/services" className="text-emerald-600 hover:underline mt-4 inline-block">
                    العودة لصفحة الخدمات
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-8 text-right" dir="rtl">
            <Link to="/services" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-medium mb-8 transition-colors">
                <ArrowRight className="w-5 h-5" />
                العودة للخدمات
            </Link>

            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-8 lg:gap-0">
                {/* Left Side: Image & Description */}
                <div className="lg:w-2/3 lg:border-l border-slate-100">
                    <div className="aspect-video bg-slate-50 flex items-center justify-center relative overflow-hidden">
                        {service.image_url ? (
                            <img
                                src={service.image_url}
                                alt={service.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <MonitorPlay className="w-32 h-32 text-slate-300" />
                        )}
                    </div>

                    <div className="p-8 md:p-10">
                        <div className="mb-4">
                            <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-full">
                                خدمة عمل حر
                            </span>
                        </div>

                        <h1 className="text-3xl font-black text-slate-800 mb-6 leading-tight max-w-4xl">
                            {service.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 mb-10 pb-8 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-amber-400 fill-current" />
                                <span className="font-bold text-slate-800">5.0</span>
                                <span className="text-slate-500">(12 تقييم)</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 font-medium">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                24 طلب مكتمل
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-black text-slate-800 mb-4">عن هذه الخدمة</h2>
                            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {service.description || 'لا يوجد وصف تفصيلي متوفر لهذه الخدمة.'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Pricing & Order Card */}
                <div className="lg:w-1/3 p-8 lg:p-10 bg-slate-50 lg:bg-white">
                    <div className="sticky top-28 bg-white border-2 border-emerald-50 rounded-2xl p-8 shadow-xl shadow-emerald-900/5">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-600">سعر الخدمة</h3>
                            <div className="text-3xl font-black text-emerald-600">${service.price}</div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3 text-slate-700 font-medium">
                                <Clock className="w-5 h-5 text-slate-400" />
                                مدة التسليم: {service.delivery_time_days} أيام
                            </div>
                            <div className="flex items-start gap-3 text-slate-700 font-medium">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                                جودة عالية في التنفيذ والمتابعة
                            </div>
                            <div className="flex items-start gap-3 text-slate-700 font-medium">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                                دعم فني ما بعد التسليم
                            </div>
                        </div>

                        <button
                            onClick={addToCart}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-200 active:scale-95 mb-4"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            طلب الخدمة (أضف للسلة)
                        </button>

                        <div className="text-center flex justify-center items-center gap-2 text-sm font-medium text-slate-500 bg-slate-50 py-3 rounded-xl border border-slate-100">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            دفع آمن ومضمون من المنصة
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
