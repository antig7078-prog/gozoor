import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { MonitorPlay, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Service {
    id: string;
    title: string;
    price: number;
    delivery_time_days: number;
    created_at: string;
}

export const UserServices = () => {
    const { user } = useAuth();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('services')
                    .select('*')
                    .eq('freelancer_id', user.id)
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
    }, [user]);

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return;
        try {
            const { error } = await supabase.from('services').delete().eq('id', id);
            if (error) throw error;
            toast.success('تم الحذف بنجاح');
            setServices(services.filter(s => s.id !== id));
        } catch (error: any) {
            toast.error('حدث خطأ أثناء الحذف');
            console.error(error);
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
        <div className="max-w-6xl mx-auto py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                    <MonitorPlay className="w-8 h-8 text-emerald-600" />
                    خدماتي (Freelance)
                </h1>

                <Link
                    to="/services/add"
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    إضافة خدمة جديدة
                </Link>
            </div>

            {services.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
                    <MonitorPlay className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-700">لم تقم بتقديم أي خدمات بعد</h3>
                    <p className="text-slate-500 mt-2 mb-6">ابدأ بعرض مهاراتك وتقديم خدماتك للعملاء عبر المنصة.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-slate-50 border-b border-slate-100 text-slate-600">
                                <tr>
                                    <th className="px-6 py-4 font-bold">اسم الخدمة</th>
                                    <th className="px-6 py-4 font-bold">السعر</th>
                                    <th className="px-6 py-4 font-bold">مدة التسليم</th>
                                    <th className="px-6 py-4 font-bold">تاريخ الإضافة</th>
                                    <th className="px-6 py-4 font-bold text-center">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {services.map((service) => (
                                    <tr key={service.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-800">{service.title}</td>
                                        <td className="px-6 py-4 text-emerald-600 font-bold">${service.price}</td>
                                        <td className="px-6 py-4 text-slate-600">{service.delivery_time_days} أيام</td>
                                        <td className="px-6 py-4 text-slate-500 text-sm">
                                            {new Date(service.created_at).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleDelete(service.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
