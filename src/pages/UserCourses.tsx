import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Clock, User, PlayCircle, Star, TrendingUp, BookOpen, Heart, Eye, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export const UserCourses = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<any[]>([]);
    const [mostViewed, setMostViewed] = useState<any[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('كل الأقسام');

    const [categories, setCategories] = useState<string[]>(['كل الأقسام']);
    const [stats, setStats] = useState({ students: '...', courses: '...', enrollments: '...', sessions: '...' });

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                // Fetch Courses
                const { data: coursesData, error: coursesError } = await supabase
                    .from('courses')
                    .select('*, course_sections(course_lectures(id))')
                    .eq('status', 'Published')
                    .eq('visibility', 'Public')
                    .order('created_at', { ascending: false });

                if (coursesError) throw coursesError;
                setCourses(coursesData || []);

                // Fetch Stats
                const { count: studentCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user');
                const { count: enrollCount } = await supabase.from('enrollments').select('*', { count: 'exact', head: true });

                setStats({
                    students: (studentCount || 0).toLocaleString(),
                    courses: (coursesData?.length || 0).toString(),
                    enrollments: (enrollCount || 0).toLocaleString(),
                    sessions: "مستمرة"
                });

                // Fetch Categories
                const { data: catData } = await supabase.from('categories').select('name').order('name');
                if (catData) {
                    const dynamicCats = catData.map(c => c.name);
                    setCategories(['كل الأقسام', ...dynamicCats]);
                }

                // Fetch Most Viewed (Top 5)
                const { data: mvData } = await supabase
                    .from('courses')
                    .select('*, course_sections(course_lectures(id))')
                    .eq('status', 'Published')
                    .order('views_count', { ascending: false })
                    .limit(5);
                if (mvData) setMostViewed(mvData);

                // Fetch Favorites
                if (user) {
                    const { data: favData } = await supabase
                        .from('favorites')
                        .select('course_id')
                        .eq('user_id', user.id);
                    if (favData) setFavoriteIds(favData.map(f => f.course_id));
                }

            } catch (error: any) {
                toast.error('حدث خطأ أثناء تحميل البيانات.');
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const toggleFavorite = async (courseId: string) => {
        if (!user) {
            toast.error('يرجى تسجيل الدخول أولاً');
            return;
        }

        const isFav = favoriteIds.includes(courseId);
        try {
            if (isFav) {
                await supabase.from('favorites').delete().eq('user_id', user.id).eq('course_id', courseId);
                setFavoriteIds(prev => prev.filter(id => id !== courseId));
                toast.success('تمت الإزالة من المفضلة');
            } else {
                await supabase.from('favorites').insert([{ user_id: user.id, course_id: courseId }]);
                setFavoriteIds(prev => [...prev, courseId]);
                toast.success('تمت الإضافة للمفضلة');
            }
        } catch (error) {
            toast.error('حدث خطأ ما');
        }
    };

    const filteredCourses = courses.filter(course => {
        if (selectedCategory === 'كل الأقسام') return true;
        return course.category === selectedCategory;
    });

    const getTotalLectures = (course: any) => {
        let total = 0;
        if (course.course_sections) {
            course.course_sections.forEach((sec: any) => {
                if (sec.course_lectures) total += sec.course_lectures.length;
            });
        }
        return total;
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans w-full" dir="rtl">

            {/* Premium Statistics Banner */}
            <div className="relative overflow-hidden bg-white border-b border-slate-200">
                {/* Decorative background blur */}
                <div className="absolute top-[-50%] left-[-10%] w-[40%] h-[150%] rounded-full bg-emerald-50 blur-[100px] pointer-events-none" />
                <div className="absolute bottom-[-50%] right-[-10%] w-[30%] h-[150%] rounded-full bg-slate-50 blur-[100px] pointer-events-none" />

                <div className="relative z-10 py-16 md:py-24 px-6 max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
                        {[
                            { value: stats.students, label: 'متعلم عربي', sub: 'من أنحاء العالم', color: 'text-indigo-900' },
                            { value: stats.courses, label: 'دورة تدريبية', sub: 'في مختلف المجالات', color: 'text-emerald-700' },
                            { value: stats.enrollments, label: 'شهادة', sub: 'تم اصدارها للمتعلمين', color: 'text-amber-600' },
                            { value: stats.sessions, label: 'تفاعل حي', sub: 'طبقاً لإحصائيات المنصة', color: 'text-blue-700' },
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1, type: 'spring', stiffness: 50 }}
                                className="flex flex-col items-center justify-center relative group"
                            >
                                {/* Separator line for desktop */}
                                {idx !== 0 && (
                                    <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-16 bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
                                )}

                                <h2 className={`text-4xl lg:text-5xl font-black mb-3 tracking-tight ${stat.color} drop-shadow-sm`}>
                                    {stat.value}
                                </h2>
                                <p className="text-slate-800 font-extrabold text-lg mb-1">{stat.label}</p>
                                <p className="text-slate-500 text-sm font-semibold">{stat.sub}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Premium Categories Section */}
            <div className="py-12 bg-white px-6 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.03)] relative z-20">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center gap-3 mb-10">
                        <h3 className="text-3xl font-black text-slate-900">تصفح الأقسام</h3>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3">
                        {categories.map((cat, idx) => {
                            const isActive = selectedCategory === cat;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`relative px-6 py-3 rounded-2xl text-sm font-black transition-all duration-300 overflow-hidden ${isActive
                                        ? 'text-white shadow-lg shadow-indigo-900/20 scale-105'
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:shadow-md'
                                        }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeCategory"
                                            className="absolute inset-0 bg-indigo-950"
                                            initial={false}
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10">{cat}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Most Viewed Section */}
            {!isLoading && mostViewed.length > 0 && selectedCategory === 'كل الأقسام' && (
                <div className="py-16 px-6 bg-slate-50/50">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-4 mb-10 border-b border-slate-200 pb-6">
                            <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                                <Trophy className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 line-height-none">الأكثر مشاهدة</h2>
                                <p className="text-slate-500 font-bold">أفضل 5 دورات اختياراً من قبل الطلاب</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            {mostViewed.map((course, idx) => (
                                <motion.div
                                    key={course.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer"
                                    onClick={() => window.location.href = `/courses/${course.id}`}
                                >
                                    <div className="relative aspect-video rounded-2xl overflow-hidden mb-4">
                                        <img src={course.thumbnail_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur rounded-lg text-[10px] font-black text-indigo-600 shadow-sm flex items-center gap-1">
                                            <Eye className="w-3 h-3" /> {course.views_count || 0}
                                        </div>
                                    </div>
                                    <h4 className="font-black text-slate-800 text-sm line-clamp-2 min-h-[2.5rem]">{course.title}</h4>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Favorites Button */}
            {user && (
                <Link
                    to="/favorites"
                    className="fixed bottom-24 left-8 z-50 w-16 h-16 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-rose-500/40 hover:scale-110 hover:bg-rose-600 active:scale-95 transition-all"
                >
                    <div className="relative">
                        <Heart className="w-8 h-8 fill-current" />
                        {favoriteIds.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-rose-500">
                                {favoriteIds.length}
                            </span>
                        )}
                    </div>
                </Link>
            )}

            {/* Courses Grid - Modern UI */}
            <div className="py-16 px-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-10 border-b-2 border-slate-100 pb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 leading-tight">أضيف حديثاً</h2>
                            <p className="text-slate-500 font-bold mt-1">أحدث الدورات التي انضمت للمنصة</p>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="relative w-20 h-20 mb-6">
                            <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <p className="text-slate-800 font-black text-xl">جاري استحضار الدورات...</p>
                        <p className="text-slate-500 font-medium">لحظات ونكون مستعدين</p>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">لا توجد دورات حالياً</h3>
                        <p className="text-slate-500 font-semibold">لم نجد دورات مطابقة للقسم المختار، جرب تصفح قسم آخر.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        <AnimatePresence>
                            {filteredCourses.map((course, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                                    key={course.id}
                                >
                                    <Link
                                        to={`/courses/${course.id}`}
                                        className="block bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-400 group"
                                    >
                                        {/* Premium Thumbnail Section */}
                                        <div className="relative h-64 w-full flex-shrink-0 overflow-hidden bg-slate-100 p-2">
                                            <div className="w-full h-full rounded-2xl overflow-hidden relative">
                                                {course.thumbnail_url ? (
                                                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
                                                        <BookOpen className="w-16 h-16 text-emerald-200" />
                                                    </div>
                                                )}

                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        toggleFavorite(course.id);
                                                    }}
                                                    className="absolute top-4 left-4 z-30 w-10 h-10 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:bg-white transition-all group/fav"
                                                >
                                                    <Heart
                                                        className={`w-5 h-5 transition-colors ${favoriteIds.includes(course.id) ? 'text-rose-500 fill-rose-500' : 'text-slate-600 group-hover/fav:text-rose-500'}`}
                                                    />
                                                </button>

                                                {/* Sophisticated Gradient Overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />

                                                {/* Top Right Badges */}
                                                <div className="absolute top-4 right-4 flex flex-col gap-2">
                                                    {course.is_free && (
                                                        <div className="bg-emerald-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md">
                                                            مجاني
                                                        </div>
                                                    )}
                                                    <div className="bg-white/90 text-slate-800 text-xs font-black px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md border border-white/50">
                                                        {course.level === 'Beginner' ? 'مبتدئ' : course.level === 'Intermediate' ? 'متوسط' : 'متقدم'}
                                                    </div>
                                                </div>

                                                {/* Instructor Floating Name over video */}
                                                <div className="absolute bottom-4 right-4 left-4 flex items-end justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-lg bg-slate-200 shrink-0">
                                                            <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                                                                <User className="w-5 h-5 text-indigo-400" />
                                                            </div>
                                                        </div>
                                                        <span className="text-white font-bold drop-shadow-md">
                                                            {course.instructor_name || 'المهندس المختص'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                                                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                                        <span className="text-white text-xs font-bold">4.8</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-6">
                                            <h3 className="text-xl font-black text-slate-800 line-clamp-2 mb-4 leading-snug group-hover:text-emerald-700 transition-colors h-14">
                                                {course.title}
                                            </h3>

                                            <div className="flex items-center justify-between text-sm font-bold mt-auto pt-4 border-t border-slate-100 text-slate-500">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                                                        <Clock className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                                                    </span>
                                                    <span>{getTotalLectures(course)} درس فيديو</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                    <span>تصفح الدورة</span>
                                                    <PlayCircle className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

        </div>
    );
};
