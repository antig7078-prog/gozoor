import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, MonitorPlay, Clock, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';

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

    return (
        <div className="max-w-7xl mx-auto py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                    <MonitorPlay className="w-8 h-8 text-emerald-600" />
                    خدمات المستقلين (Freelancing)
                </h1>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="ابحث عن خدمة (برمجة، تصميم، كتابة)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        />
                    </div>
                    <button className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                </div>
            ) : filteredServices.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredServices.map((service, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            key={service.id}
                            className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col"
                        >
                            <Link to={`/services/${service.id}`} className="aspect-video bg-slate-50 relative overflow-hidden block">
                                {service.image_url ? (
                                    <img
                                        src={service.image_url}
                                        alt={service.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <MonitorPlay className="w-12 h-12" />
                                    </div>
                                )}
                            </Link>

                            <div className="p-5 flex flex-col flex-1">
                                <Link to={`/services/${service.id}`}>
                                    <h3 className="font-bold text-slate-800 text-lg hover:text-emerald-600 transition-colors line-clamp-2 leading-tight h-14">
                                        {service.title}
                                    </h3>
                                </Link>

                                <div className="flex items-center justify-between mt-4">
                                    <span className="flex items-center gap-1 text-sm text-amber-500 font-bold">
                                        <Star className="w-4 h-4 fill-current" />
                                        5.0
                                    </span>
                                    <span className="flex items-center gap-1 text-sm text-slate-500 font-medium">
                                        <Clock className="w-4 h-4" />
                                        {service.delivery_time_days} أيام التسليم
                                    </span>
                                </div>

                                <div className="border-t border-slate-100 mt-4 pt-4 flex items-center justify-between">
                                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">يبدأ من</span>
                                    <span className="text-xl font-black text-emerald-600">
                                        ${service.price}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                    <MonitorPlay className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-700">لا يوجد خدمات حالياً</h3>
                    <p className="text-slate-500 mt-2">لم يتم العثور على خدمات تطابق بحثك.</p>
                </div>
            )}
        </div>
    );
};
