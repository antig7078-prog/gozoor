import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, PlayCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const MyCourses = () => {
    const { user } = useAuth();
    const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            if (!user) return;
            try {
                // Fetch enrollments
                const { data, error } = await supabase
                    .from('enrollments')
                    .select('*, courses(*)')
                    .eq('user_id', user.id);

                if (error) {
                    console.error('Error fetching enrollments:', error);
                } else if (data) {
                    const courses = data.map(e => e.courses).filter(Boolean);

                    // Allow unique courses
                    const uniqueCourses = Array.from(new Map(courses.map(item => [item.id, item])).values());
                    setEnrolledCourses(uniqueCourses);
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
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
                <p className="text-slate-500 font-medium animate-pulse">جاري استرجاع دوراتك...</p>
            </div>
        );
    }

    return (
        <div className="font-sans" dir="rtl">
            <div className="flex items-center gap-3 mb-10 border-b border-slate-200 pb-6">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                    <BookOpen className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-900">دوراتي التعليمية</h1>
                    <p className="text-slate-500 font-bold mt-1">تابع تقدمك في الدورات المشترك بها</p>
                </div>
            </div>

            {enrolledCourses.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">لم تسجل في أي دورة بعد</h3>
                    <p className="text-slate-500 font-semibold mb-6">اكتشف دوراتنا وابدأ رحلة التعلم اليوم.</p>
                    <Link to="/courses" className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition">
                        استكشف الدورات
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrolledCourses.map((course, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={course.id}
                            className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group"
                        >
                            <div className="h-48 relative overflow-hidden bg-slate-100">
                                {course.thumbnail_url ? (
                                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <BookOpen className="w-12 h-12 text-slate-300" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-black text-slate-800 mb-2 line-clamp-2">{course.title}</h3>
                                <p className="text-slate-500 text-sm font-semibold mb-6 line-clamp-1">{course.subtitle || course.description}</p>

                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-sm font-bold text-slate-700">
                                        <span>نسبة الإنجاز</span>
                                        <span>0%</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full w-[0%]"></div>
                                    </div>
                                </div>

                                <Link
                                    to={`/courses/${course.id}`}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl font-bold transition-colors"
                                >
                                    <PlayCircle className="w-5 h-5" />
                                    متابعة التعلم
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};
