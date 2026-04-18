import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
    CreditCard,
    ShieldCheck,
    ArrowRight,
    Loader2,
    CheckCircle2,
    Lock,
    Wallet
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export const Checkout = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [course, setCourse] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

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

        setIsProcessing(true);
        try {
            // 1. Create Order in orders table
            const { error: orderError } = await supabase
                .from('orders')
                .insert([{
                    user_id: user.id,
                    course_id: id,
                    amount: course.price,
                    status: 'Pending', // Orders start as pending for review
                    payment_method: 'Wallet/Manual'
                }]);

            if (orderError) throw orderError;

            // 2. Add to Enrollments (Auto-enroll if it's free, otherwise keep pending)
            // For now, let's auto-enroll to keep the flow working, or just show success
            if (course.is_free || course.price === 0) {
                await supabase.from('enrollments').insert([{ user_id: user.id, course_id: id }]);
            }

            setIsSuccess(true);
            toast.success('تم إرسال طلب الاشتراك بنجاح!');
        } catch (error: any) {
            toast.error('حدث خطأ أثناء معالجة الطلب');
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            </div>
        );
    }

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
                    <h1 className="text-2xl font-black text-slate-900 mb-4">مبروك، تم استلام طلبك!</h1>
                    <p className="text-slate-500 font-bold mb-8 leading-relaxed">
                        سيتم مراجعة طلب الاشتراك الخاص بك في كورس <b>"{course.title}"</b> وتفعيله خلال 24 ساعة كحد أقصى.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full py-4 bg-slate-900 text-white rounded-xl font-black shadow-lg hover:bg-slate-800 transition-all"
                        >
                            انتقل للوحة التحكم
                        </button>
                        <button
                            onClick={() => navigate('/courses')}
                            className="w-full py-4 bg-slate-100 text-slate-600 rounded-xl font-black hover:bg-slate-200 transition-all"
                        >
                            تصفح كورسات أخرى
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
                    onClick={() => navigate(`/courses/${id}`)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold mb-8 transition-colors"
                >
                    <ArrowRight className="w-5 h-5" />
                    الرجوع للكورس
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Side: Payment Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <CreditCard className="w-6 h-6 text-emerald-600" />
                                اختيار وسيلة الدفع
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="relative flex items-center p-5 border-2 border-emerald-500 bg-emerald-50/50 rounded-2xl cursor-pointer">
                                    <input type="radio" name="payment" defaultChecked className="hidden" />
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-emerald-100">
                                            <Wallet className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900">محفظة إلكترونية</p>
                                            <p className="text-xs text-slate-500 font-bold">فودافون كاش / اتصالات / غيرها</p>
                                        </div>
                                    </div>
                                    <div className="mr-auto">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    </div>
                                </label>

                                <label className="relative flex items-center p-5 border-2 border-slate-100 bg-slate-50/50 rounded-2xl cursor-not-allowed opacity-60">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200">
                                            <CreditCard className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-400">بطاقة بنكية (قريبًا)</p>
                                            <p className="text-xs text-slate-400 font-bold">Visa / MasterCard</p>
                                        </div>
                                    </div>
                                </label>
                            </div>

                            <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <h3 className="font-black text-slate-800 mb-3 flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                    تعليمات الدفع اليدوي
                                </h3>
                                <ul className="text-sm text-slate-600 font-bold space-y-2 leading-relaxed">
                                    <li>• قم بتحويل مبلغ {course.price} جنيهاً إلى الرقم: 010XXXXXXXX</li>
                                    <li>• التقط صورة لشاشة إتمام التحويل (الوصل).</li>
                                    <li>• اضغط على زر "تأكيد الدفع" بالأسفل لإرسال طلبك.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-700 text-sm font-bold">
                            <Lock className="w-5 h-5 flex-shrink-0" />
                            بياناتك محمية تماماً ولا نقوم بتخزين أي معلومات بنكية سرية.
                        </div>
                    </div>

                    {/* Right Side: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden sticky top-8">
                            <div className="p-8 text-center bg-slate-50 border-b border-white">
                                <h3 className="text-slate-500 font-black text-sm uppercase tracking-widest mb-4">ملخص الطلب</h3>
                                <img
                                    src={course.thumbnail_url}
                                    alt={course.title}
                                    className="w-full aspect-video object-cover rounded-2xl shadow-md mb-6"
                                />
                                <h4 className="text-lg font-black text-slate-900 leading-tight">{course.title}</h4>
                            </div>

                            <div className="p-8 space-y-4">
                                <div className="flex justify-between items-center text-slate-500 font-bold">
                                    <span>سعر الكورس</span>
                                    <span>{course.price} ج.م</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-500 font-bold">
                                    <span>رسوم الخدمة</span>
                                    <span className="text-emerald-500">0.00 ج.م</span>
                                </div>
                                <div className="pt-4 border-t border-slate-100 flex justify-between items-center bg-white">
                                    <span className="text-slate-900 font-black text-xl">الإجمالي</span>
                                    <span className="text-emerald-600 font-black text-3xl">{course.price} ج.م</span>
                                </div>

                                <button
                                    onClick={handleConfirmPayment}
                                    disabled={isProcessing}
                                    className="w-full mt-6 py-4 bg-emerald-600 text-white rounded-xl font-black text-lg shadow-lg hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : 'تأكيد الدفع والإشتراك'}
                                </button>

                                <p className="text-[10px] text-center text-slate-400 font-black mt-4 leading-relaxed">
                                    بإكمالك للفعل، أنت توافق على شروط الخدمة وسياسة الخصوصية الخاصة بالمنصة.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
