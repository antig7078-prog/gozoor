import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MonitorPlay, Clock, Star, ChevronLeft, Plus, ArrowRight } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
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
                const { data, error } = await supabase
                    .from('services')
                    .select('*')
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
                                <Card
                                    className="overflow-hidden flex flex-col group h-full"
                                    hoverable
                                >
                                    <Link to={`/services/${service.id}`} className="aspect-[16/10] bg-surface-primary relative overflow-hidden block">
                                        {service.image_url ? (
                                            <img
                                                src={service.image_url}
                                                alt={service.title}
                                                loading="lazy"
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-200">
                                                <MonitorPlay className="w-16 h-16" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                            <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                                عرض التفاصيل
                                                <ChevronLeft className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </Link>

                                    <div className="p-6 flex flex-col flex-1">
                                        <Link to={`/services/${service.id}`}>
                                            <h3 className="font-black text-text-primary text-xl hover:text-brand-primary transition-colors line-clamp-2 leading-tight mb-4">
                                                {service.title}
                                            </h3>
                                        </Link>

                                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="warning" size="sm">
                                                    <Star className="w-3 h-3 ml-1 fill-current" />
                                                    5.0
                                                </Badge>
                                                <div className="flex items-center gap-1 text-[10px] text-text-muted font-black uppercase tracking-wider">
                                                    <Clock className="w-3 h-3" />
                                                    {service.delivery_time_days} أيام
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-0.5">تبدأ من</span>
                                                <span className="text-2xl font-black text-brand-primary">
                                                    {service.price} <span className="text-xs mr-0.5 font-bold">ج.م</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
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




