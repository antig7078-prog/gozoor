import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
    PlayCircle,
    BookOpen,
    Lock,
    ArrowRight,
    FileText,
    Menu,
    X,
    Trophy,
    Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { Button } from '../../components/ui/Button';

export const CoursePlayer = () => {
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [sections, setSections] = useState<any[]>([]);
    const [activeLecture, setActiveLecture] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [completedLectures, setCompletedLectures] = useState<string[]>([]);
    const [isRequestingCert, setIsRequestingCert] = useState(false);
    const [hasRequestedCert, setHasRequestedCert] = useState<any>(null);

    const lectureIdFromUrl = searchParams.get('lecture');

    useEffect(() => {
        const initPlayer = async () => {
            setIsLoading(true);
            try {
                // 1. Check Enrollment
                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', user.id)
                        .single();

                    const { data: enrollData } = await supabase
                        .from('enrollments')
                        .select('status')
                        .eq('user_id', user.id)
                        .eq('course_id', id)
                        .single();

                    if (enrollData?.status === 'approved' || profile?.role === 'admin') setIsEnrolled(true);
                }

                // 2. Fetch Course & Content
                const [courseRes, sectionsRes] = await Promise.all([
                    supabase.from('courses').select('*').eq('id', id).single(),
                    supabase.from('course_sections').select('*, course_lectures(*)').eq('course_id', id).order('sort_order', { ascending: true })
                ]);

                if (courseRes.error) throw courseRes.error;

                const sortedSections = (sectionsRes.data || []).map(sec => ({
                    ...sec,
                    course_lectures: (sec.course_lectures || []).sort((a: any, b: any) => a.sort_order - b.sort_order)
                }));
                setSections(sortedSections);

                // 3. Set Active Lecture
                let initialLecture = null;
                if (lectureIdFromUrl) {
                    // Find requested lecture
                    for (const sec of sortedSections) {
                        const found = sec.course_lectures.find((l: any) => l.id === lectureIdFromUrl);
                        if (found) {
                            initialLecture = found;
                            break;
                        }
                    }
                }

                if (!initialLecture && sortedSections.length > 0) {
                    initialLecture = sortedSections[0].course_lectures[0];
                }

                setActiveLecture(initialLecture);

                // 4. Fetch Progress
                if (user) {
                    const { data: progressData } = await supabase
                        .from('user_progress')
                        .select('lecture_id')
                        .eq('user_id', user.id)
                        .eq('course_id', id);

                    if (progressData) {
                        setCompletedLectures(progressData.map(p => p.lecture_id));
                    }

                    // Check if cert already requested and get status/url
                    const { data: certData } = await supabase
                        .from('certificate_requests')
                        .select('status, certificate_url')
                        .eq('user_id', user.id)
                        .eq('course_id', id)
                        .single();

                    if (certData) setHasRequestedCert(certData);
                }

            } catch (error: any) {
                console.error('CoursePlayer Init Error:', error);
                toast.error('فشل تحميل محتوى المشغل: ' + (error.message || 'خطأ غير معروف'));
                navigate(`/courses/${id}`);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) initPlayer();
    }, [id, user, lectureIdFromUrl]);

    const getYouTubeEmbedUrl = (url: string) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        const videoId = (match && match[2].length === 11) ? match[2] : null;
        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
    };

    const handleLectureSelect = (lecture: any) => {
        const canAccess = isEnrolled || lecture.is_free_preview;
        if (!canAccess) {
            toast.error('هذا الدرس مخصص للمشتركين فقط');
            return;
        }
        setActiveLecture(lecture);
        setSearchParams({ lecture: lecture.id });
        if (window.innerWidth < 1024) setIsSidebarOpen(false);
    };

    const toggleLectureComplete = async (lectureId: string) => {
        if (!user || !isEnrolled) {
            toast.error('يجب أن تكون مشتركاً لحفظ التقدم');
            return;
        }

        const isCompleted = completedLectures.includes(lectureId);
        
        try {
            if (isCompleted) {
                const { error } = await supabase
                    .from('user_progress')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('lecture_id', lectureId);
                
                if (error) throw error;
                setCompletedLectures(prev => prev.filter(id => id !== lectureId));
            } else {
                const { error } = await supabase
                    .from('user_progress')
                    .insert([{ 
                        user_id: user.id, 
                        course_id: id, 
                        lecture_id: lectureId 
                    }]);
                
                if (error) throw error;
                setCompletedLectures(prev => [...prev, lectureId]);
                toast.success('أحسنت! تم إكمال الدرس');
            }
        } catch (error: any) {
            console.error('Progress Update Error:', error);
            toast.error('فشل تحديث التقدم: ' + (error.message || 'تأكد من وجود الجداول المطلوبة'));
        }
    };

    const handleRequestCertificate = async () => {
        if (!user || isRequestingCert) return;
        setIsRequestingCert(true);

        try {
            const { error } = await supabase.from('certificate_requests').insert([
                { user_id: user.id, course_id: id }
            ]);

            if (error) throw error;
            
            // Re-fetch to get the status correctly
            const { data: newCert } = await supabase
                .from('certificate_requests')
                .select('status, certificate_url')
                .eq('user_id', user.id)
                .eq('course_id', id)
                .single();
            
            setHasRequestedCert(newCert || { status: 'pending' });
            toast.success('تم إرسال طلب الشهادة بنجاح! سيقوم الإدمن بمراجعته قريباً');
        } catch (error: any) {
            console.error('Cert Request Error:', error);
            toast.error('فشل إرسال طلب الشهادة: ' + (error.message || 'خطأ غير معروف'));
        } finally {
            setIsRequestingCert(false);
        }
    };

    const totalLectures = sections.reduce((acc, s) => acc + s.course_lectures.length, 0);
    const progressPercentage = totalLectures > 0 ? Math.round((completedLectures.length / totalLectures) * 100) : 0;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-brand-bg flex items-center justify-center">
                <LoadingSpinner size="lg" message="جاري تجهيز بيئة التعلم..." />
            </div>
        );
    }

    return (
        <div className="h-screen bg-brand-bg flex flex-col overflow-hidden" dir="rtl">
            {/* Header */}
            <div className="h-16 bg-brand-bg/50 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 z-30">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/courses/${id}`)}
                        className="p-1.5 md:p-2 text-text-muted hover:text-white transition-colors"
                    >
                        <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <div>
                        <h1 className="text-white font-black text-sm md:text-base truncate max-w-[200px] md:max-w-md">
                            {activeLecture?.title}
                        </h1>
                        <div className="flex items-center gap-2">
                            <div className="w-24 md:w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-brand-primary transition-all duration-500"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                            <span className="text-brand-primary text-[10px] font-black">{progressPercentage}% منجز</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="lg:hidden p-2 bg-white/5 text-white rounded-lg"
                >
                    {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Main Content (Player) */}
                <div className="flex-1 flex flex-col bg-black overflow-y-auto">
                    <div className="w-full aspect-video bg-brand-bg">
                        {activeLecture?.lecture_type === 'Video' ? (
                            activeLecture.video_url?.includes('youtube.com') || activeLecture.video_url?.includes('youtu.be') ? (
                                <iframe
                                    className="w-full h-full"
                                    src={getYouTubeEmbedUrl(activeLecture.video_url)}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <video controls autoPlay className="w-full h-full" src={activeLecture.video_url}></video>
                            )
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-secondary flex-col gap-4">
                                <FileText className="w-20 h-20 opacity-20" />
                                <p className="font-bold">هذا الدرس يحتوي على ملفات نصية فقط</p>
                            </div>
                        )}
                    </div>

                    {/* Lecture Info Area */}
                    <div className="p-6 md:p-8 pb-20">
                        <div className="max-w-4xl">
                            <h2 className="text-xl md:text-2xl font-black text-white mb-4">{activeLecture?.title}</h2>
                            <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-8">
                                {activeLecture?.is_free_preview && (
                                    <span className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-xs font-black border border-brand-primary/20">
                                        معاينة مجانية
                                    </span>
                                )}
                                <span className="text-text-secondary text-sm font-bold flex items-center gap-2">
                                    <PlayCircle className="w-4 h-4" /> {activeLecture?.lecture_type}
                                </span>

                                {isEnrolled && (
                                    <button
                                        onClick={() => toggleLectureComplete(activeLecture.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${completedLectures.includes(activeLecture.id)
                                                ? 'bg-brand-primary text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                                : 'bg-white/10 text-slate-300 hover:bg-white/20'
                                            }`}
                                    >
                                        {completedLectures.includes(activeLecture.id) ? (
                                            'تم الإنجاز'
                                        ) : (
                                            'تحديد كمكتمل'
                                        )}
                                    </button>
                                )}
                            </div>

                            {activeLecture?.text_content && (
                                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                    <h3 className="text-brand-primary font-bold mb-4 flex items-center gap-2">
                                        <BookOpen className="w-5 h-5" /> ملاحظات المحاضرة
                                    </h3>
                                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                                        {activeLecture.text_content}
                                    </p>
                                </div>
                            )}

                            {/* Certificate Request Section */}
                            {isEnrolled && progressPercentage === 100 && (
                                <div className="mt-12 p-6 md:p-8 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-[1.5rem] md:rounded-[2.5rem] border border-amber-500/20 text-center">
                                    <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                                    <h3 className="text-2xl font-black text-white mb-2">تهانينا! لقد أتممت المسار بالكامل</h3>
                                    <p className="text-amber-100/60 mb-6">يمكنك الآن طلب شهادة إتمام الدورة المعتمدة من منصة جذور</p>

                                    {hasRequestedCert ? (
                                        hasRequestedCert.status === 'approved' ? (
                                            <div className="flex flex-col items-center">
                                                <a
                                                    href={hasRequestedCert.certificate_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-3 px-6 md:px-10 py-4 md:py-5 bg-brand-primary-hover hover:bg-brand-primary text-white rounded-2xl font-black transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-bounce text-sm md:text-base"
                                                >
                                                    <Trophy className="w-5 h-5 md:w-6 md:h-6" /> تحميل الشهادة المعتمدة
                                                </a>
                                                <p className="mt-4 text-brand-primary font-bold">تهانينا! شهادتك جاهزة للتحميل</p>
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-2 px-8 py-4 bg-brand-primary/20 text-brand-primary rounded-2xl font-black border border-brand-primary/20">
                                                <Check className="w-5 h-5" /> تم إرسال الطلب بنجاح (قيد المراجعة)
                                            </div>
                                        )
                                    ) : (
                                        <Button
                                            onClick={handleRequestCertificate}
                                            isLoading={isRequestingCert}
                                            variant="premium"
                                            size="lg"
                                            className="px-10"
                                        >
                                            طلب شهادة الإتمام
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar (Curriculum) */}
                <div
                    className={`
                        fixed inset-0 z-20 lg:relative lg:inset-auto bg-brand-bg border-r border-white/5 w-[85vw] md:w-80 
                        transform transition-transform duration-300
                        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:hidden'}
                    `}
                >
                    <div className="h-full flex flex-col">
                        <div className="p-6 border-b border-white/5 bg-white/5">
                            <h3 className="text-white font-black">محتوى المسار</h3>
                            <p className="text-text-secondary text-xs mt-1 font-bold">إجمالي {sections.reduce((acc, s) => acc + s.course_lectures.length, 0)} دروس</p>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {sections.map((section, sIdx) => (
                                <div key={section.id} className="border-b border-white/5">
                                    <div className="px-6 py-4 bg-white/5 flex justify-between items-center group cursor-pointer">
                                        <span className="text-slate-300 font-black text-xs">
                                            {sIdx + 1}. {section.title}
                                        </span>
                                    </div>
                                    <div className="py-2">
                                        {section.course_lectures.map((lec: any) => {
                                            const canAccess = isEnrolled || lec.is_free_preview;
                                            const isActive = activeLecture?.id === lec.id;

                                            return (
                                                <button
                                                    key={lec.id}
                                                    disabled={!canAccess}
                                                    onClick={() => handleLectureSelect(lec)}
                                                    className={`
                                                        w-full px-6 py-3.5 flex items-start gap-3 text-right transition-all
                                                        ${isActive ? 'bg-brand-primary text-white' : 'text-text-muted hover:bg-white/5'}
                                                        ${!canAccess ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                                                    `}
                                                >
                                                    <div className="mt-0.5 relative">
                                                        {completedLectures.includes(lec.id) && (
                                                            <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                                                <Check className="w-2 h-2 text-brand-primary stroke-[4px]" />
                                                            </div>
                                                        )}
                                                        {isActive ? (
                                                            <PlayCircle className="w-4 h-4" />
                                                        ) : !canAccess ? (
                                                            <Lock className="w-4 h-4 opacity-60" />
                                                        ) : (
                                                            <PlayCircle className="w-4 h-4 text-brand-primary" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-xs font-black truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>
                                                            {lec.title}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {lec.is_free_preview && !isEnrolled && (
                                                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${isActive ? 'bg-white/20' : 'bg-brand-primary/10 text-brand-primary'}`}>مجاني</span>
                                                            )}
                                                            <span className="text-[9px] opacity-70 font-bold">{lec.lecture_type}</span>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};




