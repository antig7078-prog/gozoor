import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, AlertCircle, Eye, User, DollarSign, Calendar, FileText, Filter } from 'lucide-react';
import { marketplaceService } from '../../../services/marketplaceService';
import { PageContainer } from '../../../components/shared/PageContainer';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';

interface ServiceOrderListItem {
    id: string;
    service_id: string;
    client_id: string;
    freelancer_id: string;
    package_name: string;
    price: number;
    status: 'new' | 'in_progress' | 'delivered' | 'accepted' | 'completed' | 'cancelled';
    requirements: string;
    created_at: string;
    service?: {
        title: string;
        image_url?: string;
    };
    freelancer?: {
        full_name: string;
        avatar_url?: string;
    };
    client?: {
        full_name: string;
        avatar_url?: string;
    };
}

export const ServiceOrders = () => {
    const [activeTab, setActiveTab] = useState<'purchases' | 'received'>('purchases');
    const [orders, setOrders] = useState<ServiceOrderListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const { data, error } = activeTab === 'purchases'
                    ? await marketplaceService.getMyServiceOrders()
                    : await marketplaceService.getFreelancerOrders();

                if (error) throw new Error(error);
                setOrders((data || []) as ServiceOrderListItem[]);
            } catch (error) {
                console.error('Error fetching service orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [activeTab]);

    const getStatusDetails = (status: ServiceOrderListItem['status']) => {
        switch (status) {
            case 'new':
                return { label: 'جديد / قيد الانتظار', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
            case 'in_progress':
                return { label: 'قيد التنفيذ', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
            case 'delivered':
                return { label: 'تم تسليم العمل', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' };
            case 'completed':
            case 'accepted':
                return { label: 'مكتمل', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
            case 'cancelled':
                return { label: 'ملغي', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' };
            default:
                return { label: 'غير معروف', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20' };
        }
    };

    const getPackageLabel = (name: string) => {
        switch (name) {
            case 'Basic':
                return 'الباقة الأساسية';
            case 'Standard':
                return 'الباقة القياسية';
            case 'Premium':
                return 'الباقة المميزة';
            default:
                return name;
        }
    };

    const filteredOrders = orders.filter(order => {
        if (statusFilter === 'all') return true;
        return order.status === statusFilter;
    });

    const statusCounts = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <PageContainer maxWidth="xl">
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-text-primary mb-2 flex items-center gap-3">
                        <FileText className="w-8 h-8 text-brand-primary" />
                        طلبات الخدمات المبرمجة
                    </h1>
                    <p className="text-text-muted font-bold text-sm">إدارة ومتابعة طلبات الخدمات الحرّة ومشاريعك الحالية والسابقة.</p>
                </div>

                <div className="flex bg-slate-100 p-1.5 rounded-[20px] max-w-sm">
                    <button
                        onClick={() => { setActiveTab('purchases'); setStatusFilter('all'); }}
                        className={`flex-1 px-6 py-3 rounded-2xl text-xs font-black transition-all ${
                            activeTab === 'purchases'
                                ? 'bg-white text-brand-primary shadow-lg shadow-brand-primary/5'
                                : 'text-text-muted hover:text-text-secondary'
                        }`}
                    >
                        طلبات قمت بشرائها
                    </button>
                    <button
                        onClick={() => { setActiveTab('received'); setStatusFilter('all'); }}
                        className={`flex-1 px-6 py-3 rounded-2xl text-xs font-black transition-all ${
                            activeTab === 'received'
                                ? 'bg-white text-brand-primary shadow-lg shadow-brand-primary/5'
                                : 'text-text-muted hover:text-text-secondary'
                        }`}
                    >
                        طلبات واردة إليّ
                    </button>
                </div>
            </div>

            {/* Quick Status Filter Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-10">
                {[
                    { id: 'all', label: 'الكل', count: orders.length },
                    { id: 'new', label: 'قيد الانتظار', count: statusCounts['new'] || 0 },
                    { id: 'in_progress', label: 'قيد التنفيذ', count: statusCounts['in_progress'] || 0 },
                    { id: 'delivered', label: 'بانتظار المراجعة', count: statusCounts['delivered'] || 0 },
                    { id: 'completed', label: 'المكتملة', count: (statusCounts['completed'] || 0) + (statusCounts['accepted'] || 0) },
                    { id: 'cancelled', label: 'الملغاة', count: statusCounts['cancelled'] || 0 },
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setStatusFilter(item.id)}
                        className={`p-4 rounded-3xl border text-right transition-all flex flex-col justify-between min-h-[100px] ${
                            statusFilter === item.id
                                ? 'bg-brand-primary border-brand-primary text-white shadow-xl shadow-brand-primary/10'
                                : 'bg-white border-border-subtle text-text-primary hover:border-slate-300'
                        }`}
                    >
                        <span className={`text-[10px] font-black uppercase tracking-wider ${statusFilter === item.id ? 'text-white/60' : 'text-text-muted'}`}>
                            {item.label}
                        </span>
                        <span className="text-3xl font-black">{item.count}</span>
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            {loading ? (
                <div className="py-20">
                    <LoadingSpinner message="جاري جلب الطلبات..." />
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-[40px] border border-border-subtle shadow-sm max-w-2xl mx-auto">
                    <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-black text-text-primary mb-2">لا توجد طلبات حالياً</h3>
                    <p className="text-text-muted font-bold text-sm mb-8">
                        {statusFilter === 'all'
                            ? (activeTab === 'purchases' ? 'لم تقم بشراء أي خدمات بعد.' : 'لم تتلقى أي طلبات لخدماتك بعد.')
                            : 'لا توجد طلبات مطابقة للفلتر المحدد.'}
                    </p>
                    {activeTab === 'purchases' && statusFilter === 'all' && (
                        <Link
                            to="/services"
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-primary text-white rounded-full font-black text-sm shadow-xl shadow-brand-primary/10 hover:scale-105 transition-all"
                        >
                            تصفح الخدمات المتاحة
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOrders.map((order) => {
                        const statusObj = getStatusDetails(order.status);
                        const otherPartyName = activeTab === 'purchases'
                            ? order.freelancer?.full_name || 'مستقل منصة جذور'
                            : order.client?.full_name || 'عميل منصة جذور';

                        return (
                            <motion.div
                                key={order.id}
                                layout
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-[32px] border border-border-subtle shadow-sm overflow-hidden flex flex-col justify-between group hover:border-slate-300 transition-all hover:shadow-xl hover:shadow-slate-100/50"
                            >
                                <div className="p-6 space-y-5">
                                    {/* Service Thumbnail / Header */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-surface-primary border border-border-subtle shrink-0 overflow-hidden flex items-center justify-center text-slate-300">
                                            {order.service?.image_url ? (
                                                <img src={order.service.image_url} alt={order.service?.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <FileText className="w-8 h-8 text-brand-primary" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className={`inline-block px-2.5 py-1 text-[9px] font-black rounded-lg border uppercase tracking-wider mb-2 ${statusObj.color}`}>
                                                {statusObj.label}
                                            </span>
                                            <h3 className="font-black text-text-primary text-sm leading-snug group-hover:text-brand-primary transition-colors line-clamp-2">
                                                {order.service?.title || 'عنوان الخدمة المحذوفة'}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Order Details Grid */}
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 text-xs">
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-text-muted font-black">
                                                {activeTab === 'purchases' ? 'المستقل' : 'العميل'}
                                            </p>
                                            <p className="font-bold text-text-secondary flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                                                <span className="truncate">{otherPartyName}</span>
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-text-muted font-black">الباقة المختارة</p>
                                            <p className="font-black text-text-primary">
                                                {getPackageLabel(order.package_name)}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-text-muted font-black">تاريخ الطلب</p>
                                            <p className="font-bold text-text-secondary flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                                                {new Date(order.created_at).toLocaleDateString('ar-EG')}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-text-muted font-black">القيمة المالية</p>
                                            <p className="font-black text-brand-primary flex items-center gap-1">
                                                <DollarSign className="w-3.5 h-3.5 shrink-0" />
                                                {order.price} ج.م
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Action */}
                                <div className="p-4 bg-slate-50 border-t border-slate-100/50 flex justify-end">
                                    <Link
                                        to={`/service-orders/${order.id}`}
                                        className="w-full py-3 px-4 bg-white border border-border-subtle rounded-2xl text-xs font-black text-text-primary hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all text-center flex items-center justify-center gap-2"
                                    >
                                        <Eye className="w-4 h-4" />
                                        عرض تفاصيل الطلب والمتابعة
                                    </Link>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </PageContainer>
    );
};
