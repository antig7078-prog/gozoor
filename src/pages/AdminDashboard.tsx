import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Activity, BookOpen, GraduationCap, TrendingUp, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const AdminDashboard = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);

            // Fetch total courses count
            const { count: cCount } = await supabase.from('courses').select('*', { count: 'exact', head: true });

            // Fetch total students (role = user)
            const { count: uCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user');

            // Fetch total enrollments (future use)
            await supabase.from('enrollments').select('*', { count: 'exact', head: true });

            // Fetch free materials count
            const { count: fCount } = await supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_free', true);

            setStatsData({
                courses: cCount || 0,
                students: uCount || 0,
                allUsers: (uCount || 0) + 1, // +1 for the admin usually
                free: fCount || 0
            });

            setIsLoading(false);
        };

        fetchStats();
    }, []);

    const [statsData, setStatsData] = useState({ courses: 0, students: 0, allUsers: 0, free: 0 });

    const stats = [
        { title: 'إجمالي الدورات', value: isLoading ? '...' : statsData.courses.toString(), icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' },
        { title: 'الطلاب المسجلين', value: isLoading ? '...' : statsData.students.toString(), icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
        { title: 'إجمالي المستخدمين', value: isLoading ? '...' : statsData.allUsers.toString(), icon: Users, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' },
        { title: 'مواد مجانية', value: isLoading ? '...' : statsData.free.toString(), icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
    ];

    return (
        <div className="max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10"
            >
                <h1 className="text-3xl font-black text-slate-900 mb-2">نظرة عامة على المنصة</h1>
                <p className="text-slate-500 font-medium">مرحباً بعودتك! بيانات لوحة تحكم جذور يتم سحبها الآن من قاعدة البيانات المباشرة.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 text-sm font-bold mb-2">{stat.title}</p>
                                <h3 className="text-3xl font-black text-slate-800">
                                    {isLoading && i === 0 ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : stat.value}
                                </h3>
                            </div>
                            <div className={`p-4 rounded-xl ${stat.bg} ${stat.border} border`}>
                                <stat.icon className={`w-7 h-7 ${stat.color}`} />
                            </div>
                        </div>
                        {/* Subtle decorative accent */}
                        <div className={`absolute -bottom-4 -left-4 w-20 h-20 rounded-full ${stat.bg} opacity-50 blur-2xl`}></div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm lg:col-span-2 min-h-[400px] flex items-center justify-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-slate-50/50 pointer-events-none"></div>
                    <div className="text-center text-slate-400 relative z-10">
                        <Activity className="w-16 h-16 mx-auto mb-4 text-emerald-200" />
                        <p className="font-semibold">لا يوجد بيانات كافية لرسم بياني بعد</p>
                        <p className="text-sm mt-1">بانتظار تفاعل المستخدمين مع المنصة</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm min-h-[400px]"
                >
                    <h3 className="font-bold text-slate-800 text-lg mb-6">ملاحظات النظام</h3>

                    <div className="space-y-6">
                        <div className="flex gap-4 items-start">
                            <div className="relative mt-1">
                                <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-slate-100"></div>
                                <div className="absolute top-4 bottom-[-24px] left-1/2 w-0.5 bg-slate-100 -translate-x-1/2"></div>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">قاعدة البيانات</p>
                                <p className="text-xs font-semibold text-slate-500 mt-0.5">تم ربط قاعدة Supabase بنجاح مع جدول الكورسات</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
