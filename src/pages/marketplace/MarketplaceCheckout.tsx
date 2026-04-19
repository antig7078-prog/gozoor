import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useCartStore } from '../../lib/store/cartStore';
import {
    CreditCard,
    ShieldCheck,
    ArrowRight,
    Loader2,
    CheckCircle2,
    Lock,
    ShoppingBag
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export const MarketplaceCheckout = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { items, totalPrice, clearCart } = useCartStore();

    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (items.length === 0 && !isSuccess) {
        return (
            <div className="min-h-screen pt-32 text-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">السلة فارغة</h2>
                <button onClick={() => navigate('/marketplace')} className="text-emerald-600 hover:underline">
                    تصفح المتجر
                </button>
            </div>
        );
    }

    const handleConfirmPayment = async () => {
        if (!user) {
            toast.error('يرجى تسجيل الدخول أولاً');
            navigate('/login');
            return;
        }

        setIsProcessing(true);
        try {
            // 1. Create Order
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert([{
                    buyer_id: user.id,
                    total_amount: totalPrice,
                    status: 'Pending'
                }])
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Create Order Items
            const orderItemsInsert = items.map(item => ({
                order_id: orderData.id,
                product_id: item.id,
                quantity: item.quantity,
                price_at_purchase: item.price
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItemsInsert);

            if (itemsError) throw itemsError;

            // 3. Clear cart and show success
            clearCart();
            setIsSuccess(true);
            toast.success('تم استلام طلبك بنجاح!');
        } catch (error: any) {
            toast.error('حدث خطأ أثناء معالجة الطلب');
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6" dir="rtl">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-white rounded-3xl p-10 text-center shadow-xl border border-emerald-100"
                >
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-4">تم استلام طلبك للمنتجات!</h1>
                    <p className="text-slate-500 font-bold mb-8 leading-relaxed">
                        شكراً لثقتك بنا. سيتم مراجعة الطلب والتواصل معك قريباً لتأكيد الشحن.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/market-orders')}
                            className="w-full py-4 bg-slate-900 text-white rounded-xl font-black shadow-lg hover:bg-slate-800 transition-all"
                        >
                            تتبع طلباتي
                        </button>
                        <button
                            onClick={() => navigate('/marketplace')}
                            className="w-full py-4 bg-slate-100 text-slate-600 rounded-xl font-black hover:bg-slate-200 transition-all"
                        >
                            العودة للمتجر
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 md:py-20 px-6 font-sans" dir="rtl">
            <div className="max-w-5xl mx-auto">
                <button
                    onClick={() => navigate('/cart')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold mb-8 transition-colors"
                >
                    <ArrowRight className="w-5 h-5" />
                    الرجوع للسلة
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Side: Payment Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <CreditCard className="w-6 h-6 text-emerald-600" />
                                إتمام الشراء الدفع عند الاستلام
                            </h2>

                            <div className="mt-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <h3 className="font-black text-slate-800 mb-3 flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                    سيتم الدفع نقداً عند توصيل المنتجات إليك
                                </h3>
                                <p className="text-slate-600 font-bold text-sm">
                                    يرجى التأكد من المنتجات الموجودة في ملخص الطلب والضغط على تأكيد لتقديم طلبك.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-700 text-sm font-bold">
                            <Lock className="w-5 h-5 flex-shrink-0" />
                            نضمن لك تجربة تسوق آمنة ومحمية بفضل سياسات الإرجاع الخاصة بنا.
                        </div>
                    </div>

                    {/* Right Side: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden sticky top-8">
                            <div className="p-8 text-center bg-slate-50 border-b border-white">
                                <h3 className="text-slate-500 font-black text-sm uppercase tracking-widest mb-4">ملخص المنتجات</h3>
                                <ShoppingBag className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                                <h4 className="text-lg font-black text-slate-900 leading-tight">
                                    {items.length} منتجات في السلة
                                </h4>
                            </div>

                            <div className="p-8 space-y-4">
                                {items.map(item => (
                                    <div key={item.id} className="flex justify-between items-center text-sm font-medium border-b border-slate-50 pb-2">
                                        <span className="truncate w-2/3">{item.quantity}x {item.title}</span>
                                        <span className="text-slate-700">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}

                                <div className="pt-4 flex justify-between items-center bg-white mt-4">
                                    <span className="text-slate-900 font-black text-xl">الإجمالي</span>
                                    <span className="text-emerald-600 font-black text-3xl">${totalPrice.toFixed(2)}</span>
                                </div>

                                <button
                                    onClick={handleConfirmPayment}
                                    disabled={isProcessing}
                                    className="w-full mt-6 py-4 bg-emerald-600 text-white rounded-xl font-black text-lg shadow-lg hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : 'تأكيد الطلب'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
