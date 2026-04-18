import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowLeft, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { session, role: currentRole } = useAuth();

    useEffect(() => {
        if (session) {
            navigate(currentRole === 'admin' ? '/admin' : '/dashboard');
        }
    }, [session, currentRole, navigate]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('يرجى إدخال البريد الإلكتروني وكلمة المرور');
            return;
        }

        setIsLoading(true);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    role: 'user', // User only rule
                }
            }
        });

        if (error) {
            toast.error(error.message);
            setIsLoading(false);
        } else {
            toast.success('تم إنشاء الحساب بنجاح، مرحباً بك في جذور!');
        }
    };

    return (
        <div className="min-h-screen bg-[#04150F] flex items-center justify-center p-4 relative overflow-hidden font-sans" dir="rtl">

            {/* Premium Animated Background Layer */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute bottom-[-10%] left-[-5%] w-[40rem] h-[40rem] bg-emerald-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-50 animate-blob" />
                <div className="absolute top-[10%] right-[-10%] w-[35rem] h-[35rem] bg-lime-600/10 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-blob animation-delay-2000" />
                <div className="absolute bottom-[20%] left-[20%] w-[30rem] h-[30rem] bg-amber-500/10 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob animation-delay-4000" />

                {/* Subtle noise texture for premium matte feel */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-overlay"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[28rem] relative z-10"
            >
                {/* The Glass Card */}
                <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-[2.5rem] p-10 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">

                    {/* Inner Glow line on top */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

                    {/* Header Section */}
                    <div className="flex flex-col items-center text-center mb-10">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                            className="mb-6"
                        >
                            <div className="inline-flex items-center justify-center p-4 bg-white/5 border border-white/10 rounded-2xl shadow-xl shadow-emerald-900/20">
                                <UserPlus className="w-8 h-8 text-emerald-400" />
                            </div>
                        </motion.div>
                        <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-emerald-100/70">
                            انطلق مع جذور
                        </h1>
                        <p className="text-emerald-100/50 mt-3 font-medium text-sm leading-relaxed">
                            أنشئ حسابك الآن وانضم لآلاف المستفيدين من أكبر منصة زراعية متكاملة في مصر.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSignup} className="space-y-5">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <label className="block text-sm font-semibold text-emerald-100/80 mb-2 pl-1">البريد الإلكتروني</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-emerald-100/30 group-focus-within:text-emerald-400 transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white placeholder-emerald-100/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:bg-white/5 transition-all duration-300"
                                    placeholder="أدخل بريدك الإلكتروني"
                                    required
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <label className="block text-sm font-semibold text-emerald-100/80 mb-2 pl-1">كلمة المرور</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-emerald-100/30 group-focus-within:text-emerald-400 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white placeholder-emerald-100/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:bg-white/5 transition-all duration-300"
                                    placeholder="6 أحرف أو أكثر"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="pt-4"
                        >
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex items-center justify-center py-4 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-2xl font-bold text-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all duration-300 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <div className="absolute inset-0 -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                                {isLoading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        ابدأ رحلتك
                                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </button>
                        </motion.div>
                    </form>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-8 pt-6 border-t border-white/5 text-center text-sm font-medium text-emerald-100/50"
                    >
                        لديك حساب بالفعل؟{' '}
                        <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
                            تسجيل الدخول
                        </Link>
                    </motion.div>
                </div>
            </motion.div>

            <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
        </div>
    );
};
