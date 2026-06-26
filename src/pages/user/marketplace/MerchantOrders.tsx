import { useEffect, useState } from 'react';
import { marketplaceService } from '../../../services/marketplaceService';
import { notificationService } from '../../../services/notificationService';
import { useAuth } from '../../../contexts/AuthContext';
import { Package, Clock, CheckCircle2, XCircle, Truck, ShoppingBag, Hash, Calendar, Tag, User, MessageCircle, Bell, Building, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageContainer } from '../../../components/shared/PageContainer';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { PageHeader } from '../../../components/shared/PageHeader';
import { toast } from 'react-hot-toast';

interface OrderItem {
    id: string;
    quantity: number;
    price_at_purchase: number;
    product_id: string;
    products: { 
        title: string; 
        image_url: string;
    };
}

interface Order {
    id: string;
    buyer_id: string;
    created_at: string;
    status: string;
    total_amount: number;
    shipping_address?: string;
    tracking_number?: string;
    shipping_company?: string;
    estimated_delivery_date?: string;
    buyer: {
        full_name: string;
        phone: string;
        whatsapp: string;
    };
    items: OrderItem[];
}

export const MerchantOrders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMerchantOrders = async () => {
        if (!user) return;
        try {
            const { data, error } = await marketplaceService.getMerchantOrders();
            if (error) throw new Error(error);
            setOrders(data || []);
        } catch (error: any) {
            console.error('Error fetching merchant orders:', error);
            toast.error('حدث خطأ أثناء تحميل الطلبات');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMerchantOrders();
    }, [user]);

    const [shippingForm, setShippingForm] = useState<{ orderId: string | null; tracking: string; company: string; deliveryDate: string; saving: boolean }>({
        orderId: null, tracking: '', company: '', deliveryDate: '', saving: false
    });

    const openShippingForm = (order: Order) => {
        setShippingForm({
            orderId: order.id,
            tracking: order.tracking_number || '',
            company: order.shipping_company || '',
            deliveryDate: order.estimated_delivery_date || '',
            saving: false
        });
    };

    const saveShipping = async () => {
        if (!shippingForm.orderId) return;
        setShippingForm(prev => ({ ...prev, saving: true }));
        try {
            const { error } = await marketplaceService.updateOrderShipping(shippingForm.orderId, {
                tracking_number: shippingForm.tracking || undefined,
                shipping_company: shippingForm.company || undefined,
                estimated_delivery_date: shippingForm.deliveryDate || undefined
            });
            if (error) throw new Error(error);
            toast.success('تم حفظ بيانات الشحن');
            setShippingForm(prev => ({ ...prev, orderId: null }));
            fetchMerchantOrders();
        } catch (error: any) {
            toast.error(error.message || 'حدث خطأ');
        } finally {
            setShippingForm(prev => ({ ...prev, saving: false }));
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const { error } = await marketplaceService.updateOrderStatus(orderId, newStatus);
            if (error) throw new Error(error);

            const order = orders.find(o => o.id === orderId);
            const orderLabel = `#${orderId.slice(0, 8)}`;

            const statusMessages: Record<string, { title: string; content: string }> = {
                Paid: { title: 'تم تأكيد الدفع', content: `تم تأكيد دفع طلبك ${orderLabel}. جاري تجهيز الشحن.` },
                Shipped: { title: 'تم شحن طلبك', content: `تم شحن طلبك ${orderLabel}. سيتم توصيله قريباً.` },
                Delivered: { title: 'تم توصيل طلبك', content: `تم توصيل طلبك ${orderLabel} بنجاح. نأمل أن يكون المنتج على قدر توقعاتك!` },
                Cancelled: { title: 'تم إلغاء الطلب', content: `تم إلغاء طلبك ${orderLabel}.` }
            };

            const notif = statusMessages[newStatus];
            if (notif && order?.buyer_id) {
                notificationService.sendNotification({
                    userId: order.buyer_id,
                    title: notif.title,
                    content: notif.content,
                    type: newStatus === 'Cancelled' ? 'warning' : 'success',
                    link: '/market-orders'
                });
            }

            toast.success('تم تحديث حالة الطلب بنجاح');
            fetchMerchantOrders();
        } catch (error: any) {
            console.error('Error updating order status:', error);
            toast.error('فشل تحديث حالة الطلب');
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Paid': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Shipped': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Cancelled': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    if (loading) {
        return <LoadingSpinner fullPage message="جاري تحميل طلبات عملائك..." />;
    }

    return (
        <PageContainer maxWidth="lg">
            <PageHeader 
                title="إدارة طلبات العملاء"
                description="تابع طلبات الشراء الواردة لمنتجاتك وتواصل مع عملائك"
                icon={ShoppingBag}
            />

            {orders.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-[var(--radius-card)] border border-border-subtle p-20 text-center shadow-sm"
                >
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package className="w-12 h-12 text-slate-200" />
                    </div>
                    <h3 className="text-2xl font-black text-text-primary mb-2">لا توجد طلبات حتى الآن</h3>
                    <p className="text-text-muted font-bold">بمجرد قيام العملاء بشراء منتجاتك، ستظهر طلباتهم هنا.</p>
                </motion.div>
            ) : (
                <div className="space-y-8">
                    {orders.map((order, idx) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={order.id} 
                            className="bg-white rounded-[var(--radius-card)] border border-border-subtle shadow-sm overflow-hidden"
                        >
                            {/* Order Header */}
                            <div className="p-6 bg-slate-50/50 border-b border-border-subtle flex flex-wrap items-center justify-between gap-6">
                                <div className="flex items-center gap-8">
                                    <div>
                                        <div className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                                            <Hash className="w-3 h-3" /> رقم الطلب
                                        </div>
                                        <div className="font-black text-text-primary uppercase">#{order.id.split('-')[0]}</div>
                                    </div>
                                    <div className="h-10 w-px bg-slate-200"></div>
                                    <div>
                                        <div className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> التاريخ
                                        </div>
                                        <div className="font-bold text-text-primary">
                                            {new Date(order.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}
                                        </div>
                                    </div>
                                    <div className="h-10 w-px bg-slate-200"></div>
                                    <div>
                                        <div className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                                            <User className="w-3 h-3" /> العميل
                                        </div>
                                        <div className="font-bold text-text-primary">{order.buyer?.full_name || 'عميل مجهول'}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className={`px-4 py-1.5 rounded-full text-xs font-black border ${getStatusStyles(order.status)}`}>
                                        {order.status}
                                    </div>
                                    <select 
                                        className="bg-white border border-border-subtle rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                                        value={order.status}
                                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                    >
                                        <option value="Pending">قيد المراجعة</option>
                                        <option value="Paid">تم الدفع</option>
                                        <option value="Shipped">تم الشحن</option>
                                        <option value="Delivered">تم التوصيل</option>
                                        <option value="Cancelled">ملغي</option>
                                    </select>
                                    {order.status !== 'Pending' && order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                                        <button
                                            onClick={() => openShippingForm(order)}
                                            className="p-2 text-indigo-500 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all border border-indigo-100"
                                            title="بيانات الشحن"
                                        >
                                            <Truck className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Shipping Form */}
                            {shippingForm.orderId === order.id && (
                                <div className="p-6 bg-indigo-50/50 border-b border-indigo-100">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Truck className="w-4 h-4 text-indigo-500" />
                                        <h4 className="text-sm font-black text-indigo-700">تحديث بيانات الشحن</h4>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-text-muted mb-1">رقم التتبع</label>
                                            <input
                                                type="text"
                                                value={shippingForm.tracking}
                                                onChange={(e) => setShippingForm(prev => ({ ...prev, tracking: e.target.value }))}
                                                className="w-full px-4 py-2.5 bg-white border border-indigo-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                                                placeholder="مثال: SHIP123456"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-text-muted mb-1">شركة الشحن</label>
                                            <input
                                                type="text"
                                                value={shippingForm.company}
                                                onChange={(e) => setShippingForm(prev => ({ ...prev, company: e.target.value }))}
                                                className="w-full px-4 py-2.5 bg-white border border-indigo-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                                                placeholder="مثال: أرامكس"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-text-muted mb-1">تاريخ التوصيل المتوقع</label>
                                            <input
                                                type="date"
                                                value={shippingForm.deliveryDate}
                                                onChange={(e) => setShippingForm(prev => ({ ...prev, deliveryDate: e.target.value }))}
                                                className="w-full px-4 py-2.5 bg-white border border-indigo-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-4">
                                        <button
                                            onClick={saveShipping}
                                            disabled={shippingForm.saving}
                                            className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl text-xs font-black hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                                        >
                                            {shippingForm.saving ? 'جاري الحفظ...' : 'حفظ بيانات الشحن'}
                                        </button>
                                        <button
                                            onClick={() => setShippingForm(prev => ({ ...prev, orderId: null }))}
                                            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-50 transition-all"
                                        >
                                            إلغاء
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Order Content */}
                            <div className="p-6">
                                {/* Shipping Info */}
                                {order.shipping_address && (
                                    <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-2 text-[10px] text-text-muted font-black tracking-widest mb-2">
                                            <MapPin className="w-3 h-3" />
                                            عنوان الشحن
                                        </div>
                                        <p className="text-sm font-bold text-text-primary">{order.shipping_address}</p>
                                        {(order.tracking_number || order.shipping_company) && (
                                            <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-slate-200">
                                                {order.tracking_number && (
                                                    <div className="text-xs font-bold">
                                                        <span className="text-text-muted">رقم التتبع: </span>
                                                        <span className="text-text-primary dir-ltr">{order.tracking_number}</span>
                                                    </div>
                                                )}
                                                {order.shipping_company && (
                                                    <div className="text-xs font-bold">
                                                        <span className="text-text-muted">شركة الشحن: </span>
                                                        <span className="text-text-primary">{order.shipping_company}</span>
                                                    </div>
                                                )}
                                                {order.estimated_delivery_date && (
                                                    <div className="text-xs font-bold">
                                                        <span className="text-text-muted">تاريخ التوصيل: </span>
                                                        <span className="text-text-primary">{new Date(order.estimated_delivery_date).toLocaleDateString('ar-EG')}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="grid lg:grid-cols-3 gap-8">
                                    {/* Items List */}
                                    <div className="lg:col-span-2 space-y-4">
                                        <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-2">المنتجات المطلوبة</p>
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 group hover:border-brand-primary/20 transition-all">
                                                <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-50 flex-shrink-0">
                                                    <img src={item.products?.image_url} alt={item.products?.title} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-black text-text-primary text-sm">{item.products?.title}</h4>
                                                    <div className="text-[10px] font-bold text-text-muted mt-1">
                                                        الكمية: {item.quantity} × {item.price_at_purchase} ج.م
                                                    </div>
                                                </div>
                                                <div className="font-black text-text-primary">
                                                    {item.quantity * item.price_at_purchase} ج.م
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Buyer Contact & Summary */}
                                    <div className="bg-slate-50 rounded-3xl p-6 flex flex-col justify-between">
                                        <div>
                                            <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-4">التواصل مع العميل</p>
                                            <div className="space-y-3">
                                                {order.buyer?.whatsapp && (
                                                    <a 
                                                        href={`https://wa.me/${order.buyer.whatsapp}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 w-full p-3 bg-emerald-500 text-white rounded-2xl font-black text-xs hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/10"
                                                    >
                                                        <MessageCircle className="w-4 h-4" />
                                                        واتساب العميل
                                                    </a>
                                                )}
                                                {order.buyer?.phone && (
                                                    <a 
                                                        href={`tel:${order.buyer.phone}`}
                                                        className="flex items-center gap-3 w-full p-3 bg-white border border-border-subtle text-text-primary rounded-2xl font-black text-xs hover:bg-slate-50 transition-all shadow-sm"
                                                    >
                                                        <Clock className="w-4 h-4 text-brand-primary" />
                                                        اتصال هاتفي
                                                    </a>
                                                )}
                                                {!order.buyer?.phone && !order.buyer?.whatsapp && (
                                                    <p className="text-xs font-bold text-text-muted italic">لا توجد بيانات تواصل متاحة</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-slate-200">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-text-muted">إجمالي قيمة الطلب</span>
                                                <span className="text-xl font-black text-brand-primary">{order.total_amount} ج.م</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </PageContainer>
    );
};
