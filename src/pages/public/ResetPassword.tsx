import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import logoImg from '../../assets/logo.jpeg';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

export const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Supabase passes recovery token in the URL hash or queries.
        // The SDK automatically sets the session.
        // We verify if we can access the session or if we are indeed in a recovery flow.
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // If there's no session, we check if the URL contains hash params indicating a recovery flow
                const hash = window.location.hash;
                if (!hash || !hash.includes('access_token')) {
                    toast.error('رابط غير صالح أو منتهي الصلاحية');
                    navigate('/login');
                }
            }
        };
        checkSession();
    }, [navigate]);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!password) {
            toast.error('يرجى إدخال كلمة المرور الجديدة');
            return;
        }

        if (password.length < 6) {
            toast.error('يجب أن تكون كلمة المرور مكونة من 6 أحرف على الأقل');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('كلمات المرور غير متطابقة');
            return;
        }

        setIsLoading(true);

        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            toast.error(error.message);
            setIsLoading(false);
        } else {
            setIsSuccess(true);
            toast.success('تم تحديث كلمة المرور بنجاح');
            // Log out the session so they must log in with their new password
            await supabase.auth.signOut();
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

                    <div className="absolute top-0 inset-x-0 h-px bg-brand-primary/30" />

                    {/* Brand Section */}
                    <div className="flex flex-col items-center mb-10">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-brand-primary blur-xl opacity-40 rounded-full"></div>
                            <div className="relative p-0 rounded-[1.5rem] border border-brand-primary/30 overflow-hidden w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
                                <img src={logoImg} alt="جذور" className="w-full h-full object-cover" />
                            </div>
                        </motion.div>
                        <h1 className="text-3xl font-black mt-6 tracking-tight text-white">
                            تحديث كلمة المرور
                        </h1>
                    </div>

                    {!isSuccess ? (
                        <>
                            <p className="text-brand-primary-light/60 mb-8 font-medium leading-relaxed">
                                يرجى إدخال كلمة المرور الجديدة وتأكيدها لإتمام عملية استعادة الحساب.
                            </p>

                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <label className="block text-sm font-semibold text-brand-primary-light/80 mb-2 pl-1 text-right">كلمة المرور الجديدة</label>
                                    <div className="relative group text-right">
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-brand-primary-light/30 group-focus-within:text-brand-primary transition-colors">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white placeholder-brand-primary-light/20 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/50 focus:bg-white/5 transition-all duration-300"
                                            placeholder="أدخل كلمة المرور الجديدة"
                                            required
                                        />
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <label className="block text-sm font-semibold text-brand-primary-light/80 mb-2 pl-1 text-right">تأكيد كلمة المرور</label>
                                    <div className="relative group text-right">
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-brand-primary-light/30 group-focus-within:text-brand-primary transition-colors">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white placeholder-brand-primary-light/20 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/50 focus:bg-white/5 transition-all duration-300"
                                            placeholder="أعد إدخال كلمة المرور"
                                            required
                                        />
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <Button
                                        type="submit"
                                        isLoading={isLoading}
                                        variant="premium"
                                        fullWidth
                                        size="lg"
                                    >
                                        تحديث كلمة المرور
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
                            <h2 className="text-xl font-bold text-white mb-3">تم تغيير كلمة المرور بنجاح</h2>
                            <p className="text-brand-primary-light/50 mb-8 leading-relaxed">
                                تم تعيين كلمة المرور الجديدة لحسابك. يمكنك الآن تسجيل الدخول باستخدام البيانات الجديدة.
                            </p>
                            <Link to="/login" className="w-full">
                                <Button variant="premium" fullWidth size="lg">
                                    تسجيل الدخول
                                </Button>
                            </Link>
                        </motion.div>
                    )}

                    {!isSuccess && (
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
                    )}
                </div>
            </motion.div>

            <style>{`
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
