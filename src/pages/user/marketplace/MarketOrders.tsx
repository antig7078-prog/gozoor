import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { Package, Clock, CheckCircle2, XCircle, Truck, ShoppingBag, ChevronLeft, Calendar, Hash, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageContainer } from '../../../components/shared/PageContainer';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { PageHeader } from '../../../components/shared/PageHeader';

interface OrderItem {
    id: string;
    product_id: string;
    quantity: number;
    price_at_purchase: number;
    products: { title: string; image_url: string };
}

interface Order {
    id: string;
    total_amount: number;
    status: string;
    created_at: string;
    order_items: OrderItem[];
}

export const MarketOrders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            try {
                // Fetch orders along with their order_items and product details
                const { data, error } = await supabase
                    .from('orders')
                    .select(`
                        id, total_amount, status, created_at,
                        order_items ( id, quantity, price_at_purchase, product_id, products ( title, image_url ) )
                    `)
                    .eq('buyer_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                if (data) setOrders(data as any);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Paid': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Shipped': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'Delivered': return 'bg-brand-primary-light/20 text-brand-primary border-brand-primary/10';
            case 'Cancelled': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-surface-primary text-text-secondary border-border-subtle';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Pending': return <Clock className="w-4 h-4" />;
            case 'Paid': return <CheckCircle2 className="w-4 h-4" />;
            case 'Shipped': return <Truck className="w-4 h-4" />;
            case 'Delivered': return <CheckCircle2 className="w-4 h-4" />;
            case 'Cancelled': return <XCircle className="w-4 h-4" />;
            default: return <Package className="w-4 h-4" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'Pending': return 'قيد المراجعة';
            case 'Paid': return 'تم الدفع';
            case 'Shipped': return 'جاري التوصيل';
            case 'Delivered': return 'تم التوصيل';
            case 'Cancelled': return 'ملغي';
            default: return status;
        }
    };

    if (loading) {
        return <LoadingSpinner fullPage message="جاري تحميل طلباتك السابقة..." />;
    }

    return (
        <PageContainer maxWidth="md">
            <PageHeader 
                title="طلباتي"
                description="تتبع حالة مشترياتك وطلباتك السابقة من سوق جذور"
                icon={Package}
                actions={
                    <Link 
                        to="/marketplace" 
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-surface-primary text-text-primary hover:bg-brand-primary hover:text-white rounded-[var(--radius-button)] text-sm font-black transition-all shadow-sm group"
                    >
                        متابعة التسوق
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                }
            />

            {orders.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-[var(--radius-card)] border border-border-subtle p-24 text-center shadow-2xl max-w-3xl mx-auto mt-12"
                >
                    <div className="w-32 h-32 bg-surface-primary rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <Package className="w-16 h-16 text-slate-200" />
                    </div>
                    <h3 className="text-3xl font-black text-text-primary mb-4">لا توجد طلبات بعد</h3>
                    <p className="text-text-muted font-bold max-w-sm mx-auto mb-10 leading-relaxed">اكتشف المنتجات والأدوات الرائعة المتاحة في المتجر وابدأ تجربتك الأولى مع جذور.</p>
                    <Link to="/marketplace" className="inline-flex items-center gap-3 px-10 py-5 bg-brand-primary text-white rounded-full font-black shadow-xl shadow-brand-primary/20 hover:scale-105 transition-all">
                        <ShoppingBag className="w-6 h-6" />
                        تصفح المتجر الآن
                    </Link>
                </motion.div>
            ) : (
                <div className="space-y-8">
                    {orders.map((order, idx) => (
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={order.id} 
                            className="bg-white rounded-[var(--radius-card)] border border-border-subtle shadow-sm hover:shadow-xl transition-all overflow-hidden relative group"
                        >
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-primary opacity-20 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="p-8 bg-surface-primary/50 border-b border-border-subtle flex flex-wrap items-center justify-between gap-8">
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-[10px] text-text-muted font-black tracking-widest uppercase">
                                            <Hash className="w-3 h-3" />
                                            رقم الطلب
                                        </div>
                                        <div className="font-black text-text-primary text-lg uppercase">#{order.id.split('-')[0]}</div>
                                    </div>
                                    <div className="h-10 w-px bg-slate-200 hidden sm:block"></div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-[10px] text-text-muted font-black tracking-widest uppercase">
                                            <Calendar className="w-3 h-3" />
                                            تاريخ الطلب
                                        </div>
                                        <div className="text-text-primary font-black">{new Date(order.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-2 text-[10px] text-text-muted font-black tracking-widest uppercase">
                                            <Tag className="w-3 h-3" />
                                            المبلغ الإجمالي
                                        </div>
                                        <div className="text-brand-primary font-black text-2xl">{order.total_amount} <span className="text-xs mr-0.5">ج.م</span></div>
                                    </div>
                                    <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black border transition-all ${getStatusStyles(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        {getStatusText(order.status)}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 space-y-6">
                                {order.order_items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-6 bg-surface-primary/30 p-4 rounded-2xl border border-transparent hover:border-border-subtle hover:bg-white transition-all">
                                        <div className="w-20 h-20 bg-white rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-border-subtle shadow-sm">
                                            {item.products?.image_url ? (
                                                <img src={item.products.image_url} alt={item.products.title} loading="lazy" className="w-full h-full object-cover" />
                                            ) : (
                                                <ShoppingBag className="w-8 h-8 text-slate-200" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-text-primary text-lg mb-1">{item.products?.title || 'منتج غير معروف'}</h4>
                                            <div className="text-xs font-bold text-text-muted flex items-center gap-2">
                                                الكمية: <span className="text-text-primary">{item.quantity}</span>
                                                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                                سعر الوحدة: <span className="text-text-primary">{item.price_at_purchase} ج.م</span>
                                            </div>
                                        </div>
                                        <div className="font-black text-text-primary text-xl">
                                            {(item.price_at_purchase * item.quantity).toFixed(0)} <span className="text-[10px] mr-0.5 text-text-muted font-bold uppercase">ج.م</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="px-8 py-4 bg-surface-primary/30 border-t border-slate-50 flex justify-center items-center">
                                <Link 
                                    to={`/marketplace/${order.order_items[0]?.product_id}`}
                                    className="text-[10px] font-black text-text-muted hover:text-brand-primary uppercase tracking-[2px] transition-colors"
                                >
                                    عرض تفاصيل المنتجات في هذا الطلب
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </PageContainer>
    );
};




