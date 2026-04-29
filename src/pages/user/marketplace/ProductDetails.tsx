import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ShoppingCart, Star, ChevronRight, Check, Package, Info, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../../lib/supabase';
import { useCartStore } from '../../../lib/store/cartStore';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { PageContainer } from '../../../components/shared/PageContainer';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/shared/Card';

interface Product {
    id: string;
    seller_id: string;
    title: string;
    description: string;
    price: number;
    stock: number;
    image_url: string;
    category: string;
}

export const ProductDetails = () => {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                if (data) setProduct(data);
            } catch (error) {
                console.error('Error fetching product details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const addItem = useCartStore((state) => state.addItem);
    const requireAuth = useRequireAuth();

    const addToCart = () => {
        if (!requireAuth('سجّل دخولك الأول عشان تقدر تضيف منتجات للسلة 🛒')) return;
        if (!product) return;
        addItem({
            id: product.id,
            title: product.title,
            price: product.price,
            image_url: product.image_url
        });
        toast.success(`تمت إضافة ${product.title} إلى السلة بنجاح!`);
    };

    if (loading) {
        return <LoadingSpinner fullPage message="جاري استعراض تفاصيل المنتج..." />;
    }

    if (!product) {
        return (
            <PageContainer>
                <div className="text-center py-32 bg-white rounded-[var(--radius-card)] border border-border-subtle shadow-xl max-w-2xl mx-auto">
                    <div className="w-20 h-20 bg-surface-primary rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-10 h-10 text-slate-300" />
                    </div>
                    <h2 className="text-3xl font-black text-text-primary mb-4">المنتج غير متوفر</h2>
                    <p className="text-text-secondary mb-8 font-bold">عذراً، لم نتمكن من العثور على المنتج الذي تبحث عنه.</p>
                    <Link 
                        to="/marketplace" 
                        className="inline-flex items-center gap-3 px-8 py-4 bg-brand-primary text-white rounded-full font-black shadow-lg shadow-brand-primary/20 hover:scale-105 transition-transform"
                    >
                        <ArrowRight className="w-5 h-5" />
                        العودة للتسوق
                    </Link>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer maxWidth="lg">
            <Link to="/marketplace" className="inline-flex items-center gap-2 text-text-muted hover:text-brand-primary font-black mb-8 transition-colors group">
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                العودة لمتجر جذور
            </Link>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[1.5rem] sm:rounded-[var(--radius-card)] overflow-hidden shadow-2xl border border-border-subtle flex flex-col lg:flex-row relative"
            >
                {/* Product Image Section */}
                <div className="lg:w-1/2 bg-surface-primary relative overflow-hidden flex items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[600px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 to-transparent pointer-events-none"></div>
                    {product.image_url ? (
                        <motion.img
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.8 }}
                            src={product.image_url}
                            alt={product.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <ShoppingBag className="w-48 h-48 text-slate-200" />
                    )}
                    
                    <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-border-default/50">
                        <div className="p-2 bg-brand-primary/10 rounded-xl">
                            <Star className="w-5 h-5 text-brand-primary fill-brand-primary" />
                        </div>
                        <div>
                            <div className="text-[10px] text-text-muted font-black tracking-widest uppercase">تقييم المنتج</div>
                            <div className="text-sm font-black text-text-primary">4.9 / 5.0</div>
                        </div>
                    </div>
                </div>

                {/* Product Details Info Section */}
                <div className="lg:w-1/2 p-6 sm:p-10 lg:p-16 flex flex-col relative">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-primary opacity-20"></div>
                    
                    <div className="mb-8 flex items-center gap-4">
                        <Badge variant="premium" size="sm">
                            {product.category || 'منتج مميز'}
                        </Badge>
                        <Badge variant="secondary" size="sm">
                            <Check className="w-3 h-3 ml-1 inline-block" />
                            منتج تم فحصه
                        </Badge>
                    </div>

                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-text-primary mb-4 sm:mb-6 leading-tight">{product.title}</h1>

                    <div className="flex items-baseline gap-2 sm:gap-3 mb-8 sm:mb-10">
                        <span className="text-3xl sm:text-4xl font-black text-text-primary">{product.price}</span>
                        <span className="text-base sm:text-lg font-bold text-text-muted">جنية مصري</span>
                    </div>

                    <div className="space-y-6 mb-12 flex-1">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-6 bg-brand-primary rounded-full"></div>
                            <h3 className="text-xl font-black text-text-primary">وصف المنتج</h3>
                        </div>
                        <div className="prose prose-sm sm:prose-lg prose-slate max-w-none text-text-secondary leading-relaxed font-bold">
                            {product.description || 'هذا المنتج يقدم لك جودة استثنائية وتجربة مستخدم فريدة مصممة لتلبية احتياجاتك الإبداعية والمهنية في منصة جذور.'}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-50">
                            <Card className="p-4 bg-surface-primary border-border-subtle/50" hoverable={false}>
                                <div className="flex items-center gap-2 text-text-muted text-[10px] font-black uppercase tracking-widest mb-1">
                                    <Package className="w-3.5 h-3.5" />
                                    المخزون
                                </div>
                                <div className={`text-sm font-black ${product.stock > 0 ? 'text-brand-primary' : 'text-red-500'}`}>
                                    {product.stock > 0 ? `${product.stock} قطع متوفرة` : 'نفدت الكمية'}
                                </div>
                            </Card>
                            <Card className="p-4 bg-surface-primary border-border-subtle/50" hoverable={false}>
                                <div className="flex items-center gap-2 text-text-muted text-[10px] font-black uppercase tracking-widest mb-1">
                                    <Info className="w-3.5 h-3.5" />
                                    التوصيل
                                </div>
                                <div className="text-sm font-black text-text-primary">خلال 24-48 ساعة</div>
                            </Card>
                        </div>
                    </div>

                    <div className="mt-auto">
                        <Button 
                            onClick={addToCart}
                            disabled={product.stock <= 0}
                            variant="primary"
                            size="lg"
                            className="w-full py-4 sm:py-6 text-lg sm:text-xl"
                            icon={ShoppingCart}
                        >
                            إضافة إلى السلة الآن
                        </Button>
                    </div>
                </div>
            </motion.div>
        </PageContainer>
    );
};




