import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Store, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface Product {
    id: string;
    title: string;
    price: number;
    stock: number;
    created_at: string;
}

export const UserProducts = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('seller_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                if (data) setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [user]);

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            toast.success('تم الحذف بنجاح');
            setProducts(products.filter(p => p.id !== id));
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
                    <Store className="w-8 h-8 text-emerald-600" />
                    منتجاتي المعروضة
                </h1>

                <Link
                    to="/marketplace/add"
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    إضافة منتج جديد
                </Link>
            </div>

            {products.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
                    <Store className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-700">لم تقم بإضافة منتجات بعد</h3>
                    <p className="text-slate-500 mt-2 mb-6">ابدأ بعرض منتجاتك الخاص بك لبيعها في المتجر.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
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
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-800">{product.title}</td>
                                        <td className="px-6 py-4 text-emerald-600 font-bold">${product.price}</td>
                                        <td className="px-6 py-4 text-slate-600">{product.stock} وحدة</td>
                                        <td className="px-6 py-4 text-slate-500 text-sm">
                                            {new Date(product.created_at).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* <Link to={`/marketplace/edit/${product.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                    <Edit2 className="w-5 h-5" />
                                                </Link> */}
                                                <button
                                                    onClick={() => handleDelete(product.id)}
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
