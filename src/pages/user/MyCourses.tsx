import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, PlayCircle, GraduationCap, ChevronLeft, Sparkles, Zap, Clock, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PageContainer } from '../../components/shared/PageContainer';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { PageHeader } from '../../components/shared/PageHeader';

export const MyCourses = () => {
    const { user } = useAuth();
    const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            if (!user) return;
            try {
                // Fetch enrollments with specific lecture counts
                const { data, error } = await supabase
                    .from('enrollments')
                    .select('*, courses(*, course_sections(course_lectures(id)))')
                    .eq('user_id', user.id);

                if (error) {
                    console.error('Error fetching enrollments:', error);
                } else if (data) {
                    const { data: progressData } = await supabase
                        .from('user_progress')
                        .select('course_id, lecture_id')
                        .eq('user_id', user.id);

                    const courses = data.map(e => e.courses).filter(Boolean);

                    // Allow unique courses
                    const uniqueCourses = Array.from(new Map(courses.map((item: any) => [item.id, item])).values());
                    
                    const coursesWithProgress = uniqueCourses.map((course: any) => {
                        let totalLectures = 0;
                        if (course.course_sections) {
                            course.course_sections.forEach((sec: any) => {
                                totalLectures += sec.course_lectures?.length || 0;
                            });
                        }
                        const completedCount = progressData?.filter(p => p.course_id === course.id).length || 0;
                        const progress = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;
                        return { ...course, progress, totalLectures, completedCount };
                    });

                    setEnrolledCourses(coursesWithProgress);
                }
            } catch (err) {
                console.error('Error fetching my courses:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourses();
    }, [user]);

    if (isLoading) {
        return <LoadingSpinner fullPage message="جاري تحميل دوراتك التعليمية..." />;
    }

    return (
        <PageContainer maxWidth="xl">
            <PageHeader 
                badge={
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-black tracking-widest uppercase">
                        <Sparkles className="w-3 h-3" />
                        أكاديمية جذور للتعلم
                    </div>
                }
                title={
                    <>متابعة <span className="text-brand-primary">التعلم</span></>
                }
                description="تابع رحلتك التعليمية وراقب تقدمك في المهارات الزراعية الحديثة."
                actions={
                    <div className="flex items-center gap-4 bg-white p-2 rounded-3xl border border-border-subtle shadow-xl shadow-slate-200/50">
                        <div className="flex -space-x-3 rtl:space-x-reverse p-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                                    <div className="w-full h-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                                        <BookOpen className="w-4 h-4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="pl-6 pr-2">
                            <div className="text-[10px] font-black text-text-muted uppercase tracking-widest">الدورات النشطة</div>
                            <div className="text-xl font-black text-text-primary">{enrolledCourses.length} دورة</div>
                        </div>
                    </div>
                }
            />

            <AnimatePresence mode="wait">
                {enrolledCourses.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-24 bg-white rounded-[40px] border border-border-subtle shadow-2xl shadow-slate-200/50 max-w-2xl mx-auto mt-12 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-surface-primary rounded-bl-full" />
                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-surface-primary rounded-[30px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <GraduationCap className="w-12 h-12 text-slate-200" />
                            </div>
                            <h3 className="text-3xl font-black text-text-primary mb-4">لا يوجد دورات حالياً</h3>
                            <p className="text-text-secondary font-bold text-lg max-w-sm mx-auto leading-relaxed mb-10">ابدأ الآن رحلتك في تعلم التقنيات الزراعية الحديثة مع نخبة من الخبراء في المجال.</p>
                            <Link 
                                to="/courses" 
                                className="inline-flex items-center gap-3 px-10 py-4 bg-brand-primary text-white rounded-2xl font-black shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                <Zap className="w-5 h-5 fill-white" />
                                استكشف الدورات المتاحة
                            </Link>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
                    >
                        {enrolledCourses.map((course, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={course.id}
                                className="group bg-white rounded-[40px] border border-border-subtle overflow-hidden shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-brand-primary/5 hover:border-brand-primary/10 transition-all duration-500 flex flex-col relative"
                            >
                                {/* Course Thumbnail */}
                                <div className="aspect-video relative overflow-hidden bg-slate-100">
                                    {course.thumbnail_url ? (
                                        <img 
                                            src={course.thumbnail_url} 
                                            alt={course.title} 
                                            loading="lazy"
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 flex items-center justify-center">
                                            <BookOpen className="w-12 h-12 text-brand-primary/30" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                                    
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg border border-white/50">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${course.progress === 100 ? 'bg-brand-primary animate-pulse' : 'bg-amber-400'}`} />
                                            <span className="text-[10px] font-black text-text-primary uppercase tracking-widest">
                                                {course.progress === 100 ? 'مكتمل' : 'قيد التعلم'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Course Content */}
                                <div className="p-8 flex flex-col flex-1 relative">
                                    <h3 className="text-xl font-black text-text-primary mb-3 line-clamp-2 leading-tight group-hover:text-brand-primary transition-colors duration-300">
                                        {course.title}
                                    </h3>
                                    
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
                                            <Clock className="w-3.5 h-3.5 text-brand-primary" />
                                            <span>{course.totalLectures} درس</span>
                                        </div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-100" />
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
                                            <Trophy className="w-3.5 h-3.5 text-brand-primary" />
                                            <span>{course.completedCount} مكتمل</span>
                                        </div>
                                    </div>

                                    {/* Progress Section */}
                                    <div className="mt-auto space-y-4 mb-8">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">معدل الإنجاز</span>
                                            <span className="text-2xl font-black text-brand-primary leading-none tabular-nums">{course.progress || 0}%</span>
                                        </div>
                                        <div className="w-full h-3 bg-surface-primary rounded-full overflow-hidden border border-border-subtle/50 p-0.5">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${course.progress || 0}%` }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                                className="h-full bg-brand-primary rounded-full relative overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_2s_infinite]" style={{ backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }} />
                                            </motion.div>
                                        </div>
                                    </div>

                                    <Link
                                        to={`/courses/${course.id}/player`}
                                        className="w-full flex items-center justify-center gap-3 py-4 bg-brand-bg text-white hover:bg-brand-primary rounded-2xl font-black transition-all duration-300 group/btn shadow-xl shadow-slate-200 active:scale-95"
                                    >
                                        <PlayCircle className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                        {course.progress === 0 ? 'ابدأ التعلم' : 'متابعة التعلم'}
                                        <ChevronLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </PageContainer>
    );
};





