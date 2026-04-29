import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MonitorPlay, ShoppingCart, ChevronRight, Star, Clock, ShieldCheck, CheckCircle2, Share2, Heart, Award, Zap } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useCartStore } from '../../../lib/store/cartStore';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { PageContainer } from '../../../components/shared/PageContainer';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';

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
    const requireAuth = useRequireAuth();

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
        if (!requireAuth('سجّل دخولك الأول عشان تقدر تطلب الخدمة دي 🔐')) return;
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
        return <LoadingSpinner fullPage message="جاري تحميل تفاصيل الخدمة..." />;
    }

    if (!service) {
        return (
            <PageContainer>
                <div className="text-center py-32 bg-white rounded-[var(--radius-card)] border border-border-subtle shadow-2xl shadow-slate-200/50 max-w-2xl mx-auto">
                    <div className="w-24 h-24 bg-surface-primary rounded-full flex items-center justify-center mx-auto mb-8">
                        <MonitorPlay className="w-12 h-12 text-slate-200" />
                    </div>
                    <h2 className="text-3xl font-black text-text-primary mb-4">الخدمة غير موجودة</h2>
                    <p className="text-text-muted font-bold mb-10">عذراً، لم نتمكن من العثور على الخدمة المطلوبة.</p>
                    <Link 
                        to="/services" 
                        className="inline-flex items-center gap-3 px-8 py-4 bg-brand-primary text-white rounded-full font-black shadow-xl shadow-brand-primary/20 hover:scale-105 transition-all"
                    >
                        <ChevronRight className="w-5 h-5" />
                        العودة للخدمات
                    </Link>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer maxWidth="lg">
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-10"
            >
                <Link 
                    to="/services" 
                    className="group inline-flex items-center gap-3 px-5 py-2.5 bg-white border border-border-subtle rounded-full text-text-secondary hover:text-brand-primary hover:border-brand-primary/20 font-black text-sm transition-all shadow-sm"
                >
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    العودة لصفحة الخدمات
                </Link>
            </motion.div>

            <div className="flex flex-col lg:flex-row gap-10 items-start">
                {/* Main Content Area */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex-1 space-y-10"
                >
                    {/* Media Gallery (Single Image for now) */}
                    <div className="relative aspect-[16/9] rounded-[40px] overflow-hidden bg-slate-100 border border-border-subtle group shadow-2xl shadow-slate-200/50">
                        {service.image_url ? (
                            <img
                                src={service.image_url}
                                alt={service.title}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-200">
                                <MonitorPlay className="w-32 h-32" />
                            </div>
                        )}
                        <div className="absolute top-6 right-6 flex flex-col gap-3">
                            <button className="p-3 bg-white/80 backdrop-blur-xl rounded-2xl text-text-primary hover:bg-brand-primary hover:text-white transition-all shadow-xl shadow-black/5">
                                <Heart className="w-5 h-5" />
                            </button>
                            <button className="p-3 bg-white/80 backdrop-blur-xl rounded-2xl text-text-primary hover:bg-brand-primary hover:text-white transition-all shadow-xl shadow-black/5">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Service Info Header */}
                    <div className="bg-white rounded-[var(--radius-card)] p-10 border border-border-subtle shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-bl-full -mr-16 -mt-16"></div>
                        
                        <div className="flex items-center gap-4 mb-8">
                            <div className="px-5 py-2 bg-brand-primary/10 text-brand-primary rounded-2xl text-xs font-black tracking-widest uppercase flex items-center gap-2">
                                <Award className="w-4 h-4" />
                                خدمة احترافية مختارة
                            </div>
                            <div className="h-6 w-px bg-slate-100"></div>
                            <div className="flex items-center gap-2 text-amber-500 font-black">
                                <Star className="w-5 h-5 fill-current" />
                                5.0
                                <span className="text-slate-300 text-sm mr-1 font-bold">(12 تقييم)</span>
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-text-primary leading-[1.15] mb-8">
                            {service.title}
                        </h1>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-surface-primary rounded-3xl border border-border-subtle/50">
                            <div className="space-y-1">
                                <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">تاريخ النشر</p>
                                <p className="text-slate-700 font-bold">{new Date(service.created_at).toLocaleDateString('ar-EG')}</p>
                            </div>
                            <div className="space-y-1 text-center md:text-right">
                                <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">طلبات مكتملة</p>
                                <p className="text-slate-700 font-bold">24 طلب</p>
                            </div>
                            <div className="space-y-1 text-center md:text-right">
                                <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">سرعة الرد</p>
                                <p className="text-slate-700 font-bold">خلال ساعات</p>
                            </div>
                            <div className="space-y-1 text-left md:text-right">
                                <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">المستوى</p>
                                <p className="text-brand-primary font-bold">بائع متميز</p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-[var(--radius-card)] p-10 border border-border-subtle shadow-sm">
                        <h2 className="text-2xl font-black text-text-primary mb-8 flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-brand-primary rounded-full"></div>
                            تفاصيل الخدمة
                        </h2>
                        <div className="prose prose-slate max-w-none">
                            <div className="text-text-secondary font-bold text-lg leading-[1.8] whitespace-pre-wrap">
                                {service.description || 'لا يوجد وصف تفصيلي متوفر لهذه الخدمة.'}
                            </div>
                        </div>

                        {/* Features List */}
                        <div className="grid md:grid-cols-2 gap-4 mt-12 pt-10 border-t border-slate-50">
                            {[
                                'تنفيذ احترافي بأعلى جودة',
                                'التزام تام بمواعيد التسليم',
                                'متابعة وتحديثات مستمرة',
                                'دعم فني واستشارات مجانية'
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-brand-primary/5 text-slate-700 font-bold group hover:bg-brand-primary hover:text-white transition-all cursor-default">
                                    <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                        <CheckCircle2 className="w-5 h-5 text-brand-primary group-hover:text-white" />
                                    </div>
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Pricing & Checkout Card (Sticky) */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-full lg:w-96 sticky top-28"
                >
                    <div className="bg-white rounded-[40px] border border-border-subtle shadow-2xl shadow-slate-300/50 p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-2 bg-brand-primary"></div>
                        
                        <div className="flex justify-between items-end mb-10">
                            <div className="space-y-1">
                                <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">السعر الأساسي</p>
                                <p className="text-4xl font-black text-text-primary">{service.price} <span className="text-sm mr-1">ج.م</span></p>
                            </div>
                            <div className="p-3 bg-brand-primary/10 rounded-2xl">
                                <Zap className="w-6 h-6 text-brand-primary fill-current" />
                            </div>
                        </div>

                        <div className="space-y-6 mb-10">
                            <div className="flex items-center justify-between p-4 bg-surface-primary rounded-2xl border border-border-subtle/50 group hover:border-brand-primary/30 transition-all">
                                <div className="flex items-center gap-4 text-text-secondary font-black text-xs uppercase tracking-widest">
                                    <Clock className="w-5 h-5 text-brand-primary" />
                                    وقت التسليم المتوقع
                                </div>
                                <span className="text-text-primary font-black text-sm">{service.delivery_time_days} أيام</span>
                            </div>
                            
                            <div className="space-y-4">
                                <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-4">ما الذي ستحصل عليه؟</p>
                                {[
                                    'تنفيذ كامل لمتطلبات الخدمة',
                                    'عدد مفتوح من التعديلات',
                                    'ملفات المصدر (إن وجدت)',
                                    'دعم فني لمدة 30 يوم'
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={addToCart}
                                className="w-full py-5 bg-brand-primary text-white rounded-[var(--radius-button)] font-black text-lg shadow-2xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group"
                            >
                                <ShoppingCart className="w-6 h-6 group-hover:-translate-y-1 group-hover:rotate-12 transition-transform" />
                                طلب الخدمة الآن
                            </button>
                            
                            <div className="flex items-center justify-center gap-3 py-4 text-text-muted font-black text-[10px] uppercase tracking-widest border-t border-slate-50 mt-6">
                                <ShieldCheck className="w-4 h-4 text-brand-primary" />
                                دفع آمن عبر المنصة
                            </div>
                        </div>
                    </div>

                    {/* Seller Quick Info */}
                    <div className="mt-8 p-6 bg-brand-bg rounded-[30px] flex items-center gap-4 text-white">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                            <MonitorPlay className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">البائع</p>
                            <p className="font-black">متخصص معتمد</p>
                        </div>
                        <Link to="#" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                            <ChevronRight className="w-5 h-5 -rotate-180" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </PageContainer>
    );
};




