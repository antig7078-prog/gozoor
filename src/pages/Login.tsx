import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, Leaf, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { session, role } = useAuth();

    useEffect(() => {
        if (session) {
            navigate(role === 'admin' ? '/admin' : '/dashboard');
        }
    }, [session, role, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('يرجى إدخال البريد الإلكتروني وكلمة المرور');
            return;
        }

        setIsLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            toast.error(error.message);
            setIsLoading(false);
        } else {
            toast.success('مرحباً بك في أسرة جذور!');
        }
    };

    return (
        <div className="min-h-screen bg-[#04150F] flex items-center justify-center p-4 relative overflow-hidden font-sans" dir="rtl">

            {/* Premium Animated Background */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-emerald-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-60 animate-blob" />
                <div className="absolute top-[20%] left-[-10%] w-[35rem] h-[35rem] bg-lime-600/10 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-blob animation-delay-2000" />
                <div className="absolute bottom-[-20%] right-[10%] w-[45rem] h-[45rem] bg-amber-500/10 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-blob animation-delay-4000" />

                {/* Subtle noise texture for premium matte feel */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-overlay"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[28rem] relative z-10"
            >
                {/* The Glass Card */}
                <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-[2.5rem] p-10 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">

                    {/* Inner Glow line on top */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

                    {/* Brand Section */}
                    <div className="flex flex-col items-center mb-12">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 rounded-full"></div>
                            <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-700 p-5 rounded-[1.5rem] shadow-xl shadow-emerald-900/50 border border-emerald-300/30 transform transition-transform duration-500 group-hover:-translate-y-1">
                                <Leaf className="w-10 h-10 text-white" />
                            </div>
                        </motion.div>
                        <h1 className="text-4xl font-black mt-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-emerald-100/70">
                            جــــذور
                        </h1>
                        <p className="text-emerald-100/50 mt-2 font-medium text-sm tracking-wide">
                            البوابة الذكية للزراعة المصرية
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
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
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="flex justify-between items-center mb-2 pl-1">
                                <label className="block text-sm font-semibold text-emerald-100/80">كلمة المرور</label>
                                <a href="#" className="text-xs font-medium text-emerald-500 hover:text-emerald-400 transition-colors">هل نسيت؟</a>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-emerald-100/30 group-focus-within:text-emerald-400 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white placeholder-emerald-100/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:bg-white/5 transition-all duration-300"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="pt-2"
                        >
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex items-center justify-center py-4 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all duration-300 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {/* Button shine effect */}
                                <div className="absolute inset-0 -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />

                                {isLoading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        تسجيل الدخول
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
                        className="mt-10 text-center text-sm font-medium text-emerald-100/50"
                    >
                        عضو جديد في المنظومة؟{' '}
                        <Link to="/signup" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
                            أنشئ حسابك الآن
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
