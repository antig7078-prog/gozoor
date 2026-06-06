import { useEffect, useState } from 'react';
import { marketplaceService } from '../../services/marketplaceService';
import { MonitorPlay, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PageContainer } from '../../components/shared/PageContainer';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { PageHeader } from '../../components/shared/PageHeader';
import { ConfirmModal } from '../../components/shared/ConfirmModal';

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
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; serviceId: string | null; isLoading: boolean }>({
        isOpen: false,
        serviceId: null,
        isLoading: false
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const { data, error } = await marketplaceService.getServices();

            if (error) throw new Error(error);
            if (data) setServices(data as any[]);
        } catch (error: any) {
            console.error('Error fetching services:', error);
            toast.error(error.message || 'حدث خطأ أثناء جلب الخدمات');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        setDeleteModal({ isOpen: true, serviceId: id, isLoading: false });
    };

    const confirmDelete = async () => {
        if (!deleteModal.serviceId) return;
        setDeleteModal(prev => ({ ...prev, isLoading: true }));
        try {
            const { error } = await marketplaceService.deleteService(deleteModal.serviceId);
            if (error) throw new Error(error);

            toast.success('تم حذف الخدمة بنجاح');
            setServices(services.filter(s => s.id !== deleteModal.serviceId));
            setDeleteModal({ isOpen: false, serviceId: null, isLoading: false });
        } catch (error: any) {
            console.error('Error deleting service:', error);
            toast.error(error.message || 'حدث خطأ أثناء الحذف');
            setDeleteModal(prev => ({ ...prev, isLoading: false }));
        }
    };

    if (loading) {
        return <LoadingSpinner fullPage message="جاري تحميل الخدمات..." />;
    }

    return (
        <PageContainer maxWidth="xl" noPadding>
            <PageHeader 
                title="إدارة الخدمات"
                description="مراقبة الخدمات المعروضة من المستقلين"
                icon={MonitorPlay}
            />

            <div className="bg-white rounded-[var(--radius-card)] border border-border-default shadow-sm overflow-hidden">
                <div className="overflow-x-auto hide-scrollbar">
                    <table className="w-full text-right border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-surface-primary border-b border-border-default">
                                <th className="px-6 py-5 font-black text-text-primary">الخدمة</th>
                                <th className="px-6 py-5 font-black text-text-primary">السعر</th>
                                <th className="px-6 py-5 font-black text-text-primary">مدة التسليم</th>
                                <th className="px-6 py-5 font-black text-text-primary">تاريخ الإضافة</th>
                                <th className="px-6 py-5 font-black text-text-primary text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {services.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-text-muted font-bold">
                                        لا توجد خدمات حالياً في المنصة
                                    </td>
                                </tr>
                            ) : (
                                services.map((service) => (
                                    <tr key={service.id} className="hover:bg-brand-primary-light/10 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="font-black text-text-primary text-base md:text-lg">{service.title}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="font-black text-brand-primary text-base md:text-lg whitespace-nowrap">{service.price} ج.م</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] md:text-xs font-black bg-slate-100 text-slate-700 whitespace-nowrap">
                                                {service.delivery_time_days} أيام
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-bold text-text-secondary whitespace-nowrap">
                                            {new Date(service.created_at).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleDelete(service.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-[var(--radius-button)] transition-all"
                                                    title="حذف الخدمة"
                                                    aria-label={`حذف الخدمة ${service.title}`}
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
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, serviceId: null, isLoading: false })}
                onConfirm={confirmDelete}
                isLoading={deleteModal.isLoading}
                title="حذف الخدمة"
                message="هل أنت متأكد من حذف هذه الخدمة؟ لا يمكن التراجع عن هذا الإجراء."
                confirmText="حذف الآن"
                cancelText="تراجع"
                type="danger"
            />
        </PageContainer>
    );
};
