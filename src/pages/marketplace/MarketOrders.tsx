import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Package, Clock, CheckCircle2, XCircle, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Pending': return <Clock className="w-5 h-5 text-amber-500" />;
            case 'Paid': return <CheckCircle2 className="w-5 h-5 text-blue-500" />;
            case 'Shipped': return <Truck className="w-5 h-5 text-indigo-500" />;
            case 'Delivered': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            case 'Cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
            default: return <Package className="w-5 h-5 text-slate-500" />;
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
        return (
            <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-8">
            <h1 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-3">
                <Package className="w-8 h-8 text-emerald-600" />
                طلباتي (المنتجات)
            </h1>

            {orders.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
                    <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-700">لم تقم بأي طلبات بعد</h3>
                    <p className="text-slate-500 mt-2 mb-6">اكتشف منتجاتنا المميزة في المتجر وابدأ التسوق.</p>
                    <Link to="/marketplace" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors">
                        تصفح المتجر
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-6 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <div className="text-sm text-slate-500 font-medium mb-1">رقم الطلب</div>
                                    <div className="font-mono text-slate-800 font-bold">{order.id.split('-')[0].toUpperCase()}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-slate-500 font-medium mb-1">التاريخ</div>
                                    <div className="text-slate-800 font-bold">{new Date(order.created_at).toLocaleDateString('ar-EG')}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-slate-500 font-medium mb-1">الإجمالي</div>
                                    <div className="text-emerald-600 font-black text-lg">${order.total_amount}</div>
                                </div>
                                <div>
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold ${order.status === 'Pending' ? 'bg-amber-50 text-amber-700' :
                                        order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700' :
                                            order.status === 'Cancelled' ? 'bg-red-50 text-red-700' :
                                                'bg-blue-50 text-blue-700'
                                        }`}>
                                        {getStatusIcon(order.status)}
                                        {getStatusText(order.status)}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 divide-y divide-slate-100">
                                {order.order_items.map((item) => (
                                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                                        <div className="w-16 h-16 bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                                            {item.products?.image_url ? (
                                                <img src={item.products.image_url} alt={item.products.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <Package className="w-6 h-6 text-slate-300" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-800">{item.products?.title || 'منتج غير معروف'}</h4>
                                            <div className="text-sm text-slate-500 mt-1">الكمية: {item.quantity}</div>
                                        </div>
                                        <div className="font-bold text-slate-700">
                                            ${item.price_at_purchase}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
