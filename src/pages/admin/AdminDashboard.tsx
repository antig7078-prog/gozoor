import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Activity, BookOpen, GraduationCap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

import { PageContainer } from '../../components/shared/PageContainer';
import { PageHeader } from '../../components/shared/PageHeader';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';

export const AdminDashboard = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);

            // Fetch total courses count
            const { count: cCount } = await supabase.from('courses').select('*', { count: 'exact', head: true });

            // Fetch total students (role = user)
            const { count: uCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user');

            // Fetch total enrollments
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
        { title: 'إجمالي الدورات', value: isLoading ? '...' : statsData.courses.toString(), icon: BookOpen, color: 'text-brand-primary', bg: 'bg-brand-primary-light', border: 'border-brand-primary-light' },
        { title: 'الطلاب المسجلين', value: isLoading ? '...' : statsData.students.toString(), icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
        { title: 'إجمالي المستخدمين', value: isLoading ? '...' : statsData.allUsers.toString(), icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
        { title: 'مواد مجانية', value: isLoading ? '...' : statsData.free.toString(), icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    ];

    return (
        <PageContainer maxWidth="xl" noPadding>
            <PageHeader
                title="نظرة عامة على المنصة"
                description="مرحباً بعودتك! بيانات لوحة تحكم جذور يتم سحبها الآن من قاعدة البيانات المباشرة."
                icon={Activity}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white border border-border-default rounded-card p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-text-secondary text-sm font-bold mb-2">{stat.title}</p>
                                <h3 className="text-3xl font-black text-text-primary">
                                    {isLoading && i === 0 ? <LoadingSpinner size="sm" /> : stat.value}
                                </h3>
                            </div>
                            <div className={`p-4 rounded-button ${stat.bg} ${stat.border} border`}>
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
                    className="bg-white border border-border-default rounded-card p-8 shadow-sm lg:col-span-2 min-h-[400px] flex items-center justify-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-surface-primary/50 pointer-events-none"></div>
                    <div className="text-center text-text-muted relative z-10">
                        <Activity className="w-16 h-16 mx-auto mb-4 text-brand-primary/20" />
                        <p className="font-semibold">لا يوجد بيانات كافية لرسم بياني بعد</p>
                        <p className="text-sm mt-1">بانتظار تفاعل المستخدمين مع المنصة</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white border border-border-default rounded-card p-8 shadow-sm min-h-[400px]"
                >
                    <h3 className="font-bold text-text-primary text-lg mb-6">ملاحظات النظام</h3>

                    <div className="space-y-6">
                        <div className="flex gap-4 items-start">
                            <div className="relative mt-1">
                                <div className="w-3 h-3 rounded-full bg-brand-primary ring-4 ring-slate-100"></div>
                                <div className="absolute top-4 bottom-[-24px] left-1/2 w-0.5 bg-slate-100 -translate-x-1/2"></div>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-text-primary">قاعدة البيانات</p>
                                <p className="text-xs font-semibold text-text-secondary mt-0.5">تم ربط قاعدة Supabase بنجاح مع جدول الكورسات</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </PageContainer>
    );
};




