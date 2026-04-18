import { useNavigate } from 'react-router-dom';
import { Home, ArrowRight, Ghost } from 'lucide-react';
import { motion } from 'framer-motion';

export const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6" dir="rtl">
            <div className="max-w-md w-full text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Ghost className="w-12 h-12 text-emerald-600" />
                    </div>
                    <h1 className="text-8xl font-black text-slate-900 mb-2">404</h1>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">هذه الصفحة تاهت في الجذور!</h2>
                    <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                        عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها لمسار آخر. دعنا نعد بك للطريق الصحيح.
                    </p>
                </motion.div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="flex-1 bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                    >
                        <Home className="w-5 h-5" /> الرئيسية
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex-1 bg-white text-slate-700 border border-slate-200 font-black py-4 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                        العودة للخلف <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
