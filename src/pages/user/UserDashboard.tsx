import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, Award, Clock, PlayCircle, Sparkles, TrendingUp, Zap, ChevronLeft } from 'lucide-react';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { PageContainer } from '../../components/shared/PageContainer';
import { StatCard } from '../../components/shared/StatCard';
import { Card } from '../../components/shared/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const UserDashboard = () => {
    const { user } = useAuth();
    const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
    const [suggestedCourses, setSuggestedCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                if (user) {
                    const { data: enrollmentsData, error: enrollmentsError } = await supabase
                        .from('enrollments')
                        .select('*, courses(*, course_sections(course_lectures(id)))')
                        .eq('user_id', user.id);

                    if (!enrollmentsError && enrollmentsData) {
                        const { data: progressData } = await supabase
                            .from('user_progress')
                            .select('course_id, lecture_id')
                            .eq('user_id', user.id);

                        const userCourses = enrollmentsData.map(e => e.courses).filter(Boolean);
                        const uniqueCourses = Array.from(new Map(userCourses.map((item: any) => [item.id, item])).values());

                        const coursesWithProgress = uniqueCourses.map((course: any) => {
                            let totalLectures = 0;
                            if (course.course_sections) {
                                course.course_sections.forEach((sec: any) => {
                                    totalLectures += sec.course_lectures?.length || 0;
                                });
                            }
                            const completedCount = progressData?.filter(p => p.course_id === course.id).length || 0;
                            const progress = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;
                            return { ...course, progress };
                        });

                        setEnrolledCourses(coursesWithProgress);
                    }
                }

                const { data: coursesData, error: coursesError } = await supabase
                    .from('courses')
                    .select('*')
                    .eq('status', 'Published')
                    .eq('visibility', 'Public')
                    .order('created_at', { ascending: false })
                    .limit(3);

                if (coursesError) throw coursesError;
                setSuggestedCourses(coursesData || []);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    if (isLoading) {
        return <LoadingSpinner fullPage message="جاري تجهيز لوحة التحكم..." />;
    }

    return (
        <PageContainer maxWidth="xl" className="pt-2 md:pt-4">
            {/* Welcome Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-brand-bg rounded-[2.5rem] md:rounded-[40px] p-8 md:p-16 mb-8 md:mb-12 text-white relative overflow-hidden shadow-2xl shadow-brand-bg/30 border border-white/10"
            >
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0],
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute top-[-30%] left-[-10%] w-[60%] h-[60%] rounded-full bg-brand-primary blur-[120px] opacity-30" 
                    />
                    <motion.div 
                        animate={{ 
                            scale: [1.2, 1, 1.2],
                            rotate: [0, -90, 0],
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-primary/40 blur-[100px] opacity-40" 
                    />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
                    <div className="space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-black tracking-widest uppercase text-brand-primary-light">
                            <Sparkles className="w-3 h-3" />
                            بوابتك للتميز الزراعي
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black leading-tight">
                            أهلاً بك، {user?.email?.split('@')[0] || 'طالبنا العزيز'}! <span className="inline-block animate-bounce">👋</span>
                        </h1>
                        <p className="text-slate-200 text-lg md:text-xl font-bold opacity-80 leading-relaxed">
                            مستعد لمواصلة رحلة التعلم واكتساب مهارات زراعية جديدة؟ نحن هنا لندعم طموحك.
                        </p>
                    </div>
                    <Link to="/courses">
                        <Button
                            variant="premium"
                            size="lg"
                            className="bg-white text-brand-bg hover:bg-slate-100"
                            icon={ChevronLeft}
                            iconPosition="right"
                        >
                            استكشف الدورات 
                        </Button>
                    </Link>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <StatCard 
                    label="الدورات المسجل بها"
                    value={enrolledCourses.length}
                    icon={BookOpen}
                />
                <StatCard 
                    label="ساعات التعلم"
                    value={0}
                    icon={Clock}
                />
                <StatCard 
                    label="الشهادات المكتسبة"
                    value={0}
                    icon={Award}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Learning Progress Section */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-black text-text-primary flex items-center gap-3">
                            <TrendingUp className="w-7 h-7 text-brand-primary" />
                            مواصلة التعلم
                        </h2>
                    </div>

                    <AnimatePresence mode="wait">
                        {enrolledCourses.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-surface-primary border-2 border-dashed border-border-default rounded-[40px] p-16 text-center"
                            >
                                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                    <BookOpen className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="text-2xl font-black text-text-primary mb-2">ابدأ رحلتك المعرفية</h3>
                                <p className="text-text-secondary font-bold mb-8 max-w-sm mx-auto">تصفح مجموعة واسعة من الدورات الزراعية المتخصصة وابدأ التعلم الآن.</p>
                                <Link to="/courses">
                                    <Button variant="primary" size="lg" icon={BookOpen}>
                                        تصفح الدورات
                                    </Button>
                                </Link>
                            </motion.div>
                        ) : (
                            <div className="space-y-6">
                                {enrolledCourses.map((course: any, idx) => (
                                    <Card 
                                        key={idx}
                                        className="p-6 flex flex-col md:flex-row gap-8 relative overflow-hidden group"
                                    >
                                        <div className="w-full md:w-56 h-40 bg-slate-100 rounded-2xl overflow-hidden shrink-0 relative">
                                            {course.thumbnail_url ? (
                                                <img src={course.thumbnail_url} alt={course.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <BookOpen className="w-12 h-12" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                                            <div className="absolute bottom-4 right-4">
                                                <Badge variant="primary" size="sm">نشط</Badge>
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 flex flex-col justify-between py-2">
                                            <div>
                                                <h3 className="text-xl font-black text-text-primary mb-2 group-hover:text-brand-primary transition-colors">{course.title}</h3>
                                                <p className="text-text-muted font-bold text-sm line-clamp-2 leading-relaxed mb-4">
                                                    {course.subtitle || course.description}
                                                </p>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                                                    <span className="text-text-muted">التقدم الدراسي</span>
                                                    <span className="text-brand-primary">{course.progress || 0}%</span>
                                                </div>
                                                <div className="w-full h-3 bg-surface-primary rounded-full overflow-hidden border border-border-subtle shadow-inner">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${course.progress || 0}%` }}
                                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                                        className="h-full bg-brand-primary rounded-full relative"
                                                    >
                                                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                                                    </motion.div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-center md:border-r border-slate-50 md:pr-6">
                                            <Link 
                                                to={`/courses/${course.id}`} 
                                                className="p-5 bg-brand-primary/10 text-brand-primary rounded-3xl hover:bg-brand-primary hover:text-white transition-all shadow-sm hover:scale-110 active:scale-95"
                                            >
                                                <PlayCircle className="w-8 h-8" />
                                            </Link>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Recommendations Sidebar */}
                <div className="space-y-8">
                    <h2 className="text-2xl font-black text-text-primary flex items-center gap-3">
                        <Zap className="w-6 h-6 text-brand-primary" />
                        اقتراحات مختارة
                    </h2>

                    <div className="space-y-6">
                        {suggestedCourses.length > 0 ? (
                            suggestedCourses.map((course, i) => (
                                <motion.div
                                    key={course.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * i }}
                                >
                                    <Link 
                                        to={`/courses/${course.id}`} 
                                        className="group block bg-white border border-border-subtle rounded-[30px] overflow-hidden shadow-lg shadow-slate-200/40 hover:shadow-2xl hover:shadow-brand-primary/10 hover:border-brand-primary/20 hover:-translate-y-1 transition-all"
                                    >
                                        <div className="h-40 bg-slate-100 relative overflow-hidden">
                                            {course.thumbnail_url ? (
                                                <img src={course.thumbnail_url} alt={course.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <BookOpen className="w-10 h-10" />
                                                </div>
                                            )}
                                            {course.is_free && (
                                                <div className="absolute top-4 right-4">
                                                    <Badge variant="primary" size="sm">مجاني</Badge>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-1 h-4 bg-brand-primary rounded-full" />
                                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                                                    {course.level === 'Beginner' ? 'للمبتدئين' : course.level === 'Intermediate' ? 'متوسط' : 'متقدم'}
                                                </span>
                                            </div>
                                            <h4 className="font-black text-text-primary mb-4 line-clamp-1 group-hover:text-brand-primary transition-colors">{course.title}</h4>
                                            <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                                                <span className="text-lg font-black text-text-primary">
                                                    {course.is_free ? 'تصفح الآن' : `${course.price} ج.م`}
                                                </span>
                                                <ChevronLeft className="w-5 h-5 text-slate-300 group-hover:text-brand-primary group-hover:-translate-x-1 transition-all" />
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))
                        ) : (
                            <Card className="p-10 text-center bg-surface-primary/50">
                                <p className="text-text-muted font-bold text-sm">لا توجد اقتراحات جديدة حالياً.</p>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};




