import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Leaf, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

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
        <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 relative overflow-hidden font-sans" dir="rtl">

            {/* Premium Animated Background */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-brand-primary/20 rounded-full mix-blend-screen filter blur-[120px] opacity-60 animate-blob" />
                <div className="absolute top-[20%] left-[-10%] w-[35rem] h-[35rem] bg-lime-600/10 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-blob animation-delay-2000" />
                <div className="absolute bottom-[-20%] right-[10%] w-[45rem] h-[45rem] bg-amber-500/10 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-blob animation-delay-4000" />

                {/* Subtle noise texture for premium matte feel */}
                <div className="absolute inset-0 bg-[url('/assets/images/stardust.png')] opacity-[0.03] mix-blend-overlay"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[28rem] relative z-10"
            >
                {/* The Glass Card */}
                <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">

                    {/* Inner Glow line on top */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent" />

                    {/* Brand Section */}
                    <div className="flex flex-col items-center mb-8 sm:mb-12">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-brand-primary blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 rounded-full"></div>
                            <div className="relative bg-gradient-to-br from-brand-primary to-brand-accent p-4 sm:p-5 rounded-[1.2rem] sm:rounded-[1.5rem] shadow-xl shadow-brand-primary/20 border border-brand-primary/30 transform transition-transform duration-500 group-hover:-translate-y-1">
                                <Leaf className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                            </div>
                        </motion.div>
                        <h1 className="text-3xl sm:text-4xl font-black mt-4 sm:mt-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-brand-primary-light/70">
                            جــــذور
                        </h1>
                        <p className="text-brand-primary-light/70 mt-1 sm:mt-2 font-medium text-xs sm:text-sm tracking-wide text-center">
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
                            <label className="block text-sm font-semibold text-brand-primary-light/80 mb-2 pl-1">البريد الإلكتروني</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-brand-primary-light/60 group-focus-within:text-brand-primary transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 sm:py-4 pr-12 pl-4 text-white placeholder-brand-primary-light/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/50 focus:bg-white/5 transition-all duration-300 text-sm sm:text-base"
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
                                <label className="block text-sm font-semibold text-brand-primary-light/80">كلمة المرور</label>
                                <Link to="/forgot-password" title="استعادة كلمة المرور" className="text-xs font-medium text-brand-primary hover:text-brand-primary-hover transition-colors">هل نسيت؟</Link>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-brand-primary-light/60 group-focus-within:text-brand-primary transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 sm:py-4 pr-12 pl-4 text-white placeholder-brand-primary-light/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/50 focus:bg-white/5 transition-all duration-300 text-sm sm:text-base"
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
                            <Button
                                type="submit"
                                isLoading={isLoading}
                                variant="premium"
                                fullWidth
                                size="lg"
                                icon={ArrowLeft}
                                iconPosition="right"
                            >
                                تسجيل الدخول
                            </Button>
                        </motion.div>
                    </form>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-6 sm:mt-10 text-center text-sm font-medium text-brand-primary/70"
                    >
                        عضو جديد في المنظومة؟{' '}
                        <Link to="/signup" className="text-brand-primary hover:text-brand-primary-hover font-bold transition-colors">
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




