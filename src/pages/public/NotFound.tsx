import { useNavigate } from 'react-router-dom';
import { Home, ArrowRight, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';

export const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-brand-bg relative flex items-center justify-center overflow-hidden font-sans" dir="rtl">
            {/* Premium Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-brand-primary/20 rounded-full mix-blend-screen filter blur-[120px] opacity-50 animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[35rem] h-[35rem] bg-emerald-900/30 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-pulse" style={{ animationDelay: '2s' }} />
                
                {/* Local Assets */}
                <div className="absolute inset-0 bg-[url('/assets/images/stardust.png')] opacity-[0.05] mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-[url('/assets/images/noise.svg')] opacity-[0.08] mix-blend-overlay pointer-events-none"></div>
            </div>

            <div className="max-w-2xl w-full text-center relative z-10 px-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    {/* Illustration Container */}
                    <div className="relative mb-12">
                        <motion.div 
                            animate={{ y: [0, -15, 0], rotate: [0, 2, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="relative z-10"
                        >
                            <img 
                                src="/assets/images/404-roots.png" 
                                alt="404 - Lost in roots" 
                                loading="lazy"
                                className="w-64 h-64 mx-auto object-contain rounded-full shadow-[0_0_50px_rgba(16,185,129,0.3)] border-4 border-brand-primary/20 p-2 bg-brand-bg/50 backdrop-blur-sm"
                            />
                        </motion.div>
                        
                        {/* Glowing ring */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-brand-primary/20 rounded-full blur-[80px] z-0 animate-pulse" />
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-brand-primary to-emerald-800 leading-none mb-4 tracking-tighter">
                            404
                        </h1>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            هذه الصفحة تاهت في الجذور!
                        </h2>
                        <p className="text-emerald-100/60 text-lg font-medium mb-12 max-w-lg mx-auto leading-relaxed">
                            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها لمسار آخر. 
                            دعنا نعد بك للطريق الصحيح لنمو رحلتك.
                        </p>
                    </motion.div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-5 justify-center items-center"
                >
                    <Button
                        onClick={() => navigate('/')}
                        size="lg"
                        className="w-full sm:w-auto px-10 h-14 text-lg bg-brand-primary hover:bg-brand-primary-hover shadow-xl shadow-brand-primary/20 group"
                        icon={Home}
                    >
                        العودة للرئيسية
                    </Button>
                    
                    <Button
                        variant="outline"
                        onClick={() => navigate(-1)}
                        size="lg"
                        className="w-full sm:w-auto px-10 h-14 text-lg border-emerald-500/30 text-emerald-100 hover:bg-emerald-500/10 backdrop-blur-md"
                    >
                        العودة للخلف
                        <ArrowRight className="mr-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </motion.div>

                <div className="mt-20 flex justify-center items-center gap-2 text-emerald-100/30 font-medium">
                    <Compass className="w-4 h-4 animate-spin-slow" />
                    <span>نظام جذور الزراعي — 2026</span>
                </div>
            </div>
        </div>
    );
};





