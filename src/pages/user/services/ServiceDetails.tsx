import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MonitorPlay, ShoppingCart, ChevronRight, Star, Clock, ShieldCheck, CheckCircle2, Share2, Heart, Award, Zap, Globe, Briefcase, FileText, User, X, Info } from 'lucide-react';
import { marketplaceService } from '../../../services/marketplaceService';
import { toast } from 'react-hot-toast';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { PageContainer } from '../../../components/shared/PageContainer';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';

interface ServicePackage {
    name: string;
    description: string;
    price: number;
    delivery_time_days: number;
    revisions?: number;
}

interface Service {
    id: string;
    freelancer_id: string;
    title: string;
    description: string;
    price: number;
    delivery_time_days: number;
    image_url: string;
    created_at: string;
    packages?: ServicePackage[];
    provider?: {
        full_name: string;
        bio: string;
        specialization: string;
        portfolio_url: string;
        avatar_url: string;
    };
}

export const ServiceDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Package selector state
    const [selectedPackageIndex, setSelectedPackageIndex] = useState(0);
    
    // Order Dialog state
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [requirements, setRequirements] = useState('');
    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

    const requireAuth = useRequireAuth();

    useEffect(() => {
        const fetchService = async () => {
            if (!id) return;
            try {
                const { data, error } = await marketplaceService.getServiceById(id);

                if (error) throw new Error(error);
                if (data) setService(data as any);
            } catch (error) {
                console.error('Error fetching service details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchService();
    }, [id]);

    if (loading) {
        return <LoadingSpinner fullPage message="جاري تحميل تفاصيل الخدمة..." />;
    }

    if (!service) {
        return (
            <PageContainer>
                <div className="text-center py-32 bg-white rounded-[var(--radius-card)] border border-border-subtle shadow-2xl shadow-slate-200/50 max-w-2xl mx-auto">
                    <div className="w-24 h-24 bg-surface-primary rounded-full flex items-center justify-center mx-auto mb-8">
                        <MonitorPlay className="w-12 h-12 text-slate-200" />
                    </div>
                    <h2 className="text-3xl font-black text-text-primary mb-4">الخدمة غير موجودة</h2>
                    <p className="text-text-muted font-bold mb-10">عذراً، لم نتمكن من العثور على الخدمة المطلوبة.</p>
                    <Link
                        to="/services"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-brand-primary text-white rounded-full font-black shadow-xl shadow-brand-primary/20 hover:scale-105 transition-all"
                    >
                        <ChevronRight className="w-5 h-5" />
                        العودة للخدمات
                    </Link>
                </div>
            </PageContainer>
        );
    }

    // Build packages (fallback to virtual packages if none are defined)
    const packages: ServicePackage[] = service.packages && service.packages.length === 3 ? service.packages : [
        {
            name: 'الأساسية',
            description: 'الباقة الأساسية للبدء في تنفيذ متطلبات الخدمة بالمواصفات القياسية.',
            price: service.price,
            delivery_time_days: service.delivery_time_days,
            revisions: 1
        },
        {
            name: 'القياسية',
            description: 'باقة متميزة تشمل إضافات متعددة، جودة أعلى، وسرعة تنفيذ أفضل.',
            price: Math.round(service.price * 1.8),
            delivery_time_days: Math.max(1, Math.round(service.delivery_time_days * 0.75)),
            revisions: 3
        },
        {
            name: 'المميزة',
            description: 'التغطية الشاملة بأعلى جودة مع دعم متواصل، تسليم مستعجل وتعديلات إضافية.',
            price: Math.round(service.price * 2.8),
            delivery_time_days: Math.max(1, Math.round(service.delivery_time_days * 0.5)),
            revisions: 5
        }
    ];

    const currentPackage = packages[selectedPackageIndex];
    const packageDbNames = ['Basic', 'Standard', 'Premium'] as const;

    const handleOpenOrderModal = () => {
        if (!requireAuth('سجّل دخولك الأول لتتمكن من شراء هذه الخدمة 🔐')) return;
        setShowOrderModal(true);
    };

    const handleCreateOrder = async () => {
        if (!requirements.trim()) {
            toast.error('برجاء كتابة متطلبات العمل لمساعدة المستقل على البدء.');
            return;
        }

        setIsSubmittingOrder(true);
        try {
            const { data, error } = await marketplaceService.createServiceOrder({
                service_id: service.id,
                freelancer_id: service.freelancer_id,
                package_name: packageDbNames[selectedPackageIndex],
                price: currentPackage.price,
                requirements: requirements.trim()
            });

            if (error) throw new Error(error);

            toast.success('تم إرسال طلبك بنجاح!');
            setShowOrderModal(false);
            setRequirements('');
            // Navigate to client purchases list
            navigate('/service-orders');
        } catch (err: any) {
            console.error('Error placing service order:', err);
            toast.error(err.message || 'حدث خطأ أثناء إتمام الطلب');
        } finally {
            setIsSubmittingOrder(false);
        }
    };

    return (
        <PageContainer maxWidth="lg">
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-10"
            >
                <Link
                    to="/services"
                    className="group inline-flex items-center gap-3 px-5 py-2.5 bg-white border border-border-subtle rounded-full text-text-secondary hover:text-brand-primary hover:border-brand-primary/20 font-black text-sm transition-all shadow-sm"
                >
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    العودة لصفحة الخدمات
                </Link>
            </motion.div>

            <div className="flex flex-col lg:flex-row gap-10 items-start">
                {/* Main Content Area */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex-1 space-y-10 w-full"
                >
                    {/* Media Gallery (Single Image) */}
                    <div className="relative aspect-[16/9] rounded-[40px] overflow-hidden bg-slate-100 border border-border-subtle group shadow-2xl shadow-slate-200/50">
                        {service.image_url ? (
                            <img
                                src={service.image_url}
                                alt={service.title}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-200">
                                <MonitorPlay className="w-32 h-32" />
                            </div>
                        )}
                        <div className="absolute top-6 right-6 flex flex-col gap-3">
                            <button className="p-3 bg-white/80 backdrop-blur-xl rounded-2xl text-text-primary hover:bg-brand-primary hover:text-white transition-all shadow-xl shadow-black/5">
                                <Heart className="w-5 h-5" />
                            </button>
                            <button className="p-3 bg-white/80 backdrop-blur-xl rounded-2xl text-text-primary hover:bg-brand-primary hover:text-white transition-all shadow-xl shadow-black/5">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Service Info Header */}
                    <div className="bg-white rounded-[var(--radius-card)] p-10 border border-border-subtle shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-bl-full -mr-16 -mt-16"></div>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="px-5 py-2 bg-brand-primary/10 text-brand-primary rounded-2xl text-xs font-black tracking-widest uppercase flex items-center gap-2">
                                <Award className="w-4 h-4" />
                                خدمة احترافية مختارة
                            </div>
                            <div className="h-6 w-px bg-slate-100"></div>
                            <div className="flex items-center gap-2 text-amber-500 font-black">
                                <Star className="w-5 h-5 fill-current" />
                                5.0
                                <span className="text-slate-300 text-sm mr-1 font-bold">(12 تقييم)</span>
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-text-primary leading-[1.15] mb-8">
                            {service.title}
                        </h1>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-surface-primary rounded-3xl border border-border-subtle/50">
                            <div className="space-y-1">
                                <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">تاريخ النشر</p>
                                <p className="text-slate-700 font-bold">{new Date(service.created_at).toLocaleDateString('ar-EG')}</p>
                            </div>
                            <div className="space-y-1 text-center md:text-right">
                                <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">طلبات مكتملة</p>
                                <p className="text-slate-700 font-bold">24 طلب</p>
                            </div>
                            <div className="space-y-1 text-center md:text-right">
                                <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">سرعة الرد</p>
                                <p className="text-slate-700 font-bold">خلال ساعات</p>
                            </div>
                            <div className="space-y-1 text-left md:text-right">
                                <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">المستوى</p>
                                <p className="text-brand-primary font-bold">بائع متميز</p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-[var(--radius-card)] p-10 border border-border-subtle shadow-sm">
                        <h2 className="text-2xl font-black text-text-primary mb-8 flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-brand-primary rounded-full"></div>
                            تفاصيل الخدمة
                        </h2>
                        <div className="prose prose-slate max-w-none">
                            <div className="text-text-secondary font-bold text-lg leading-[1.8] whitespace-pre-wrap">
                                {service.description || 'لا يوجد وصف تفصيلي متوفر لهذه الخدمة.'}
                            </div>
                        </div>

                        {/* Features List */}
                        <div className="grid md:grid-cols-2 gap-4 mt-12 pt-10 border-t border-slate-50">
                            {[
                                'تنفيذ احترافي بأعلى جودة',
                                'التزام تام بمواعيد التسليم',
                                'متابعة وتحديثات مستمرة',
                                'دعم فني واستشارات مجانية'
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-brand-primary/5 text-slate-700 font-bold group hover:bg-brand-primary hover:text-white transition-all cursor-default">
                                    <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                        <CheckCircle2 className="w-5 h-5 text-brand-primary group-hover:text-white" />
                                    </div>
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Freelancer Profile Section */}
                    {service.provider && (
                        <div className="bg-white rounded-[var(--radius-card)] p-10 border border-border-subtle shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary opacity-0 group-hover:opacity-100 transition-opacity" />

                            <h2 className="text-2xl font-black text-text-primary mb-10 flex items-center gap-3">
                                <div className="w-1.5 h-8 bg-brand-primary rounded-full"></div>
                                عن مقدم الخدمة
                            </h2>

                            <div className="flex flex-col md:flex-row gap-10 items-start">
                                {/* Avatar & Primary Info */}
                                <div className="flex flex-col items-center text-center space-y-4 shrink-0">
                                    <div className="w-32 h-32 rounded-[30px] bg-slate-50 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                                        {service.provider.avatar_url ? (
                                            <img src={service.provider.avatar_url} alt={service.provider.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-16 h-16 text-brand-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <Link to={`/profile/${service.freelancer_id}`} className="text-xl font-black text-text-primary hover:text-brand-primary transition-colors">{service.provider.full_name}</Link>
                                        <p className="text-brand-primary font-bold text-xs mt-1 uppercase tracking-widest">{service.provider.specialization || 'بائع محترف'}</p>
                                    </div>
                                    {service.provider.portfolio_url && (
                                        <a
                                            href={service.provider.portfolio_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary transition-colors shadow-lg shadow-black/10"
                                        >
                                            <Globe className="w-4 h-4" />
                                            معرض الأعمال
                                        </a>
                                    )}
                                </div>

                                {/* Bio & Skills Summary */}
                                <div className="flex-1 space-y-8">
                                    <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-100">
                                        <div className="flex items-center gap-2 mb-4 text-slate-400">
                                            <FileText className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">النبذة التعريفية</span>
                                        </div>
                                        <p className="text-slate-600 font-bold leading-[1.7]">
                                            {service.provider.bio || 'هذا المستخدم لم يقم بإضافة نبذة تعريفية بعد.'}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="p-4 rounded-2xl border border-border-subtle flex flex-col items-center text-center">
                                            <Award className="w-5 h-5 text-brand-primary mb-2" />
                                            <p className="text-[10px] text-text-muted font-black uppercase tracking-tight">التقييم العام</p>
                                            <p className="text-lg font-black text-text-primary">5.0/5.0</p>
                                        </div>
                                        <div className="p-4 rounded-2xl border border-border-subtle flex flex-col items-center text-center">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-2" />
                                            <p className="text-[10px] text-text-muted font-black uppercase tracking-tight">مشاريع مكتملة</p>
                                            <p className="text-lg font-black text-text-primary">+50</p>
                                        </div>
                                        <div className="p-4 rounded-2xl border border-border-subtle flex flex-col items-center text-center">
                                            <Clock className="w-5 h-5 text-amber-500 mb-2" />
                                            <p className="text-[10px] text-text-muted font-black uppercase tracking-tight">وقت الاستجابة</p>
                                            <p className="text-lg font-black text-text-primary">ساعتين</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* 3-Tier Pricing Packages Card (Sticky Sidebar) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-full lg:w-[420px] sticky top-28 shrink-0"
                >
                    <div className="bg-white rounded-[40px] border border-border-subtle shadow-2xl shadow-slate-300/50 overflow-hidden relative">
                        {/* Tab Headers */}
                        <div className="flex border-b border-slate-100 bg-slate-50/50 p-2">
                            {packages.map((pkg, idx) => (
                                <button
                                    key={pkg.name}
                                    onClick={() => setSelectedPackageIndex(idx)}
                                    className={`flex-1 py-4 text-center rounded-[20px] text-sm font-black transition-all ${
                                        selectedPackageIndex === idx
                                            ? 'bg-white text-brand-primary shadow-md shadow-brand-primary/5'
                                            : 'text-text-muted hover:text-text-secondary'
                                    }`}
                                >
                                    {pkg.name}
                                </button>
                            ))}
                        </div>

                        {/* Package Info */}
                        <div className="p-8 space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-black text-text-primary">
                                    {currentPackage.price} <span className="text-xs font-bold">ج.م</span>
                                </h3>
                                <div className="p-2.5 bg-brand-primary/5 rounded-xl text-brand-primary">
                                    <Zap className="w-5 h-5 fill-current" />
                                </div>
                            </div>

                            <p className="text-slate-600 text-sm font-semibold leading-relaxed min-h-[60px]">
                                {currentPackage.description}
                            </p>

                            <div className="space-y-3 pt-4 border-t border-slate-100">
                                <div className="flex items-center justify-between text-xs text-text-secondary font-bold">
                                    <span className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-brand-primary" />
                                        وقت التسليم
                                    </span>
                                    <span className="text-text-primary font-black">{currentPackage.delivery_time_days} أيام</span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-text-secondary font-bold">
                                    <span className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-brand-primary" />
                                        عدد التعديلات المتاحة
                                    </span>
                                    <span className="text-text-primary font-black">{currentPackage.revisions} تعديلات</span>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <button
                                    onClick={handleOpenOrderModal}
                                    className="w-full py-4 bg-brand-primary text-white rounded-[24px] font-black text-base shadow-xl shadow-brand-primary/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
                                >
                                    <ShoppingCart className="w-5 h-5 group-hover:-translate-y-0.5 group-hover:rotate-12 transition-transform" />
                                    طلب هذه الحزمة الآن
                                </button>

                                <div className="flex items-center justify-center gap-2 text-text-muted font-black text-[9px] uppercase tracking-wider">
                                    <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" />
                                    حماية كاملة وحفظ لحقوقك المالية
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seller Quick Info */}
                    <Link to={`/profile/${service.freelancer_id}`} className="block mt-6 p-6 bg-brand-bg rounded-[30px] flex items-center gap-4 text-white hover:opacity-90 transition-opacity">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                            <MonitorPlay className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">البائع</p>
                            <p className="font-black">{service.provider?.full_name || 'بائع معتمد'}</p>
                        </div>
                        <div className="p-2 bg-white/5 rounded-xl">
                            <ChevronRight className="w-4 h-4 -rotate-180" />
                        </div>
                    </Link>
                </motion.div>
            </div>

            {/* Requirements & Checkout Dialog Modal */}
            <AnimatePresence>
                {showOrderModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isSubmittingOrder && setShowOrderModal(false)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />

                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[32px] w-full max-w-lg border border-border-subtle shadow-2xl relative z-10 overflow-hidden"
                            dir="rtl"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-text-primary">إتمام طلب الخدمة</h3>
                                    <p className="text-xs text-text-muted mt-1 font-semibold">{service.title}</p>
                                </div>
                                <button
                                    onClick={() => !isSubmittingOrder && setShowOrderModal(false)}
                                    className="p-2 text-text-muted hover:bg-slate-50 rounded-xl transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-6">
                                {/* Selected Package Summary */}
                                <div className="p-4 bg-brand-primary/5 border border-brand-primary/10 rounded-2xl flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-brand-primary font-black">الباقة المختارة</p>
                                        <p className="text-sm text-text-primary font-black mt-1">{currentPackage.name}</p>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs text-text-muted font-bold">السعر الإجمالي</p>
                                        <p className="text-lg font-black text-brand-primary mt-1">{currentPackage.price} ج.م</p>
                                    </div>
                                </div>

                                {/* Requirements Textarea */}
                                <div className="space-y-2.5">
                                    <label className="text-sm font-black text-text-primary flex items-center gap-2">
                                        متطلبات الخدمة والتعليمات
                                        <span className="text-brand-primary">*</span>
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={requirements}
                                        onChange={(e) => setRequirements(e.target.value)}
                                        disabled={isSubmittingOrder}
                                        placeholder="اكتب هنا جميع التفاصيل أو المتطلبات أو الملفات التي يحتاجها البائع لإنهاء خدمتك على أكمل وجه..."
                                        className="w-full px-4 py-3 bg-surface-primary border border-border-subtle rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary outline-none transition-all font-semibold text-text-primary text-sm placeholder:text-slate-300 resize-none leading-relaxed"
                                    />
                                </div>

                                {/* Secure Notice */}
                                <div className="p-4 bg-slate-50 rounded-2xl flex gap-3 text-slate-500 border border-slate-100">
                                    <Info className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                                    <p className="text-xs font-semibold leading-relaxed">
                                        يتم حفظ المبلغ في حساب المنصة بأمان ولا يتم تحويله إلى البائع إلا بعد مراجعتك للعمل المستلم والموافقة عليه بشكل كامل.
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-4 bg-slate-50/50">
                                <button
                                    onClick={() => !isSubmittingOrder && setShowOrderModal(false)}
                                    disabled={isSubmittingOrder}
                                    className="px-6 py-3 text-sm font-black text-text-muted hover:text-text-secondary transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleCreateOrder}
                                    disabled={isSubmittingOrder}
                                    className="px-8 py-3 bg-brand-primary text-white rounded-2xl font-black text-sm hover:scale-[1.02] transition-all flex items-center gap-2"
                                >
                                    {isSubmittingOrder ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            جاري إرسال الطلب...
                                        </>
                                    ) : (
                                        'تأكيد الطلب والدفع'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </PageContainer>
    );
};
