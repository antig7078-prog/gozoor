import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import {
    BookOpen, Store, MonitorPlay, Briefcase,
    ArrowLeft, Leaf, Star,
    TrendingUp, ShieldCheck, Users, PlayCircle,
    ChevronLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Premium Agricultural Assets
import hydroponicsCourse from '../assets/landing/hydroponics_course.png';
import tomatoSeeds from '../assets/landing/hybrid_tomato_seeds.png';
import academyBanner from '../assets/landing/academy_banner.png';
import freelanceServices from '../assets/landing/freelance_services.png';

// Team Members Assets
import team1 from '../assets/team/1.jpeg';
import team2 from '../assets/team/2.jpeg';
import team3 from '../assets/team/3.jpeg';
import team4 from '../assets/team/4.jpeg';
import team5 from '../assets/team/5.jpeg';
import team6 from '../assets/team/6.jpeg';

export const LandingPage = () => {
    const { user } = useAuth();

    const teamMembers = [
        { name: "أمير اشرف", image: team1 },
        { name: "جهاد أشرف محمد الباز", image: team6 },
        { name: "رحمه حماده محمد ياسين", image: team2 },
        { name: "نجوى محمد حسن محمد دسوقي", image: team5 },
        { name: "ندي محمد هنداوي عبدالجليل", image: team4 },
        { name: "ياسمين أحمد السيد عبدالرزاق علي", image: team3 },
    ];

    // Reusable animation variants
    const fadeUp: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, type: 'spring', bounce: 0.2 } }
    };

    const staggerContainer: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-emerald-200 overflow-x-hidden" dir="rtl">

            {/* Ultra Premium Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300 relative overflow-hidden">
                            <Leaf className="w-7 h-7 relative z-10" />
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        </div>
                        <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-l from-slate-900 to-slate-700 tracking-tight">جذور</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <Link
                                to={user.user_metadata?.role === 'admin' ? '/admin' : '/dashboard'}
                                className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-slate-800 transition-all active:scale-95"
                            >
                                لوحة التحكم
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="hidden sm:block px-5 py-2.5 text-slate-600 font-bold hover:text-emerald-700 transition-colors">
                                    تسجيل الدخول
                                </Link>
                                <Link to="/signup" className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-slate-800 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center gap-2">
                                    حساب جديد
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Next-Gen Hero Section */}
            <section className="relative pt-32 lg:pt-48 pb-20 lg:pb-32 overflow-hidden px-4 min-h-[95vh] flex items-center">
                {/* Advanced Abstract Background */}
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-400/20 rounded-full blur-[120px] -z-10 animate-pulse pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-[100px] -z-10 pointer-events-none" />
                <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] bg-amber-200/20 rounded-full blur-[80px] -z-10 pointer-events-none" />

                <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="text-right"
                    >
                        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-emerald-700 font-bold text-sm mb-8 shadow-sm">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                            الجيل الجديد من منصات التكنولوجيا الزراعية 🚀
                        </motion.div>

                        <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
                            المنظومة <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-500 to-teal-400">الزراعية</span><br />
                            المتكاملة في مكان واحد.
                        </motion.h1>

                        <motion.p variants={fadeUp} className="text-xl text-slate-500 font-medium leading-relaxed mb-10 max-w-lg">
                            تعلم مهارات حديثة، تسوق أجود المدخلات الزراعية، قدم خدماتك كمستقل، واحصل على فرص وظيفية مرموقة. منصة جذور تصنع مستقبلك الآن.
                        </motion.p>

                        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4">
                            <Link
                                to={user ? "/dashboard" : "/signup"}
                                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black text-lg rounded-2xl shadow-[0_20px_40px_-15px_rgba(16,185,129,0.5)] hover:-translate-y-1 hover:shadow-[0_25px_50px_-15px_rgba(16,185,129,0.6)] transition-all active:scale-95 flex items-center justify-center gap-3 group"
                            >
                                انضم للمنظومة الآن
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            </Link>
                            <a
                                href="#bento"
                                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-800 font-black text-lg rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-slate-50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all flex items-center justify-center gap-2 group"
                            >
                                <PlayCircle className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                                جولة سريعة
                            </a>
                        </motion.div>

                        {/* Trust Badges */}
                        <motion.div variants={fadeUp} className="mt-12 flex items-center gap-6 pt-8 border-t border-slate-200/60">
                            <div className="flex -space-x-4 -space-x-reverse">
                                {[
                                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
                                    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100",
                                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
                                    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100"
                                ].map((img, i) => (
                                    <img key={i} src={img} className="w-12 h-12 rounded-full border-4 border-[#F8FAFC] object-cover" alt="User avatar" />
                                ))}
                            </div>
                            <div className="text-sm">
                                <div className="flex gap-1 text-amber-400 mb-1">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                                </div>
                                <p className="font-bold text-slate-600">موثوق من <span className="text-slate-900">+50,000</span> زراعي</p>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Floating Cards (RHS Display) */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, type: 'spring' }}
                        className="relative hidden lg:block h-[500px]"
                    >
                        {/* Course Card Component Mockup */}
                        <div className="absolute top-10 right-0 w-80 bg-white rounded-[2rem] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 z-30 animate-[float_6s_ease-in-out_infinite]">
                            <div className="h-40 bg-slate-100 rounded-2xl overflow-hidden mb-4 relative">
                                <img src={hydroponicsCourse} className="w-full h-full object-cover" alt="hydroponics" />
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-black px-2 py-1 rounded-lg text-emerald-700">دورة الزراعة المائية</div>
                            </div>
                            <h4 className="font-black text-slate-800 text-lg mb-2">أساسيات الهيدروبونيك الحديثة</h4>
                            <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                                <Users className="w-4 h-4" /> 1,240 طالب مسجل
                            </div>
                        </div>

                        {/* Product Card Component Mockup */}
                        <div className="absolute bottom-10 left-10 w-72 bg-white rounded-[2rem] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-100 z-20 animate-[float_8s_ease-in-out_infinite_reverse]">
                            <div className="h-32 bg-slate-100 rounded-2xl overflow-hidden mb-4 p-2 flex items-center justify-center">
                                <img src={tomatoSeeds} className="w-full h-full object-cover rounded-xl" alt="product" />
                            </div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-black text-slate-800 text-base mb-1">بذور طماطم هجينة</h4>
                                    <p className="text-emerald-600 font-black text-lg">$24.00</p>
                                </div>
                                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                                    <Store className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {/* Job Card Component Mockup */}
                        <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-12 w-64 bg-slate-900 rounded-[2rem] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-700 z-10 animate-[float_7s_ease-in-out_infinite_reverse]">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                                    <Briefcase className="w-6 h-6 text-emerald-400" />
                                </div>
                                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-black px-2 py-1 rounded-lg">دوام كامل</span>
                            </div>
                            <h4 className="font-black text-white text-base mb-1">مهندس زراعي إشراف</h4>
                            <p className="text-slate-400 font-medium text-sm mb-4">شركة مزارع التميز</p>
                            <button className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-colors">قدم الآن</button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Bento Grid Features Section */}
            <section id="bento" className="py-24 bg-white relative z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">نظام بيئي زراعي متكامل لك</h2>
                        <p className="text-lg text-slate-500 font-medium leading-relaxed">
                            تم تصميم واجهتنا لتلبية جميع احتياجات القطاع الزراعي الحديث في منصة واحدة سهلة الاستخدام ومبنية على أحدث التقنيات.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">

                        {/* Large Bento Box - Education */}
                        <Link to="/courses" className="md:col-span-2 md:row-span-2 group relative bg-slate-900 rounded-[2.5rem] overflow-hidden p-10 flex flex-col justify-end">
                            <div
                                className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:scale-105 transition-transform duration-700"
                                style={{ backgroundImage: `url(${academyBanner})` }}
                            ></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>

                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-6 border border-white/20 group-hover:-translate-y-2 transition-transform">
                                    <BookOpen className="w-8 h-8" />
                                </div>
                                <h3 className="text-4xl font-black text-white mb-4 drop-shadow-md">أكاديمية جذور للتعليم</h3>
                                <p className="text-slate-300 text-lg font-medium max-w-md mb-6 leading-relaxed">مكتبة ضخمة من الدورات التدريبية المعتمدة لتعلم أحدث أساليب الزراعة المائية والعضوية، مقدمة من كبار الخبراء.</p>
                                <span className="inline-flex items-center gap-2 text-emerald-400 font-bold group-hover:text-emerald-300 transition-colors">
                                    تصفح الدورات <ArrowLeft className="w-5 h-5 flex-shrink-0" />
                                </span>
                            </div>
                        </Link>

                        {/* Square Bento Box - Marketplace */}
                        <Link to="/marketplace" className="md:col-span-1 md:row-span-1 group bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2.5rem] p-8 overflow-hidden relative shadow-lg shadow-emerald-500/20">
                            <div className="absolute top-[-20%] left-[-20%] w-[150%] h-[150%] bg-white/10 rotate-12 blur-2xl group-hover:rotate-45 transition-all duration-700 pointer-events-none"></div>
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white mb-auto border border-white/20">
                                    <Store className="w-7 h-7" />
                                </div>
                                <div className="mt-8">
                                    <h4 className="text-2xl font-black text-white mb-2 drop-shadow-sm">شراء المنتجات</h4>
                                    <p className="text-emerald-50 text-sm font-medium leading-relaxed">أفضل البذور والأدوات الزراعية بجودة مضمونة وتوصيل سريع.</p>
                                </div>
                            </div>
                        </Link>

                        {/* Square Bento Box - Jobs */}
                        <Link to="/jobs" className="md:col-span-1 md:row-span-1 group bg-white border border-slate-200 rounded-[2.5rem] p-8 hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all relative overflow-hidden">
                            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                                <Briefcase className="w-7 h-7" />
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-slate-800 mb-2">فرص العمل</h4>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-4">اكتشف أحدث الوظائف المتاحة في كبرى المزارع والمؤسسات.</p>
                                <span className="inline-flex items-center text-blue-600 font-bold text-sm">
                                    المزيد <ChevronLeft className="w-4 h-4 ml-1" />
                                </span>
                            </div>
                        </Link>

                        {/* Wide Rectangle Box - Freelance */}
                        <Link to="/services" className="md:col-span-3 md:row-span-1 group bg-slate-50 border border-slate-200/60 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-8 hover:bg-white hover:shadow-[0_20px_40px_rgb(0,0,0,0.04)] transition-all">
                            <div className="w-full md:w-1/3 h-full aspect-[2/1] md:aspect-auto bg-slate-200 rounded-3xl overflow-hidden shrink-0 relative">
                                <img src={freelanceServices} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="freelance" />
                                <div className="absolute inset-0 bg-indigo-900/20"></div>
                            </div>
                            <div className="flex-1 text-right">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-sm mb-4">
                                    <MonitorPlay className="w-4 h-4" /> سوق مستقلين الزراعة
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 mb-4">اطلب الخدمات والاستشارات مباشرة</h3>
                                <p className="text-slate-500 font-medium text-lg leading-relaxed mb-6 max-w-2xl">
                                    تواصل مع نخبة من المهندسين الزراعيين والمستشارين لطلب دراسات جدوى، استشارات فنية، وخدمات تصميم الحدائق واللاندسكيب لتنفيذ مشاريعك بدقة.
                                </p>
                                <span className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg group-hover:bg-indigo-600 transition-colors">
                                    تصفح الخدمات المطروحة
                                </span>
                            </div>
                        </Link>

                    </div>
                </div>
            </section>

            {/* Premium Team Section */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">فريق العمل</h2>
                        <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
                            نخبة من المتخصصين والمهندسين القائمين على تطوير وتنمية منصة جذور لخدمة المجتمع الزراعي.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-12">
                        {teamMembers.map((member, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className="flex flex-col items-center group"
                            >
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] overflow-hidden mb-6 border-4 border-white shadow-2xl shadow-slate-200 group-hover:rounded-2xl group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-500 relative">
                                    <img src={member.image} alt={member.name} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <h4 className="text-base font-black text-slate-800 text-center leading-tight group-hover:text-emerald-700 transition-colors">
                                    {member.name}
                                </h4>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Premium Metrics Section */}
            <section className="py-20 border-y border-slate-200 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { icon: BookOpen, val: '200+', label: 'دورة تعليمية', color: 'text-emerald-600', bg: 'bg-emerald-100' },
                            { icon: Users, val: '50K+', label: 'متدرب ناشط', color: 'text-blue-600', bg: 'bg-blue-100' },
                            { icon: ShieldCheck, val: '10K+', label: 'عملية شراء آمنة', color: 'text-purple-600', bg: 'bg-purple-100' },
                            { icon: TrendingUp, val: '500+', label: 'وظيفة شاغرة', color: 'text-amber-600', bg: 'bg-amber-100' },
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center text-center">
                                <div className={`w-16 h-16 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                                    <stat.icon className="w-8 h-8" />
                                </div>
                                <h4 className="text-4xl font-black text-slate-900 mb-2">{stat.val}</h4>
                                <p className="text-slate-500 font-bold">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonial Section */}
            <section className="py-32 bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-50 rounded-l-full blur-3xl -z-10 opacity-70"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-emerald-500/30 to-teal-600/30 blur-[80px] pointer-events-none rounded-full"></div>
                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-4xl font-black text-white leading-tight mb-8">
                                    "جذور ليست مجرد منصة، بل هي شريك النجاح لكل طموح في مجال الزراعة وتطوير الذات."
                                </h2>
                                <div className="flex items-center gap-4">
                                    <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100" className="w-16 h-16 rounded-full border-2 border-slate-700 object-cover" alt="User" />
                                    <div>
                                        <h4 className="text-lg font-black text-white">إنجي حسن</h4>
                                        <p className="text-emerald-400 font-medium">سفيرة جذور ومهندسة جودة</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-6">
                                <p className="text-slate-300 text-lg leading-relaxed font-medium">
                                    منذ اشتراكي في المنصة تمكنت من بناء قاعدة معرفية متينة عبر كورسات الجودة الزراعية، ثم أطلقت خدماتي كمستقلة. والآن أحصل على طلبات عمل حقيقية عبر لوحة الوظائف!
                                </p>
                                <div className="flex gap-2 mt-4">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-6 h-6 text-amber-400 fill-amber-400" />)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Smart Footer */}
            <footer className="bg-white border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <Leaf className="w-8 h-8 text-emerald-500" />
                                <span className="text-3xl font-black text-slate-800 tracking-tight">جذور</span>
                            </div>
                            <p className="text-slate-500 font-medium leading-relaxed max-w-sm mb-6">
                                الوجهة الأولى والبيئة المتكاملة للتعليم والتجارة والتطوير في القطاع الزراعي. نهدف للربط بين المعرفة وسوق العمل في واجهة واحدة.
                            </p>
                            <div className="flex flex-row gap-2">
                                <input type="email" placeholder="اشترك في نشرتنا البريدية" className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 w-64 font-medium" />
                                <button className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors whitespace-nowrap">اشترك</button>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-black text-slate-900 text-lg mb-6">روابط هامة</h4>
                            <ul className="space-y-4 font-medium text-slate-500">
                                <li><Link to="/courses" className="hover:text-emerald-600 transition-colors">الدورات التعليمية</Link></li>
                                <li><Link to="/marketplace" className="hover:text-emerald-600 transition-colors">السوق الزراعي</Link></li>
                                <li><Link to="/jobs" className="hover:text-emerald-600 transition-colors">الوظائف الشاغرة</Link></li>
                                <li><Link to="/services" className="hover:text-emerald-600 transition-colors">خدمات المستقلين</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-black text-slate-900 text-lg mb-6">الشركة</h4>
                            <ul className="space-y-4 font-medium text-slate-500">
                                <li><a href="#" className="hover:text-emerald-600 transition-colors">من نحن</a></li>
                                <li><a href="#" className="hover:text-emerald-600 transition-colors">اتصل بنا</a></li>
                                <li><a href="#" className="hover:text-emerald-600 transition-colors">الشروط والأحكام</a></li>
                                <li><a href="#" className="hover:text-emerald-600 transition-colors">سياسة الخصوصية</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-slate-400 font-bold">© {new Date().getFullYear()} جميع الحقوق محفوظة لمنصة جذور الزراعية.</p>
                        <div className="flex gap-4 text-slate-400">
                            {/* Social Icons Placeholders */}
                            <a href="#" className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 transition-colors">X</a>
                            <a href="#" className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 transition-colors">in</a>
                            <a href="#" className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 transition-colors">Fb</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Added custom keyframe for floating animation inside regular stylesheet or inline */}
            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                    100% { transform: translateY(0px); }
                }
            `}</style>
        </div>
    );
};
