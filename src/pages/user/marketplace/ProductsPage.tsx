import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ShoppingBag, Filter, ChevronLeft, Star } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { PageContainer } from '../../../components/shared/PageContainer';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { PageHeader } from '../../../components/shared/PageHeader';

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    image_url: string;
    category: string;
}

export const ProductsPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
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
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) {
        return <LoadingSpinner fullPage message="جاري تجهيز المنتجات المميزة لك..." />;
    }

    return (
        <PageContainer maxWidth="xl">
            <PageHeader 
                title="سوق جذور"
                description="اكتشف منتجات حصرية وأدوات تساعدك على الإبداع والتميز في مجالك"
                icon={ShoppingBag}
                actions={
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-[400px] group">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="ابحث عن منتجاتك المفضلة..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pr-12 pl-4 py-4 bg-white border border-border-default rounded-[var(--radius-button)] focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all shadow-sm font-bold placeholder:text-slate-300"
                            />
                        </div>
                        <button className="p-4 bg-white border border-border-default text-text-secondary rounded-[var(--radius-button)] hover:bg-surface-primary transition-all shadow-sm flex items-center justify-center">
                            <Filter className="w-6 h-6" />
                        </button>
                    </div>
                }
            />

            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                    {filteredProducts.map((product, index) => (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            key={product.id}
                            className="bg-white rounded-[var(--radius-card)] border border-border-subtle overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group flex flex-col relative"
                        >
                            <Link to={`/marketplace/${product.id}`} className="aspect-square bg-surface-primary relative overflow-hidden block">
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.title}
                                        loading="lazy"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-200 bg-surface-primary">
                                        <ShoppingBag className="w-20 h-20" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-black shadow-sm text-text-secondary flex items-center gap-1">
                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                    مميز
                                </div>
                            </Link>

                            <div className="p-4 sm:p-6 flex flex-col flex-1 relative bg-white">
                                <div className="flex-1">
                                    <div className="text-[10px] font-black text-brand-primary uppercase tracking-[2px] mb-2">{product.category || 'عام'}</div>
                                    <Link to={`/marketplace/${product.id}`}>
                                        <h3 className="font-black text-text-primary text-lg hover:text-brand-primary transition-colors line-clamp-1 mb-2">
                                            {product.title}
                                        </h3>
                                    </Link>
                                    <p className="text-text-muted text-sm mb-6 line-clamp-2 leading-relaxed font-bold">
                                        {product.description || 'لا يوجد وصف متاح لهذا المنتج حالياً.'}
                                    </p>
                                </div>
                                
                                <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-300 font-black tracking-widest uppercase">السعر</span>
                                        <span className="text-xl sm:text-2xl font-black text-text-primary leading-none">
                                            {product.price} <span className="text-[10px] sm:text-xs font-bold text-text-muted mr-1">ج.م</span>
                                        </span>
                                    </div>
                                    <Link
                                        to={`/marketplace/${product.id}`}
                                        className="flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-surface-primary text-text-primary hover:bg-brand-primary hover:text-white rounded-[var(--radius-button)] text-xs sm:text-sm font-black transition-all group/btn"
                                    >
                                        التفاصيل
                                        <ChevronLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-24 bg-white rounded-[var(--radius-card)] border border-border-subtle shadow-2xl max-w-2xl mx-auto mt-12"
                >
                    <div className="w-24 h-24 bg-surface-primary rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <ShoppingBag className="w-12 h-12 text-slate-200" />
                    </div>
                    <h3 className="text-3xl font-black text-text-primary mb-4">السوق فارغ حالياً</h3>
                    <p className="text-text-muted font-bold max-w-sm mx-auto mb-8">لم يتم العثور على أي منتجات تطابق بحثك. جرب استخدام كلمات أخرى أو تصفح كل المنتجات.</p>
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="px-8 py-3 bg-brand-primary text-white rounded-full font-black shadow-lg shadow-brand-primary/20 hover:scale-105 transition-transform"
                    >
                        إعادة عرض كل المنتجات
                    </button>
                </motion.div>
            )}
        </PageContainer>
    );
};




