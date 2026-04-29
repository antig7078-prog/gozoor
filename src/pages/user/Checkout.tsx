import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
    CreditCard,
    ShieldCheck,
    ArrowRight,
    CheckCircle2,
    Lock,
    Wallet,
    UploadCloud,
    AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { PageContainer } from '../../components/shared/PageContainer';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { PageHeader } from '../../components/shared/PageHeader';
import { Button } from '../../components/ui/Button';

export const Checkout = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [course, setCourse] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [proofFile, setProofFile] = useState<File | null>(null);

    useEffect(() => {
        const fetchCourse = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !data) {
                toast.error('لم يتم العثور على الكورس');
                navigate('/courses');
                return;
            }

            setCourse(data);
            setIsLoading(false);
        };

        if (id) fetchCourse();
    }, [id, navigate]);

    const handleConfirmPayment = async () => {
        if (!user) {
            toast.error('يرجى تسجيل الدخول أولاً');
            navigate('/login');
            return;
        }

        if (!proofFile && course.price > 0) {
            toast.error('يرجى رفع صورة إيصال التحويل');
            return;
        }

        setIsProcessing(true);
        try {
            let proofImageUrl = '';

            // 1. Upload proof image if exists
            if (proofFile) {
                const fileExt = proofFile.name.split('.').pop();
                const fileName = `${user.id}-${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('payment-proofs')
                    .upload(fileName, proofFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('payment-proofs')
                    .getPublicUrl(fileName);

                proofImageUrl = publicUrl;
            }

            // 2. Add to Enrollments with 'pending' status
            const { error: enrollmentError } = await supabase
                .from('enrollments')
                .insert([{
                    user_id: user.id,
                    course_id: id,
                    status: (course.is_free || course.price === 0) ? 'approved' : 'pending',
                    proof_image_url: proofImageUrl
                }]);

            if (enrollmentError) {
                if (enrollmentError.code === '23505') {
                    toast.error('أنت مشترك بالفعل أو لديك طلب معلق لهذا الكورس');
                    return;
                }
                throw enrollmentError;
            }

            setIsSuccess(true);
            toast.success('تم إرسال طلب الاشتراك بنجاح!');
        } catch (error: any) {
            toast.error(error.message || 'حدث خطأ أثناء معالجة الطلب');
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return <LoadingSpinner fullPage message="جاري تجهيز طلبك..." />;
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-primary p-6" dir="rtl">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-white rounded-[var(--radius-card)] p-8 md:p-12 text-center shadow-2xl border border-border-subtle"
                >
                    <div className="w-24 h-24 bg-brand-primary-light/20 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 className="w-12 h-12 text-brand-primary" />
                    </div>
                    <h1 className="text-3xl font-black text-text-primary mb-4 tracking-tight">تم استلام طلبك!</h1>
                    <p className="text-text-secondary font-bold mb-10 leading-relaxed text-lg">
                        سيتم مراجعة طلب الاشتراك الخاص بك في كورس <br />
                        <span className="text-text-primary font-black underline decoration-brand-primary decoration-4 underline-offset-4">"{course.title}"</span>
                        <br /> وتفعيله خلال 24 ساعة كحد أقصى.
                    </p>
                    <div className="space-y-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full py-4.5 bg-brand-bg text-white rounded-[var(--radius-button)] font-black shadow-xl hover:bg-black transition-all active:scale-95"
                        >
                            انتقل للوحة التحكم
                        </button>
                        <button
                            onClick={() => navigate('/courses')}
                            className="w-full py-4.5 bg-surface-primary text-text-secondary rounded-[var(--radius-button)] font-black hover:bg-slate-100 transition-all"
                        >
                            تصفح كورسات أخرى
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-primary py-12 md:py-20 font-sans" dir="rtl">
            <PageContainer maxWidth="xl">
            <PageHeader
                title="الاشتراك في الكورس"
                description={`أنت على وشك الاشتراك في كورس "${course?.title || ''}". يرجى إكمال عملية الدفع لتفعيل حسابك.`}
                icon={CreditCard}
                actions={
                    <Button
                        onClick={() => navigate(`/courses/${id}`)}
                        variant="ghost"
                        icon={ArrowRight}
                        className="font-black text-xs"
                    >
                        الرجوع للكورس
                    </Button>
                }
            />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Side: Payment Details */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[var(--radius-card)] p-6 md:p-10 border border-border-default shadow-sm"
                        >
                            <h2 className="text-2xl font-black text-text-primary mb-8 flex items-center gap-4">
                                <div className="p-2.5 bg-brand-primary-light/30 rounded-xl">
                                    <CreditCard className="w-6 h-6 text-brand-primary" />
                                </div>
                                اختيار وسيلة الدفع
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <label className="relative flex items-center p-6 border-2 border-brand-primary bg-brand-primary-light/10 rounded-[var(--radius-card)] cursor-pointer transition-all">
                                    <input type="radio" name="payment" defaultChecked className="hidden" />
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-brand-primary/20">
                                            <Wallet className="w-7 h-7 text-brand-primary" />
                                        </div>
                                        <div>
                                            <p className="font-black text-text-primary text-lg">محفظة إلكترونية</p>
                                            <p className="text-xs text-text-muted font-black uppercase tracking-widest">فودافون / اتصالات كاش</p>
                                        </div>
                                    </div>
                                    <div className="mr-auto">
                                        <div className="w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center">
                                            <CheckCircle2 className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                </label>

                                <label className="relative flex items-center p-6 border-2 border-border-subtle bg-surface-primary/50 rounded-[var(--radius-card)] cursor-not-allowed opacity-60">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-border-default">
                                            <CreditCard className="w-7 h-7 text-slate-300" />
                                        </div>
                                        <div>
                                            <p className="font-black text-text-muted text-lg">بطاقة بنكية</p>
                                            <p className="text-xs text-slate-300 font-black uppercase tracking-widest">قريباً جداً</p>
                                        </div>
                                    </div>
                                </label>
                            </div>

                            <div className="mt-10 p-6 md:p-8 bg-surface-card rounded-[var(--radius-card)] border border-border-default relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                
                                <h3 className="font-black text-text-primary mb-6 flex items-center gap-3">
                                    <ShieldCheck className="w-6 h-6 text-brand-primary" />
                                    تعليمات الدفع اليدوي
                                </h3>
                                <div className="space-y-4 mb-8">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-2xl border border-border-default shadow-sm gap-2">
                                        <span className="text-text-secondary font-bold text-sm sm:text-base">رقم التحويل</span>
                                        <span className="text-lg sm:text-xl font-black text-brand-primary font-mono select-all">010XXXXXXXX</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-border-default shadow-sm">
                                        <span className="text-text-secondary font-bold text-sm sm:text-base">المبلغ المطلوب</span>
                                        <span className="text-lg sm:text-xl font-black text-text-primary">{course.price} ج.م</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-sm font-black text-text-primary mb-3 flex items-center gap-2">
                                        <UploadCloud className="w-4 h-4 text-brand-primary" />
                                        رفع إيصال التحويل (Screenshot)
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className={`p-6 md:p-10 border-2 border-dashed rounded-[var(--radius-card)] flex flex-col items-center justify-center gap-4 transition-all duration-300 ${proofFile ? 'border-brand-primary bg-brand-primary-light/10' : 'border-slate-300 bg-white group-hover:border-brand-primary'}`}>
                                            <AnimatePresence mode="wait">
                                                {proofFile ? (
                                                    <motion.div 
                                                        key="success"
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="text-center"
                                                    >
                                                        <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                                            <CheckCircle2 className="w-8 h-8 text-white" />
                                                        </div>
                                                        <p className="text-sm font-black text-brand-primary truncate max-w-[200px]">{proofFile.name}</p>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div 
                                                        key="upload"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="text-center"
                                                    >
                                                        <div className="w-16 h-16 bg-surface-primary rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300 group-hover:text-brand-primary group-hover:bg-brand-primary-light/30 transition-all">
                                                            <UploadCloud className="w-8 h-8" />
                                                        </div>
                                                        <p className="text-sm font-black text-text-muted group-hover:text-text-secondary transition-colors">اضغط هنا لرفع صورة الوصل</p>
                                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">JPG, PNG up to 5MB</p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="flex items-start gap-4 p-5 bg-amber-50 border border-amber-100 rounded-2xl text-amber-800 text-sm font-bold">
                            <AlertCircle className="w-6 h-6 flex-shrink-0 text-amber-500" />
                            <p className="leading-relaxed">
                                يرجى التأكد من أن صورة الإيصال واضحة وتحتوي على رقم العملية وتاريخ التحويل لضمان تفعيل الكورس في أسرع وقت.
                            </p>
                        </div>
                    </div>

                    {/* Right Side: Order Summary */}
                    <div className="lg:col-span-1">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-[var(--radius-card)] border border-border-default shadow-2xl overflow-hidden sticky top-8"
                        >
                            <div className="p-8 text-center bg-surface-primary border-b border-border-subtle">
                                <h3 className="text-text-muted font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] mb-4 md:mb-6">ملخص طلب الاشتراك</h3>
                                <div className="relative group overflow-hidden rounded-2xl shadow-lg mb-6">
                                    <img
                                        src={course.thumbnail_url}
                                        alt={course.title}
                                        loading="lazy"
                                        className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                </div>
                                <h4 className="text-xl font-black text-text-primary leading-tight px-2">{course.title}</h4>
                            </div>

                            <div className="p-8 space-y-5">
                                <div className="flex justify-between items-center text-text-secondary font-black text-sm">
                                    <span>سعر الكورس</span>
                                    <span>{course.price} ج.م</span>
                                </div>
                                <div className="flex justify-between items-center text-text-secondary font-black text-sm">
                                    <span>رسوم الخدمة</span>
                                    <span className="text-brand-primary flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> مجاناً
                                    </span>
                                </div>
                                <div className="pt-6 border-t border-border-subtle flex justify-between items-end bg-white">
                                    <div>
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">الإجمالي المستحق</p>
                                        <span className="text-text-primary font-black text-3xl md:text-4xl tracking-tighter">{course.price} <span className="text-sm">ج.م</span></span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleConfirmPayment}
                                    disabled={isProcessing}
                                    className="w-full mt-8 py-5 bg-brand-primary text-white rounded-[var(--radius-button)] font-black text-lg shadow-xl hover:bg-brand-primary-hover active:scale-95 transition-all flex items-center justify-center gap-3 group"
                                >
                                    {isProcessing ? (
                                        <LoadingSpinner size={20} color="text-white" />
                                    ) : (
                                        <>
                                            تأكيد الدفع والإشتراك
                                            <ArrowRight className="w-5 h-5 -rotate-180 group-hover:-translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>

                                <div className="flex flex-col items-center gap-3 pt-6">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest">
                                        <Lock className="w-3 h-3" /> نظام دفع مشفر وآمن
                                    </div>
                                    <p className="text-[9px] text-center text-slate-300 font-bold leading-relaxed max-w-[200px]">
                                        بإكمالك للطلب، أنت توافق على شروط الخدمة وسياسة الخصوصية الخاصة بجذور.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </PageContainer>
        </div>
    );
};




