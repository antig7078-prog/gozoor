import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const Favorites = () => {
    const [favoriteCourses, setFavoriteCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    const fetchFavorites = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('favorites')
                .select(`
                    course_id,
                    courses (*)
                `)
                .eq('user_id', user.id);

            if (error) throw error;
            setFavoriteCourses(data?.map(f => f.courses) || []);
        } catch (error) {
            console.error('Error fetching favorites:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, [user]);

    const removeFromFavorites = async (courseId: string) => {
        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', user?.id)
            .eq('course_id', courseId);

        if (!error) {
            setFavoriteCourses(prev => prev.filter(c => c.id !== courseId));
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                    <Heart className="w-8 h-8 text-rose-500 fill-rose-500/20" />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-12 px-6 font-sans" dir="rtl">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
                                <Heart className="w-6 h-6 fill-current" />
                            </div>
                            <h1 className="text-3xl font-black text-slate-900">الكورسات المفضلة</h1>
                        </div>
                        <p className="text-slate-500 font-bold">كل الدورات التي قمت بحفظها للرجوع إليها لاحقاً</p>
                    </div>
                    <Link to="/courses" className="flex items-center gap-2 text-indigo-600 font-black hover:gap-3 transition-all">
                        تصفح المزيد من الكورسات
                        <ArrowRight className="w-5 h-5 rotate-180" />
                    </Link>
                </div>

                {favoriteCourses.length === 0 ? (
                    <div className="bg-white rounded-3xl p-20 text-center border border-slate-200 shadow-sm">
                        <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart className="w-12 h-12 text-rose-300" />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 mb-2">قائمة المفضلة فارغة</h2>
                        <p className="text-slate-400 font-bold mb-8">ابدأ بإضافة الكورسات التي تنال إعجابك لتظهر هنا</p>
                        <Link to="/courses" className="inline-flex items-center px-8 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:bg-slate-800 transition-all">
                            اكتشف الكورسات الآن
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {favoriteCourses.map((course) => (
                            <motion.div
                                key={course.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative"
                            >
                                <button
                                    onClick={() => removeFromFavorites(course.id)}
                                    className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-rose-500 shadow-lg hover:scale-110 transition-transform"
                                >
                                    <Heart className="w-5 h-5 fill-current" />
                                </button>

                                <div className="relative aspect-video overflow-hidden">
                                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>

                                <div className="p-8">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-tighter">
                                            {course.category || 'عام'}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 mb-4 line-clamp-2 min-h-[3.5rem] group-hover:text-indigo-600 transition-colors">
                                        {course.title}
                                    </h3>

                                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-indigo-600 font-bold">
                                                {course.instructor_name?.charAt(0) || 'A'}
                                            </div>
                                            <span className="text-sm font-black text-slate-600">{course.instructor_name}</span>
                                        </div>
                                        <Link
                                            to={`/courses/${course.id}`}
                                            className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-300"
                                        >
                                            <PlayCircle className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
