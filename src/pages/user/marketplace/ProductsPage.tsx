import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, Filter, ChevronLeft, Plus, X, SlidersHorizontal, LayoutGrid, Check } from 'lucide-react';
import { PageContainer } from '../../../components/shared/PageContainer';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { PageHeader } from '../../../components/shared/PageHeader';
import { useCartStore } from '../../../lib/store/cartStore';
import { marketplaceService } from '../../../services/marketplaceService';
import { toast } from 'react-hot-toast';

interface Product {
    id: string;
    title: string;
    description?: string;
    price: number;
    image_url?: string;
    category?: string;
    seller_id: string;
    seller?: {
        full_name?: string;
        avatar_url?: string;
    };
}

export const ProductsPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Smart Filter State - Locked to Drawer mode
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedSeller, setSelectedSeller] = useState<string>('all');
    const [maxPrice, setMaxPrice] = useState<number>(1000);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
    const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const addItem = useCartStore((state) => state.addItem);

    const handleAddToCart = (product: Product, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem({
            id: product.id,
            seller_id: product.seller_id,
            title: product.title,
            price: product.price,
            image_url: product.image_url || ''
        });
        toast.success(`تم إضافة "${product.title}" إلى السلة بنجاح!`);
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data, error } = await marketplaceService.getProducts();

                if (error) throw new Error(error);
                if (data) {
                    setProducts(data);
                    if (data.length > 0) {
                        const maxVal = Math.max(...data.map(p => p.price));
                        setMaxPrice(maxVal);
                        setPriceRange([0, maxVal]);
                    }
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Extract categories and seller names dynamically for filters
    const categories = Array.from(new Set(products.map(p => p.category).filter((c): c is string => !!c)));
    const sellers = Array.from(new Set(products.map(p => p.seller?.full_name).filter((name): name is string => !!name)));

    // Smart Filtering Logic (Search by seller full name, category, or product title)
    const filteredProducts = products.filter(p => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch = !query || 
            p.title.toLowerCase().includes(query) ||
            (p.category && p.category.toLowerCase().includes(query)) ||
            (p.seller?.full_name && p.seller.full_name.toLowerCase().includes(query));

        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        const matchesSeller = selectedSeller === 'all' || p.seller?.full_name === selectedSeller;
        const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];

        return matchesSearch && matchesCategory && matchesSeller && matchesPrice;
    });

    // Sorting Logic
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return 0; // Default ordering from database
    });

    if (loading) {
        return <LoadingSpinner fullPage message="جاري تجهيز المنتجات المميزة لك..." />;
    }

    // Reuseable Filter Content Component
    const FilterPanelContent = () => (
        <div className="space-y-6">
            {/* Category selection */}
            <div>
                <h4 className="text-xs font-bold text-slate-800 mb-3 tracking-wide">القسم</h4>
                <div className="flex flex-col gap-1.5">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                            selectedCategory === 'all' 
                                ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/10' 
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100/80'
                        }`}
                    >
                        <span>كل الأقسام</span>
                        {selectedCategory === 'all' && <Check className="w-4 h-4" />}
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                                selectedCategory === cat 
                                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/10' 
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100/80'
                            }`}
                        >
                            <span>{cat}</span>
                            {selectedCategory === cat && <Check className="w-4 h-4" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price slider */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-slate-800 tracking-wide">السعر الأقصى</h4>
                    <span className="text-xs font-black text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-lg">{priceRange[1]} ج.م</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-primary focus:outline-none"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-2">
                    <span>0 ج.م</span>
                    <span>{maxPrice} ج.م</span>
                </div>
            </div>

            {/* Seller / Brand filter */}
            <div>
                <h4 className="text-xs font-bold text-slate-800 mb-3 tracking-wide">البائع أو المتجر</h4>
                <div className="flex flex-col gap-1.5">
                    <button
                        onClick={() => setSelectedSeller('all')}
                        className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                            selectedSeller === 'all' 
                                ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/15' 
                                : 'bg-slate-50 text-slate-600 border border-transparent hover:bg-slate-100/80'
                        }`}
                    >
                        <span>كل المتاجر</span>
                        {selectedSeller === 'all' && <Check className="w-4 h-4" />}
                    </button>
                    {sellers.map(seller => (
                        <button
                            key={seller}
                            onClick={() => setSelectedSeller(seller)}
                            className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                                selectedSeller === seller 
                                    ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/15' 
                                    : 'bg-slate-50 text-slate-600 border border-transparent hover:bg-slate-100/80'
                            }`}
                        >
                            <span>{seller}</span>
                            {selectedSeller === seller && <Check className="w-4 h-4" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sorting */}
            <div>
                <h4 className="text-xs font-bold text-slate-800 mb-3 tracking-wide">ترتيب حسب</h4>
                <div className="flex flex-col gap-1.5">
                    {[
                        { id: 'newest', label: 'الأحدث أولاً' },
                        { id: 'price-asc', label: 'السعر: من الأقل للأعلى' },
                        { id: 'price-desc', label: 'السعر: من الأعلى للأقل' }
                    ].map(option => (
                        <button
                            key={option.id}
                            onClick={() => setSortBy(option.id as any)}
                            className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                                sortBy === option.id 
                                    ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/15' 
                                    : 'bg-slate-50 text-slate-600 border border-transparent hover:bg-slate-100/80'
                            }`}
                        >
                            <span>{option.label}</span>
                            {sortBy === option.id && <Check className="w-4 h-4" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <PageContainer maxWidth="xl">
            {/* Header section with search & filter */}
            <div className="bg-white rounded-3xl border border-slate-100 p-8 md:p-10 mb-8 shadow-sm relative overflow-hidden">
                {/* Decorative background shapes */}
                <div className="absolute -right-24 -top-24 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
                    <div className="space-y-2">
                        <span className="inline-block text-[10px] font-black text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">سوق جذور</span>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-800 leading-tight">تسوّق أفضل المنتجات</h1>
                        <p className="text-slate-500 text-sm font-semibold max-w-lg leading-relaxed">
                            اكتشف تشكيلة واسعة ومتنوعة من المنتجات المميزة من بائعين موثوقين.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
                        {/* Search bar with explicit text colors for visibility */}
                        <div className="relative w-full sm:w-80 md:w-96 group">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                            <input
                                type="text"
                                dir="rtl"
                                placeholder="ابحث عن منتج، بائع أو قسم..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pr-12 pl-4 py-3.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200/60 focus:border-brand-primary rounded-2xl outline-none transition-all font-semibold text-slate-800 placeholder:text-slate-400 text-sm shadow-inner"
                            />
                        </div>

                        {/* Filter Toggle Button */}
                        <button
                            onClick={() => setIsDrawerOpen(true)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-2xl transition-all font-bold text-xs shadow-lg shadow-brand-primary/15 cursor-pointer shrink-0 hover:scale-[1.02] active:scale-95"
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            <span>تصفية متقدمة</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Category Tabs - Added vertical padding to prevent scale/shadow clipping */}
            <div className="relative mb-10 -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-10 md:px-10">
                <div className="flex items-center gap-2.5 overflow-x-auto py-4 px-2 scrollbar-none">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-6 py-2.5 rounded-full text-xs font-black shrink-0 transition-all duration-300 ${
                            selectedCategory === 'all'
                                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25 scale-105'
                                : 'bg-white border border-slate-100 hover:bg-slate-50 text-slate-600 shadow-sm hover:scale-[1.02]'
                        }`}
                    >
                        كل الأقسام
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-6 py-2.5 rounded-full text-xs font-black shrink-0 transition-all duration-300 ${
                                selectedCategory === cat
                                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25 scale-105'
                                    : 'bg-white border border-slate-100 hover:bg-slate-50 text-slate-600 shadow-sm hover:scale-[1.02]'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Layout with 3 large columns grid */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="flex-1 w-full">
                    {sortedProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {sortedProducts.map((product, index) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.05, duration: 0.5 }}
                                    key={product.id}
                                    className="group bg-white rounded-[40px] border border-slate-100/60 overflow-hidden hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] hover:-translate-y-1.5 transition-all duration-700 flex flex-col h-full relative"
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
                                                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                </div>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-200">
                                                    <ShoppingBag className="w-20 h-20" />
                                                </div>
                                            )}
                                        </Link>

                                        {/* Floating Category Tag */}
                                        {product.category && (
                                            <div className="absolute top-6 inset-x-6 flex items-center justify-between">
                                                <div className="px-5 py-2 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-glass text-[10px] font-black text-brand-primary uppercase tracking-[2px]">
                                                    {product.category}
                                                </div>
                                            </div>
                                        )}

                                        {/* Floating Price & Add to Cart button */}
                                        <div className="absolute bottom-6 left-6 right-6">
                                            <div className="bg-white/90 backdrop-blur-2xl rounded-[28px] p-2 pr-6 border border-white/50 shadow-glass flex items-center justify-between group/price translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-2xl font-black text-slate-900 tracking-tighter">{product.price}</span>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase">ج.م</span>
                                                </div>
                                                <button
                                                    onClick={(e) => handleAddToCart(product, e)}
                                                    className="w-10 h-10 bg-brand-primary hover:bg-brand-primary/95 active:scale-95 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/20 transition-all duration-200 cursor-pointer"
                                                    title="أضف إلى السلة"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                </button>
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
                                                {product.description || 'اكتشف المزيد حول هذا المنتج المميز المتوفر الآن في متجر جذور.'}
                                            </p>
                                        </div>

                                        {/* Seller details & Details Chevron */}
                                        <div className="mt-auto pt-8 flex items-center justify-between gap-6 border-t border-slate-50/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-surface-primary border border-white flex items-center justify-center overflow-hidden shrink-0 shadow-inner group-hover:ring-4 group-hover:ring-brand-primary/5 transition-all">
                                                    <img 
                                                        src={product.seller?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${product.seller?.full_name || product.id}`} 
                                                        alt="seller" 
                                                        className="w-full h-full object-cover" 
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">البائع</span>
                                                    <span className="text-[11px] font-black text-slate-600">
                                                        {product.seller?.full_name || 'متجر معتمد'}
                                                    </span>
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
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-xl mx-auto mt-4"
                        >
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <ShoppingBag className="w-10 h-10 text-slate-300 stroke-[1.5]" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-2">لا توجد نتائج مطابقة</h3>
                            <p className="text-slate-500 text-xs font-bold max-w-sm mx-auto mb-6">لم يتم العثور على أي منتجات تطابق خيارات التصفية أو البحث الحالية.</p>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedCategory('all');
                                    setSelectedSeller('all');
                                    setPriceRange([0, maxPrice]);
                                }}
                                className="px-6 py-3 bg-brand-primary text-white rounded-xl font-black shadow-md shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all text-xs"
                            >
                                إعادة ضبط الفلاتر
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Sliding filter drawer */}
            <AnimatePresence>
                {isDrawerOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.3 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDrawerOpen(false)}
                            className="fixed inset-0 bg-black z-50"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                            className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto p-6 flex flex-col"
                            dir="rtl"
                        >
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                                <h3 className="text-base font-black text-slate-800">التصفية المتقدمة</h3>
                                <button
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex-1">
                                <FilterPanelContent />
                            </div>
                            <button
                                onClick={() => setIsDrawerOpen(false)}
                                className="mt-8 w-full py-3.5 bg-brand-primary text-white rounded-2xl font-black text-xs shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                تطبيق التصفية
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </PageContainer>
    );
};





