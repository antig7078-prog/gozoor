import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { MonitorPlay, Plus, Trash2, Calendar, Clock, ExternalLink, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { PageContainer } from '../../../components/shared/PageContainer';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { PageHeader } from '../../../components/shared/PageHeader';

interface Service {
    id: string;
    title: string;
    price: number;
    delivery_time_days: number;
    created_at: string;
    image_url?: string;
}

export const UserServices = () => {
    const { user } = useAuth();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('services')
                    .select('*')
                    .eq('freelancer_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                if (data) setServices(data);
            } catch (error) {
                console.error('Error fetching services:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, [user]);

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return;
        try {
            const { error } = await supabase.from('services').delete().eq('id', id);
            if (error) throw error;
            toast.success('تم الحذف بنجاح');
            setServices(services.filter(s => s.id !== id));
        } catch (error: any) {
            toast.error('حدث خطأ أثناء الحذف');
            console.error(error);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <PageContainer maxWidth="lg">
            <PageHeader 
                badge={
                    <div className="flex items-center gap-2 text-brand-primary font-black text-xs uppercase tracking-widest bg-brand-primary/10 px-3 py-1 rounded-full w-fit">
                        <Sparkles className="w-3 h-3" />
                        منصة الخدمات الاحترافية
                    </div>
                }
                title="إدارة خدماتي"
                icon={MonitorPlay}
                actions={
                    <Link
                        to="/services/add"
                        className="flex items-center gap-3 px-8 py-4 bg-brand-primary text-white rounded-[var(--radius-button)] font-black text-lg shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all group"
                    >
                        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                        إضافة خدمة جديدة
                    </Link>
                }
            />

            <AnimatePresence mode="wait">
                {services.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[40px] border border-border-subtle p-20 text-center shadow-2xl shadow-slate-200/50 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-surface-primary rounded-bl-full"></div>
                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-surface-primary rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <MonitorPlay className="w-12 h-12 text-slate-300" />
                            </div>
                            <h3 className="text-2xl font-black text-text-primary mb-3">لم تقم بتقديم أي خدمات بعد</h3>
                            <p className="text-text-secondary font-bold text-lg mb-10 max-w-md mx-auto">ابدأ بعرض مهاراتك وتقديم خدماتك للعملاء عبر المنصة وابدأ بتحقيق دخل إضافي.</p>
                            <Link
                                to="/services/add"
                                className="inline-flex items-center gap-3 px-8 py-4 bg-brand-bg text-white rounded-2xl font-black transition-all hover:bg-brand-bg/90"
                            >
                                <Plus className="w-5 h-5" />
                                ابدأ الآن
                            </Link>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[40px] border border-border-subtle shadow-2xl shadow-slate-200/50 overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead>
                                    <tr className="bg-surface-primary/50 border-b border-border-subtle">
                                        <th className="px-8 py-6 font-black text-text-muted text-xs uppercase tracking-widest">معلومات الخدمة</th>
                                        <th className="px-8 py-6 font-black text-text-muted text-xs uppercase tracking-widest">السعر</th>
                                        <th className="px-8 py-6 font-black text-text-muted text-xs uppercase tracking-widest">التسليم</th>
                                        <th className="px-8 py-6 font-black text-text-muted text-xs uppercase tracking-widest text-center">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {services.map((service) => (
                                        <tr key={service.id} className="group hover:bg-surface-primary/50 transition-all">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-12 bg-slate-100 rounded-xl overflow-hidden shadow-inner flex-shrink-0">
                                                        {service.image_url ? (
                                                            <img src={service.image_url} alt={service.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                                <MonitorPlay className="w-6 h-6" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-text-primary line-clamp-1">{service.title}</h4>
                                                        <div className="flex items-center gap-2 mt-1 text-text-muted text-xs font-bold">
                                                            <Calendar className="w-3 h-3" />
                                                            نشر في: {new Date(service.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xl font-black text-brand-primary">{service.price}</span>
                                                    <span className="text-[10px] font-black text-text-muted uppercase">ج.م</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 text-text-secondary rounded-full w-fit font-black text-xs">
                                                    <Clock className="w-3 h-3" />
                                                    {service.delivery_time_days} أيام
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-center gap-3">
                                                    <Link
                                                        to={`/services/${service.id}`}
                                                        className="p-3 text-text-muted hover:text-brand-primary hover:bg-brand-primary/10 rounded-2xl transition-all"
                                                        title="عرض الخدمة"
                                                    >
                                                        <ExternalLink className="w-5 h-5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(service.id)}
                                                        className="p-3 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                                        title="حذف الخدمة"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </PageContainer>
    );
};




