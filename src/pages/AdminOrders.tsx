import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CreditCard, Search, DollarSign, CheckCircle, Clock, XCircle, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminOrders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.from('orders').select('*, profiles(full_name, email), courses(title)').order('created_at', { ascending: false });
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

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-emerald-100 text-emerald-700';
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'canceled': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-3.5 h-3.5" />;
            case 'pending': return <Clock className="w-3.5 h-3.5" />;
            case 'canceled': return <XCircle className="w-3.5 h-3.5" />;
            default: return <FileText className="w-3.5 h-3.5" />;
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

    return (
        <div className="max-w-7xl mx-auto" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <CreditCard className="w-8 h-8 text-emerald-600" />
                        الطلبات والاشتراكات
                    </h1>
                    <p className="text-slate-500 font-semibold mt-2">
                        متابعة عمليات الشراء واشتراكات الطلاب في الدورات التعليمية.
                    </p>
                </div>

                <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-400">إجمالي المبيعات</p>
                        <p className="text-2xl font-black text-slate-800">
                            {orders.filter(o => o.status === 'completed').reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString()} ج.م
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4 items-center bg-slate-50/50">
                    <div className="relative w-full md:w-96">
                        <Search className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="ابحث برقم الطلب، اسم الطالب، أو الدورة..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                            <tr>
                                <th className="px-6 py-4 font-bold">رقم الطلب</th>
                                <th className="px-6 py-4 font-bold">الطالب</th>
                                <th className="px-6 py-4 font-bold">الدورة التعليمية</th>
                                <th className="px-6 py-4 font-bold">المبلغ</th>
                                <th className="px-6 py-4 font-bold">التاريخ</th>
                                <th className="px-6 py-4 font-bold">الحالة</th>
                                <th className="px-6 py-4 font-bold text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-4" />
                                        <span className="text-slate-500 font-bold">جاري تحميل الطلبات...</span>
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CreditCard className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <span className="text-slate-500 font-bold text-lg">لم يتم العثور على طلبات!</span>
                                        <p className="text-slate-400 text-sm mt-1">تأكد من إنشاء جدول orders في قاعدة البيانات.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-slate-900">#{order.id.toString().padStart(6, '0')}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-800">{order.profiles?.full_name || 'طالب مجهول'}</p>
                                            <p className="text-xs text-slate-500">{order.profiles?.email || 'N/A'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg text-sm inline-block max-w-[200px] truncate">
                                                {order.courses?.title || 'دورة محذوفة'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-black text-emerald-600">{order.amount} ج.م</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-slate-600">
                                                {new Date(order.created_at).toLocaleDateString('ar-EG')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                {getStatusText(order.status)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-1">
                                                {order.status !== 'completed' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(order.id, 'completed')}
                                                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="تأكيد الطلب"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                )}
                                                {order.status !== 'canceled' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(order.id, 'canceled')}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="إلغاء الطلب"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
