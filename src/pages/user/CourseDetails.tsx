import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayCircle, BookOpen, CheckCircle, Lock, Unlock, ChevronRight, Star, ShieldCheck, Globe, Play, User as UserIcon, Clock, Award, Share2, Zap } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { PageContainer } from '../../components/shared/PageContainer';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { motion } from 'framer-motion';

export const CourseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [course, setCourse] = useState<any>(null);
    const [sections, setSections] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);
    const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

    const getYouTubeEmbedUrl = (url: string) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        const videoId = (match && match[2].length === 11) ? match[2] : null;
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    };

    useEffect(() => {
        const fetchCourseDetails = async () => {
            setIsLoading(true);
            try {
                // Fetch course
                const { data: courseData, error: courseError } = await supabase
                    .from('courses')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (courseError) throw courseError;
                setCourse(courseData);
                setActiveVideoUrl(courseData.intro_video_url);

                // Fetch sections
                const { data: sectionsData, error: sectionsError } = await supabase
                    .from('course_sections')
                    .select('*, course_lectures(*)')
                    .eq('course_id', id)
                    .order('sort_order', { ascending: true });

                if (sectionsError) throw sectionsError;

                // Sort lectures within sections
                const sortedSections = sectionsData?.map(sec => ({
                    ...sec,
                    course_lectures: sec.course_lectures.sort((a: any, b: any) => a.sort_order - b.sort_order)
                }));

                setSections(sortedSections || []);

                // Increment views_count
                await supabase.rpc('increment_course_views', { course_row_id: id });
            } catch (error: any) {
                toast.error('حدث خطأ أثناء تحميل تفاصيل الدورة.');
                console.error(error);
                navigate('/courses');
            } finally {
                setIsLoading(false);
            }
        };

        const checkEnrollment = async () => {
            if (!user || !id) return;
            const { data } = await supabase
                .from('enrollments')
                .select('status')
                .eq('user_id', user.id)
                .eq('course_id', id)
                .single();

            if (data) setEnrollmentStatus(data.status);
        };

        checkEnrollment();
        if (id) fetchCourseDetails();
    }, [id, user, navigate]);

    const requireAuth = useRequireAuth();

    const handleEnroll = () => {
        if (!requireAuth('سجّل دخولك الأول عشان تقدر تلتحق بالكورس ده 🎓')) return;
        navigate(`/checkout/${id}`);
    };

    if (isLoading) {
        return <LoadingSpinner fullPage message="جاري تحميل تفاصيل الدورة..." />;
    }

    if (!course) return null;

    let totalLectures = 0;
    sections.forEach(sec => totalLectures += sec.course_lectures?.length || 0);

    return (
        <div className="min-h-screen bg-surface-primary pb-32" dir="rtl">
            {/* Hero Section */}
            <div className="bg-brand-bg text-white pt-6 md:pt-10 pb-32 md:pb-48 px-4 sm:px-12 relative overflow-hidden">
                {/* Visual Flair */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => navigate('/courses')}
                        className="flex items-center gap-2 text-text-muted hover:text-white font-black mb-12 transition-all group"
                    >
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        العودة للدورات
                    </motion.button>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            <div className="flex flex-wrap gap-3">
                                <span className="bg-brand-primary/20 text-brand-primary border border-brand-primary/30 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                                    {course.category || 'تصنيف عام'}
                                </span>
                                <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                                    المستوى: {course.level === 'Beginner' ? 'مبتدئ' : course.level === 'Intermediate' ? 'متوسط' : 'متقدم'}
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-6xl font-black leading-[1.2] md:leading-[1.1] text-white">
                                {course.title}
                            </h1>
                            <p className="text-xl text-text-muted font-bold leading-relaxed max-w-xl">
                                {course.subtitle || course.description?.substring(0, 150) + '...'}
                            </p>

                             <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-6 md:gap-8 pt-6">
                                {course.instructor_name && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-primary backdrop-blur-md">
                                            <UserIcon className="w-5 h-5 md:w-6 md:h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest leading-none mb-1">المحاضر</p>
                                            <p className="font-black text-slate-200 text-sm md:text-base">{course.instructor_name}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 backdrop-blur-md">
                                        <Star className="w-5 h-5 md:w-6 md:h-6 fill-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest leading-none mb-1">التقييم</p>
                                        <p className="font-black text-slate-200 text-sm md:text-base">4.9 / 5.0</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 backdrop-blur-md">
                                        <Play className="w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest leading-none mb-1">المحتوى</p>
                                        <p className="font-black text-slate-200 text-sm md:text-base">{totalLectures} درس</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Intro Video Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-brand-primary rounded-[40px] blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-700"></div>
                            <div className="relative rounded-[40px] overflow-hidden border-[6px] border-white/5 bg-brand-bg shadow-2xl aspect-video group-hover:scale-[1.02] transition-transform duration-700">
                                {activeVideoUrl ? (
                                    activeVideoUrl.includes('youtube.com') || activeVideoUrl.includes('youtu.be') ? (
                                        <iframe
                                            className="w-full h-full"
                                            src={getYouTubeEmbedUrl(activeVideoUrl)}
                                            title={course.title}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    ) : (
                                        <video
                                            controls
                                            className="w-full h-full object-cover"
                                            poster={course.thumbnail_url}
                                            src={activeVideoUrl}
                                        >
                                            المتصفح لا يدعم مشغل الفيديو.
                                        </video>
                                    )
                                ) : (
                                    <img src={course.thumbnail_url} alt={course.title} loading="lazy" className="w-full h-full object-cover" />
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <PageContainer maxWidth="xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 -mt-24 relative z-20">

                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Description Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-3xl md:rounded-[40px] p-6 md:p-10 border border-border-subtle shadow-2xl shadow-slate-200/40 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-surface-primary rounded-bl-full opacity-50" />
                            <h2 className="text-3xl font-black text-text-primary mb-8 flex items-center gap-4">
                                <div className="w-2 h-10 bg-brand-primary rounded-full"></div>
                                عن هذه الدورة
                            </h2>
                            <div className="prose prose-slate max-w-none relative z-10">
                                <p className="text-text-secondary leading-relaxed font-bold text-lg whitespace-pre-wrap">
                                    {course.description || 'لا يوجد وصف متاح لهذه الدورة حالياً.'}
                                </p>
                            </div>
                        </motion.div>

                        {/* Curriculum Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-3xl md:rounded-[40px] p-6 md:p-10 border border-border-subtle shadow-2xl shadow-slate-200/40"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                                <h2 className="text-2xl md:text-3xl font-black text-text-primary flex items-center gap-4">
                                    <div className="w-1.5 md:w-2 h-8 md:h-10 bg-blue-500 rounded-full"></div>
                                    محتوى الدورة التعليمي
                                </h2>
                                <div className="inline-flex items-center gap-2 px-5 py-2 bg-surface-primary text-text-secondary rounded-full text-xs font-black border border-border-subtle">
                                    <Clock className="w-4 h-4" />
                                    {sections.length} أقسام • {totalLectures} دروس
                                </div>
                            </div>

                            <div className="space-y-6">
                                {sections.map((section, idx) => (
                                    <motion.div
                                        key={section.id}
                                        className="border border-border-subtle rounded-[30px] overflow-hidden transition-all hover:border-brand-primary/10 hover:shadow-xl hover:shadow-brand-primary/5 group"
                                    >
                                        <div className="bg-surface-primary/50 px-8 py-6 border-b border-border-subtle flex justify-between items-center group-hover:bg-brand-primary/5 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <span className="w-10 h-10 rounded-2xl bg-white border border-border-subtle flex items-center justify-center text-xs font-black text-text-muted shadow-inner group-hover:bg-brand-primary group-hover:text-white transition-all">
                                                    {idx + 1}
                                                </span>
                                                <h3 className="font-black text-text-primary text-xl">{section.title}</h3>
                                            </div>
                                            <span className="text-xs font-black text-text-muted uppercase tracking-widest">{section.course_lectures?.length || 0} دروس</span>
                                        </div>
                                        <div className="divide-y divide-slate-50">
                                            {section.course_lectures?.map((lecture: any) => {
                                                const canPlay = enrollmentStatus === 'approved' || lecture.is_free_preview;

                                                return (
                                                    <div
                                                        key={lecture.id}
                                                        onClick={() => {
                                                            if (canPlay) {
                                                                navigate(`/courses/${id}/player?lecture=${lecture.id}`);
                                                            } else {
                                                                toast.error('هذا الدرس يتطلب الاشتراك في الدورة');
                                                            }
                                                        }}
                                                        className={`px-8 py-6 flex items-center justify-between transition-all group/lecture ${canPlay ? 'cursor-pointer hover:bg-brand-primary/5' : 'opacity-60 bg-surface-primary/30'}`}
                                                    >
                                                        <div className="flex items-center gap-5">
                                                            <div className={`p-3 rounded-2xl transition-all duration-300 ${canPlay ? 'bg-brand-primary/10 text-brand-primary group-hover/lecture:scale-110 shadow-sm' : 'bg-slate-100 text-slate-300'}`}>
                                                                {lecture.lecture_type === 'Video' ? <PlayCircle className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                                                            </div>
                                                            <div>
                                                                <span className={`font-black text-lg block mb-1 transition-colors ${canPlay ? 'text-slate-700 group-hover/lecture:text-brand-primary' : 'text-text-muted'}`}>
                                                                    {lecture.title}
                                                                </span>
                                                                {lecture.is_free_preview && (
                                                                    <span className="inline-flex items-center gap-1.5 text-[9px] bg-brand-primary text-white px-2.5 py-1 rounded-full font-black uppercase tracking-[0.1em] shadow-lg shadow-brand-primary/20">
                                                                        <Unlock className="w-3 h-3" /> معاينة مجانية
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="shrink-0">
                                                            {canPlay ? (
                                                                <PlayCircle className="w-6 h-6 text-brand-primary opacity-0 group-hover/lecture:opacity-100 transition-all duration-300" />
                                                            ) : (
                                                                <Lock className="w-5 h-5 text-slate-300" />
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar: Pricing & Actions */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-12 bg-white rounded-[40px] border border-border-subtle shadow-2xl shadow-slate-200/60 overflow-hidden">
                            <div className="p-10 space-y-10">
                                <div className="text-center relative">
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-20 bg-brand-primary/5 rounded-full blur-2xl" />
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-6 relative z-10">قيمة الدورة التعليمية</p>
                                    {course.is_free ? (
                                        <div className="text-6xl font-black text-brand-primary tracking-tighter relative z-10">مجانية!</div>
                                    ) : (
                                        <div className="flex items-baseline justify-center gap-4 relative z-10">
                                            <span className="text-7xl font-black text-text-primary tracking-tighter tabular-nums">{course.price}</span>
                                            <span className="text-2xl font-black text-text-muted">ج.م</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <Button
                                        onClick={enrollmentStatus === 'approved' ? () => navigate(`/courses/${id}/player`) : handleEnroll}
                                        isLoading={enrollmentStatus === 'pending'}
                                        variant={enrollmentStatus === 'approved' ? 'primary' : 'premium'}
                                        size="lg"
                                        fullWidth
                                        className={enrollmentStatus === 'approved' ? 'bg-brand-bg hover:bg-brand-primary' : ''}
                                        icon={enrollmentStatus === 'approved' ? PlayCircle : Zap}
                                    >
                                        {enrollmentStatus === 'approved' 
                                            ? 'استمرار التعلم' 
                                            : enrollmentStatus === 'pending' 
                                                ? 'جاري المراجعة' 
                                                : (course.is_free ? 'ابدأ الآن مجاناً' : 'اشترك في الدورة')}
                                    </Button>

                                    <div className="flex items-center justify-center gap-3 pt-2">
                                        <div className="flex items-center gap-1 text-[9px] font-black text-slate-300 uppercase tracking-widest border border-border-subtle px-3 py-1 rounded-full">
                                            <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" /> دفع آمن
                                        </div>
                                        <div className="flex items-center gap-1 text-[9px] font-black text-slate-300 uppercase tracking-widest border border-border-subtle px-3 py-1 rounded-full">
                                            <Share2 className="w-3.5 h-3.5 text-brand-primary" /> شارك
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-10 border-t border-slate-50 space-y-6">
                                    <div className="flex items-center gap-5 group/feature">
                                        <div className="w-12 h-12 rounded-2xl bg-brand-primary/5 text-brand-primary flex items-center justify-center group-hover/feature:bg-brand-primary group-hover/feature:text-white transition-all duration-300 shadow-sm shadow-brand-primary/10">
                                            <Award className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block">شهادة معتمدة</span>
                                            <span className="text-sm font-black text-slate-700">عند إتمام الدورة</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-5 group/feature">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover/feature:bg-blue-500 group-hover/feature:text-white transition-all duration-300 shadow-sm shadow-blue-500/10">
                                            <Globe className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block">وصول غير محدود</span>
                                            <span className="text-sm font-black text-slate-700">مدى الحياة للمحتوى</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-5 group/feature">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center group-hover/feature:bg-amber-500 group-hover/feature:text-white transition-all duration-300 shadow-sm shadow-amber-500/10">
                                            <CheckCircle className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block">دعم فني</span>
                                            <span className="text-sm font-black text-slate-700">مباشر مع المحاضر</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </PageContainer>

            {/* Sticky Mobile CTA */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border-subtle p-4 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">الإجمالي</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-text-primary">{course.is_free ? 'مجاني' : course.price}</span>
                            {!course.is_free && <span className="text-[10px] font-black text-text-muted">ج.م</span>}
                        </div>
                    </div>
                    <div className="flex-1">
                        <Button
                            onClick={enrollmentStatus === 'approved' ? () => navigate(`/courses/${id}/player`) : handleEnroll}
                            isLoading={enrollmentStatus === 'pending'}
                            variant={enrollmentStatus === 'approved' ? 'primary' : 'premium'}
                            size="md"
                            fullWidth
                            className={enrollmentStatus === 'approved' ? 'bg-brand-bg hover:bg-brand-primary' : 'h-12'}
                            icon={enrollmentStatus === 'approved' ? PlayCircle : Zap}
                        >
                            {enrollmentStatus === 'approved' 
                                ? 'استمرار' 
                                : enrollmentStatus === 'pending' 
                                    ? 'مراجعة' 
                                    : (course.is_free ? 'ابدأ الآن' : 'اشترك')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};






