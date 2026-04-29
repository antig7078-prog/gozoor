import { useState, useEffect } from 'react';
import { Store, Plus, Trash2, ShoppingBag, Hash, Calendar, ChevronLeft, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { PageContainer } from '../../../components/shared/PageContainer';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { PageHeader } from '../../../components/shared/PageHeader';

interface Product {
    id: string;
    title: string;
    price: number;
    stock: number;
    image_url: string;
    category: string;
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
        if (!confirm('هل أنت متأكد من حذف هذا المنتج نهائياً من المتجر؟')) return;
        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            toast.success('تم حذف المنتج بنجاح');
            setProducts(products.filter(p => p.id !== id));
        } catch (error: any) {
            toast.error('حدث خطأ أثناء الحذف');
            console.error(error);
        }
    };

    if (loading) {
        return <LoadingSpinner fullPage message="جاري تحميل قائمة منتجاتك..." />;
    }

    return (
        <PageContainer maxWidth="lg">
            <PageHeader 
                title="منتجاتي"
                description="إدارة منتجاتك المعروضة للبيع وتتبع المخزون والأسعار"
                icon={Store}
                actions={
                    <Link
                        to="/marketplace/add"
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-brand-primary text-white rounded-[var(--radius-button)] font-black text-sm shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all group"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        إضافة منتج جديد
                    </Link>
                }
            />

            {products.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-[var(--radius-card)] border border-border-subtle p-24 text-center shadow-2xl max-w-3xl mx-auto mt-12"
                >
                    <div className="w-32 h-32 bg-surface-primary rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <ShoppingBag className="w-16 h-16 text-slate-200" />
                    </div>
                    <h3 className="text-3xl font-black text-text-primary mb-4">لا توجد منتجات بعد</h3>
                    <p className="text-text-muted font-bold max-w-sm mx-auto mb-10 leading-relaxed">ابدأ بعرض منتجاتك وأدواتك الزراعية في سوق جذور وشاركها مع المجتمع.</p>
                    <Link to="/marketplace/add" className="inline-flex items-center gap-3 px-10 py-5 bg-brand-primary text-white rounded-full font-black shadow-xl shadow-brand-primary/20 hover:scale-105 transition-all">
                        <Plus className="w-6 h-6" />
                        أضف أول منتج الآن
                    </Link>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {products.map((product, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: idx * 0.05 }}
                                key={product.id} 
                                className="bg-white rounded-[var(--radius-card)] border border-border-subtle shadow-sm hover:shadow-2xl transition-all overflow-hidden flex flex-col group relative"
                            >
                                {/* Stock Badge */}
                                <div className={`absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm border ${
                                    product.stock > 5 ? 'bg-white/90 text-text-primary border-border-subtle' : 
                                    product.stock > 0 ? 'bg-amber-500 text-white border-amber-400' : 
                                    'bg-red-500 text-white border-red-400'
                                }`}>
                                    {product.stock > 0 ? `المخزون: ${product.stock}` : 'نفذت الكمية'}
                                </div>

                                <div className="aspect-[4/3] bg-surface-primary relative overflow-hidden">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                                            <ShoppingBag className="w-16 h-16" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div>
                                            <div className="text-[10px] text-brand-primary font-black uppercase tracking-[2px] mb-1">{product.category || 'عام'}</div>
                                            <h3 className="text-xl font-black text-text-primary leading-tight group-hover:text-brand-primary transition-colors">{product.title}</h3>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-black text-text-primary">{product.price} <span className="text-xs text-text-muted">ج.م</span></div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-50 mb-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-black uppercase tracking-wider">
                                                <Calendar className="w-3 h-3" />
                                                تاريخ النشر
                                            </div>
                                            <div className="text-slate-700 font-bold text-xs">{new Date(product.created_at).toLocaleDateString('ar-EG')}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-black uppercase tracking-wider">
                                                <Hash className="w-3 h-3" />
                                                معرف المنتج
                                            </div>
                                            <div className="text-slate-700 font-bold text-xs uppercase">#{product.id.split('-')[0]}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-50">
                                        <Link 
                                            to={`/marketplace/${product.id}`}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-primary text-text-primary rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                                        >
                                            معاينة في المتجر
                                            <ChevronLeft className="w-3 h-3" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="p-2.5 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm border border-red-100"
                                            title="حذف المنتج"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {product.stock === 0 && (
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center p-8 z-20">
                                        <div className="bg-white p-6 rounded-2xl shadow-2xl border border-border-subtle text-center space-y-3 max-w-[200px]">
                                            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
                                            <h4 className="font-black text-text-primary">غير متوفر</h4>
                                            <p className="text-[10px] font-bold text-text-muted">هذا المنتج نفذ من المخزون، يرجى تحديث الكمية أو حذفه.</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </PageContainer>
    );
};




