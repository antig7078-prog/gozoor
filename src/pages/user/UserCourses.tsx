import { useEffect, useState } from 'react';
import { PageContainer } from '../../components/shared/PageContainer';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, BookOpen, User, Star, TrendingUp, Sparkles, Heart, Trophy, GraduationCap, Users, PlayCircle, Eye } from 'lucide-react';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { PageHeader } from '../../components/shared/PageHeader';
import { Link } from 'react-router-dom';
import { useRequireAuth } from '../../hooks/useRequireAuth';

export const UserCourses = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<any[]>([]);
    const [mostViewed, setMostViewed] = useState<any[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('كل الأقسام');

    const [categories, setCategories] = useState<string[]>(['كل الأقسام']);
    const [stats, setStats] = useState({ students: '...', courses: '...', enrollments: '...' });

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

    const requireAuth = useRequireAuth();

    const toggleFavorite = async (courseId: string) => {
        if (!requireAuth('سجّل دخولك الأول عشان تقدر تضيف كورسات للمفضلة ❤️')) return;

        const isFav = favoriteIds.includes(courseId);
        try {
            if (isFav) {
                await supabase.from('favorites').delete().eq('user_id', user?.id).eq('course_id', courseId);
                setFavoriteIds(prev => prev.filter(id => id !== courseId));
                toast.success('تمت الإزالة من المفضلة');
            } else {
                await supabase.from('favorites').insert([{ user_id: user?.id, course_id: courseId }]);
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
        <PageContainer className="bg-surface-primary" maxWidth="full" noPadding>
            <div dir="rtl">
                <PageHeader
                    badge={
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-black tracking-widest uppercase">
                            <Sparkles className="w-3 h-3" />
                            موسوعة جذور التعليمية
                        </div>
                    }
                    title={
                        <>استكشف <span className="text-brand-primary">الدورات</span></>
                    }
                    description="تعلم الزراعة الحديثة والتقنيات المتطورة من أفضل الخبراء في الوطن العربي."
                    actions={
                        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-6 sm:gap-8 lg:gap-12">
                            {[
                                { value: stats.students, label: 'متعلم', icon: Users, color: 'text-brand-primary' },
                                { value: stats.courses, label: 'دورة', icon: BookOpen, color: 'text-emerald-500' },
                                { value: stats.enrollments, label: 'شهادة', icon: GraduationCap, color: 'text-amber-500' },
                            ].map((stat, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl bg-white border border-border-subtle shadow-sm ${stat.color}`}>
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-lg sm:text-xl font-black text-text-primary leading-none">{stat.value}</div>
                                        <div className="text-[9px] sm:text-[10px] font-bold text-text-muted uppercase tracking-wider">{stat.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    }
                />

                {/* Premium Categories Section */}
                <div className="px-4 sm:px-6 max-w-7xl mx-auto -mt-6 sm:-mt-10 relative z-20">
                    <div className="bg-white/80 backdrop-blur-xl border border-border-subtle rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-6 shadow-2xl shadow-slate-200/50">
                        <div className="flex flex-wrap justify-center gap-3">
                            {categories.map((cat, idx) => {
                                const isActive = selectedCategory === cat;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`relative px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black transition-all duration-300 overflow-hidden ${isActive
                                            ? 'text-white shadow-lg shadow-brand-primary/30 scale-105'
                                            : 'bg-surface-primary text-text-secondary hover:bg-slate-100 hover:text-text-primary hover:shadow-md'
                                            }`}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeCategory"
                                                className="absolute inset-0 bg-brand-primary"
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
                    <div className="py-16 px-6 bg-surface-primary/50 rounded-[2.5rem] mb-12 border border-border-subtle">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex items-center gap-4 mb-10 border-b border-border-default pb-6">
                                <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                                    <Trophy className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-text-primary line-height-none">الأكثر مشاهدة</h2>
                                    <p className="text-text-secondary font-bold">أفضل 5 دورات اختياراً من قبل الطلاب</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                                {mostViewed.map((course, idx) => (
                                    <motion.div
                                        key={course.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-white rounded-[1.5rem] sm:rounded-[2rem] p-3 sm:p-4 border border-border-subtle shadow-sm hover:shadow-xl hover:shadow-brand-primary/10 hover:border-brand-primary/20 transition-all group cursor-pointer"
                                        onClick={() => window.location.href = `/courses/${course.id}`}
                                    >
                                        <div className="relative aspect-video rounded-2xl overflow-hidden mb-4">
                                            <img src={course.thumbnail_url} alt={course.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur rounded-lg text-[10px] font-black text-brand-primary shadow-sm flex items-center gap-1">
                                                <Eye className="w-3 h-3" /> {course.views_count || 0}
                                            </div>
                                        </div>
                                        <h4 className="font-black text-text-primary text-sm line-clamp-2 min-h-[2.5rem] group-hover:text-brand-primary transition-colors">{course.title}</h4>
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
                                <span className="absolute -top-2 -right-2 bg-brand-bg text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-rose-500">
                                    {favoriteIds.length}
                                </span>
                            )}
                        </div>
                    </Link>
                )}

                {/* Courses Grid - Modern UI */}
                <div className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-border-subtle">
                    <div className="flex justify-between items-end mb-10 border-b-2 border-border-subtle pb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shadow-inner">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-black text-text-primary leading-tight">أضيف حديثاً</h2>
                                <p className="text-text-secondary font-bold mt-1 text-sm sm:text-base">أحدث الدورات التي انضمت للمنصة</p>
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <LoadingSpinner size="lg" message="جاري استحضار الدورات..." />
                    ) : filteredCourses.length === 0 ? (
                        <div className="text-center py-32 bg-white rounded-3xl">
                            <div className="w-24 h-24 bg-surface-primary rounded-full flex items-center justify-center mx-auto mb-6">
                                <BookOpen className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-2xl font-black text-text-primary mb-2">لا توجد دورات حالياً</h3>
                            <p className="text-text-secondary font-semibold">لم نجد دورات مطابقة للقسم المختار، جرب تصفح قسم آخر.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
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
                                            className="block bg-white rounded-[2rem] border border-border-subtle overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-400 group"
                                        >
                                            {/* Premium Thumbnail Section */}
                                            <div className="relative h-48 sm:h-64 w-full flex-shrink-0 overflow-hidden bg-slate-100 p-2">
                                                <div className="w-full h-full rounded-2xl overflow-hidden relative">
                                                    {course.thumbnail_url ? (
                                                        <img src={course.thumbnail_url} alt={course.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-brand-primary/10 to-teal-100/50 flex items-center justify-center">
                                                            <BookOpen className="w-16 h-16 text-brand-primary/30" />
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
                                                            className={`w-5 h-5 transition-colors ${favoriteIds.includes(course.id) ? 'text-rose-500 fill-rose-500' : 'text-text-secondary group-hover/fav:text-rose-500'}`}
                                                        />
                                                    </button>

                                                    {/* Sophisticated Gradient Overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />

                                                    {/* Top Right Badges */}
                                                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                                                        {course.is_free && (
                                                            <div className="bg-brand-primary text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md">
                                                                مجاني
                                                            </div>
                                                        )}
                                                        <div className="bg-white/90 text-text-primary text-xs font-black px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md border border-white/50">
                                                            {course.level === 'Beginner' ? 'مبتدئ' : course.level === 'Intermediate' ? 'متوسط' : 'متقدم'}
                                                        </div>
                                                    </div>

                                                    {/* Instructor Floating Name over video */}
                                                    <div className="absolute bottom-4 right-4 left-4 flex items-end justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-lg bg-slate-200 shrink-0">
                                                                <div className="w-full h-full bg-brand-primary/10 flex items-center justify-center">
                                                                    <User className="w-5 h-5 text-brand-primary" />
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
                                                <h3 className="text-lg sm:text-xl font-black text-text-primary line-clamp-2 mb-4 leading-snug group-hover:text-brand-primary transition-colors h-12 sm:h-14">
                                                    {course.title}
                                                </h3>

                                                <div className="flex items-center justify-between text-sm font-bold mt-auto pt-4 border-t border-border-subtle text-text-secondary">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-8 h-8 rounded-full bg-surface-primary flex items-center justify-center">
                                                            <Clock className="w-4 h-4 text-text-muted group-hover:text-brand-primary transition-colors" />
                                                        </span>
                                                        <span>{getTotalLectures(course)} درس فيديو</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-brand-primary bg-brand-primary/10 px-4 py-2 rounded-xl group-hover:bg-brand-primary group-hover:text-white transition-all">
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
        </PageContainer>
    );
};




