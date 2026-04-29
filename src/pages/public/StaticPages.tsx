import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf } from 'lucide-react';

interface StaticPageProps {
    title: string;
    children: React.ReactNode;
}

export const StaticPage = ({ title, children }: StaticPageProps) => {
    return (
        <div className="min-h-screen bg-brand-bg text-brand-primary-light/90 font-sans" dir="rtl">
            {/* Header */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-bg/80 backdrop-blur-2xl border-b border-white/5 py-4">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center">
                            <Leaf className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-black text-white">جذور</span>
                    </Link>
                    <Link to="/" className="flex items-center gap-2 text-brand-primary font-bold hover:text-brand-primary-hover transition-colors">
                        <ArrowRight className="w-4 h-4" />
                        العودة للرئيسية
                    </Link>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-black text-white mb-12 tracking-tight"
                    >
                        {title}
                    </motion.h1>
                    
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/[0.03] border border-white/[0.08] rounded-[2.5rem] p-8 md:p-12 backdrop-blur-md prose prose-invert prose-brand max-w-none shadow-2xl"
                    >
                        {children}
                    </motion.div>
                </div>
            </main>

            <footer className="py-12 border-t border-white/5 text-center text-brand-primary-light/30 text-sm font-medium">
                © {new Date().getFullYear()} منصة جذور الزراعية. جميع الحقوق محفوظة.
            </footer>
        </div>
    );
};

export const AboutUs = () => (
    <StaticPage title="من نحن">
        <div className="space-y-6 text-brand-primary-light/80 leading-relaxed text-lg">
            <p>
                منصة <strong className="text-brand-primary">جذور</strong> هي المبادرة التكنولوجية الأولى من نوعها في مصر والوطن العربي التي تهدف إلى رقمنة القطاع الزراعي بالكامل وربط جميع أطراف المنظومة في مكان واحد.
            </p>
            <p>
                نحن نؤمن بأن المستقبل يكمن في دمج التكنولوجيا بالزراعة (Agri-Tech). لذا، قمنا ببناء بيئة متكاملة توفر التعليم المتقدم، المنتجات الموثوقة، والفرص المهنية المتميزة للمهندسين والمزارعين والشركات.
            </p>
            <h3 className="text-2xl font-bold text-white mt-8">رؤيتنا</h3>
            <p>تمكين المجتمع الزراعي من الوصول إلى أحدث المعارف والأدوات لتحقيق الأمن الغذائي والاستدامة البيئية.</p>
        </div>
    </StaticPage>
);

export const ContactUs = () => (
    <StaticPage title="اتصل بنا">
        <div className="space-y-8">
            <p className="text-brand-primary-light/80 text-lg">يسعدنا دائماً تواصلكم معنا. يمكنك الوصول إلينا عبر القنوات التالية:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <h4 className="text-brand-primary font-bold mb-2">البريد الإلكتروني</h4>
                    <p className="text-white">support@gozoor.com</p>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <h4 className="text-brand-primary font-bold mb-2">رقم الهاتف</h4>
                    <p className="text-white" dir="ltr">+20 123 456 7890</p>
                </div>
            </div>
            <p className="text-brand-primary-light/50 text-sm mt-12 italic">ساعات العمل: من الأحد إلى الخميس، 9 صباحاً - 5 مساءً.</p>
        </div>
    </StaticPage>
);

export const Terms = () => (
    <StaticPage title="الشروط والأحكام">
        <div className="space-y-6 text-brand-primary-light/70 leading-relaxed">
            <h3 className="text-xl font-bold text-white">1. قبول الشروط</h3>
            <p>باستخدامك لمنصة جذور، فإنك توافق على الالتزام بكافة الشروط والأحكام المذكورة هنا.</p>
            <h3 className="text-xl font-bold text-white">2. حساب المستخدم</h3>
            <p>يتحمل المستخدم مسؤولية الحفاظ على سرية بيانات حسابه وكافة الأنشطة التي تتم من خلاله.</p>
            <h3 className="text-xl font-bold text-white">3. المحتوى التعليمي</h3>
            <p>جميع الدورات التدريبية المتاحة هي ملكية فكرية للمنصة ومقدمي المحتوى، ويمنع إعادة نشرها أو توزيعها دون إذن كتابي.</p>
        </div>
    </StaticPage>
);

export const Privacy = () => (
    <StaticPage title="سياسة الخصوصية">
        <div className="space-y-6 text-brand-primary-light/70 leading-relaxed">
            <p>نحن في جذور نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية.</p>
            <h3 className="text-xl font-bold text-white">جمع البيانات</h3>
            <p>نقوم بجمع البيانات التي تقدمها لنا عند التسجيل مثل الاسم، البريد الإلكتروني، والتخصص المهني لتحسين تجربة استخدامك للمنصة.</p>
            <h3 className="text-xl font-bold text-white">أمن المعلومات</h3>
            <p>نستخدم تقنيات تشفير متقدمة لضمان أمن بياناتك ومعاملاتك المالية داخل المنصة.</p>
        </div>
    </StaticPage>
);




