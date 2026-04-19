import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../lib/store/cartStore';
import { ArrowRight, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

export const Cart = () => {
    const { items, removeItem, updateQuantity, clearCart } = useCartStore();
    const navigate = useNavigate();

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (items.length === 0) {
        return (
            <div className="max-w-4xl mx-auto py-16 text-center">
                <ShoppingBag className="w-24 h-24 text-slate-200 mx-auto mb-6" />
                <h2 className="text-3xl font-black text-slate-800 mb-4">سلة المشتريات فارغة</h2>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                    لم تقم بإضافة أي منتجات إلى سلة المشتريات بعد. تصفح المتجر واكتشف منتجاتنا المميزة.
                </p>
                <Link
                    to="/marketplace"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                >
                    <ShoppingBag className="w-5 h-5" />
                    تصفح المتجر
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-8">
            <h1 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-3">
                <ShoppingBag className="w-8 h-8 text-emerald-600" />
                سلة المشتريات
            </h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items List */}
                <div className="lg:w-2/3 flex flex-col gap-4">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                        {items.map((item, index) => (
                            <div
                                key={item.id}
                                className={`p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 ${index !== items.length - 1 ? 'border-b border-slate-100' : ''}`}
                            >
                                <div className="w-24 h-24 bg-slate-50 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <ShoppingBag className="w-8 h-8 text-slate-300" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <Link to={`/marketplace/${item.id}`}>
                                        <h3 className="text-lg font-bold text-slate-800 hover:text-emerald-600 transition-colors truncate">
                                            {item.title}
                                        </h3>
                                    </Link>
                                    <div className="text-emerald-600 font-bold mt-1">${item.price}</div>
                                </div>

                                <div className="flex items-center gap-4 sm:gap-6 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-start">
                                    <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-100">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="p-2 hover:bg-white rounded-md text-slate-500 hover:text-slate-700 transition-colors shadow-sm"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-12 text-center font-bold text-slate-700">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="p-2 hover:bg-white rounded-md text-slate-500 hover:text-slate-700 transition-colors shadow-sm"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="إزالة المنتج"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={clearCart}
                        className="text-slate-500 self-end text-sm font-medium hover:text-red-600 flex items-center gap-1 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        إفراغ السلة بالكامل
                    </button>
                </div>

                {/* Order Summary */}
                <div className="lg:w-1/3">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-28">
                        <h3 className="text-xl font-bold text-slate-800 mb-6">ملخص الطلب</h3>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-slate-600">
                                <span>المجموع الفرعي</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>الشحن</span>
                                <span className="text-emerald-600">مجاني</span>
                            </div>
                            <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-lg font-black text-slate-800">
                                <span>الإجمالي</span>
                                <span className="text-emerald-600">${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/checkout')}
                            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                        >
                            إتمام الشراء
                            <ArrowRight className="w-5 h-5" />
                        </button>

                        <div className="mt-4 text-center">
                            <Link to="/marketplace" className="text-emerald-600 text-sm font-medium hover:underline">
                                متابعة التسوق
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
