import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, Edit2, Trash2, PlayCircle, Lock, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ConfirmModal } from '../../components/shared/ConfirmModal';
import { PageContainer } from '../../components/shared/PageContainer';
import { PageHeader } from '../../components/shared/PageHeader';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { SearchBar } from '../../components/shared/SearchBar';
import { EmptyState } from '../../components/shared/EmptyState';
import type { Course } from '../../types';

export const AdminCourses = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        courseId: string;
        courseTitle: string;
    }>({
        isOpen: false,
        courseId: '',
        courseTitle: ''
    });

    const fetchCourses = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            toast.error('حدث خطأ أثناء جلب الدورات: ' + error.message);
        } else {
            setCourses((data as Course[]) || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleDelete = async () => {
        if (!confirmConfig.courseId) return;
        
        setIsActionLoading(true);
        try {
            const { error } = await supabase.from('courses').delete().eq('id', confirmConfig.courseId);
            if (error) throw error;
            
            toast.success('تم حذف الدورة بنجاح!');
            setCourses(courses.filter((course) => course.id !== confirmConfig.courseId));
            setConfirmConfig({ isOpen: false, courseId: '', courseTitle: '' });
        } catch (error: any) {
            toast.error('فشل عملية الحذف: ' + error.message);
        } finally {
            setIsActionLoading(false);
        }
    };

    const filteredCourses = courses.filter((course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <PageContainer maxWidth="xl" noPadding>
            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={() => !isActionLoading && setConfirmConfig({ ...confirmConfig, isOpen: false })}
                onConfirm={handleDelete}
                title="حذف الدورة التعليمية"
                message={`هل أنت متأكد من حذف دورة "${confirmConfig.courseTitle}"؟ لا يمكن التراجع عن هذا الإجراء وسيتم مسح كافة البيانات المرتبطة بها.`}
                isLoading={isActionLoading}
                confirmText="حذف الدورة"
            />
            <PageHeader
                title="إدارة الدورات التعليمية"
                description={`تمتلك إجمالي ${courses.length} دورة مسجلة في المنصة.`}
                icon={BookOpen}
                actions={
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <SearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="ابحث عن دورة..."
                            showFilter={false}
                        />
                        <Link
                            to="/admin/courses/new"
                            className="btn-premium flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-primary text-white font-bold rounded-button shadow-lg shadow-brand-primary/20 hover:bg-brand-primary-hover transition-all whitespace-nowrap"
                        >
                            <Plus className="w-5 h-5" />
                            إضافة دورة
                        </Link>
                    </div>
                }
            />

            {/* Courses List */}
            <div className="bg-white rounded-card border border-border-default shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="py-20">
                        <LoadingSpinner size="lg" message="جاري تحميل الدورات..." />
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="p-12">
                        <EmptyState
                            icon={BookOpen}
                            title="لا توجد دورات هنا!"
                            message={searchQuery ? "لم نتمكن من العثور على نتائج لبحثك." : "لم تقم بإضافة أي دورات بعد."}
                            className="border-none shadow-none"
                            action={
                                !searchQuery && (
                                    <Link to="/admin/courses/new" className="btn-premium inline-flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white font-bold rounded-button shadow-lg shadow-brand-primary/20 hover:bg-brand-primary-hover transition-all">
                                        <Plus className="w-5 h-5" />
                                        إضافة أول دورة
                                    </Link>
                                )
                            }
                        />
                    </div>
                ) : (
                    <div className="responsive-table-container overflow-x-auto hide-scrollbar">
                        <table className="w-full text-right border-collapse min-w-[800px]">
                            <thead className="bg-surface-primary/80 border-b border-border-default">
                                <tr>
                                    <th className="px-6 py-4 text-sm font-black text-text-secondary">الدورة التعليمية</th>
                                    <th className="px-6 py-4 text-sm font-black text-text-secondary">المستوى</th>
                                    <th className="px-6 py-4 text-sm font-black text-text-secondary">الحالة / الوصول</th>
                                    <th className="px-6 py-4 text-sm font-black text-text-secondary">السعر</th>
                                    <th className="px-6 py-4 text-sm font-black text-text-secondary">تاريخ الإضافة</th>
                                    <th className="px-6 py-4 text-sm font-black text-text-secondary text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredCourses.map((course, idx) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={course.id}
                                        className="hover:bg-brand-primary-light/30 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-bold text-text-primary flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-button bg-slate-100 border border-border-default flex items-center justify-center">
                                                <PlayCircle className="w-5 h-5 text-text-muted" />
                                            </div>
                                            {course.title}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-text-secondary">
                                            {course.level}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <span
                                                    className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold rounded-button w-fit
                                                        ${course.status === 'Published' ? 'bg-brand-primary-light text-brand-primary' : 'bg-amber-100 text-amber-700'}
                                                    `}
                                                >
                                                    {course.status === 'Published' ? 'منشورة' : 'مسودة'}
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary">
                                                    {course.visibility === 'Public' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                                    {course.visibility === 'Public' ? 'عامة للجميع' : 'مخفية / خاصة'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-700">
                                            {course.is_free ? (
                                                <span className="text-brand-primary bg-brand-primary-light px-2 py-1 rounded-button text-xs">مجانية</span>
                                            ) : (
                                                `${course.price} ج.م`
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-text-secondary">
                                            {new Date(course.created_at).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    to={`/admin/courses/edit/${course.id}`}
                                                    className="p-2 text-text-muted hover:text-blue-600 hover:bg-blue-50 rounded-button transition-colors"
                                                    title="تعديل"
                                                    aria-label={`تعديل الدورة ${course.title}`}
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </Link>
                                                <button
                                                    onClick={() => setConfirmConfig({ isOpen: true, courseId: course.id, courseTitle: course.title })}
                                                    className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-button transition-colors"
                                                    title="حذف"
                                                    aria-label={`حذف الدورة ${course.title}`}
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
        </PageContainer>
    );
};




