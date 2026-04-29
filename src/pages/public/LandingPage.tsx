import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, type Variants, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Store, MonitorPlay, Briefcase,
    ArrowLeft, Leaf, Star,
    ShieldCheck, Users, PlayCircle,
    ChevronLeft, ShoppingBag,
    MapPin, Quote, Menu, X
} from 'lucide-react';

// Custom Brand Icons (Missing in Lucide v1.x)
const FacebookIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></svg>
);
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

// Premium Agricultural Assets
import hydroponicsCourse from '../../assets/landing/hydroponics_course.png';
import tomatoSeeds from '../../assets/landing/hybrid_tomato_seeds.png';
import academyBanner from '../../assets/landing/academy_banner.png';
import freelanceServices from '../../assets/landing/freelance_services.png';

// Team Members Assets
import team1 from '../../assets/team/1.jpeg';
import team2 from '../../assets/team/2.jpeg';
import team3 from '../../assets/team/3.jpeg';
import team4 from '../../assets/team/4.jpeg';
import team5 from '../../assets/team/5.jpeg';
import team6 from '../../assets/team/6.jpeg';

export const LandingPage = () => {
    const { user } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 1000], [0, 150]);
    const y2 = useTransform(scrollY, [0, 1000], [0, -150]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const teamMembers = [
        { name: "أمير اشرف", image: team1 },
        { name: "جهاد أشرف محمد الباز", image: team6 },
        { name: "رحمه حماده محمد ياسين", image: team2 },
        { name: "نجوى محمد حسن محمد دسوقي", image: team5 },
        { name: "ندي محمد هنداوي عبدالجليل", image: team4 },
        { name: "ياسمين أحمد السيد عبدالرزاق علي", image: team3 },
    ];

    const stats = [
        { icon: BookOpen, val: '+200', label: 'دورة متخصصة', desc: 'محتوى تعليمي معتمد' },
        { icon: Users, val: '+50K', label: 'متدرب معانا', desc: 'مجتمع زراعي متفاعل' },
        { icon: ShieldCheck, val: '+10K', label: 'عملية شراء آمنة', desc: 'كل معاملاتك مضمونة' },
        { icon: Briefcase, val: '+500', label: 'فرصة شغل موجودة', desc: 'فرص شغل حقيقية ومستمرة' },
    ];

    const fadeUp: Variants = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
    };

    const stagger: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    return (
        <div className="min-h-screen bg-brand-bg font-sans selection:bg-brand-primary/30 selection:text-brand-primary-light overflow-x-hidden text-brand-primary-light" dir="rtl">
            {/* Intelligent Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled || isMenuOpen ? 'bg-brand-bg/90 backdrop-blur-2xl shadow-lg shadow-black/40 py-4 border-b border-white/5' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 sm:gap-3 group cursor-pointer">
                        <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-gradient-to-tr from-brand-primary to-brand-accent rounded-xl sm:rounded-2xl shadow-lg shadow-brand-primary/20 transform group-hover:rotate-12 transition-all duration-300">
                            <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10" />
                            <div className="absolute inset-0 bg-white/20 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-xl sm:text-2xl font-black text-white tracking-tighter">جذور</span>
                    </Link>

                    <div className="hidden lg:flex items-center gap-8 xl:gap-10">
                        {[
                            { label: 'الرئيسية', to: '/' },
                            { label: 'الأكاديمية', to: '/courses' },
                            { label: 'المتجر', to: '/marketplace' },
                            { label: 'المستقلين', to: '/services' },
                        ].map((item, i) => (
                            <Link key={i} to={item.to} className="text-sm font-bold text-brand-primary-light/80 hover:text-brand-primary transition-colors">{item.label}</Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="hidden sm:flex items-center gap-4">
                            {user ? (
                                <Link to="/dashboard">
                                    <Button variant="premium" size="sm">لوحة التحكم</Button>
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="text-sm font-bold text-brand-primary-light hover:text-brand-primary transition-colors">تسجيل الدخول</Link>
                                    <Link to="/signup">
                                        <Button variant="premium" size="sm">ابدأ الآن</Button>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Auth Button (Icon only or small text) */}
                        {!user && (
                            <Link to="/signup" className="sm:hidden">
                                <Button variant="premium" size="sm" className="px-3 h-9 text-xs">ابدأ</Button>
                            </Link>
                        )}
                        {user && (
                            <Link to="/dashboard" className="sm:hidden">
                                <Button variant="premium" size="sm" className="px-3 h-9 text-xs">حسابي</Button>
                            </Link>
                        )}

                        {/* Hamburger Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="lg:hidden bg-brand-bg/95 backdrop-blur-2xl border-b border-white/5 overflow-hidden"
                        >
                            <div className="px-6 py-8 flex flex-col gap-6">
                                {[
                                    { label: 'الرئيسية', to: '/' },
                                    { label: 'الأكاديمية', to: '/courses' },
                                    { label: 'المتجر', to: '/marketplace' },
                                    { label: 'المستقلين', to: '/services' },
                                ].map((item, i) => (
                                    <Link
                                        key={i}
                                        to={item.to}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-xl font-black text-brand-primary-light/90 hover:text-brand-primary transition-colors flex items-center justify-between group"
                                    >
                                        {item.label}
                                        <ChevronLeft className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0" />
                                    </Link>
                                ))}
                                <hr className="border-white/5 my-2" />
                                {!user && (
                                    <div className="flex flex-col gap-4">
                                        <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-center font-bold text-brand-primary-light p-4 rounded-2xl bg-white/5 border border-white/10">تسجيل الدخول</Link>
                                        <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                                            <Button variant="premium" className="w-full py-6 text-lg">ابدأ الآن مجاناً</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Immersive Hero Section */}
            <section className="relative pt-28 sm:pt-32 lg:pt-52 pb-16 lg:pb-32 min-h-[90vh] lg:min-h-[95vh] flex items-center">
                {/* Premium Animated Background Layer */}
                <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute bottom-[-10%] left-[-5%] w-[20rem] sm:w-[40rem] h-[20rem] sm:h-[40rem] bg-brand-primary/20 rounded-full mix-blend-screen filter blur-[80px] sm:blur-[120px] opacity-50 animate-pulse" />
                    <div className="absolute top-[10%] right-[-10%] w-[15rem] sm:w-[35rem] h-[15rem] sm:h-[35rem] bg-lime-600/10 rounded-full mix-blend-screen filter blur-[80px] sm:blur-[120px] opacity-40 animate-pulse" style={{ animationDelay: '2s' }} />
                    <div className="absolute inset-0 bg-[url('/assets/images/stardust.png')] opacity-[0.03] mix-blend-overlay"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={stagger}
                        className="text-center lg:text-right"
                    >
                        <motion.div variants={fadeUp} className="mb-6 sm:mb-8 flex justify-center lg:justify-start">
                            <Badge variant="premium" size="md" className="py-2 px-4 sm:px-6 text-xs sm:text-sm">
                                <span className="relative flex h-2 w-2 ml-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
                                </span>
                                الجيل الجديد من منصات التكنولوجيا الزراعية 🚀
                            </Badge>
                        </motion.div>

                        <motion.h1 variants={fadeUp} className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[1.2] lg:leading-[1.1] mb-6 sm:mb-8">
                            المنظومة <br className="hidden sm:block" />
                            الزراعية <span className="text-transparent bg-clip-text bg-gradient-to-l from-brand-primary to-brand-accent">المتكاملة</span>.
                        </motion.h1>

                        <motion.p variants={fadeUp} className="text-base sm:text-lg lg:text-xl text-brand-primary-light/70 font-medium leading-relaxed mb-8 sm:mb-12 max-w-lg mx-auto lg:mx-0">
                            مكانك المفضل عشان تتعلم أحدث تكنولوجيا الزراعة، تشتري منتجات مضمونة، تقدم خدماتك، وتلاقي فرص شغل تناسب طموحك.
                        </motion.p>

                        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4">
                            <Link to={user ? "/dashboard" : "/signup"} className="w-full sm:w-auto">
                                <Button variant="premium" size="lg" className="w-full sm:w-auto" icon={ArrowLeft} iconPosition="right">
                                    ابدأ رحلتك الآن
                                </Button>
                            </Link>
                            <a href="#bento" className="w-full sm:w-auto">
                                <Button variant="ghost" size="lg" className="w-full sm:w-auto text-white bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10" icon={PlayCircle}>
                                    جولة سريعة
                                </Button>
                            </a>
                        </motion.div>


                    </motion.div>

                    {/* Interactive 3D Mockups */}
                    <div className="relative hidden lg:block h-[600px] perspective-1000">
                        <motion.div style={{ y: y1 }} className="absolute top-10 right-0 w-80 bg-white/[0.03] backdrop-blur-2xl rounded-card p-5 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/[0.08] z-30">
                            <div className="h-48 bg-black/40 rounded-3xl overflow-hidden mb-5 relative group border border-white/5">
                                <img src={hydroponicsCourse} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" alt="دورة الزراعة المائية" />
                                <div className="absolute top-4 right-4">
                                    <Badge variant="premium">دورة احترافية</Badge>
                                </div>
                            </div>
                            <h4 className="font-black text-white text-xl mb-3">أساسيات الزراعة المائية</h4>
                            <div className="flex items-center gap-2 text-brand-primary-light/60 text-sm">
                                <Users className="w-4 h-4 text-brand-primary" /> 1,240 مسجل
                            </div>
                        </motion.div>

                        <motion.div style={{ y: y2 }} className="absolute bottom-20 left-10 w-72 bg-white/[0.03] backdrop-blur-2xl rounded-card p-5 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/[0.08] z-20">
                            <div className="h-36 bg-brand-primary/10 rounded-3xl overflow-hidden mb-5 p-3 flex items-center justify-center border border-brand-primary/10">
                                <img src={tomatoSeeds} loading="lazy" className="w-full h-full object-cover rounded-2xl shadow-sm opacity-90 hover:opacity-100 transition-opacity" alt="بذور طماطم هجينة" />
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <h4 className="font-black text-white text-lg mb-1">بذور طماطم هجينة</h4>
                                    <p className="text-brand-primary font-black text-2xl">24<span className="text-sm text-brand-primary/50"> ج.م</span></p>
                                </div>
                                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-brand-primary hover:border-brand-primary-hover transition-all cursor-pointer">
                                    <ShoppingBag className="w-5 h-5" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-16 w-64 bg-brand-bg/95 backdrop-blur-2xl rounded-card p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-brand-primary/20 z-40">
                            <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/10 to-transparent rounded-card pointer-events-none" />
                            <div className="flex items-start justify-between mb-5 relative z-10">
                                <div className="w-12 h-12 bg-brand-primary/20 rounded-2xl flex items-center justify-center border border-brand-primary/20">
                                    <Briefcase className="w-6 h-6 text-brand-primary" />
                                </div>
                                <Badge variant="secondary">دوام كامل</Badge>
                            </div>
                            <h4 className="font-black text-white text-lg mb-2 relative z-10">مهندس إشراف زراعي</h4>
                            <p className="text-brand-primary-light/50 font-medium text-sm mb-6 flex items-center gap-2 relative z-10">
                                <MapPin className="w-4 h-4" /> شركة مزارع التميز
                            </p>
                            <Button variant="primary" size="sm" className="w-full">تقديم سريع</Button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Enhanced Bento Grid */}
            <section id="bento" className="py-32 relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-20">
                        <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-brand-primary font-bold tracking-wider text-xs sm:text-sm uppercase mb-3 sm:mb-4 block">كل اللي محتاجه في مكان واحد</motion.span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 sm:mb-6 tracking-tight leading-tight px-2">كل اللي محتاجه عشان تكبّر مشاريعك<br className="hidden sm:block" /> الزراعية في منصة واحدة</h2>
                        <p className="text-base sm:text-xl text-brand-primary-light/60 font-medium leading-relaxed px-4">
                            تصميم مودرن وتجربة استخدام ملهاش زي بتخلي أقوى الأدوات الزراعية في إيدك.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]">
                        {/* Large Bento Box - Education */}
                        <Link to="/courses" className="md:col-span-2 md:row-span-2 group relative rounded-card overflow-hidden p-6 sm:p-10 md:p-12 flex flex-col justify-end shadow-[0_0_30px_rgba(0,0,0,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.15)] transition-all duration-500 border border-white/[0.08] min-h-[400px] md:min-h-0">
                            <div className="absolute inset-0 bg-brand-bg"></div>
                            <div className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:scale-105 group-hover:opacity-40 transition-all duration-700" style={{ backgroundImage: `url(${academyBanner})` }}></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/80 to-transparent"></div>

                            <div className="relative z-10">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-brand-primary mb-4 sm:mb-6 border border-white/20 group-hover:-translate-y-2 transition-transform duration-300">
                                    <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />
                                </div>
                                <h3 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-3 sm:mb-4 drop-shadow-lg">أكاديمية جذور للتعليم</h3>
                                <p className="text-brand-primary-light/70 text-base sm:text-lg font-medium max-w-md mb-6 sm:mb-8 leading-relaxed">مكتبة ضخمة من الدورات التدريبية المعتمدة لتعلم أحدث أساليب الزراعة المائية والعضوية، مقدمة من كبار الخبراء.</p>
                                <span className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-white/5 backdrop-blur-md text-white border border-white/10 rounded-xl font-bold group-hover:bg-white/10 transition-colors text-sm sm:text-base">
                                    تصفح الدورات <ArrowLeft className="w-4 h-4 sm:w-5 h-5" />
                                </span>
                            </div>
                        </Link>

                        {/* Marketplace */}
                        <Link to="/marketplace" className="md:col-span-1 md:row-span-1 group bg-gradient-to-br from-brand-primary-hover/40 to-brand-bg/40 backdrop-blur-xl border border-white/[0.08] rounded-card p-6 sm:p-8 overflow-hidden relative shadow-[0_0_30px_rgba(0,0,0,0.3)] hover:border-brand-primary/30 transition-all duration-500 hover:-translate-y-1">
                            <div className="absolute top-[-20%] left-[-20%] w-[150%] h-[150%] bg-white/5 rotate-12 blur-2xl group-hover:rotate-45 transition-all duration-700 pointer-events-none"></div>
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-brand-primary/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-brand-primary mb-auto border border-brand-primary/20 shadow-inner">
                                    <Store className="w-6 h-6 sm:w-7 sm:h-7" />
                                </div>
                                <div className="mt-6 sm:mt-8">
                                    <h4 className="text-2xl sm:text-3xl font-black text-white mb-2 sm:mb-3">سوق المزارعين</h4>
                                    <p className="text-brand-primary-light/70 text-sm sm:text-base font-medium leading-relaxed">أفضل البذور والأدوات الزراعية بجودة مضمونة وتوصيل سريع.</p>
                                </div>
                            </div>
                        </Link>

                        {/* Jobs */}
                        <Link to="/jobs" className="md:col-span-1 md:row-span-1 group bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-card p-8 overflow-hidden relative shadow-[0_0_30px_rgba(0,0,0,0.3)] hover:border-blue-500/30 transition-all duration-500 hover:-translate-y-1">
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-auto border border-blue-500/20 group-hover:scale-110 transition-transform">
                                    <Briefcase className="w-7 h-7" />
                                </div>
                                <div className="mt-8">
                                    <h4 className="text-3xl font-black text-white mb-3">فرص العمل</h4>
                                    <p className="text-brand-primary-light/70 text-base font-medium leading-relaxed mb-4">اكتشف أحدث الوظائف المتاحة في كبرى المزارع والمؤسسات.</p>
                                    <span className="inline-flex items-center text-blue-400 font-bold text-sm">
                                        المزيد <ChevronLeft className="w-4 h-4 ml-1" />
                                    </span>
                                </div>
                            </div>
                        </Link>

                        {/* Freelance */}
                        <Link to="/services" className="md:col-span-3 md:row-span-1 group bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-card p-6 sm:p-8 md:p-12 flex flex-col lg:flex-row items-center gap-8 sm:gap-10 hover:bg-white/[0.05] hover:shadow-[0_0_50px_rgba(16,185,129,0.15)] hover:border-brand-primary/20 transition-all duration-500 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                            <div className="w-full lg:w-2/5 h-48 sm:h-64 lg:h-full bg-black/40 rounded-3xl overflow-hidden shrink-0 relative shadow-inner border border-white/5">
                                <img src={freelanceServices} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" alt="خدمات المستقلين الزراعية" />
                                <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/80 to-transparent"></div>
                            </div>
                            <div className="flex-1 text-center lg:text-right relative z-10">
                                <div className="mb-4 sm:mb-6 flex justify-center lg:justify-start">
                                    <Badge variant="premium" size="md">
                                        <MonitorPlay className="w-4 h-4 sm:w-5 sm:h-5 ml-2" /> سوق مستقلين الزراعة
                                    </Badge>
                                </div>
                                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4 sm:mb-6 leading-tight">اطلب الخدمات والاستشارات<br className="hidden sm:block" /> مباشرة من الخبراء</h3>
                                <p className="text-brand-primary-light/60 font-medium text-base sm:text-lg leading-relaxed mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0">
                                    تواصل مع نخبة من المهندسين الزراعيين والمستشارين لطلب دراسات جدوى، استشارات فنية، وخدمات تصميم الحدائق واللاندسكيب لتنفيذ مشاريعك بدقة.
                                </p>
                                <Button variant="outline" className="w-full sm:w-auto text-white border-white/10 hover:bg-brand-primary hover:border-brand-primary" icon={ArrowLeft} iconPosition="right">
                                    تصفح الخدمات المطروحة
                                </Button>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Data-Driven Impact Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/assets/images/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-primary/10 rounded-full blur-[150px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05] p-6 sm:p-8 rounded-card hover:bg-white/[0.04] hover:border-brand-primary/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all duration-300 group"
                            >
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:bg-brand-primary/20 group-hover:border-brand-primary/30 transition-all">
                                    <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-brand-primary" />
                                </div>
                                <h4 className="text-3xl sm:text-5xl font-black text-white mb-2 sm:mb-3">{stat.val}</h4>
                                <p className="text-base sm:text-lg font-bold text-brand-primary-light mb-1 sm:mb-2">{stat.label}</p>
                                <p className="text-xs sm:text-sm text-brand-primary-light/50 font-medium">{stat.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Meet The Creators */}
            <section className="py-32 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-20">
                        <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-brand-primary font-bold tracking-wider text-xs sm:text-sm uppercase mb-3 sm:mb-4 block">فريق العمل</motion.span>
                        <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 sm:mb-6 tracking-tight">فريق أبجدي</h2>
                        <p className="text-base sm:text-xl text-brand-primary-light/60 font-medium leading-relaxed px-4">
                            نخبة من المتخصصين والمهندسين اللي شغالين على تطوير وتنمية منصة جذور عشان تخدم كل الزراعيين.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-0">
                        {teamMembers.map((member, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group bg-white/[0.03] backdrop-blur-2xl rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-[0_0_30px_rgba(0,0,0,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.15)] hover:bg-white/[0.05] transition-all duration-500 flex flex-col items-center text-center border border-white/[0.08]"
                            >
                                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden mb-4 sm:mb-6 border-4 border-white/10 p-1 relative group-hover:border-brand-primary/50 transition-colors">
                                    <img src={member.image} alt={member.name} loading="lazy" className="w-full h-full object-cover rounded-full filter grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500" />
                                </div>
                                <h4 className="text-lg sm:text-xl font-black text-white mb-1 sm:mb-2">{member.name}</h4>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-32 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-primary/10 rounded-l-full blur-3xl -z-10 opacity-70"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] rounded-[2rem] sm:rounded-[3.5rem] p-8 sm:p-12 md:p-20 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-brand-primary/20 to-brand-accent/20 blur-[100px] pointer-events-none rounded-full"></div>
                        <Quote className="absolute text-white/[0.03] w-32 h-32 sm:w-64 sm:h-64 -top-5 sm:-top-10 -right-5 sm:-right-10 rotate-180" />

                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 items-center">
                            <div className="text-center lg:text-right">
                                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-6 sm:mb-8">
                                    "جذور مش مجرد منصة، دي شريك النجاح لكل حد طموح في مجال الزراعة وتطوير نفسه."
                                </h2>
                                <div className="flex items-center justify-center lg:justify-start gap-4 sm:gap-5">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-brand-primary bg-brand-primary/10 flex items-center justify-center">
                                        <Users className="w-8 h-8 sm:w-10 sm:h-10 text-brand-primary" />
                                    </div>
                                    <div className="text-right">
                                        <h4 className="text-lg sm:text-xl font-black text-white">قصة نجاح من المنصة</h4>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-6 sm:gap-8 bg-white/5 backdrop-blur-md p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-white/10 shadow-inner">
                                <div className="flex gap-1.5 sm:gap-2 justify-center lg:justify-start">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 sm:w-6 sm:h-6 text-amber-400 fill-amber-400" />)}
                                </div>
                                <p className="text-brand-primary-light text-lg sm:text-xl leading-relaxed font-medium text-center lg:text-right">
                                    "من ساعة ما اشتركت في المنصة وقدرت أبني أساس قوي في مجال الجودة الزراعية من خلال الكورسات، وبعدها بدأت أقدم خدماتي كمستقلة. ودلوقتي بيجيلي طلبات شغل حقيقية من لوحة الوظائف!"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Ultra Modern Footer */}
            <footer className="bg-black/20 border-t border-white/5 relative z-10 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-16">
                        <div className="lg:col-span-2 text-center sm:text-right">
                            <Link to="/" className="flex items-center justify-center sm:justify-start gap-3 mb-6 sm:mb-8 group">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-brand-primary-hover to-brand-accent rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20 group-hover:rotate-12 transition-all duration-300">
                                    <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">جذور</span>
                            </Link>
                            <p className="text-brand-primary-light/80 font-medium leading-relaxed max-w-md mb-8 text-base sm:text-lg mx-auto sm:mx-0">
                                المكان الأول والبيئة المتكاملة عشان تتعلم وتتاجر وتطور نفسك في القطاع الزراعي. هدفنا إننا نربط بين المعرفة وسوق العمل في مكان واحد.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 max-w-sm sm:max-w-none mx-auto sm:mx-0">
                                <input
                                    type="email"
                                    placeholder="اشترك في نشرتنا البريدية"
                                    aria-label="البريد الإلكتروني للاشتراك في النشرة البريدية"
                                    className="px-6 py-3 sm:py-4 bg-white/5 border border-white/10 text-white placeholder-brand-primary-light/50 rounded-xl sm:rounded-2xl focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 w-full sm:w-72 font-medium shadow-sm transition-all text-sm sm:text-base"
                                />
                                <Button variant="primary" className="py-3 sm:py-4 px-8 w-full sm:w-auto">اشترك</Button>
                            </div>
                        </div>

                        <div className="text-center sm:text-right">
                            <h4 className="font-black text-white text-lg sm:text-xl mb-4 sm:mb-6">روابط هامة</h4>
                            <ul className="space-y-3 sm:space-y-4 font-medium text-brand-primary-light/80 text-sm sm:text-base">
                                <li><Link to="/courses" className="hover:text-brand-primary transition-colors inline-block">الدورات التعليمية</Link></li>
                                <li><Link to="/marketplace" className="hover:text-brand-primary transition-colors inline-block">السوق الزراعي</Link></li>
                                <li><Link to="/jobs" className="hover:text-brand-primary transition-colors inline-block">الوظائف الشاغرة</Link></li>
                                <li><Link to="/services" className="hover:text-brand-primary transition-colors inline-block">خدمات المستقلين</Link></li>
                            </ul>
                        </div>

                        <div className="text-center sm:text-right">
                            <h4 className="font-black text-white text-lg sm:text-xl mb-4 sm:mb-6">الشركة</h4>
                            <ul className="space-y-3 sm:space-y-4 font-medium text-brand-primary-light/80 text-sm sm:text-base">
                                <li><Link to="/about" className="hover:text-brand-primary transition-colors inline-block">من نحن</Link></li>
                                <li><Link to="/contact" className="hover:text-brand-primary transition-colors inline-block">اتصل بنا</Link></li>
                                <li><Link to="/terms" className="hover:text-brand-primary transition-colors inline-block">الشروط والأحكام</Link></li>
                                <li><Link to="/privacy" className="hover:text-brand-primary transition-colors inline-block">سياسة الخصوصية</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-center sm:text-right">
                        <p className="text-brand-primary-light/70 font-bold text-sm sm:text-base">© {new Date().getFullYear()} جميع الحقوق محفوظة لمنصة جذور الزراعية.</p>
                        <div className="flex gap-3 justify-center">
                            {[
                                { name: 'Facebook', icon: FacebookIcon, label: 'فيسبوك' },
                                { name: 'Instagram', icon: InstagramIcon, label: 'انستجرام' },
                                { name: 'YouTube', icon: YoutubeIcon, label: 'يوتيوب' }
                            ].map((social, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    aria-label={`تابعنا على ${social.label}`}
                                    className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-brand-primary-light/80 hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all shadow-sm group"
                                >
                                    <social.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};




