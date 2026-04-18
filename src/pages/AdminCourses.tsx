import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, Search, Edit2, Trash2, Loader2, PlayCircle, Lock, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface Course {
    id: string;
    title: string;
    level: string;
    status: string;
    visibility: string;
    price: number;
    is_free: boolean;
    created_at: string;
}

export const AdminCourses = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchCourses = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            toast.error('حدث خطأ أثناء جلب الدورات: ' + error.message);
        } else {
            setCourses(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm('هل أنت متأكد أنك تريد حذف هذه الدورة؟ لن يمكنك التراجع عن هذا الإجراء.')) {
            const { error } = await supabase.from('courses').delete().eq('id', id);
            if (error) {
                toast.error('فشل عملية الحذف: ' + error.message);
            } else {
                toast.success('تم حذف الدورة بنجاح!');
                setCourses(courses.filter((course) => course.id !== id));
            }
        }
    };

    const filteredCourses = courses.filter((course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto" dir="rtl">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-emerald-600" />
                        إدارة الدورات التعليمية
                    </h1>
                    <p className="text-slate-500 font-semibold mt-2">
                        تمتلك إجمالي {courses.length} دورة مسجلة في المنصة.
                    </p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="ابحث عن دورة..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20"
                        />
                    </div>
                    <Link
                        to="/admin/courses/new"
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        إضافة دورة
                    </Link>
                </div>
            </div>

            {/* Courses List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
                        <p className="font-semibold text-lg">جاري تحميل الدورات...</p>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                        <BookOpen className="w-16 h-16 text-slate-200 mb-4" />
                        <p className="text-xl font-bold mb-2">لا توجد دورات هنا!</p>
                        <p className="text-sm">لم تقم بإضافة أي دورات بعد، أو لم نتمكن من العثور على ما تبحث عنه.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead className="bg-slate-50/80 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-sm font-black text-slate-600">الدورة التعليمية</th>
                                    <th className="px-6 py-4 text-sm font-black text-slate-600">المستوى</th>
                                    <th className="px-6 py-4 text-sm font-black text-slate-600">الحالة / الوصول</th>
                                    <th className="px-6 py-4 text-sm font-black text-slate-600">السعر</th>
                                    <th className="px-6 py-4 text-sm font-black text-slate-600">تاريخ الإضافة</th>
                                    <th className="px-6 py-4 text-sm font-black text-slate-600 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredCourses.map((course, idx) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={course.id}
                                        className="hover:bg-emerald-50/30 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                                                <PlayCircle className="w-5 h-5 text-slate-400" />
                                            </div>
                                            {course.title}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                                            {course.level}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <span
                                                    className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold rounded-md w-fit
                            ${course.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}
                          `}
                                                >
                                                    {course.status === 'Published' ? 'منشورة' : 'مسودة'}
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                                                    {course.visibility === 'Public' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                                    {course.visibility === 'Public' ? 'عامة للجميع' : 'مخفية / خاصة'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-700">
                                            {course.is_free ? (
                                                <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs">مجانية</span>
                                            ) : (
                                                `${course.price} ج.م`
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-500">
                                            {new Date(course.created_at).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    to={`/admin/courses/edit/${course.id}`}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="تعديل"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(course.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="حذف"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
