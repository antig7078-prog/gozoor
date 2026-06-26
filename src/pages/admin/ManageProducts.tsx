import { useEffect, useState } from 'react';
import { marketplaceService } from '../../services/marketplaceService';
import { notificationService } from '../../services/notificationService';
import { Store, Trash2, CheckCircle2, XCircle, Clock, Search, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PageContainer } from '../../components/shared/PageContainer';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { PageHeader } from '../../components/shared/PageHeader';
import { ConfirmModal } from '../../components/shared/ConfirmModal';
import { Badge } from '../../components/ui/Badge';

interface Product {
    id: string;
    title: string;
    price: number;
    stock: number;
    moderation_status: string;
    created_at: string;
    seller?: { full_name: string; id: string };
}

export const ManageProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; productId: string | null; isLoading: boolean }>({
        isOpen: false,
        productId: null,
        isLoading: false
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data, error } = await marketplaceService.getAllProductsForAdmin();
            if (error) throw new Error(error);
            if (data) setProducts(data as any[]);
        } catch (error: any) {
            console.error('Error fetching products:', error);
            toast.error(error.message || 'حدث خطأ أثناء جلب المنتجات');
        } finally {
            setLoading(false);
        }
    };

    const handleModeration = async (id: string, status: 'approved' | 'rejected') => {
        try {
            const { error } = await marketplaceService.updateProductModeration(id, status);
            if (error) throw new Error(error);

            const product = products.find(p => p.id === id);
            if (product?.seller?.id) {
                notificationService.sendNotification({
                    userId: product.seller.id,
                    title: status === 'approved' ? 'تم قبول منتجك' : 'تم رفض منتجك',
                    content: status === 'approved'
                        ? `تمت الموافقة على منتجك "${product.title}" وهو الآن متاح في المتجر.`
                        : `عذراً، لم تتم الموافقة على منتجك "${product.title}". يرجى مراجعة شروط النشر وإعادة المحاولة.`,
                    type: status === 'approved' ? 'success' : 'warning',
                    link: '/user-products'
                });
            }

            toast.success(status === 'approved' ? 'تم قبول المنتج' : 'تم رفض المنتج');
            fetchProducts();
        } catch (error: any) {
            toast.error(error.message || 'حدث خطأ');
        }
    };

    const handleDelete = async (id: string) => {
        setDeleteModal({ isOpen: true, productId: id, isLoading: false });
    };

    const confirmDelete = async () => {
        if (!deleteModal.productId) return;
        setDeleteModal(prev => ({ ...prev, isLoading: true }));
        try {
            const { error } = await marketplaceService.deleteProduct(deleteModal.productId);
            if (error) throw new Error(error);
            toast.success('تم حذف المنتج بنجاح');
            setProducts(products.filter(p => p.id !== deleteModal.productId));
            setDeleteModal({ isOpen: false, productId: null, isLoading: false });
        } catch (error: any) {
            console.error('Error deleting product:', error);
            toast.error(error.message || 'حدث خطأ أثناء الحذف');
            setDeleteModal(prev => ({ ...prev, isLoading: false }));
        }
    };

    const filteredProducts = filterStatus === 'all'
        ? products
        : products.filter(p => p.moderation_status === filterStatus);

    const getModerationBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="warning" size="sm"><Clock className="w-3 h-3 ml-1" />قيد المراجعة</Badge>;
            case 'approved': return <Badge variant="success" size="sm"><CheckCircle2 className="w-3 h-3 ml-1" />مقبول</Badge>;
            case 'rejected': return <Badge variant="danger" size="sm"><XCircle className="w-3 h-3 ml-1" />مرفوض</Badge>;
            default: return <Badge variant="secondary" size="sm">{status}</Badge>;
        }
    };

    if (loading) {
        return <LoadingSpinner fullPage message="جاري تحميل المنتجات..." />;
    }

    return (
        <PageContainer maxWidth="xl" noPadding>
            <PageHeader 
                title="إدارة المنتجات"
                description="مراقبة منتجات المتجر وإدارة طلبات المراجعة والقبول"
                icon={Store}
            />

            <div className="flex items-center gap-3 mb-8 px-6">
                <Filter className="w-4 h-4 text-text-muted" />
                {['all', 'pending', 'approved', 'rejected'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-5 py-2 rounded-full text-xs font-black transition-all ${
                            filterStatus === status
                                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                                : 'bg-white border border-border-default text-text-secondary hover:bg-slate-50'
                        }`}
                    >
                        {status === 'all' ? 'الكل' : status === 'pending' ? 'قيد المراجعة' : status === 'approved' ? 'المقبولة' : 'المرفوضة'}
                    </button>
                ))}
                <div className="mr-auto text-xs font-bold text-text-muted">
                    الإجمالي: {filteredProducts.length} منتج
                </div>
            </div>

            <div className="bg-white rounded-[var(--radius-card)] border border-border-default shadow-sm overflow-hidden">
                <div className="overflow-x-auto hide-scrollbar">
                    <table className="w-full text-right border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-surface-primary border-b border-border-default">
                                <th className="px-6 py-5 font-black text-text-primary">المنتج</th>
                                <th className="px-6 py-5 font-black text-text-primary">البائع</th>
                                <th className="px-6 py-5 font-black text-text-primary">السعر</th>
                                <th className="px-6 py-5 font-black text-text-primary">المخزون</th>
                                <th className="px-6 py-5 font-black text-text-primary">الحالة</th>
                                <th className="px-6 py-5 font-black text-text-primary">تاريخ الإضافة</th>
                                <th className="px-6 py-5 font-black text-text-primary text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center text-text-muted font-bold">
                                        لا توجد منتجات حالياً
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-brand-primary-light/10 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="font-black text-text-primary text-base md:text-lg">{product.title}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="font-bold text-text-secondary text-sm">
                                                {product.seller?.full_name || 'غير معروف'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="font-black text-brand-primary text-base md:text-lg whitespace-nowrap">{product.price} ج.م</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] md:text-xs font-black whitespace-nowrap ${product.stock > 0 ? 'bg-slate-100 text-slate-700' : 'bg-red-50 text-red-600'}`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            {getModerationBadge(product.moderation_status)}
                                        </td>
                                        <td className="px-6 py-5 text-sm font-bold text-text-secondary whitespace-nowrap">
                                            {new Date(product.created_at).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-2">
                                                {product.moderation_status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleModeration(product.id, 'approved')}
                                                            className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-[var(--radius-button)] transition-all"
                                                            title="قبول المنتج"
                                                        >
                                                            <CheckCircle2 className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleModeration(product.id, 'rejected')}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-[var(--radius-button)] transition-all"
                                                            title="رفض المنتج"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-[var(--radius-button)] transition-all"
                                                    title="حذف المنتج"
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
                onClose={() => setDeleteModal({ isOpen: false, productId: null, isLoading: false })}
                onConfirm={confirmDelete}
                isLoading={deleteModal.isLoading}
                title="حذف المنتج"
                message="هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء."
                confirmText="حذف الآن"
                cancelText="تراجع"
                type="danger"
            />
        </PageContainer>
    );
};
