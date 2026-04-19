import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, ArrowRight, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useCartStore } from '../../lib/store/cartStore';

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

    const addToCart = () => {
        if (!product) return;
        addItem({
            id: product.id,
            title: product.title,
            price: product.price,
            image_url: product.image_url
        });
        toast.success(`تمت إضافة ${product.title} إلى السلة!`);
    };

    if (loading) {
        return (
            <div className="flex justify-center py-32">
                <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-32">
                <h2 className="text-2xl font-bold text-slate-700">لم يتم العثور على المنتج</h2>
                <Link to="/marketplace" className="text-emerald-600 hover:underline mt-4 inline-block">
                    العودة للمتجر
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-8">
            <Link to="/marketplace" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-medium mb-8 transition-colors">
                <ArrowRight className="w-5 h-5" />
                العودة للمتجر
            </Link>

            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col md:flex-row">
                {/* Product Image */}
                <div className="md:w-1/2 bg-slate-50 aspect-square md:aspect-auto min-h-[400px] flex items-center justify-center">
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <ShoppingBag className="w-32 h-32 text-slate-300" />
                    )}
                </div>

                {/* Product Info */}
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col">
                    <div className="mb-4 flex items-center gap-2">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                            {product.category || 'عام'}
                        </span>
                        <div className="flex items-center gap-1 text-amber-400">
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 text-slate-200 fill-slate-200" />
                            <span className="text-slate-500 text-xs font-medium ml-1">(4.0)</span>
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">{product.title}</h1>

                    <div className="text-3xl font-black text-emerald-600 mb-8">
                        ${product.price}
                    </div>

                    <div className="prose prose-slate mb-8 max-w-none text-slate-600 flex-1">
                        <p>{product.description || 'لا يوجد وصف متاح لهذا المنتج.'}</p>
                    </div>

                    <div className="border-t border-slate-100 pt-8 mt-auto flex flex-col gap-4">
                        <div className="flex items-center justify-between text-sm font-medium text-slate-600">
                            <span>حالة المخزون:</span>
                            {product.stock > 0 ? (
                                <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">متوفر ({product.stock})</span>
                            ) : (
                                <span className="text-red-500 bg-red-50 px-2 py-1 rounded-md">نفدت الكمية</span>
                            )}
                        </div>

                        <button
                            onClick={addToCart}
                            disabled={product.stock <= 0}
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${product.stock > 0
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 hover:shadow-emerald-300'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            <ShoppingCart className="w-5 h-5" />
                            إضافة إلى السلة
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
