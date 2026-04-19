import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Store, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Loader } from '../../components/ui/Loader';

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

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('حدث خطأ أثناء جلب المنتجات');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.')) return;

        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;

            toast.success('تم حذف المنتج بنجاح');
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('حدث خطأ أثناء الحذف');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader size={48} />
            </div>
        );
    }

    return (
        <div dir="rtl">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                    <Store className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-800">إدارة المنتجات</h1>
                    <p className="text-slate-500 text-sm font-medium">إدارة ومراقبة منتجات المتجر</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-600">
                            <tr>
                                <th className="px-6 py-4 font-bold">المنتج</th>
                                <th className="px-6 py-4 font-bold">السعر</th>
                                <th className="px-6 py-4 font-bold">المخزون</th>
                                <th className="px-6 py-4 font-bold">تاريخ الإضافة</th>
                                <th className="px-6 py-4 font-bold text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                                        لا توجد منتجات حالياً
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-800">{product.title}</td>
                                        <td className="px-6 py-4 font-bold text-emerald-600">${product.price}</td>
                                        <td className="px-6 py-4 text-slate-600">{product.stock}</td>
                                        <td className="px-6 py-4 text-slate-500 text-sm">
                                            {new Date(product.created_at).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        </div>
    );
};
