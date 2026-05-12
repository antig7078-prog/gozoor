import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus, Star, ChevronLeft, ArrowRight, ShoppingBag, Tag } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { PageContainer } from '../../../components/shared/PageContainer';
import { PageHeader } from '../../../components/shared/PageHeader';
import { SearchBar } from '../../../components/shared/SearchBar';
import { Card } from '../../../components/shared/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { Link, useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { useAuth } from '../../../contexts/AuthContext';

interface FreelanceProduct {
    id: string;
    user_id: string;
    title: string;
    description: string;
    price: number;
    image_url?: string;
    category: string;
    created_at: string;
    seller_name?: string;
}

import { toast } from 'react-hot-toast';

export const FreelanceProductsPage = () => {
    const { user } = useAuth();
    const requireAuth = useRequireAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState<FreelanceProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newProduct, setNewProduct] = useState({ title: '', description: '', price: '', category: 'كتب إلكترونية' });

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*, profiles:seller_id(full_name)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) {
                setProducts(data.map((p: any) => ({
                    id: p.id,
                    user_id: p.seller_id,
                    title: p.title,
                    description: p.description,
                    price: p.price,
                    image_url: p.image_url,
                    category: p.category,
                    created_at: p.created_at,
                    seller_name: p.profiles?.full_name || 'بائع',
                })));
            }
        } catch (error) {
            console.error('Error fetching freelance products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleAddProduct = async () => {
        if (!requireAuth('سجّل دخولك الأول عشان تقدر تضيف منتج 📦')) return;
        if (!newProduct.title.trim() || !newProduct.description.trim() || !newProduct.price) return;

        try {
            const { error } = await supabase.from('products').insert([{
                seller_id: user?.id,
                title: newProduct.title.trim(),
                description: newProduct.description.trim(),
                price: parseFloat(newProduct.price),
                category: newProduct.category,
                status: 'Published'
            }]);

            if (error) throw error;

            fetchProducts();
            setShowAddForm(false);
            setNewProduct({ title: '', description: '', price: '', category: 'كتب إلكترونية' });
            toast.success('تم إضافة المنتج بنجاح! 🎉');
        } catch (error) {
            console.error('Error adding freelance product:', error);
            toast.error('حدث خطأ أثناء الإضافة');
        }
    };

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <LoadingSpinner fullPage message="جاري تحميل المنتجات..." />;

    return (
        <PageContainer maxWidth="xl">
            <PageHeader
                title="منتجاتي"
                description="اعرض منتجاتك الرقمية والمادية للبيع مباشرة من حسابك — كتب إلكترونية، قوالب، دورات مسجلة، وأكتر."
                icon={Package}
                actions={
                    <Button
                        icon={Plus}
                        variant="premium"
                        onClick={() => {
                            if (!requireAuth('سجّل دخولك الأول عشان تقدر تضيف منتج 📦')) return;
                            navigate('/marketplace/add');
                        }}
                    >
                        أضف منتج جديد
                    </Button>
                }
            />

            {/* Search */}
            <div className="mb-12">
                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="ابحث عن منتج (كتب، قوالب، دورات)..."
                    className="md:w-full"
                />
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    <AnimatePresence>
                        {filteredProducts.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <motion.div
                                    whileHover={{ y: -10 }}
                                    className="bg-white rounded-[32px] border border-border-subtle overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col h-full relative"
                                >
                                    {/* Image Section */}
                                    <Link to={`/marketplace/${product.id}`} className="aspect-[4/3] bg-surface-primary relative overflow-hidden block">
                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.title}
                                                loading="lazy"
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-200">
                                                <Package className="w-16 h-16" />
                                            </div>
                                        )}
                                        
                                        {/* Category Badge */}
                                        <div className="absolute top-4 right-4">
                                            <div className="bg-brand-primary/90 backdrop-blur-md text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                                                <Tag className="w-3 h-3" />
                                                {product.category}
                                            </div>
                                        </div>
                                    </Link>

                                    {/* Content Section */}
                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="text-[10px] text-brand-primary font-black uppercase tracking-widest">
                                                بواسطة: {product.seller_name}
                                            </div>
                                        </div>

                                        <Link to={`/marketplace/${product.id}`}>
                                            <h3 className="font-black text-text-primary text-xl hover:text-brand-primary transition-colors line-clamp-2 leading-tight mb-4">
                                                {product.title}
                                            </h3>
                                        </Link>
                                        
                                        <p className="text-text-muted text-sm mb-6 line-clamp-2 leading-relaxed font-bold">
                                            {product.description}
                                        </p>

                                        {/* Action Section */}
                                        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-slate-300 font-black tracking-widest uppercase">السعر</span>
                                                <span className="text-xl font-black text-brand-primary leading-none">
                                                    {product.price}<span className="text-[10px] mr-0.5 font-bold">ج.م</span>
                                                </span>
                                            </div>

                                            <Link
                                                to={`/marketplace/${product.id}`}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-brand-primary/5 text-brand-primary hover:bg-brand-primary hover:text-white rounded-2xl text-xs font-black transition-all group/btn shadow-sm"
                                            >
                                                عرض التفاصيل
                                                <ChevronLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <Card className="text-center py-20 max-w-2xl mx-auto border-dashed border-2 bg-surface-primary/50">
                    <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                        <Package className="w-12 h-12 text-slate-200" />
                    </div>
                    <h3 className="text-2xl font-black text-text-primary mb-4">لا يوجد منتجات بعد</h3>
                    <p className="text-text-muted font-bold max-w-sm mx-auto mb-10 leading-relaxed">
                        كن أول من يعرض منتجاته! أضف كتب إلكترونية، قوالب، دورات مسجلة وأكتر.
                    </p>
                    <Button onClick={() => setSearchQuery('')} variant="secondary" icon={ArrowRight}>
                        مسح البحث
                    </Button>
                </Card>
            )}
        </PageContainer>
    );
};
