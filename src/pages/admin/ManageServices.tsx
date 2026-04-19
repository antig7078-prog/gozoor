import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { MonitorPlay, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Loader } from '../../components/ui/Loader';

interface Service {
    id: string;
    title: string;
    price: number;
    delivery_time_days: number;
    created_at: string;
}

export const ManageServices = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchServices();
    }, []);

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
            toast.error('حدث خطأ أثناء جلب الخدمات');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return;

        try {
            const { error } = await supabase.from('services').delete().eq('id', id);
            if (error) throw error;

            toast.success('تم حذف الخدمة بنجاح');
            setServices(services.filter(s => s.id !== id));
        } catch (error) {
            console.error('Error deleting service:', error);
            toast.error('حدث خطأ أثناء الحذف');
        }
    };

    if (loading) {
        return <Loader fullHeight size={48} />;
    }

    return (
        <div dir="rtl">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                    <MonitorPlay className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-800">إدارة الخدمات</h1>
                    <p className="text-slate-500 text-sm font-medium">مراقبة الخدمات المعروضة من المستقلين</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-600">
                            <tr>
                                <th className="px-6 py-4 font-bold">الخدمة</th>
                                <th className="px-6 py-4 font-bold">السعر</th>
                                <th className="px-6 py-4 font-bold">مدة التسليم</th>
                                <th className="px-6 py-4 font-bold">تاريخ الإضافة</th>
                                <th className="px-6 py-4 font-bold text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {services.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                                        لا توجد خدمات حالياً
                                    </td>
                                </tr>
                            ) : (
                                services.map((service) => (
                                    <tr key={service.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-800">{service.title}</td>
                                        <td className="px-6 py-4 font-bold text-emerald-600">${service.price}</td>
                                        <td className="px-6 py-4 text-slate-600">{service.delivery_time_days} أيام</td>
                                        <td className="px-6 py-4 text-slate-500 text-sm">
                                            {new Date(service.created_at).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleDelete(service.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="حذف الخدمة"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
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
