import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MonitorPlay, Clock, Star, ChevronLeft, Plus, ArrowRight, Sparkles } from 'lucide-react';
import { marketplaceService } from '../../../services/marketplaceService';
import { PageContainer } from '../../../components/shared/PageContainer';
import { PageHeader } from '../../../components/shared/PageHeader';
import { SearchBar } from '../../../components/shared/SearchBar';
import { Card } from '../../../components/shared/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { Link, useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../../../hooks/useRequireAuth';

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

export const ServicesPage = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const requireAuth = useRequireAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const { data, error } = await marketplaceService.getServices();

                if (error) throw new Error(error);
                if (data) setServices(data as any[]);
            } catch (error) {
                console.error('Error fetching services:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    const filteredServices = services.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) {
        return <LoadingSpinner fullPage message="جاري استعراض الخدمات المهنية..." />;
    }

    return (
        <PageContainer maxWidth="xl">
            <PageHeader
                title="الخدمات الاحترافية"
                description="استعن بنخبة من المتخصصين لإنجاز مهامك وتطوير أعمالك الزراعية والتقنية بكل سهولة وموثوقية."
                icon={MonitorPlay}
                actions={
                    <Button
                        icon={Plus}
                        variant="premium"
                        onClick={() => {
                            if (!requireAuth('سجّل دخولك الأول عشان تقدر تعرض خدمتك 🛠️')) return;
                            navigate('/services/add');
                        }}
                    >
                        اعرض خدمتك
                    </Button>
                }
            />

            {/* Search & Filters */}
            <div className="mb-12">
                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="ابحث عن خدمة (برمجة، تصميم، كتابة، استشارات)..."
                    className="md:w-full"
                />
            </div>

            {filteredServices.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    <AnimatePresence>
                        {filteredServices.map((service, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                key={service.id}
                            >
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                                key={service.id}
                                className="group bg-white rounded-[40px] border border-slate-100/60 overflow-hidden hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] transition-all duration-700 flex flex-col h-full relative"
                            >
                                {/* Image/Media Section */}
                                <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
                                    <Link to={`/services/${service.id}`} className="block w-full h-full">
                                        {service.image_url ? (
                                            <div className="w-full h-full relative">
                                                <img
                                                    src={service.image_url}
                                                    alt={service.title}
                                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-200">
                                                <MonitorPlay className="w-16 h-16" />
                                            </div>
                                        )}
                                    </Link>

                                    {/* Glassmorphism Price Badge */}
                                    <div className="absolute top-6 left-6">
                                        <div className="px-5 py-2.5 bg-white/80 backdrop-blur-2xl border border-white/50 rounded-[22px] shadow-glass flex flex-col items-center">
                                            <span className="text-[9px] text-slate-500 font-black uppercase tracking-tighter mb-0.5">تبدأ من</span>
                                            <span className="text-xl font-black text-brand-primary leading-none">
                                                {service.price}<span className="text-[10px] mr-1 font-bold">ج.م</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="absolute top-6 right-6">
                                        <div className="bg-emerald-500 text-white text-[10px] font-black px-5 py-2 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center gap-2 border border-emerald-400/30">
                                            <Sparkles className="w-3.5 h-3.5" />
                                            خدمة مميزة
                                        </div>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-8 pb-10 flex flex-col flex-1">
                                    {/* Meta Info */}
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-4 py-1.5 rounded-xl text-[10px] font-black border border-amber-100/50">
                                            <Star className="w-3.5 h-3.5 fill-current" />
                                            5.0
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                            <div className="w-2 h-2 rounded-full bg-brand-primary/30 animate-pulse" />
                                            تسليم خلال {service.delivery_time_days} أيام
                                        </div>
                                    </div>

                                    <Link to={`/services/${service.id}`}>
                                        <h3 className="text-2xl font-black text-slate-900 group-hover:text-brand-primary transition-colors line-clamp-2 leading-tight mb-8 tracking-tight">
                                            {service.title}
                                        </h3>
                                    </Link>

                                    {/* Professional Action Section */}
                                    <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between gap-6">
                                        <div className="flex -space-x-4 rtl:space-x-reverse group/avatars cursor-pointer">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-10 h-10 rounded-2xl border-4 border-white bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 transition-all hover:z-10 hover:-translate-y-2 hover:rotate-6">
                                                    <img src={`https://i.pravatar.cc/100?img=${i + 30}`} alt="avatar" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                            <div className="w-10 h-10 rounded-2xl border-4 border-white bg-brand-bg flex items-center justify-center text-[9px] font-black text-white shrink-0 shadow-lg">
                                                +12
                                            </div>
                                        </div>

                                        <Link
                                            to={`/services/${service.id}`}
                                            className="w-12 h-12 bg-surface-primary text-text-primary hover:bg-brand-primary hover:text-white rounded-2xl transition-all duration-500 group/btn shadow-sm flex items-center justify-center"
                                        >
                                            <ChevronLeft className="w-6 h-6 group-hover/btn:-translate-x-0.5 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <Card className="text-center py-20 max-w-2xl mx-auto border-dashed border-2 bg-surface-primary/50">
                    <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                        <MonitorPlay className="w-12 h-12 text-slate-200" />
                    </div>
                    <h3 className="text-2xl font-black text-text-primary mb-4">لم يتم العثور على نتائج</h3>
                    <p className="text-text-muted font-bold max-w-sm mx-auto mb-10 leading-relaxed">
                        عذراً، لم نتمكن من العثور على أي خدمات تطابق بحثك حالياً. جرب كلمات بحث أخرى.
                    </p>
                    <Button
                        onClick={() => setSearchQuery('')}
                        variant="secondary"
                        icon={ArrowRight}
                    >
                        مسح البحث
                    </Button>
                </Card>
            )}
        </PageContainer>
    );
};




