import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../../lib/store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Trash2, Plus, Minus, ShoppingBag, ShoppingCart, ChevronLeft, CreditCard, ShieldCheck } from 'lucide-react';
import { PageContainer } from '../../../components/shared/PageContainer';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/shared/Card';
import { PageHeader } from '../../../components/shared/PageHeader';
import { ConfirmModal } from '../../../components/shared/ConfirmModal';
import { useState } from 'react';

export const Cart = () => {
    const { items, removeItem, updateQuantity, clearCart } = useCartStore();
    const navigate = useNavigate();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (items.length === 0) {
        return (
            <PageContainer>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-3xl mx-auto py-24 text-center bg-white rounded-[var(--radius-card)] border border-border-subtle shadow-2xl mt-12"
                >
                    <div className="w-32 h-32 bg-surface-primary rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner relative">
                        <ShoppingBag className="w-16 h-16 text-slate-200" />
                        <div className="absolute -top-2 -right-2 w-10 h-10 bg-brand-primary-light/30 rounded-full flex items-center justify-center border-4 border-white">
                            <Plus className="w-5 h-5 text-brand-primary" />
                        </div>
                    </div>
                    <h2 className="text-4xl font-black text-text-primary mb-4 tracking-tight">سلة المشتريات فارغة</h2>
                    <p className="text-text-muted mb-10 max-w-md mx-auto font-bold leading-relaxed">
                        يبدو أنك لم تختر أي منتجات بعد. انطلق إلى المتجر واكتشف الأدوات والمنتجات التي ستساعدك على النجاح!
                    </p>
                    <Link
                        to="/marketplace"
                        className="inline-flex items-center gap-3 px-10 py-5 bg-brand-primary text-white rounded-full font-black hover:scale-105 transition-all shadow-xl shadow-brand-primary/20"
                    >
                        <ShoppingBag className="w-6 h-6" />
                        اكتشف المنتجات الآن
                    </Link>
                </motion.div>
            </PageContainer>
        );
    }

    return (
        <PageContainer maxWidth="lg">
            <ConfirmModal 
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={() => {
                    clearCart();
                    setIsConfirmOpen(false);
                }}
                title="تفريغ السلة"
                message="هل أنت متأكد من رغبتك في إزالة كافة المنتجات من سلة المشتريات؟"
                confirmText="نعم، قم بالتفريغ"
            />
            <PageHeader 
                title="سلة المشتريات"
                description={`لديك ${items.length} منتجات في انتظارك`}
                icon={ShoppingCart}
                actions={
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsConfirmOpen(true)}
                        className="text-text-muted hover:text-red-500"
                        icon={Trash2}
                    >
                        تفريغ السلة
                    </Button>
                }
            />

            <div className="flex flex-col lg:flex-row gap-10 mt-8">
                {/* Cart Items List */}
                <div className="lg:w-2/3 flex flex-col gap-6">
                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {items.map((item) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    key={item.id}
                                    className="bg-white rounded-[var(--radius-card)] border border-border-subtle shadow-sm hover:shadow-xl transition-all p-6 flex flex-col sm:flex-row items-center gap-8 group"
                                >
                                    <div className="w-32 h-32 bg-surface-primary rounded-2xl overflow-hidden shrink-0 flex items-center justify-center relative border border-border-subtle">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <ShoppingBag className="w-10 h-10 text-slate-200" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 text-center sm:text-right">
                                        <div className="text-[10px] text-brand-primary font-black tracking-widest uppercase mb-1">المنتج</div>
                                        <Link to={`/marketplace/${item.id}`}>
                                            <h3 className="text-xl font-black text-text-primary hover:text-brand-primary transition-colors line-clamp-1 mb-2">
                                                {item.title}
                                            </h3>
                                        </Link>
                                        <div className="text-text-muted font-bold text-sm">سعر الوحدة: <span className="text-text-primary">{item.price} ج.م</span></div>
                                    </div>

                                    <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-start pt-6 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                                        <div className="flex items-center bg-surface-primary rounded-2xl p-1.5 border border-border-subtle">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                aria-label="تقليل الكمية"
                                                className="w-10 h-10 flex items-center justify-center bg-white rounded-xl text-text-secondary hover:text-brand-primary transition-all shadow-sm border border-border-subtle disabled:opacity-30"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-12 text-center font-black text-text-primary text-lg">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                aria-label="زيادة الكمية"
                                                className="w-10 h-10 flex items-center justify-center bg-white rounded-xl text-text-secondary hover:text-brand-primary transition-all shadow-sm border border-border-subtle"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        
                                        <div className="flex flex-col items-end min-w-[100px]">
                                            <div className="text-[10px] text-text-muted font-black tracking-widest uppercase mb-1">الإجمالي</div>
                                            <div className="text-xl font-black text-brand-primary">{(item.price * item.quantity).toFixed(0)} <span className="text-[10px] mr-0.5">ج.م</span></div>
                                        </div>

                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            title="إزالة المنتج"
                                            aria-label={`إزالة ${item.title} من السلة`}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <Link to="/marketplace" className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary font-black text-sm mt-4 transition-colors group self-start">
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        العودة للتسوق وإضافة المزيد
                    </Link>
                </div>

                {/* Order Summary Sidebar */}
                <div className="lg:w-1/3">
                    <Card className="p-8 sticky top-28 overflow-hidden" hoverable={false}>
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-primary"></div>
                        <h3 className="text-2xl font-black text-text-primary mb-8 flex items-center gap-3">
                            <CreditCard className="w-6 h-6 text-brand-primary" />
                            ملخص الطلب
                        </h3>

                        <div className="space-y-6 mb-10">
                            <div className="flex justify-between items-center text-text-secondary font-bold">
                                <span>المجموع الفرعي ({items.length} منتجات)</span>
                                <span className="text-text-primary">{total.toFixed(0)} ج.م</span>
                            </div>
                            <div className="flex justify-between items-center text-text-secondary font-bold">
                                <span>رسوم التوصيل</span>
                                <Badge variant="primary" size="sm">مجاني</Badge>
                            </div>
                            
                            <div className="h-px bg-surface-primary w-full"></div>
                            
                            <div className="flex justify-between items-center py-2">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-text-muted font-black tracking-widest uppercase mb-1">المبلغ الإجمالي</span>
                                    <span className="text-3xl font-black text-brand-primary">{total.toFixed(0)} <span className="text-sm mr-1">ج.م</span></span>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={() => navigate('/marketplace/checkout')}
                            variant="primary"
                            size="lg"
                            className="w-full py-6 text-lg"
                            icon={ChevronLeft}
                            iconPosition="right"
                        >
                            إتمام عملية الشراء
                        </Button>

                        <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-center gap-3 text-text-muted">
                            <ShieldCheck className="w-5 h-5 text-brand-primary" />
                            <span className="text-[10px] font-black tracking-widest uppercase">دفع آمن ومحمي 100%</span>
                        </div>
                    </Card>
                </div>
            </div>
        </PageContainer>
    );
};




