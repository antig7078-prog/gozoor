import { useState, useRef } from 'react';
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
    ArrowLeft,
    Building,
    Upload,
    Image as ImageIcon,
    X,
    Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { useCartStore } from '../../../lib/store/cartStore';
import { marketplaceService } from '../../../services/marketplaceService';
import { notificationService } from '../../../services/notificationService';
import { supabase } from '../../../lib/supabase';
import { PageContainer } from '../../../components/shared/PageContainer';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/shared/Card';
import { PageHeader } from '../../../components/shared/PageHeader';

export const MarketplaceCheckout = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { items, totalPrice, clearCart } = useCartStore();

    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [shippingAddress, setShippingAddress] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank_transfer'>('cod');
    const [paymentProof, setPaymentProof] = useState<string>('');
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponError, setCouponError] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [appliedCouponId, setAppliedCouponId] = useState<string | null>(null);
    const finalTotal = Math.max(0, totalPrice - couponDiscount);
    const [uploadingProof, setUploadingProof] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('يرجى اختيار صورة صحيحة');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('حجم الصورة كبير جداً (الحد الأقصى 5 ميجا)');
            return;
        }
        setUploadingProof(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `payment_proof-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `public/${fileName}`;
            const { error: uploadError } = await supabase.storage
                .from('uploads')
                .upload(filePath, file);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage
                .from('uploads')
                .getPublicUrl(filePath);
            setPaymentProof(publicUrl);
            toast.success('تم رفع إيصال الدفع بنجاح');
        } catch (error: any) {
            toast.error('حدث خطأ أثناء رفع الإيصال');
        } finally {
            setUploadingProof(false);
        }
    };

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

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        setCouponError('');
        try {
            const result = await marketplaceService.validateCoupon(couponCode, totalPrice);
            if (result.valid && result.couponId) {
                setCouponDiscount(result.discount);
                setAppliedCouponId(result.couponId);
                setCouponError('');
                toast.success(`تم تطبيق الخصم بنجاح! خصم بقيمة ${result.discount} ج.م`);
            } else {
                setCouponDiscount(0);
                setAppliedCouponId(null);
                setCouponError(result.error || 'كود الخصم غير صالح');
            }
        } catch {
            setCouponError('حدث خطأ أثناء التحقق من الكود');
        } finally {
            setCouponLoading(false);
        }
    };

    const handleConfirmPayment = async () => {
        if (isProcessing) return;

        if (!user) {
            toast.error('يرجى تسجيل الدخول أولاً');
            navigate('/login');
            return;
        }

        if (!shippingAddress.trim() || !contactNumber.trim()) {
            toast.error('يرجى إدخال عنوان الشحن ورقم التواصل');
            return;
        }

        setIsProcessing(true);
        try {
            // Apply coupon if used
            if (appliedCouponId) {
                await marketplaceService.applyCoupon(appliedCouponId);
            }

            // Create Order using marketplaceService
            const { error } = await marketplaceService.createMarketplaceOrder(
                finalTotal,
                shippingAddress,
                contactNumber,
                items,
                paymentMethod,
                paymentProof || undefined
            );

            if (error) throw new Error(error);

            // 3. Clear cart and show success
            clearCart();
            setIsSuccess(true);
            toast.success('تم استلام طلبك بنجاح!');

            // Send notifications to sellers
            for (const item of items) {
                if (item.seller_id && item.seller_id !== user.id) {
                    notificationService.sendNotification({
                        userId: item.seller_id,
                        title: 'طلب شراء جديد',
                        content: `لقد تلقيت طلب شراء لمنتجك "${item.title}" (الكمية: ${item.quantity}).`,
                        type: 'order',
                        link: '/customer-orders'
                    }).catch(err => console.error('Error notifying seller:', err));
                }
            }

            // Send notification to the buyer
            notificationService.sendNotification({
                userId: user.id,
                title: 'تأكيد طلب الشراء',
                content: `تم تسجيل طلبك بنجاح للمنتجات بقيمة إجمالية ${totalPrice} ج.م.`,
                type: 'success',
                link: '/market-orders'
            }).catch(err => console.error('Error notifying buyer:', err));
        } catch (error: any) {
            toast.error(error.message || 'حدث خطأ أثناء معالجة الطلب');
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
                                <ShoppingBag className="w-8 h-8 text-brand-primary" />
                            </div>
                            <h2 className="text-2xl font-black text-text-primary">بيانات الشحن والتوصيل</h2>
                        </div>
                        <div className="space-y-6">
                            <Input
                                label="عنوان الشحن بالتفصيل"
                                placeholder="المدينة، الحي، الشارع، رقم المبنى..."
                                value={shippingAddress}
                                onChange={(e) => setShippingAddress(e.target.value)}
                                required
                            />
                            <Input
                                label="رقم الهاتف للتواصل"
                                placeholder="01xxxxxxxxx"
                                type="tel"
                                value={contactNumber}
                                onChange={(e) => setContactNumber(e.target.value)}
                                required
                            />
                        </div>
                    </Card>

                    <Card className="p-10 border-border-subtle relative overflow-hidden" hoverable={false}>
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-primary"></div>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-brand-primary/10 rounded-2xl">
                                <Wallet className="w-8 h-8 text-brand-primary" />
                            </div>
                            <h2 className="text-2xl font-black text-text-primary">طريقة الدفع</h2>
                        </div>

                        <div className="space-y-4">
                            {/* COD Option */}
                            <div
                                onClick={() => setPaymentMethod('cod')}
                                className={`p-6 rounded-3xl border-2 cursor-pointer transition-all ${
                                    paymentMethod === 'cod'
                                        ? 'border-brand-primary bg-brand-primary/5'
                                        : 'border-border-subtle bg-surface-primary hover:border-brand-primary/30'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white rounded-xl shadow-sm">
                                        <ShieldCheck className="w-6 h-6 text-brand-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-black text-text-primary mb-1">الدفع عند الاستلام (COD)</h3>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                paymentMethod === 'cod' ? 'border-brand-primary' : 'border-slate-300'
                                            }`}>
                                                {paymentMethod === 'cod' && <div className="w-3 h-3 rounded-full bg-brand-primary" />}
                                            </div>
                                        </div>
                                        <p className="text-text-muted font-bold text-sm leading-relaxed">
                                            سيتم سداد قيمة الطلب نقداً للمندوب عند وصول المنتجات إليك.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Bank Transfer Option */}
                            <div
                                onClick={() => setPaymentMethod('bank_transfer')}
                                className={`p-6 rounded-3xl border-2 cursor-pointer transition-all ${
                                    paymentMethod === 'bank_transfer'
                                        ? 'border-brand-primary bg-brand-primary/5'
                                        : 'border-border-subtle bg-surface-primary hover:border-brand-primary/30'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white rounded-xl shadow-sm">
                                        <Building className="w-6 h-6 text-brand-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-black text-text-primary mb-1">تحويل بنكي</h3>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                paymentMethod === 'bank_transfer' ? 'border-brand-primary' : 'border-slate-300'
                                            }`}>
                                                {paymentMethod === 'bank_transfer' && <div className="w-3 h-3 rounded-full bg-brand-primary" />}
                                            </div>
                                        </div>
                                        <p className="text-text-muted font-bold text-sm leading-relaxed">
                                            قم بتحويل المبلغ إلى حساب جذور البنكي وأرفق صورة الإيصال.
                                        </p>
                                    </div>
                                </div>

                                {paymentMethod === 'bank_transfer' && (
                                    <div className="mt-6 p-5 bg-white rounded-2xl border border-border-subtle space-y-4">
                                        <div className="space-y-2">
                                            <p className="text-sm font-black text-text-primary">بيانات الحساب البنكي</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
                                                <div className="bg-surface-primary p-3 rounded-xl">
                                                    <span className="text-text-muted">البنك:</span>
                                                    <span className="text-text-primary block">البنك الأهلي المصري</span>
                                                </div>
                                                <div className="bg-surface-primary p-3 rounded-xl">
                                                    <span className="text-text-muted">رقم الحساب:</span>
                                                    <span className="text-text-primary block font-black dir-ltr">1000 1234 5678 9012</span>
                                                </div>
                                                <div className="bg-surface-primary p-3 rounded-xl">
                                                    <span className="text-text-muted">اسم المستفيد:</span>
                                                    <span className="text-text-primary block">منصة جذور للخدمات الزراعية</span>
                                                </div>
                                                <div className="bg-surface-primary p-3 rounded-xl">
                                                    <span className="text-text-muted">الإيبان (IBAN):</span>
                                                    <span className="text-text-primary block font-black dir-ltr text-[10px]">EG123456789012345678901234567</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-border-subtle pt-4">
                                            <p className="text-xs font-black text-text-primary mb-3">أرفق صورة إيصال التحويل</p>
                                            <div
                                                onClick={() => !uploadingProof && fileInputRef.current?.click()}
                                                className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                                                    paymentProof ? 'border-brand-primary bg-brand-primary/5' : 'border-slate-200 hover:border-brand-primary bg-slate-50'
                                                }`}
                                            >
                                                {uploadingProof ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                                                        <span className="text-xs font-bold text-brand-primary">جاري الرفع...</span>
                                                    </div>
                                                ) : paymentProof ? (
                                                    <div className="relative">
                                                        <img src={paymentProof} alt="إيصال الدفع" className="max-h-32 mx-auto rounded-xl" />
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setPaymentProof(''); }}
                                                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                                        <Upload className="w-8 h-8" />
                                                        <span className="text-xs font-bold">اضغط لرفع صورة الإيصال</span>
                                                    </div>
                                                )}
                                            </div>
                                            <input type="file" ref={fileInputRef} onChange={handleProofUpload} accept="image/*" className="hidden" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {paymentMethod === 'cod' && (
                            <div className="mt-8 flex items-center gap-4 p-5 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800 text-sm font-bold leading-relaxed">
                                <Info className="w-6 h-6 flex-shrink-0 text-amber-500" />
                                <p>نحن نضمن لك فحص المنتج قبل الاستلام. في حال وجود أي مشكلة، يمكنك رفض الاستلام دون أي تكاليف إضافية.</p>
                            </div>
                        )}
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

                            {/* Coupon Code Input */}
                            <div className="pt-6 border-t border-border-subtle">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => { setCouponCode(e.target.value); setCouponError(''); }}
                                        placeholder="كود الخصم"
                                        className="flex-1 px-4 py-3 bg-surface-primary border border-border-subtle rounded-xl text-sm font-bold text-text-primary focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        disabled={couponLoading || !couponCode.trim() || !!appliedCouponId}
                                        className="px-6 py-3 bg-brand-primary text-white rounded-xl text-xs font-black hover:bg-brand-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-brand-primary/20"
                                    >
                                        {couponLoading ? '...' : appliedCouponId ? 'تم' : 'تطبيق'}
                                    </button>
                                </div>
                                {couponError && (
                                    <p className="text-red-500 text-[10px] font-bold mt-2">{couponError}</p>
                                )}
                                {couponDiscount > 0 && (
                                    <p className="text-emerald-600 text-[10px] font-bold mt-2">تم تطبيق خصم بقيمة {couponDiscount} ج.م</p>
                                )}
                            </div>

                            <div className="pt-6 space-y-4 border-t border-border-subtle">
                                <div className="flex justify-between items-center text-text-muted font-bold text-sm">
                                    <span>المجموع الفرعي</span>
                                    <span className="text-text-primary">{totalPrice.toFixed(0)} ج.م</span>
                                </div>
                                {couponDiscount > 0 && (
                                    <div className="flex justify-between items-center text-emerald-600 font-bold text-sm">
                                        <span>الخصم</span>
                                        <span>- {couponDiscount.toFixed(0)} ج.م</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-text-muted font-bold text-sm">
                                    <span>الشحن والخدمة</span>
                                    <Badge variant="primary" size="sm">مجاني</Badge>
                                </div>
                                <div className="flex justify-between items-center pt-4">
                                    <span className="text-text-primary font-black text-xl">المبلغ المستحق</span>
                                    <span className="text-brand-primary font-black text-3xl">{finalTotal.toFixed(0)} <span className="text-xs mr-1">ج.م</span></span>
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
