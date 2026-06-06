import { useEffect, useState } from 'react';
import { marketplaceService } from '../../services/marketplaceService';
import { Store, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PageContainer } from '../../components/shared/PageContainer';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { PageHeader } from '../../components/shared/PageHeader';
import { ConfirmModal } from '../../components/shared/ConfirmModal';

interface Product {
    id: string;
    title: string;
    price: number;
    stock: number;
    created_at: string;
}

export const ManageProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
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
            const { data, error } = await marketplaceService.getProducts();

            if (error) throw new Error(error);
            if (data) setProducts(data as any[]);
        } catch (error: any) {
            console.error('Error fetching products:', error);
            toast.error(error.message || 'حدث خطأ أثناء جلب المنتجات');
        } finally {
            setLoading(false);
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

    if (loading) {
        return <LoadingSpinner fullPage message="جاري تحميل المنتجات..." />;
    }

    return (
        <PageContainer maxWidth="xl" noPadding>
            <PageHeader 
                title="إدارة المنتجات"
                description="إدارة ومراقبة منتجات المتجر"
                icon={Store}
            />

            <div className="bg-white rounded-[var(--radius-card)] border border-border-default shadow-sm overflow-hidden">
                <div className="overflow-x-auto hide-scrollbar">
                    <table className="w-full text-right border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-surface-primary border-b border-border-default">
                                <th className="px-6 py-5 font-black text-text-primary">المنتج</th>
                                <th className="px-6 py-5 font-black text-text-primary">السعر</th>
                                <th className="px-6 py-5 font-black text-text-primary">المخزون</th>
                                <th className="px-6 py-5 font-black text-text-primary">تاريخ الإضافة</th>
                                <th className="px-6 py-5 font-black text-text-primary text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-text-muted font-bold">
                                        لا توجد منتجات حالياً في المتجر
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-brand-primary-light/10 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="font-black text-text-primary text-base md:text-lg">{product.title}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="font-black text-brand-primary text-base md:text-lg whitespace-nowrap">{product.price} ج.م</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] md:text-xs font-black whitespace-nowrap ${product.stock > 0 ? 'bg-slate-100 text-slate-700' : 'bg-red-50 text-red-600'}`}>
                                                {product.stock} متوفر
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-bold text-text-secondary whitespace-nowrap">
                                            {new Date(product.created_at).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-[var(--radius-button)] transition-all"
                                                    title="حذف المنتج"
                                                    aria-label={`حذف المنتج ${product.title}`}
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
