import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ShoppingBag, Filter, ChevronLeft, Star, Plus } from 'lucide-react';
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
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.6 }}
                            key={product.id}
                            className="group bg-white rounded-[40px] border border-slate-100/60 overflow-hidden hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] transition-all duration-700 flex flex-col h-full relative"
                        >
                            {/* Image Section */}
                            <div className="relative aspect-[1/1] overflow-hidden bg-slate-50">
                                <Link to={`/marketplace/${product.id}`} className="block w-full h-full">
                                    {product.image_url ? (
                                        <div className="w-full h-full relative">
                                            <img
                                                src={product.image_url}
                                                alt={product.title}
                                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                                            <ShoppingBag className="w-20 h-20" />
                                        </div>
                                    )}
                                </Link>

                                {/* Badges */}
                                <div className="absolute top-6 inset-x-6 flex items-center justify-between">
                                    <div className="px-5 py-2 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-glass text-[10px] font-black text-brand-primary uppercase tracking-[2px]">
                                        {product.category || 'عام'}
                                    </div>
                                    <button className="w-11 h-11 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-glass text-amber-400 hover:scale-110 active:scale-95 transition-all flex items-center justify-center">
                                        <Star className="w-5 h-5 fill-current" />
                                    </button>
                                </div>

                                {/* Floating Price Container */}
                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="bg-white/90 backdrop-blur-2xl rounded-[28px] p-2 pr-6 border border-white/50 shadow-glass flex items-center justify-between group/price translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black text-brand-bg tracking-tighter">{product.price}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase">ج.م</span>
                                        </div>
                                        <div className="w-10 h-10 bg-brand-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
                                            <Plus className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="p-8 pb-10 flex flex-col flex-1">
                                <div className="mb-8">
                                    <Link to={`/marketplace/${product.id}`}>
                                        <h3 className="text-2xl font-black text-slate-900 group-hover:text-brand-primary transition-colors line-clamp-1 mb-3 tracking-tight">
                                            {product.title}
                                        </h3>
                                    </Link>
                                    <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                                        {product.description || 'اكتشف المزيد حول هذا المنتج الرائع المتوفر الآن في سوق جذور بأعلى معايير الجودة.'}
                                    </p>
                                </div>

                                <div className="mt-auto pt-8 flex items-center justify-between gap-6 border-t border-slate-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-surface-primary border border-white flex items-center justify-center overflow-hidden shrink-0 shadow-inner group-hover:ring-4 group-hover:ring-brand-primary/5 transition-all">
                                            <img src={`https://i.pravatar.cc/100?u=${product.id}`} alt="seller" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">البائع</span>
                                            <span className="text-[11px] font-black text-slate-600">متجر معتمد</span>
                                        </div>
                                    </div>

                                    <Link
                                        to={`/marketplace/${product.id}`}
                                        className="inline-flex items-center justify-center w-12 h-12 bg-slate-900 text-white rounded-2xl hover:bg-brand-primary hover:shadow-xl hover:shadow-brand-primary/30 hover:scale-110 transition-all duration-500 group/btn"
                                    >
                                        <ChevronLeft className="w-6 h-6 group-hover/btn:-translate-x-0.5 transition-transform" />
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




