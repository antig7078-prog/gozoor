import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CreditCard, DollarSign, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';
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

export const AdminOrders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*, profiles(full_name, email), courses(title)')
                .order('created_at', { ascending: false });
            
            if (error) {
                toast.error("فشل تحميل الطلبات");
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
            const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
            if (error) throw error;
            toast.success('تم تحديث حالة الطلب');
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (error: any) {
            toast.error('حدث خطأ: ' + error.message);
        }
    };

    const filteredOrders = orders.filter(o =>
        (o.id && o.id.toString().includes(searchTerm)) ||
        (o.profiles?.full_name && o.profiles.full_name.includes(searchTerm)) ||
        (o.courses?.title && o.courses.title.includes(searchTerm))
    );

    const getStatusVariant = (status: string): "success" | "warning" | "danger" | "premium" | "secondary" | "primary" => {
        switch (status) {
            case 'completed': return 'success';
            case 'pending': return 'warning';
            case 'canceled': return 'danger';
            default: return 'secondary';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return CheckCircle;
            case 'pending': return Clock;
            case 'canceled': return XCircle;
            default: return FileText;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed': return 'مكتمل';
            case 'pending': return 'قيد الانتظار';
            case 'canceled': return 'ملغي';
            default: return 'غير معروف';
        }
    };

    if (isLoading) {
        return <LoadingSpinner fullPage message="جاري تحميل الطلبات..." />;
    }

    const totalSales = orders.filter(o => o.status === 'completed').reduce((acc, curr) => acc + (curr.amount || 0), 0);

    return (
        <PageContainer maxWidth="xl">
            <PageHeader 
                title="الطلبات والاشتراكات"
                description="متابعة عمليات الشراء واشتراكات الطلاب"
                icon={CreditCard}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <StatCard 
                    label="إجمالي الطلبات"
                    value={orders.length}
                    icon={CreditCard}
                />
                <StatCard 
                    label="إجمالي المبيعات"
                    value={`${totalSales} ج.م`}
                    icon={DollarSign}
                />
                <StatCard 
                    label="الطلبات المعلقة"
                    value={orders.filter(o => o.status === 'pending').length}
                    icon={Clock}
                />
            </div>

            <Card className="overflow-hidden p-0" hoverable={false}>
                <div className="p-6 border-b border-border-subtle bg-surface-primary/30">
                    <SearchBar 
                        placeholder="ابحث برقم الطلب، اسم الطالب، أو الدورة..."
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
                                <th className="px-6 py-5 font-black text-text-muted text-xs uppercase tracking-widest">الطالب</th>
                                <th className="px-6 py-5 font-black text-text-muted text-xs uppercase tracking-widest">الدورة التعليمية</th>
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
                                            icon={CreditCard}
                                            title="لا توجد طلبات!"
                                            message={searchTerm ? `لا توجد نتائج للبحث عن "${searchTerm}"` : "لم يتم تسجيل أي طلبات شراء في النظام حتى الآن."}
                                        />
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-brand-primary/5 transition-colors group">
                                        <td className="px-6 py-5">
                                            <span className="font-black text-text-primary">#{order.id.toString().padStart(6, '0')}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="font-black text-text-primary">{order.profiles?.full_name || 'طالب مجهول'}</div>
                                            <div className="text-[10px] font-bold text-text-muted group-hover:text-text-secondary transition-colors uppercase tracking-tight">{order.profiles?.email || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <Badge variant="secondary" size="sm" className="max-w-[200px] truncate">
                                                {order.courses?.title || 'دورة محذوفة'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="font-black text-brand-primary text-lg">{order.amount} <span className="text-[10px] font-bold text-text-muted uppercase tracking-tighter mr-0.5">ج.م</span></span>
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
                                                {order.status !== 'completed' && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => handleUpdateStatus(order.id, 'completed')}
                                                        className="text-brand-primary hover:bg-brand-primary/10"
                                                        icon={CheckCircle}
                                                    />
                                                )}
                                                {order.status !== 'canceled' && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => handleUpdateStatus(order.id, 'canceled')}
                                                        className="text-red-500 hover:bg-red-50"
                                                        icon={XCircle}
                                                    />
                                                )}
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





