import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, AlertCircle, ArrowRight, User, DollarSign, Calendar, FileText, Info, Send, ShieldCheck, RefreshCw } from 'lucide-react';
import { marketplaceService } from '../../../services/marketplaceService';
import { useAuth } from '../../../contexts/AuthContext';
import { PageContainer } from '../../../components/shared/PageContainer';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { toast } from 'react-hot-toast';

interface ServiceOrderDetailsData {
    id: string;
    service_id: string;
    client_id: string;
    freelancer_id: string;
    package_name: string;
    price: number;
    status: 'new' | 'in_progress' | 'delivered' | 'accepted' | 'completed' | 'cancelled';
    requirements: string;
    created_at: string;
    updated_at: string;
    service?: {
        title: string;
        image_url?: string;
        description?: string;
    };
    freelancer?: {
        full_name: string;
        avatar_url?: string;
        email?: string;
    };
    client?: {
        full_name: string;
        avatar_url?: string;
        email?: string;
    };
}

export const ServiceOrderDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [order, setOrder] = useState<ServiceOrderDetailsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const fetchOrderDetails = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const { data, error } = await marketplaceService.getServiceOrderById(id);
            if (error) throw new Error(error);
            setOrder(data as any);
        } catch (error) {
            console.error('Error fetching service order details:', error);
            toast.error('حدث خطأ أثناء تحميل تفاصيل الطلب');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    if (loading) {
        return <LoadingSpinner fullPage message="جاري تحميل تفاصيل الطلب..." />;
    }

    if (!order || !user) {
        return (
            <PageContainer>
                <div className="text-center py-32 bg-white rounded-[var(--radius-card)] border border-border-subtle shadow-2xl shadow-slate-200/50 max-w-2xl mx-auto">
                    <div className="w-24 h-24 bg-surface-primary rounded-full flex items-center justify-center mx-auto mb-8">
                        <AlertCircle className="w-12 h-12 text-slate-300" />
                    </div>
                    <h2 className="text-3xl font-black text-text-primary mb-4">الطلب غير موجود</h2>
                    <p className="text-text-muted font-bold mb-10">عذراً، لم نتمكن من العثور على الطلب المطلوب أو لا تملك صلاحية الوصول إليه.</p>
                    <Link
                        to="/service-orders"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-brand-primary text-white rounded-full font-black shadow-xl shadow-brand-primary/20 hover:scale-105 transition-all"
                    >
                        <ArrowRight className="w-5 h-5" />
                        العودة للطلبات
                    </Link>
                </div>
            </PageContainer>
        );
    }

    // Role check
    const isFreelancer = user.id === order.freelancer_id;
    const isClient = user.id === order.client_id;

    if (!isFreelancer && !isClient) {
        return (
            <PageContainer>
                <div className="text-center py-32 bg-white rounded-[var(--radius-card)] border border-border-subtle shadow-2xl shadow-slate-200/50 max-w-2xl mx-auto">
                    <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8">
                        <XCircle className="w-12 h-12 text-rose-500" />
                    </div>
                    <h2 className="text-3xl font-black text-rose-600 mb-4">غير مصرح لك بالوصول</h2>
                    <p className="text-text-muted font-bold mb-10">هذا الطلب خاص بمستخدم آخر ولا تملك صلاحية تصفحه.</p>
                    <Link
                        to="/service-orders"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-brand-primary text-white rounded-full font-black shadow-xl shadow-brand-primary/20 hover:scale-105 transition-all"
                    >
                        <ArrowRight className="w-5 h-5" />
                        العودة للطلبات
                    </Link>
                </div>
            </PageContainer>
        );
    }

    const handleUpdateStatus = async (newStatus: ServiceOrderDetailsData['status'], successMsg: string) => {
        setUpdating(true);
        try {
            const { error } = await marketplaceService.updateServiceOrderStatus(order.id, newStatus);
            if (error) throw new Error(error);
            
            toast.success(successMsg);
            // Refresh order details
            const { data } = await marketplaceService.getServiceOrderById(order.id);
            if (data) setOrder(data as any);
        } catch (err: any) {
            console.error('Error updating order status:', err);
            toast.error(err.message || 'فشل تحديث حالة الطلب');
        } finally {
            setUpdating(false);
        }
    };

    const getStatusDetails = (status: ServiceOrderDetailsData['status']) => {
        switch (status) {
            case 'new':
                return { label: 'جديد / بانتظار القبول', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
            case 'in_progress':
                return { label: 'قيد التنفيذ والعمل', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
            case 'delivered':
                return { label: 'تم تسليم العمل وبانتظار الموافقة', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' };
            case 'completed':
            case 'accepted':
                return { label: 'مكتمل بنجاح', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
            case 'cancelled':
                return { label: 'تم إلغاء الطلب', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' };
            default:
                return { label: 'غير معروف', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20' };
        }
    };

    const getPackageLabel = (name: string) => {
        switch (name) {
            case 'Basic':
                return 'الباقة الأساسية';
            case 'Standard':
                return 'الباقة القياسية';
            case 'Premium':
                return 'الباقة المميزة';
            default:
                return name;
        }
    };

    const statusObj = getStatusDetails(order.status);
    const otherParty = isClient ? order.freelancer : order.client;
    const otherPartyRole = isClient ? 'المستقل المنفّذ' : 'العميل المشتري';

    // Timeline Steps representation
    const timelineSteps = [
        {
            title: 'تقديم الطلب',
            desc: 'قام العميل بطلب الخدمة وتوفير متطلبات العمل الأساسية.',
            date: new Date(order.created_at).toLocaleString('ar-EG'),
            completed: true,
            active: true
        },
        {
            title: 'بدء التنفيذ',
            desc: 'تم قبول الطلب وبدأ المستقل في العمل والإنتاج.',
            date: order.status !== 'new' && order.status !== 'cancelled' ? 'تم البدء' : '',
            completed: order.status !== 'new' && order.status !== 'cancelled',
            active: order.status === 'in_progress' || order.status === 'delivered' || order.status === 'completed'
        },
        {
            title: 'تسليم العمل النهائي',
            desc: 'قام المستقل بتسليم مخرجات الخدمة والملفات المطلوبة لمراجعتها.',
            date: order.status === 'delivered' || order.status === 'completed' ? 'تم التسليم' : '',
            completed: order.status === 'delivered' || order.status === 'completed',
            active: order.status === 'delivered' || order.status === 'completed'
        },
        {
            title: 'استلام وإنهاء المشروع',
            desc: 'وافق العميل على التسليم النهائي وتم إغلاق الطلب وتحويل المستحقات.',
            date: order.status === 'completed' ? 'تم الإنهاء' : '',
            completed: order.status === 'completed',
            active: order.status === 'completed'
        }
    ];

    return (
        <PageContainer maxWidth="lg">
            {/* Back Button */}
            <div className="mb-8">
                <Link
                    to="/service-orders"
                    className="inline-flex items-center gap-2 text-text-muted hover:text-brand-primary font-black text-sm transition-colors"
                >
                    <ArrowRight className="w-5 h-5" />
                    العودة لجميع الطلبات
                </Link>
            </div>

            {/* Main Order Details Grid */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                
                {/* Left Area: Status, Details & Actions */}
                <div className="flex-1 space-y-8 w-full">
                    
                    {/* Header Details Card */}
                    <div className="bg-white rounded-[32px] border border-border-subtle shadow-sm p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-1.5 bg-brand-primary" />
                        
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                            <div>
                                <span className={`inline-block px-3 py-1 text-[10px] font-black rounded-lg border uppercase tracking-wider mb-3 ${statusObj.color}`}>
                                    {statusObj.label}
                                </span>
                                <h1 className="text-2xl font-black text-text-primary leading-tight">
                                    {order.service?.title || 'عنوان الخدمة المطلوبة'}
                                </h1>
                            </div>
                            <div className="text-left bg-slate-50 p-4 rounded-2xl border border-slate-100 min-w-[120px]">
                                <p className="text-[10px] text-text-muted font-black">قيمة الطلب</p>
                                <p className="text-2xl font-black text-brand-primary mt-1">{order.price} ج.م</p>
                            </div>
                        </div>

                        {/* Order Metadata list */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-slate-50 text-xs">
                            <div className="space-y-1">
                                <p className="text-text-muted font-black">رقم المعاملة</p>
                                <p className="font-mono text-text-secondary font-bold select-all">{order.id}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-text-muted font-black">تاريخ الإنشاء</p>
                                <p className="font-bold text-text-secondary">{new Date(order.created_at).toLocaleString('ar-EG')}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-text-muted font-black">الحزمة المطلوبة</p>
                                <p className="font-black text-brand-primary">{getPackageLabel(order.package_name)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Requirements Card */}
                    <div className="bg-white rounded-[32px] border border-border-subtle shadow-sm p-8">
                        <h2 className="text-lg font-black text-text-primary mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-brand-primary" />
                            متطلبات وتفاصيل العمل المدخلة من العميل
                        </h2>
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100/50">
                            <p className="text-text-secondary font-semibold leading-[1.8] whitespace-pre-wrap">
                                {order.requirements || 'لم يتم إدخال أي متطلبات محددة.'}
                            </p>
                        </div>
                    </div>

                    {/* Interactive Action Steps based on User Role and Status */}
                    <div className="bg-white rounded-[32px] border border-border-subtle shadow-sm p-8 relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                                <RefreshCw className={`w-5 h-5 ${updating ? 'animate-spin' : ''}`} />
                            </div>
                            <h2 className="text-lg font-black text-text-primary">إجراءات التحكم بالطلب</h2>
                        </div>

                        {updating ? (
                            <div className="py-6 flex items-center justify-center">
                                <LoadingSpinner message="جاري معالجة طلبك وتحديث النظام..." />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {order.status === 'new' && (
                                    <div className="space-y-4">
                                        <p className="text-sm font-semibold text-text-secondary">
                                            {isFreelancer 
                                                ? 'لقد وصلك طلب جديد من العميل. يرجى مراجعة المتطلبات بعناية والموافقة لبدء العمل في أقرب وقت.'
                                                : 'الطلب قيد المراجعة والانتظار حالياً حتى يقوم المستقل بالموافقة وبدء التنفيذ.'}
                                        </p>
                                        <div className="flex flex-wrap gap-4">
                                            {isFreelancer && (
                                                <button
                                                    onClick={() => handleUpdateStatus('in_progress', 'تم قبول الطلب بنجاح وبدء التنفيذ! 🚀')}
                                                    className="px-8 py-3.5 bg-brand-primary text-white rounded-2xl font-black text-sm shadow-lg shadow-brand-primary/10 hover:scale-[1.02] active:scale-95 transition-all"
                                                >
                                                    قبول الطلب وبدء العمل
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleUpdateStatus('cancelled', 'تم إلغاء الطلب وحفظ الحقوق المالية.')}
                                                className="px-8 py-3.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl font-black text-sm hover:bg-rose-100 transition-all"
                                            >
                                                إلغاء الطلب
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {order.status === 'in_progress' && (
                                    <div className="space-y-4">
                                        <p className="text-sm font-semibold text-text-secondary">
                                            {isFreelancer
                                                ? 'المشروع قيد التنفيذ الآن. عند الانتهاء من العمل بالكامل، يرجى تقديم التسليم ليتمكن العميل من اعتماده.'
                                                : 'المستقل يعمل حالياً على تنفيذ طلبك. سيتم إخطارك بمجرد تسليم العمل.'}
                                        </p>
                                        <div className="flex flex-wrap gap-4">
                                            {isFreelancer && (
                                                <button
                                                    onClick={() => handleUpdateStatus('delivered', 'تم تسليم العمل النهائي بنجاح! بانتظار مراجعة العميل.')}
                                                    className="px-8 py-3.5 bg-brand-primary text-white rounded-2xl font-black text-sm shadow-lg shadow-brand-primary/10 hover:scale-[1.02] active:scale-95 transition-all"
                                                >
                                                    تسليم العمل النهائي للعميل
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleUpdateStatus('cancelled', 'تم طلب إلغاء المعاملة.')}
                                                className="px-8 py-3.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl font-black text-sm hover:bg-rose-100 transition-all"
                                            >
                                                طلب إلغاء المشروع
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {order.status === 'delivered' && (
                                    <div className="space-y-4">
                                        <p className="text-sm font-semibold text-text-secondary">
                                            {isClient
                                                ? 'قام المستقل بتسليم المشروع النهائي. يرجى مراجعة كافة المخرجات والمستندات قبل القبول.'
                                                : 'تم تقديم مخرجات العمل النهائي للعميل بنجاح. ننتظر حالياً رد العميل إما بالقبول أو طلب التعديل.'}
                                        </p>
                                        {isClient && (
                                            <div className="flex flex-wrap gap-4">
                                                <button
                                                    onClick={() => handleUpdateStatus('completed', 'مبروك! تم إنهاء المشروع وتحويل المستحقات للبائع. 🎉')}
                                                    className="px-8 py-3.5 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-600/10 hover:scale-[1.02] active:scale-95 transition-all"
                                                >
                                                    قبول العمل النهائي وإغلاق الطلب
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus('in_progress', 'تم إرجاع الطلب للمستقل لإجراء التعديلات المطلوبة.')}
                                                    className="px-8 py-3.5 bg-amber-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-amber-500/10 hover:scale-[1.02] active:scale-95 transition-all"
                                                >
                                                    طلب تعديلات إضافية
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {order.status === 'completed' && (
                                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-800 flex gap-3 text-xs">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-black">تم تسليم وإنهاء المشروع بالكامل</p>
                                            <p className="font-semibold mt-1">
                                                تم شحن الرصيد لحساب المستقل المنفّذ وحفظ حقوق الطرفين. شكراً لاستخدامكم منصة جذور.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {order.status === 'cancelled' && (
                                    <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-rose-800 flex gap-3 text-xs">
                                        <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-black">تم إلغاء هذا الطلب</p>
                                            <p className="font-semibold mt-1">
                                                تم إرجاع كامل المبلغ المدفوع لحفظ الحقوق المالية للعميل، ولم يتم شحن أي عمولات.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Area: Timeline & Contact Info */}
                <div className="w-full lg:w-96 space-y-8 shrink-0">
                    
                    {/* User Profile Card */}
                    {otherParty && (
                        <div className="bg-white rounded-[32px] border border-border-subtle shadow-sm p-6 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-surface-primary border border-border-subtle shrink-0 overflow-hidden flex items-center justify-center text-slate-300">
                                {otherParty.avatar_url ? (
                                    <img src={otherParty.avatar_url} alt={otherParty.full_name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-7 h-7 text-brand-primary" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-text-muted font-black uppercase tracking-wider">{otherPartyRole}</p>
                                <h4 className="font-black text-text-primary text-sm truncate mt-0.5">{otherParty.full_name}</h4>
                                <p className="text-xs text-text-muted truncate mt-0.5">{otherParty.email}</p>
                            </div>
                        </div>
                    )}

                    {/* Timeline Progress Tracker */}
                    <div className="bg-white rounded-[32px] border border-border-subtle shadow-sm p-8">
                        <h3 className="text-md font-black text-text-primary mb-6 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-brand-primary" />
                            مراحل سير المشروع
                        </h3>

                        {order.status === 'cancelled' ? (
                            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100/50 text-rose-600 text-center font-black text-xs">
                                ❌ تم إلغاء المعاملة وتوقف الخط الزمني
                            </div>
                        ) : (
                            <div className="space-y-8 relative before:absolute before:top-2 before:right-3.5 before:bottom-2 before:w-[2px] before:bg-slate-100">
                                {timelineSteps.map((step, idx) => (
                                    <div key={idx} className="flex gap-4 relative">
                                        <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center border-2 transition-all relative z-10 ${
                                            step.completed 
                                                ? 'bg-brand-primary border-brand-primary text-white' 
                                                : step.active 
                                                    ? 'bg-white border-brand-primary text-brand-primary' 
                                                    : 'bg-white border-slate-200 text-slate-300'
                                        }`}>
                                            {step.completed ? (
                                                <CheckCircle2 className="w-4 h-4 fill-current text-brand-primary" />
                                            ) : (
                                                <span className="text-[10px] font-black">{idx + 1}</span>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className={`text-xs font-black transition-colors ${step.active ? 'text-text-primary' : 'text-slate-400'}`}>
                                                {step.title}
                                            </h4>
                                            <p className="text-[10px] text-text-muted font-semibold leading-relaxed">
                                                {step.desc}
                                            </p>
                                            {step.date && (
                                                <span className="inline-block text-[9px] text-brand-primary font-black mt-1">
                                                    ⏱️ {step.date}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Escrow Shield Guarantee */}
                    <div className="p-6 bg-brand-primary/5 rounded-[30px] border border-brand-primary/10 space-y-4">
                        <div className="flex gap-3 text-brand-primary">
                            <ShieldCheck className="w-6 h-6 shrink-0" />
                            <h4 className="font-black text-xs uppercase tracking-wider mt-0.5">ضمان أمان جذور المالي</h4>
                        </div>
                        <p className="text-[10px] text-text-secondary font-semibold leading-relaxed">
                            نضمن لك الحماية التامة لحقوقك المالية حيث يبقى مبلغ الاتفاق في خزانة منصة جذور الآمنة حتى تأكيد تسليم الخدمة وموافقتك الكاملة على المخرجات.
                        </p>
                    </div>
                </div>

            </div>
        </PageContainer>
    );
};
