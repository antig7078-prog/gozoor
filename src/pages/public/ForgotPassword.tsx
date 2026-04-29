import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Leaf, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

export const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error('يرجى إدخال البريد الإلكتروني');
            return;
        }

        setIsLoading(true);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
            toast.error(error.message);
            setIsLoading(false);
        } else {
            setIsSubmitted(true);
            toast.success('تم إرسال رابط إعادة التعيين');
        }
    };

    return (
        <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 relative overflow-hidden font-sans" dir="rtl">

            {/* Premium Animated Background */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-brand-primary/20 rounded-full mix-blend-screen filter blur-[120px] opacity-60 animate-blob" />
                <div className="absolute top-[20%] left-[-10%] w-[35rem] h-[35rem] bg-lime-600/10 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-blob animation-delay-2000" />
                <div className="absolute bottom-[-20%] right-[10%] w-[45rem] h-[45rem] bg-amber-500/10 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-blob animation-delay-4000" />
                <div className="absolute inset-0 bg-[url('/assets/images/stardust.png')] opacity-[0.03] mix-blend-overlay"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[28rem] relative z-10"
            >
                <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-[2.5rem] p-10 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden text-center">

                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent" />

                    {/* Brand Section */}
                    <div className="flex flex-col items-center mb-10">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-brand-primary blur-xl opacity-40 rounded-full"></div>
                            <div className="relative bg-gradient-to-br from-brand-primary to-brand-accent p-5 rounded-[1.5rem] border border-brand-primary/30">
                                <Leaf className="w-10 h-10 text-white" />
                            </div>
                        </motion.div>
                        <h1 className="text-3xl font-black mt-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-brand-primary-light/70">
                            استعادة الحساب
                        </h1>
                    </div>

                    {!isSubmitted ? (
                        <>
                            <p className="text-brand-primary-light/60 mb-8 font-medium leading-relaxed">
                                أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور الخاصة بك.
                            </p>

                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <div className="relative group text-right">
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-brand-primary-light/30 group-focus-within:text-brand-primary transition-colors">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white placeholder-brand-primary-light/20 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/50 focus:bg-white/5 transition-all duration-300"
                                            placeholder="أدخل بريدك الإلكتروني"
                                            required
                                        />
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <Button
                                        type="submit"
                                        isLoading={isLoading}
                                        variant="premium"
                                        fullWidth
                                        size="lg"
                                    >
                                        إرسال الرابط
                                    </Button>
                                </motion.div>
                            </form>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center py-4"
                        >
                            <div className="w-20 h-20 bg-brand-primary/20 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-10 h-10 text-brand-primary" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-3">تفقد بريدك الإلكتروني</h2>
                            <p className="text-brand-primary-light/50 mb-8 leading-relaxed">
                                لقد أرسلنا تعليمات استعادة كلمة المرور إلى <b>{email}</b>. يرجى مراجعة صندوق الوارد (والرسائل غير المرغوب فيها).
                            </p>
                            <button
                                onClick={() => setIsSubmitted(false)}
                                className="text-brand-primary hover:text-brand-primary-hover font-bold text-sm transition-colors"
                            >
                                لم تصلك الرسالة؟ أعد المحاولة
                            </button>
                        </motion.div>
                    )}

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-10 text-center"
                    >
                        <Link to="/login" className="inline-flex items-center gap-2 text-brand-primary-light/50 hover:text-white transition-colors text-sm font-medium">
                            <ArrowRight className="w-4 h-4" />
                            العودة لتسجيل الدخول
                        </Link>
                    </motion.div>
                </div>
            </motion.div>

            <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
        </div>
    );
};




