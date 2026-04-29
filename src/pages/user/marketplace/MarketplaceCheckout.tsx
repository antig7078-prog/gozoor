import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    CreditCard,
    ShieldCheck,
    ArrowRight,
    CheckCircle2,
    Lock,
    ShoppingBag,
    ChevronRight,
    Wallet,
    Info,
    ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { useCartStore } from '../../../lib/store/cartStore';
import { supabase } from '../../../lib/supabase';
import { PageContainer } from '../../../components/shared/PageContainer';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/shared/Card';
import { PageHeader } from '../../../components/shared/PageHeader';

export const MarketplaceCheckout = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { items, totalPrice, clearCart } = useCartStore();

    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (items.length === 0 && !isSuccess) {
        return (
            <PageContainer>
                <div className="max-w-2xl mx-auto py-32 text-center bg-white rounded-[var(--radius-card)] border border-border-subtle shadow-2xl mt-12">
                    <div className="w-20 h-20 bg-surface-primary rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-10 h-10 text-slate-200" />
                    </div>
                    <h2 className="text-3xl font-black text-text-primary mb-4">السلة فارغة</h2>
                    <p className="text-text-secondary mb-8 font-bold">لا توجد منتجات لإتمام عملية الشراء حالياً.</p>
                    <Link 
                        to="/marketplace" 
                        className="inline-flex items-center gap-3 px-8 py-4 bg-brand-primary text-white rounded-full font-black shadow-lg shadow-brand-primary/20 hover:scale-105 transition-transform"
                    >
                        <ArrowRight className="w-5 h-5" />
                        العودة للمتجر
                    </Link>
                </div>
            </PageContainer>
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
            <PageContainer>
                <div className="min-h-[70vh] flex items-center justify-center py-12">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="max-w-2xl w-full bg-white rounded-[var(--radius-card)] p-12 text-center shadow-2xl border border-brand-primary/10 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-brand-primary"></div>
                        <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                            <CheckCircle2 className="w-12 h-12 text-brand-primary" />
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5, type: 'spring' }}
                                className="absolute -top-1 -right-1 w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center border-4 border-white shadow-lg"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                            </motion.div>
                        </div>
                        <h1 className="text-4xl font-black text-text-primary mb-6 tracking-tight">تم استلام طلبك بنجاح!</h1>
                        <p className="text-text-muted font-bold mb-10 leading-relaxed text-lg max-w-md mx-auto">
                            شكراً لثقتك بمنصة جذور. فريقنا سيبدأ العمل على طلبك فوراً، وسيتم التواصل معك لتأكيد موعد الشحن.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                            <Button
                                onClick={() => navigate('/market-orders')}
                                variant="primary"
                                size="lg"
                                icon={CreditCard}
                            >
                                تتبع الطلب
                            </Button>
                            <Button
                                onClick={() => navigate('/marketplace')}
                                variant="secondary"
                                size="lg"
                                icon={ShoppingBag}
                            >
                                العودة للمتجر
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer maxWidth="xl">
            <PageHeader
                title="إتمام الشراء"
                description="قم بمراجعة طلبك واختيار طريقة الدفع المناسبة لإكمال عملية الشراء."
                icon={CreditCard}
                actions={
                    <Button
                        onClick={() => navigate('/cart')}
                        variant="ghost"
                        icon={ChevronRight}
                        className="font-black text-xs"
                    >
                        الرجوع لسلة المشتريات
                    </Button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* Left Side: Payment Details */}
                <div className="lg:col-span-7 space-y-8">
                    <Card className="p-10 border-border-subtle relative overflow-hidden" hoverable={false}>
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-primary"></div>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-brand-primary/10 rounded-2xl">
                                <Wallet className="w-8 h-8 text-brand-primary" />
                            </div>
                            <h2 className="text-2xl font-black text-text-primary">طريقة الدفع</h2>
                        </div>

                        <div className="p-8 bg-surface-primary rounded-3xl border border-border-subtle relative group transition-all hover:bg-brand-primary/5">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm">
                                    <ShieldCheck className="w-6 h-6 text-brand-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-text-primary mb-2">الدفع عند الاستلام (COD)</h3>
                                    <p className="text-text-muted font-bold text-sm leading-relaxed">
                                        سيتم سداد قيمة الطلب نقداً للمندوب عند وصول المنتجات إليك. هذه الخدمة متاحة لجميع عملاء جذور حالياً لضمان أعلى مستويات الأمان والرضا.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center gap-4 p-5 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800 text-sm font-bold leading-relaxed">
                            <Info className="w-6 h-6 flex-shrink-0 text-amber-500" />
                            <p>نحن نضمن لك فحص المنتج قبل الاستلام. في حال وجود أي مشكلة، يمكنك رفض الاستلام دون أي تكاليف إضافية.</p>
                        </div>
                    </Card>
                </div>

                {/* Right Side: Order Summary */}
                <div className="lg:col-span-5">
                    <Card className="border-border-subtle p-0 overflow-hidden sticky top-28" hoverable={false}>
                        <div className="p-10 text-center bg-surface-primary/50 relative">
                            <div className="text-[10px] text-text-muted font-black tracking-widest uppercase mb-4">ملخص الطلب النهائي</div>
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl relative">
                                <ShoppingBag className="w-10 h-10 text-brand-primary" />
                                <div className="absolute -top-1 -right-1 w-7 h-7 bg-brand-bg text-white rounded-full flex items-center justify-center text-[10px] font-black border-4 border-white">
                                    {items.length}
                                </div>
                            </div>
                            <h4 className="text-2xl font-black text-text-primary leading-tight">
                                تفاصيل المنتجات
                            </h4>
                        </div>

                        <div className="p-10 pt-6 space-y-6">
                            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                                {items.map(item => (
                                    <div key={item.id} className="flex justify-between items-center bg-surface-primary/50 p-4 rounded-2xl border border-slate-50 transition-all hover:bg-white hover:shadow-sm">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-black text-text-primary text-sm truncate max-w-[200px]">{item.title}</span>
                                            <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">كمية: {item.quantity}</span>
                                        </div>
                                        <span className="text-brand-primary font-black">{(item.price * item.quantity).toFixed(0)} <span className="text-[10px]">ج.م</span></span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-8 space-y-4 border-t border-border-subtle">
                                <div className="flex justify-between items-center text-text-muted font-bold text-sm">
                                    <span>المجموع الفرعي</span>
                                    <span className="text-text-primary">{totalPrice.toFixed(0)} ج.م</span>
                                </div>
                                <div className="flex justify-between items-center text-text-muted font-bold text-sm">
                                    <span>الشحن والخدمة</span>
                                    <Badge variant="primary" size="sm">مجاني</Badge>
                                </div>
                                <div className="flex justify-between items-center pt-4">
                                    <span className="text-text-primary font-black text-xl">المبلغ المستحق</span>
                                    <span className="text-brand-primary font-black text-3xl">{totalPrice.toFixed(0)} <span className="text-xs mr-1">ج.م</span></span>
                                </div>
                            </div>

                            <Button
                                onClick={handleConfirmPayment}
                                isLoading={isProcessing}
                                variant="primary"
                                size="lg"
                                className="w-full mt-10 py-6 text-lg"
                                icon={ArrowLeft}
                                iconPosition="right"
                            >
                                تأكيد الطلب وشحن المنتجات
                            </Button>
                            
                            <div className="flex items-center justify-center gap-3 mt-6 text-slate-300">
                                <Lock className="w-4 h-4" />
                                <span className="text-[10px] font-black tracking-widest uppercase">تشفير وحماية البيانات 256-bit</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </PageContainer>
    );
};
