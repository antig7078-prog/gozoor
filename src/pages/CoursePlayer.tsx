import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
    PlayCircle,
    BookOpen,
    Lock,
    ArrowRight,
    Loader2,
    FileText,
    Menu,
    X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export const CoursePlayer = () => {
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [course, setCourse] = useState<any>(null);
    const [sections, setSections] = useState<any[]>([]);
    const [activeLecture, setActiveLecture] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const lectureIdFromUrl = searchParams.get('lecture');

    useEffect(() => {
        const initPlayer = async () => {
            setIsLoading(true);
            try {
                // 1. Check Enrollment
                if (user) {
                    const { data: enrollData } = await supabase
                        .from('enrollments')
                        .select('id')
                        .eq('user_id', user.id)
                        .eq('course_id', id)
                        .single();
                    if (enrollData) setIsEnrolled(true);
                }

                // 2. Fetch Course & Content
                const [courseRes, sectionsRes] = await Promise.all([
                    supabase.from('courses').select('*').eq('id', id).single(),
                    supabase.from('course_sections').select('*, course_lectures(*)').eq('course_id', id).order('sort_order', { ascending: true })
                ]);

                if (courseRes.error) throw courseRes.error;
                setCourse(courseRes.data);

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

            } catch (error: any) {
                toast.error('فشل تحميل محتوى المشغل');
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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-screen bg-slate-950 flex flex-col overflow-hidden" dir="rtl">
            {/* Header */}
            <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-30">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/courses/${id}`)}
                        className="p-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowRight className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-white font-black text-sm md:text-base truncate max-w-[200px] md:max-w-md">
                            {course?.title}
                        </h1>
                        <p className="text-emerald-500 text-[10px] font-bold">
                            {activeLecture?.title}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="lg:hidden p-2 bg-slate-800 text-white rounded-lg"
                >
                    {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Main Content (Player) */}
                <div className="flex-1 flex flex-col bg-black overflow-y-auto">
                    <div className="w-full aspect-video bg-slate-900">
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
                            <div className="w-full h-full flex items-center justify-center text-slate-500 flex-col gap-4">
                                <FileText className="w-20 h-20 opacity-20" />
                                <p className="font-bold">هذا الدرس يحتوي على ملفات نصية فقط</p>
                            </div>
                        )}
                    </div>

                    {/* Lecture Info Area */}
                    <div className="p-8 pb-20">
                        <div className="max-w-4xl">
                            <h2 className="text-2xl font-black text-white mb-4">{activeLecture?.title}</h2>
                            <div className="flex items-center gap-4 mb-8">
                                {activeLecture?.is_free_preview && (
                                    <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-xs font-black border border-emerald-500/20">
                                        معاينة مجانية
                                    </span>
                                )}
                                <span className="text-slate-500 text-sm font-bold flex items-center gap-2">
                                    <PlayCircle className="w-4 h-4" /> {activeLecture?.lecture_type}
                                </span>
                            </div>

                            {activeLecture?.text_content && (
                                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                    <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
                                        <BookOpen className="w-5 h-5" /> ملاحظات المحاضرة
                                    </h3>
                                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                                        {activeLecture.text_content}
                                    </p>
                                </div>
                            )}

                            {activeLecture?.file_url && (
                                <div className="mt-6">
                                    <a
                                        href={activeLecture.file_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-black hover:bg-emerald-700 transition-all"
                                    >
                                        <FileText className="w-5 h-5" /> تحميل ملاحق الدرس
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar (Curriculum) */}
                <div
                    className={`
                        fixed inset-0 z-20 lg:relative lg:inset-auto bg-slate-900 border-r border-slate-800 w-80 
                        transform transition-transform duration-300
                        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:hidden'}
                    `}
                >
                    <div className="h-full flex flex-col">
                        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                            <h3 className="text-white font-black">محتوى المسار</h3>
                            <p className="text-slate-500 text-xs mt-1 font-bold">إجمالي {sections.reduce((acc, s) => acc + s.course_lectures.length, 0)} دروس</p>
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
                                                        ${isActive ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-white/5'}
                                                        ${!canAccess ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                                    `}
                                                >
                                                    <div className="mt-0.5">
                                                        {isActive ? (
                                                            <PlayCircle className="w-4 h-4" />
                                                        ) : !canAccess ? (
                                                            <Lock className="w-4 h-4 opacity-50" />
                                                        ) : (
                                                            <PlayCircle className="w-4 h-4 text-emerald-500" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-xs font-black truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>
                                                            {lec.title}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {lec.is_free_preview && !isEnrolled && (
                                                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${isActive ? 'bg-white/20' : 'bg-emerald-500/10 text-emerald-500'}`}>مجاني</span>
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
