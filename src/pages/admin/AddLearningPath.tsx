import { useState, useEffect } from 'react';
import { courseService } from '../../services/courseService';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    PlusCircle, Map, Save, Send, Trash2, ListChecks, 
    FileText, CheckCircle, Search, BookOpen, ChevronRight,
    GripVertical
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { PageContainer } from '../../components/shared/PageContainer';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { PageHeader } from '../../components/shared/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/shared/Card';

export const AddLearningPath = () => {
    const { id } = useParams();
    const isEditing = !!id;
    const navigate = useNavigate();

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(isEditing);
    const [courses, setCourses] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'Draft',
        thumbnailUrl: '',
    });

    // Selected Courses State
    const [selectedCourses, setSelectedCourses] = useState<any[]>([]);

    useEffect(() => {
        const fetchCourses = async () => {
            const { data } = await courseService.getPublishedCourses();
            if (data) {
                // Sort by title for easier search/selection
                const sorted = [...data].sort((a, b) => a.title.localeCompare(b.title));
                setCourses(sorted);
            }
        };
        fetchCourses();

        if (isEditing) {
            const fetchPath = async () => {
                const { data: path, error } = await courseService.getLearningPathById(id);
                
                if (error) {
                    toast.error('حدث خطأ في تحميل بيانات المسار.');
                    navigate('/admin/learning-paths');
                    return;
                }

                setFormData({
                    title: path.title || '',
                    description: path.description || '',
                    status: path.status || 'Draft',
                    thumbnailUrl: path.thumbnail_url || '',
                });

                if (path.learning_path_courses) {
                    const sortedCourses = path.learning_path_courses
                        .sort((a: any, b: any) => a.sort_order - b.sort_order)
                        .map((lpc: any) => lpc.courses);
                    setSelectedCourses(sortedCourses);
                }
                setIsLoading(false);
            };
            fetchPath();
        }
    }, [id, isEditing, navigate]);

    const handleSave = async (status = 'Draft') => {
        if (!formData.title) {
            toast.error('عنوان المسار مطلوب!');
            return;
        }

        if (selectedCourses.length === 0) {
            toast.error('يجب اختيار كورس واحد على الأقل للمسار!');
            return;
        }

        setIsSaving(true);
        try {
            const pathPayload = {
                title: formData.title,
                description: formData.description,
                status: status,
                thumbnail_url: formData.thumbnailUrl,
            };

            const { error } = await courseService.saveLearningPath(id, pathPayload, selectedCourses);
            if (error) throw new Error(error);

            toast.success(status === 'Published' ? 'تم نشر المسار بنجاح!' : 'تم حفظ المسودة بنجاح!');
            navigate('/admin/learning-paths');
        } catch (error: any) {
            toast.error('حدث خطأ أثناء الحفظ: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const toggleCourseSelection = (course: any) => {
        if (selectedCourses.some(c => c.id === course.id)) {
            setSelectedCourses(selectedCourses.filter(c => c.id !== course.id));
        } else {
            setSelectedCourses([...selectedCourses, course]);
        }
    };

    const filteredAvailableCourses = courses.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !selectedCourses.some(sc => sc.id === c.id)
    );

    if (isLoading) {
        return <LoadingSpinner fullPage message="جاري تحميل بيانات المسار..." />;
    }

    return (
        <PageContainer maxWidth="xl">
            <PageHeader
                title={isEditing ? 'تعديل مسار التعلم' : 'إنشاء مسار تعلم جديد'}
                description="صمم رحلة تعليمية متكاملة لطلابك من خلال تجميع مجموعة من الكورسات المترابطة."
                icon={Map}
                actions={
                    <div className="flex gap-4">
                        <Button variant="secondary" onClick={() => handleSave('Draft')} disabled={isSaving}>
                            <Save className="w-5 h-5 ml-2" />
                            حفظ مسودة
                        </Button>
                        <Button variant="primary" onClick={() => handleSave('Published')} disabled={isSaving}>
                            {isSaving ? <LoadingSpinner size={20} color="text-white" /> : <Send className="w-5 h-5 ml-2" />}
                            نشر المسار
                        </Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-700">عنوان المسار التعليمي *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="مثال: دبلومة الزراعة المائية المتكاملة"
                                className="w-full px-6 py-4 bg-surface-primary border border-border-default rounded-2xl font-bold focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-700">وصف المسار</label>
                            <textarea
                                rows={4}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="اشرح للطلاب ماذا سيتعلمون في هذا المسار وكيف سيؤهلهم لسوق العمل..."
                                className="w-full px-6 py-4 bg-surface-primary border border-border-default rounded-2xl font-bold focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all resize-none"
                            />
                        </div>
                    </Card>

                    {/* Selected Courses Section */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-black text-text-primary flex items-center gap-2">
                            <ListChecks className="w-6 h-6 text-brand-primary" />
                            الكورسات المختارة في المسار ({selectedCourses.length})
                        </h3>
                        
                        <div className="space-y-4">
                            {selectedCourses.length > 0 ? (
                                selectedCourses.map((course, index) => (
                                    <motion.div 
                                        layout
                                        key={course.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white border border-border-default p-4 rounded-2xl flex items-center gap-4 group"
                                    >
                                        <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 cursor-move">
                                            <GripVertical className="w-5 h-5" />
                                        </div>
                                        <span className="w-8 h-8 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center font-black text-sm">
                                            {index + 1}
                                        </span>
                                        <div className="flex-1">
                                            <h4 className="font-black text-text-primary">{course.title}</h4>
                                            <p className="text-xs text-text-muted font-bold">{course.category}</p>
                                        </div>
                                        <button 
                                            onClick={() => toggleCourseSelection(course)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="p-12 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400">
                                    <p className="font-bold italic">لم يتم اختيار أي كورسات بعد</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar - Course Picker */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-black text-text-primary mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-brand-primary" />
                            اختر الكورسات
                        </h3>
                        
                        <div className="relative mb-6">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="ابحث عن كورس..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pr-10 pl-4 py-3 bg-surface-primary border border-border-default rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {filteredAvailableCourses.map(course => (
                                <div 
                                    key={course.id}
                                    onClick={() => toggleCourseSelection(course)}
                                    className="p-3 bg-surface-primary border border-border-subtle rounded-xl cursor-pointer hover:border-brand-primary hover:bg-brand-primary/5 transition-all group"
                                >
                                    <h4 className="text-sm font-black text-text-primary group-hover:text-brand-primary transition-colors">{course.title}</h4>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-[10px] font-bold text-text-muted">{course.category}</span>
                                        <PlusCircle className="w-4 h-4 text-slate-300 group-hover:text-brand-primary transition-all" />
                                    </div>
                                </div>
                            ))}
                            {filteredAvailableCourses.length === 0 && (
                                <p className="text-center text-xs text-text-muted font-bold py-4">لا توجد نتائج مطابقة</p>
                            )}
                        </div>
                    </Card>

                    <div className="bg-brand-bg rounded-[2rem] p-6 text-white space-y-4">
                        <h4 className="font-black flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-brand-primary-light" />
                            نصيحة للإدارة
                        </h4>
                        <p className="text-xs font-bold leading-relaxed text-slate-200">
                            احرص على أن تكون الكورسات في المسار الواحد متدرجة في الصعوبة، وتبدأ بمقدمات قوية تمهد الطريق للمحتوى المتقدم.
                        </p>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};
