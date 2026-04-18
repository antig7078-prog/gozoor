import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, Award, Clock, ArrowLeft, Loader2, PlayCircle } from 'lucide-react';

export const UserDashboard = () => {
    const { user } = useAuth();
    const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
    const [suggestedCourses, setSuggestedCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                // Fetch Enrolled Courses via orders (hypothetical table)
                if (user) {
                    const { data: ordersData, error: ordersError } = await supabase
                        .from('orders')
                        .select('*, courses(*)')
                        .eq('user_id', user.id)
                        .eq('status', 'completed');

                    if (!ordersError && ordersData) {
                        const userCourses = ordersData.map(order => order.courses).filter(Boolean);
                        setEnrolledCourses(userCourses);
                    }
                }

                // Fetch Suggested Courses (Latest 3 currently public)
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

    return (
        <div className="p-6 md:p-10 pt-28 md:pt-28 font-sans" dir="rtl">
            {/* Welcome Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-800 rounded-3xl p-8 md:p-12 mb-10 text-white relative overflow-hidden shadow-xl"
            >
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500 blur-[100px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500 blur-[100px]" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black mb-2">أهلاً بك مرة أخرى، {user?.email?.split('@')[0] || 'طالبنا العزيز'}! 👋</h1>
                        <p className="text-emerald-100 text-lg font-medium">مستعد لمواصلة رحلة التعلم واكتساب مهارات زراعية جديدة اليوم؟</p>
                    </div>
                    <Link
                        to="/courses"
                        className="flex items-center gap-2 px-6 py-3 bg-white text-emerald-800 font-bold rounded-xl shadow-lg hover:bg-emerald-50 transition-colors whitespace-nowrap"
                    >
                        استكشف الدورات <ArrowLeft className="w-5 h-5" />
                    </Link>
                </div>
            </motion.div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                        <BookOpen className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-slate-400 font-bold text-sm">الدورات المسجل بها</p>
                        <h3 className="text-3xl font-black text-slate-800">{enrolledCourses.length}</h3>
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                        <Clock className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-slate-400 font-bold text-sm">ساعات التعلم المنجزة</p>
                        <h3 className="text-3xl font-black text-slate-800">0<span className="text-lg font-bold text-slate-400 ml-1">ساعة</span></h3>
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                        <Award className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-slate-400 font-bold text-sm">الشهادات المكتسبة</p>
                        <h3 className="text-3xl font-black text-slate-800">0</h3>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Enrolled Courses */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-slate-800">مواصلة التعلم</h2>
                    </div>

                    {isLoading ? (
                        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                            <p className="font-bold text-slate-500">جاري تحميل بياناتك...</p>
                        </div>
                    ) : enrolledCourses.length === 0 ? (
                        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <BookOpen className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-2">لست مسجلاً في أي دورة بعد</h3>
                            <p className="text-slate-500 font-semibold mb-6">ابدأ رحلتك باختيار الدورة المناسبة من الكتالوج الخاص بنا.</p>
                            <Link to="/courses" className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-colors">
                                تصفح الدورات المتوفرة
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {enrolledCourses.map((course: any, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow">
                                    <div className="w-full sm:w-48 h-32 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                                        {course.thumbnail_url ? (
                                            <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <BookOpen className="w-10 h-10 text-slate-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col pt-2">
                                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full w-fit mb-2">الدورات المسجلة</span>
                                        <h3 className="text-lg font-black text-slate-900 mb-1">{course.title}</h3>
                                        <p className="text-slate-500 font-semibold text-sm line-clamp-1 mb-4">{course.subtitle || course.description}</p>

                                        <div className="mt-auto">
                                            <div className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                                                <span>نسبة الإنجاز</span>
                                                <span>0%</span>
                                            </div>
                                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full w-[0%]"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex sm:flex-col justify-end sm:justify-center items-center gap-3">
                                        <Link to={`/courses/${course.id}`} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors">
                                            <PlayCircle className="w-6 h-6" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Suggested Courses Area */}
                <div className="lg:col-span-1 space-y-6">
                    <h2 className="text-2xl font-black text-slate-800">اقتراحات لك</h2>

                    {isLoading ? (
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                        </div>
                    ) : suggestedCourses.length > 0 ? (
                        <div className="space-y-4">
                            {suggestedCourses.map(course => (
                                <Link key={course.id} to={`/courses/${course.id}`} className="group block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-200 transition-all">
                                    <div className="h-32 bg-slate-100 relative">
                                        {course.thumbnail_url ? (
                                            <img src={course.thumbnail_url} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <BookOpen className="w-8 h-8" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors"></div>
                                        {course.is_free && (
                                            <span className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-black px-2 py-1 rounded bg-opacity-90">مجاني</span>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-bold text-slate-800 line-clamp-1 mb-1 group-hover:text-emerald-700 transition-colors">{course.title}</h4>
                                        <p className="text-xs text-slate-500 font-semibold mb-3">{course.level === 'Beginner' ? 'للمبتدئين' : course.level === 'Intermediate' ? 'متوسط' : 'متقدم'}</p>
                                        <div className="text-sm font-black text-slate-900">
                                            {course.is_free ? 'تصفح الآن' : `${course.price} جنيهاً`}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                            <p className="text-slate-400 font-semibold text-sm">لا توجد اقتراحات حالياً.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
