import { useEffect, useState } from 'react';
import { marketplaceService } from '../../services/marketplaceService';
import { ShoppingBag, Search, Clock, CheckCircle2, XCircle, Truck, CreditCard, Hash, User, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageContainer } from '../../components/shared/PageContainer';
import { PageHeader } from '../../components/shared/PageHeader';
import { SearchBar } from '../../components/shared/SearchBar';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { EmptyState } from '../../components/shared/EmptyState';
import { StatCard } from '../../components/shared/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/shared/Card';

export const AdminMarketplaceOrders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await marketplaceService.getAllMarketplaceOrders();
            if (error) {
                toast.error("فشل تحميل طلبات المتجر");
                setOrders([]);
            } else {
                setOrders(data || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        try {
            const { error } = await marketplaceService.updateOrderStatus(orderId, newStatus);
            if (error) throw new Error(error);
            toast.success('تم تحديث حالة الطلب');
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (error: any) {
            toast.error('حدث خطأ: ' + error.message);
        }
    };

    const filteredOrders = orders.filter(o =>
        (o.id && o.id.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
        (o.buyer?.full_name && o.buyer.full_name.includes(searchTerm))
    );

    const getStatusVariant = (status: string): "success" | "warning" | "danger" | "premium" | "secondary" | "primary" => {
        switch (status) {
            case 'Delivered': return 'success';
            case 'Pending': return 'warning';
            case 'Paid': return 'primary';
            case 'Shipped': return 'premium';
            case 'Cancelled': return 'danger';
            default: return 'secondary';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Delivered': return CheckCircle2;
            case 'Pending': return Clock;
            case 'Paid': return CreditCard;
            case 'Shipped': return Truck;
            case 'Cancelled': return XCircle;
            default: return Package;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'Pending': return 'قيد الانتظار';
            case 'Paid': return 'تم الدفع';
            case 'Shipped': return 'تم الشحن';
            case 'Delivered': return 'تم التوصيل';
            case 'Cancelled': return 'ملغي';
            default: return status;
        }
    };

    if (isLoading) {
        return <LoadingSpinner fullPage message="جاري تحميل طلبات المتجر..." />;
    }

    const totalSales = orders.filter(o => o.status === 'Delivered').reduce((acc: number, curr: any) => acc + (curr.total_amount || 0), 0);
    const pendingCount = orders.filter(o => o.status === 'Pending').length;

    return (
        <PageContainer maxWidth="xl">
            <PageHeader 
                title="طلبات المتجر"
                description="متابعة وإدارة طلبات شراء المنتجات"
                icon={ShoppingBag}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <StatCard 
                    label="إجمالي الطلبات"
                    value={orders.length}
                    icon={ShoppingBag}
                />
                <StatCard 
                    label="إجمالي المبيعات"
                    value={`${totalSales} ج.م`}
                    icon={CreditCard}
                />
                <StatCard 
                    label="الطلبات المعلقة"
                    value={pendingCount}
                    icon={Clock}
                />
            </div>

            <Card className="overflow-hidden p-0" hoverable={false}>
                <div className="p-6 border-b border-border-subtle bg-surface-primary/30">
                    <SearchBar 
                        placeholder="ابحث برقم الطلب أو اسم المشتري..."
                        value={searchTerm}
                        onChange={setSearchTerm}
                        className="md:w-full"
                    />
                </div>

                <div className="overflow-x-auto hide-scrollbar">
                    <table className="w-full text-right border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-surface-primary/50 border-b border-border-subtle">
                                <th className="px-6 py-5 font-black text-text-muted text-xs uppercase tracking-widest">رقم الطلب</th>
                                <th className="px-6 py-5 font-black text-text-muted text-xs uppercase tracking-widest">المشتري</th>
                                <th className="px-6 py-5 font-black text-text-muted text-xs uppercase tracking-widest">المنتجات</th>
                                <th className="px-6 py-5 font-black text-text-muted text-xs uppercase tracking-widest">المبلغ</th>
                                <th className="px-6 py-5 font-black text-text-muted text-xs uppercase tracking-widest">التاريخ</th>
                                <th className="px-6 py-5 font-black text-text-muted text-xs uppercase tracking-widest text-center">الحالة</th>
                                <th className="px-6 py-5 font-black text-text-muted text-xs uppercase tracking-widest text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7}>
                                        <EmptyState 
                                            icon={ShoppingBag}
                                            title="لا توجد طلبات!"
                                            message={searchTerm ? `لا توجد نتائج للبحث عن "${searchTerm}"` : "لم يتم تسجيل أي طلبات شراء في المتجر حتى الآن."}
                                        />
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order: any) => (
                                    <tr key={order.id} className="hover:bg-brand-primary/5 transition-colors group">
                                        <td className="px-6 py-5">
                                            <span className="font-black text-text-primary">#{order.id.toString().slice(0, 8)}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="font-black text-text-primary">{order.buyer?.full_name || 'مشتري مجهول'}</div>
                                            <div className="text-[10px] font-bold text-text-muted group-hover:text-text-secondary transition-colors">{order.contact_number || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                {order.order_items?.slice(0, 2).map((item: any) => (
                                                    <Badge key={item.id} variant="secondary" size="sm" className="max-w-[200px] truncate">
                                                        {item.products?.title || 'منتج محذوف'} × {item.quantity}
                                                    </Badge>
                                                ))}
                                                {order.order_items?.length > 2 && (
                                                    <span className="text-[10px] font-bold text-text-muted">+{order.order_items.length - 2} منتجات أخرى</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="font-black text-brand-primary text-lg">{order.total_amount} <span className="text-[10px] font-bold text-text-muted uppercase tracking-tighter mr-0.5">ج.م</span></span>
                                        </td>
                                        <td className="px-6 py-5 text-xs font-bold text-text-secondary">
                                            {new Date(order.created_at).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-center">
                                                {(() => {
                                                    const StatusIcon = getStatusIcon(order.status);
                                                    return (
                                                        <Badge variant={getStatusVariant(order.status)} size="sm">
                                                            <StatusIcon className="w-3 h-3 ml-1 inline-block" />
                                                            {getStatusText(order.status)}
                                                        </Badge>
                                                    );
                                                })()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-2">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                    className="bg-white border border-border-subtle rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                                                >
                                                    <option value="Pending">قيد الانتظار</option>
                                                    <option value="Paid">تم الدفع</option>
                                                    <option value="Shipped">تم الشحن</option>
                                                    <option value="Delivered">تم التوصيل</option>
                                                    <option value="Cancelled">ملغي</option>
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </PageContainer>
    );
};
