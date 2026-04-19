import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ShoppingBag, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';

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

    return (
        <div className="max-w-7xl mx-auto py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                    <ShoppingBag className="w-8 h-8 text-emerald-600" />
                    المتجر (Marketplace)
                </h1>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="ابحث عن المنتجات..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        />
                    </div>
                    <button className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                </div>
            ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            key={product.id}
                            className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col"
                        >
                            <Link to={`/marketplace/${product.id}`} className="aspect-square bg-slate-50 relative overflow-hidden block">
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <ShoppingBag className="w-16 h-16" />
                                    </div>
                                )}
                            </Link>

                            <div className="p-5 flex flex-col flex-1">
                                <Link to={`/marketplace/${product.id}`}>
                                    <h3 className="font-bold text-slate-800 text-lg hover:text-emerald-600 transition-colors line-clamp-1">
                                        {product.title}
                                    </h3>
                                </Link>
                                <p className="text-slate-500 text-sm mt-1 mb-4 line-clamp-2 flex-1">
                                    {product.description || 'لا يوجد وصف'}
                                </p>
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                                    <span className="text-xl font-black text-emerald-600">
                                        ${product.price}
                                    </span>
                                    <Link
                                        to={`/marketplace/${product.id}`}
                                        className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg text-sm font-bold transition-colors"
                                    >
                                        التفاصيل
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                    <ShoppingBag className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-700">لا يوجد منتجات</h3>
                    <p className="text-slate-500 mt-2">لم يتم العثور على أي منتجات تطابق بحثك.</p>
                </div>
            )}
        </div>
    );
};
