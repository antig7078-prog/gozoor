import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayCircle, BookOpen, CheckCircle, Lock, Unlock, ArrowRight, Loader2, Star, ShieldCheck, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export const CourseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [course, setCourse] = useState<any>(null);
    const [sections, setSections] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isEnrolling] = useState(false);
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

                // Fetch sections...
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
                .select('id')
                .eq('user_id', user.id)
                .eq('course_id', id)
                .single();

            if (data) setIsEnrolled(true);
        };

        checkEnrollment();
        if (id) fetchCourseDetails();
    }, [id, user, navigate]);

    const handleEnroll = () => {
        if (!user) {
            toast.error('يرجى تسجيل الدخول أولاً لإتمام الشراء');
            navigate('/login');
            return;
        }
        navigate(`/checkout/${id}`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">جاري تحميل مسار الدورة...</p>
                </div>
            </div>
        );
    }

    if (!course) return null;

    let totalLectures = 0;
    sections.forEach(sec => totalLectures += sec.course_lectures?.length || 0);

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24" dir="rtl">
            {/* ... (existing Hero Section) */}
            <div className="bg-slate-900 text-white pt-8 pb-32 px-6 sm:px-12 relative overflow-hidden">
                {/* Background image tint */}
                {course.thumbnail_url && (
                    <div className="absolute inset-0 opacity-10">
                        <img src={course.thumbnail_url} alt="background view" className="w-full h-full object-cover blur-sm" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <button
                        onClick={() => navigate('/courses')}
                        className="flex items-center gap-2 text-slate-300 hover:text-white font-bold mb-8 transition-colors"
                    >
                        <ArrowRight className="w-5 h-5" /> العودة للدورات
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="flex flex-wrap gap-3">
                                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-1.5 rounded-full text-sm font-black">
                                    {course.category || 'تصنيف عام'}
                                </span>
                                <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-1.5 rounded-full text-sm font-black">
                                    مستوى: {course.level === 'Beginner' ? 'مبتدئ' : course.level === 'Intermediate' ? 'متوسط' : 'متقدم'}
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-black leading-tight text-white">
                                {course.title}
                            </h1>
                            <p className="text-xl text-slate-300 font-medium leading-relaxed font-semibold">
                                {course.subtitle || course.description?.substring(0, 150) + '...'}
                            </p>

                            <div className="flex flex-wrap items-center gap-6 pt-4 text-slate-300 font-bold">
                                {course.instructor_name && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-white">
                                            {course.instructor_name.charAt(0)}
                                        </div>
                                        <span>بواسطة: {course.instructor_name}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                                    <span>4.8 (تقييم)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <PlayCircle className="w-5 h-5" />
                                    <span>{totalLectures} درس تعليمي</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Globe className="w-5 h-5" />
                                    <span>{course.language}</span>
                                </div>
                            </div>
                        </div>

                        {/* Video Player Section */}
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800/50 bg-slate-800 w-full aspect-video">
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
                                <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content & Purchasing Card */}
            <div className="max-w-7xl mx-auto px-6 sm:px-12 -mt-16 z-20 relative">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content (Description & Curriculum) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Course Description */}
                        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm transition-all hover:shadow-md">
                            <h2 className="text-2xl font-black text-slate-900 mb-6 border-b border-slate-100 pb-4">عن هذه الدورة</h2>
                            <div className="prose prose-slate max-w-none">
                                <p className="text-slate-600 leading-relaxed font-semibold whitespace-pre-wrap">
                                    {course.description || 'لا يوجد وصف متاح لهذه الدورة حالياً.'}
                                </p>
                            </div>
                        </div>

                        {/* Curriculum Section */}
                        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                            <h2 className="text-2xl font-black text-slate-900 mb-6 border-b border-slate-100 pb-4">محتوى الدورة</h2>
                            <div className="space-y-4">
                                {sections.map((section) => (
                                    <div key={section.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                                            <h3 className="font-bold text-slate-800">{section.title}</h3>
                                            <span className="text-xs font-bold text-slate-400">{section.course_lectures?.length || 0} دروس</span>
                                        </div>
                                        <div className="divide-y divide-slate-100">
                                            {section.course_lectures?.map((lecture: any) => {
                                                const canPlay = isEnrolled || lecture.is_free_preview;
                                                const isActive = activeVideoUrl === lecture.video_url;

                                                return (
                                                    <div
                                                        key={lecture.id}
                                                        onClick={() => {
                                                            if (canPlay && lecture.video_url) {
                                                                navigate(`/courses/${id}/player?lecture=${lecture.id}`);
                                                            } else if (!canPlay) {
                                                                toast.error('هذا الدرس يتطلب الاشتراك في الدورة');
                                                            }
                                                        }}
                                                        className={`px-6 py-4 flex items-center justify-between transition-colors ${canPlay ? 'cursor-pointer hover:bg-emerald-50' : 'bg-slate-50/50 opacity-70'} ${isActive ? 'bg-emerald-50 border-r-4 border-emerald-500' : ''}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {lecture.lecture_type === 'Video' ? <PlayCircle className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-emerald-500'}`} /> : <BookOpen className="w-4 h-4 text-blue-500" />}
                                                            <span className={`font-bold text-sm ${isActive ? 'text-emerald-900' : 'text-slate-700'}`}>{lecture.title}</span>
                                                            {lecture.is_free_preview && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-black">مجاني</span>}
                                                        </div>
                                                        {canPlay ? <Unlock className="w-4 h-4 text-emerald-500" /> : <Lock className="w-4 h-4 text-slate-300" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Purchasing / Sticky Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
                            <div className="text-center mb-8">
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">استثمارك في مستقبلك</h3>
                                {course.is_free ? (
                                    <div className="text-4xl font-black text-emerald-600">مجاناً بالكامل!</div>
                                ) : (
                                    <div className="flex items-baseline justify-center gap-2">
                                        <span className="text-5xl font-black text-slate-900">{course.price}</span>
                                        <span className="text-xl font-bold text-slate-500">جنيهاً</span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={isEnrolled ? () => navigate(`/courses/${id}/player`) : handleEnroll}
                                disabled={isEnrolling}
                                className={`w-full text-white font-black text-lg py-4 rounded-xl shadow-lg transition-all mb-4 flex items-center justify-center gap-2 ${isEnrolled ? 'bg-slate-800 hover:bg-slate-900 shadow-slate-900/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                                    }`}
                            >
                                {isEnrolling ? <Loader2 className="w-6 h-6 animate-spin" /> : isEnrolled ? (
                                    <>
                                        <PlayCircle className="w-6 h-6" />
                                        استمرار التعلم
                                    </>
                                ) : course.is_free ? 'ابدأ التعلم مجاناً الآن' : 'اشترك في الدورة واشترِ الآن'}
                            </button>

                            <p className="text-center text-sm font-semibold text-slate-400 mb-8 border-b border-slate-100 pb-8">
                                🔒 دفع آمن ومشفر 100%
                            </p>

                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                    <span className="text-sm font-bold text-slate-700">وصول مدى الحياة للمحتوى الحالي والمستقبلي</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <BookOpen className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                    <span className="text-sm font-bold text-slate-700">تحديثات دورية مجانية للمادة العلمية</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                    <span className="text-sm font-bold text-slate-700">شهادة إتمام معتمدة بعد الانتهاء</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

