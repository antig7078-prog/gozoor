import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import {
    PlusCircle, CheckCircle, Video, FileText, File, ListChecks,
    ImageIcon, GripVertical, CreditCard, Sliders, PlayCircle, Save, Send, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { PageContainer } from '../../components/shared/PageContainer';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { PageHeader } from '../../components/shared/PageHeader';

export const AddCourse = () => {
    const { id } = useParams();
    const isEditing = !!id;
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('basic');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(isEditing);
    const [categories, setCategories] = useState<any[]>([]);
    const [uploadingState, setUploadingState] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        description: '',
        language: 'العربية',
        level: 'Beginner',
        category: '',
        instructorName: '',
        isFree: false,
        price: 0,
        status: 'Draft',
        visibility: 'Public',
        thumbnailUrl: '',
        introVideoUrl: '',
    });

    // Curriculum State
    const [sections, setSections] = useState<any[]>([
        {
            id: Date.now(),
            title: 'مقدمة الدورة',
            lectures: [
                { id: Date.now() + 1, title: 'الترحيب بالمتدربين', type: 'Video', isFreePreview: true, videoUrl: '', textContent: '', fileUrl: '' }
            ]
        }
    ]);

    const handleFileUpload = async (file: File, pathIdentifier: string): Promise<string | null> => {
        try {
            setUploadingState(pathIdentifier);
            const toastId = toast.loading('جاري رفع الملف...', { id: 'upload' });

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
            const filePath = `uploads/${fileName}`;

            const { error } = await supabase.storage
                .from('course-content')
                .upload(filePath, file, { cacheControl: '3600', upsert: false });

            if (error) throw error;

            const { data: publicUrlData } = supabase.storage
                .from('course-content')
                .getPublicUrl(filePath);

            toast.success('تم الرفع بنجاح!', { id: 'upload' });
            return publicUrlData.publicUrl;
        } catch (error: any) {
            toast.error('حدث خطأ أثناء الرفع!', { id: 'upload' });
            console.error(error);
            return null;
        } finally {
            setUploadingState(null);
        }
    };

    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase.from('categories').select('*').order('name');
            if (data) setCategories(data);
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (isEditing) {
            const fetchCourse = async () => {
                const { data: course, error } = await supabase.from('courses').select('*').eq('id', id).single();
                if (error) {
                    toast.error('حدث خطأ في تحميل بيانات الكورس.');
                    navigate('/admin/courses');
                    return;
                }

                setFormData({
                    title: course.title || '',
                    subtitle: course.subtitle || '',
                    description: course.description || '',
                    language: course.language || 'العربية',
                    level: course.level || 'Beginner',
                    category: course.category || '',
                    instructorName: course.instructor_name || '',
                    isFree: course.is_free || false,
                    price: course.price || 0,
                    status: course.status || 'Draft',
                    visibility: course.visibility || 'Public',
                    thumbnailUrl: course.thumbnail_url || '',
                    introVideoUrl: course.intro_video_url || '',
                });

                const { data: fetchSections, error: sectionsError } = await supabase
                    .from('course_sections')
                    .select('*, course_lectures(*)')
                    .eq('course_id', id)
                    .order('sort_order', { ascending: true });

                if (!sectionsError && fetchSections && fetchSections.length > 0) {
                    const formattedSections = fetchSections.map(sec => ({
                        id: sec.id,
                        title: sec.title,
                        lectures: sec.course_lectures.sort((a: any, b: any) => a.sort_order - b.sort_order).map((lec: any) => ({
                            id: lec.id,
                            title: lec.title,
                            type: lec.lecture_type,
                            isFreePreview: lec.is_free_preview,
                            videoUrl: lec.video_url || '',
                            fileUrl: lec.file_url || '',
                            textContent: lec.text_content || ''
                        }))
                    }));
                    setSections(formattedSections);
                }

                setIsLoading(false);
            };
            fetchCourse();
        }
    }, [id, isEditing, navigate]);

    const handleSave = async (status = 'Draft') => {
        if (!formData.title) {
            toast.error('عنوان الدورة مطلوب!');
            return;
        }

        setIsSaving(true);
        let currentCourseId = id;

        try {
            const coursePayload = {
                title: formData.title,
                subtitle: formData.subtitle,
                description: formData.description,
                level: formData.level,
                language: formData.language,
                category: formData.category,
                instructor_name: formData.instructorName,
                is_free: formData.isFree,
                price: formData.price,
                status: status,
                visibility: formData.visibility,
                thumbnail_url: formData.thumbnailUrl,
                intro_video_url: formData.introVideoUrl,
            };

            if (isEditing) {
                const { error } = await supabase
                    .from('courses')
                    .update(coursePayload)
                    .eq('id', id);
                if (error) throw error;
            } else {
                const { data, error } = await supabase
                    .from('courses')
                    .insert([coursePayload])
                    .select()
                    .single();
                if (error) throw error;
                currentCourseId = data.id;
            }

            if (currentCourseId) {
                if (isEditing) {
                    await supabase.from('course_sections').delete().eq('course_id', currentCourseId);
                }

                for (let i = 0; i < sections.length; i++) {
                    const sec = sections[i];
                    const { data: newSec, error: secErr } = await supabase
                        .from('course_sections')
                        .insert({ course_id: currentCourseId, title: sec.title, sort_order: i })
                        .select()
                        .single();

                    if (secErr || !newSec) continue;

                    const lecturesToInsert = sec.lectures.map((l: any, lIdx: number) => ({
                        section_id: newSec.id,
                        title: l.title,
                        lecture_type: l.type,
                        is_free_preview: l.is_free_preview,
                        video_url: l.video_url || null,
                        file_url: l.file_url || null,
                        text_content: l.textContent || null,
                        sort_order: lIdx
                    }));

                    if (lecturesToInsert.length > 0) {
                        await supabase.from('course_lectures').insert(lecturesToInsert);
                    }
                }
            }

            toast.success(status === 'Published' ? 'تم نشر الدورة بنجاح!' : 'تم حفظ المسودة بنجاح!');
            navigate('/admin/courses');
        } catch (error: any) {
            toast.error('حدث خطأ أثناء الحفظ: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const addSection = () => {
        setSections([...sections, { id: Date.now(), title: 'قسم جديد', lectures: [] }]);
    };

    const deleteSection = (sectionId: number) => {
        setSections(sections.filter(sec => sec.id !== sectionId));
    };

    const addLecture = (sectionId: number, type: string) => {
        setSections(sections.map(sec => {
            if (sec.id === sectionId) {
                return {
                    ...sec,
                    lectures: [...sec.lectures, { id: Date.now(), title: 'درس جديد', type, isFreePreview: false, videoUrl: '', fileUrl: '', textContent: '' }]
                };
            }
            return sec;
        }));
    };

    const deleteLecture = (sectionId: number, lectureId: number) => {
        setSections(sections.map(sec => {
            if (sec.id === sectionId) {
                return {
                    ...sec,
                    lectures: sec.lectures.filter((l: any) => l.id !== lectureId)
                };
            }
            return sec;
        }));
    };

    const updateLecture = (sectionId: number, lectureId: number, field: string, value: any) => {
        setSections(sections.map(sec => {
            if (sec.id === sectionId) {
                return {
                    ...sec,
                    lectures: sec.lectures.map((l: any) => {
                        if (l.id === lectureId) return { ...l, [field]: value };
                        return l;
                    })
                };
            }
            return sec;
        }));
    };

    if (isLoading) {
        return <LoadingSpinner fullPage message="جاري تحميل بيانات الدورة..." />;
    }

    const tabs = [
        { id: 'basic', label: 'المعلومات الأساسية', icon: FileText },
        { id: 'curriculum', label: 'المحتوى العلمي', icon: ListChecks },
        { id: 'pricing', label: 'التسعير والعروض', icon: CreditCard },
        { id: 'settings', label: 'إعدادات إضافية', icon: Sliders },
    ];

    return (
        <PageContainer maxWidth="xl" noPadding>
            <PageHeader
                title={isEditing ? 'تعديل الدورة التعليمية' : 'إضافة دورة جديدة'}
                description={isEditing ? 'تعديل بيانات الدورة والمحتوى العلمي.' : 'قم بتجهيز دورتك التعليمية الزراعية الجديدة.'}
                icon={PlusCircle}
                actions={
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
                        <button
                            onClick={() => handleSave('Draft')}
                            disabled={isSaving}
                            className="px-6 py-3 bg-white border border-border-default text-slate-700 rounded-[var(--radius-button)] font-black hover:bg-surface-primary transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                            <Save className="w-5 h-5" />
                            <span>حفظ كمسودة</span>
                        </button>
                        <button
                            onClick={() => handleSave('Published')}
                            disabled={isSaving}
                            className="px-8 py-3 bg-brand-primary text-white rounded-[var(--radius-button)] font-black hover:bg-brand-primary-hover shadow-lg shadow-brand-primary/20 transition-all flex items-center justify-center gap-2"
                        >
                            {isSaving ? <LoadingSpinner size={20} color="text-white" /> : <Send className="w-5 h-5" />}
                            <span>{isEditing ? 'حفظ التعديلات' : 'نشر الدورة'}</span>
                        </button>
                    </div>
                }
            />

            <div className="bg-white rounded-[var(--radius-card)] border border-border-default shadow-sm flex flex-col md:flex-row overflow-hidden min-h-[750px]">
                {/* Tab Navigation - Responsive: Sidebar on MD+, Horizontal Scroll on Mobile */}
                <div className="w-full md:w-80 bg-surface-primary/50 border-b md:border-b-0 md:border-l border-border-default p-4 md:p-6 flex md:flex-col gap-2 overflow-x-auto hide-scrollbar whitespace-nowrap">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex items-center gap-3 md:gap-4 px-5 md:px-6 py-3 md:py-4 rounded-[var(--radius-button)] text-sm font-black transition-all duration-300 flex-shrink-0 md:w-full
                                ${activeTab === tab.id
                                    ? 'bg-white shadow-md border border-border-default text-brand-primary'
                                    : 'text-text-secondary hover:bg-slate-100/80 border border-transparent'}
                            `}
                        >
                            <tab.icon className={`w-5 h-5 flex-shrink-0 ${activeTab === tab.id ? 'text-brand-primary' : 'text-text-muted'}`} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Form Content Area */}
                <div className="flex-1 p-6 md:p-12 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {activeTab === 'basic' && (
                            <motion.div
                                key="basic"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-3xl space-y-10"
                            >
                                <div>
                                    <h2 className="text-xl md:text-2xl font-black text-text-primary border-b-2 border-brand-primary-light pb-4 mb-6 md:mb-10">التفاصيل الأساسية</h2>
                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-slate-700">عنوان الدورة *</label>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                placeholder="مثال: الدورة الشاملة في زراعة القمح"
                                                className="w-full px-6 py-4 bg-surface-primary border border-border-default rounded-[var(--radius-button)] font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all placeholder-slate-400"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-slate-700">عنوان فرعي</label>
                                            <input
                                                type="text"
                                                value={formData.subtitle}
                                                onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                                                placeholder="نبذة مختصرة عما تقدمه الدورة..."
                                                className="w-full px-6 py-4 bg-surface-primary border border-border-default rounded-[var(--radius-button)] font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all placeholder-slate-400"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-slate-700">وصف الدورة التفصيلي</label>
                                            <textarea
                                                rows={6}
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="ماذا سيتعلم الطالب؟ وما هي المخرجات المتوقعة من الدورة..."
                                                className="w-full px-6 py-4 bg-surface-primary border border-border-default rounded-[var(--radius-button)] font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all placeholder-slate-400 resize-none"
                                            ></textarea>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-700">المستوى</label>
                                                <select
                                                    value={formData.level}
                                                    onChange={e => setFormData({ ...formData, level: e.target.value })}
                                                    className="w-full px-6 py-4 bg-surface-primary border border-border-default rounded-[var(--radius-button)] font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary"
                                                >
                                                    <option value="Beginner">مبتدئ</option>
                                                    <option value="Intermediate">متوسط</option>
                                                    <option value="Advanced">متقدم</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-700">التصنيف</label>
                                                <select
                                                    value={formData.category}
                                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                    className="w-full px-6 py-4 bg-surface-primary border border-border-default rounded-[var(--radius-button)] font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary"
                                                >
                                                    <option value="">اختر القسم...</option>
                                                    {categories.map(cat => (
                                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-700">اسم المحاضر</label>
                                                <input
                                                    type="text"
                                                    value={formData.instructorName}
                                                    onChange={e => setFormData({ ...formData, instructorName: e.target.value })}
                                                    placeholder="اسم مقدم الدورة..."
                                                    className="w-full px-6 py-4 bg-surface-primary border border-border-default rounded-[var(--radius-button)] font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-700">لغة الدورة</label>
                                                <select
                                                    value={formData.language}
                                                    onChange={e => setFormData({ ...formData, language: e.target.value })}
                                                    className="w-full px-6 py-4 bg-surface-primary border border-border-default rounded-[var(--radius-button)] font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary"
                                                >
                                                    <option>العربية</option>
                                                    <option>الإنجليزية</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-10">
                                    <h2 className="text-2xl font-black text-text-primary border-b-2 border-brand-primary-light pb-4 mb-8">الوسائط المرئية</h2>
                                    <div className="flex flex-col md:flex-row gap-8">
                                        <div className="flex-1 space-y-4 p-6 border border-border-subtle rounded-[var(--radius-card)] bg-surface-primary/30">
                                            <label className="text-sm font-black text-slate-700">صورة الغلاف</label>
                                            <div className="relative border-2 border-dashed border-border-default bg-white rounded-[var(--radius-button)] p-8 text-center hover:bg-brand-primary-light/10 hover:border-brand-primary transition-all cursor-pointer group">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                            const url = await handleFileUpload(e.target.files[0], 'thumbnails');
                                                            if (url) setFormData({ ...formData, thumbnailUrl: url });
                                                        }
                                                    }}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                                {uploadingState === 'thumbnails' ? (
                                                    <LoadingSpinner message="جاري الرفع..." />
                                                ) : formData.thumbnailUrl ? (
                                                    <div className="relative aspect-video rounded-[var(--radius-button)] overflow-hidden shadow-sm">
                                                        <img src={formData.thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <p className="text-white text-xs font-black">تغيير الصورة</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-primary-light group-hover:text-brand-primary transition-colors">
                                                            <ImageIcon className="w-6 h-6" />
                                                        </div>
                                                        <p className="text-sm font-black text-slate-700">رفع غلاف الدورة</p>
                                                        <p className="text-xs text-text-muted mt-2">JPG, PNG (Max 2MB)</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-4 p-6 border border-border-subtle rounded-[var(--radius-card)] bg-surface-primary/30">
                                            <label className="text-sm font-black text-slate-700">فيديو ترويجي</label>
                                            <div className="relative border-2 border-dashed border-border-default bg-white rounded-[var(--radius-button)] p-8 text-center hover:bg-blue-50/50 hover:border-blue-400 transition-all cursor-pointer group">
                                                <input
                                                    type="file"
                                                    accept="video/*"
                                                    onChange={async (e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                            const url = await handleFileUpload(e.target.files[0], 'promos');
                                                            if (url) setFormData({ ...formData, introVideoUrl: url });
                                                        }
                                                    }}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                                {uploadingState === 'promos' ? (
                                                    <LoadingSpinner message="جاري الرفع..." color="blue" />
                                                ) : formData.introVideoUrl ? (
                                                    <div className="aspect-video bg-blue-50 rounded-[var(--radius-button)] flex flex-col items-center justify-center gap-3">
                                                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                                            <CheckCircle className="w-6 h-6" />
                                                        </div>
                                                        <p className="text-blue-700 font-black text-sm">تم رفع الفيديو بنجاح</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                            <PlayCircle className="w-6 h-6" />
                                                        </div>
                                                        <p className="text-sm font-black text-slate-700">رفع فيديو ترويجي</p>
                                                        <p className="text-xs text-text-muted mt-2">MP4 (Max 50MB)</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'curriculum' && (
                            <motion.div
                                key="curriculum"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-4xl space-y-10"
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-brand-primary-light pb-4 mb-6 md:mb-10">
                                    <h2 className="text-xl md:text-2xl font-black text-text-primary">تكوين المحتوى العلمي</h2>
                                    <button onClick={addSection} className="w-full sm:w-auto text-xs font-black bg-brand-primary text-white hover:bg-brand-primary-hover px-5 py-2.5 rounded-[var(--radius-button)] flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-primary/10">
                                        <PlusCircle className="w-4 h-4" /> إضافة قسم جديد
                                    </button>
                                </div>

                                <div className="space-y-10">
                                    {sections.map((section, idx) => (
                                        <div key={section.id} className="border border-border-default bg-surface-primary/30 rounded-[var(--radius-card)] p-4 md:p-8 relative">
                                            {/* Section Header */}
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 mb-6 md:mb-8 bg-white p-4 md:p-5 rounded-[var(--radius-button)] border border-border-default shadow-sm">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-text-muted cursor-move flex-shrink-0">
                                                        <GripVertical className="w-6 h-6" />
                                                    </div>
                                                    <span className="font-black text-text-primary text-lg whitespace-nowrap shrink-0">القسم {idx + 1}:</span>
                                                    <input
                                                        type="text"
                                                        value={section.title}
                                                        onChange={e => {
                                                            const newSecs = [...sections];
                                                            newSecs[idx].title = e.target.value;
                                                            setSections(newSecs);
                                                        }}
                                                        placeholder="عنوان القسم..."
                                                        className="flex-1 bg-transparent px-2 py-1 font-black text-text-primary focus:outline-none focus:border-b-2 focus:border-brand-primary transition-all text-lg md:text-xl"
                                                    />
                                                </div>
                                                <button onClick={() => deleteSection(section.id)} className="self-end sm:self-auto p-3 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" aria-label={`حذف القسم ${section.title || idx + 1}`}>
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>

                                            {/* Lectures List */}
                                            <div className="space-y-6 md:mr-10 md:pr-10 md:border-r-2 md:border-border-subtle">
                                                {section.lectures.map((lecture: any, lIdx: number) => (
                                                    <div key={lecture.id} className="bg-white border border-border-default p-4 md:p-6 rounded-[var(--radius-button)] shadow-sm group">
                                                        <div className="flex flex-col lg:flex-row lg:items-center gap-4 md:gap-6 mb-6">
                                                            <div className="flex items-center justify-between lg:justify-start gap-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`p-2.5 md:p-3 rounded-xl ${lecture.type === 'Video' ? 'bg-blue-50 text-blue-600' :
                                                                        lecture.type === 'File' ? 'bg-brand-primary-light text-brand-primary' :
                                                                            'bg-amber-50 text-amber-600'
                                                                        }`}>
                                                                        {lecture.type === 'Video' && <Video className="w-5 h-5" />}
                                                                        {lecture.type === 'File' && <File className="w-5 h-5" />}
                                                                        {lecture.type === 'Text' && <FileText className="w-5 h-5" />}
                                                                    </div>
                                                                    <span className="text-xs font-black text-text-muted uppercase tracking-widest whitespace-nowrap">درس {lIdx + 1}</span>
                                                                </div>
                                                                <div className="lg:hidden">
                                                                    <button onClick={() => deleteLecture(section.id, lecture.id)} className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                                        <Trash2 className="w-4.5 h-4.5" />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <input
                                                                type="text"
                                                                value={lecture.title}
                                                                placeholder="عنوان الدرس..."
                                                                onChange={(e) => updateLecture(section.id, lecture.id, 'title', e.target.value)}
                                                                className="flex-1 font-black text-lg text-text-primary bg-transparent border-b-2 border-transparent focus:border-brand-primary outline-none px-2 py-1 transition-all"
                                                            />

                                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                                                                <label className="flex items-center gap-3 text-sm font-black text-text-secondary cursor-pointer group-hover:text-text-primary transition-colors">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={lecture.isFreePreview}
                                                                        onChange={(e) => updateLecture(section.id, lecture.id, 'isFreePreview', e.target.checked)}
                                                                        className="w-5 h-5 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                                                                    />
                                                                    <span>معاينة مجانية</span>
                                                                </label>
                                                                <button onClick={() => deleteLecture(section.id, lecture.id)} className="hidden lg:block p-2.5 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" aria-label={`حذف الدرس ${lecture.title || lIdx + 1}`}>
                                                                    <Trash2 className="w-4.5 h-4.5" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Dynamic Content Input */}
                                                        <div className="bg-surface-primary/50 border border-border-subtle rounded-xl p-6">
                                                            {lecture.type === 'Video' && (
                                                                <div className="space-y-4">
                                                                    <label className="text-xs font-black text-text-secondary block uppercase">رابط الفيديو (YouTube / Vimeo / Direct URL)</label>
                                                                    <div className="flex flex-col md:flex-row gap-4">
                                                                        <input
                                                                            type="url"
                                                                            value={lecture.videoUrl || ''}
                                                                            onChange={(e) => updateLecture(section.id, lecture.id, 'videoUrl', e.target.value)}
                                                                            placeholder="https://..."
                                                                            className="flex-1 px-5 py-3.5 bg-white border border-border-default rounded-[var(--radius-button)] font-bold text-slate-700 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                                                        />
                                                                        <div className="relative">
                                                                            <button className="px-6 py-3.5 bg-blue-600 text-white font-black rounded-[var(--radius-button)] hover:bg-blue-700 transition-all text-sm whitespace-nowrap shadow-lg shadow-blue-600/10">
                                                                                {uploadingState === `lecture_video_${lecture.id}` ? 'جاري الرفع...' : 'رفع فيديو 📤'}
                                                                            </button>
                                                                            <input
                                                                                type="file"
                                                                                accept="video/*"
                                                                                onChange={async (e) => {
                                                                                    if (e.target.files && e.target.files[0]) {
                                                                                        const url = await handleFileUpload(e.target.files[0], `lecture_video_${lecture.id}`);
                                                                                        if (url) updateLecture(section.id, lecture.id, 'videoUrl', url);
                                                                                    }
                                                                                }}
                                                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {lecture.type === 'File' && (
                                                                <div className="space-y-4">
                                                                    <label className="text-xs font-black text-text-secondary block uppercase">رابط الملحقات أو الملفات</label>
                                                                    <div className="flex flex-col md:flex-row gap-4">
                                                                        <input
                                                                            type="url"
                                                                            value={lecture.fileUrl || ''}
                                                                            onChange={(e) => updateLecture(section.id, lecture.id, 'fileUrl', e.target.value)}
                                                                            placeholder="https://..."
                                                                            className="flex-1 px-5 py-3.5 bg-white border border-border-default rounded-[var(--radius-button)] font-bold text-slate-700 focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all"
                                                                        />
                                                                        <div className="relative">
                                                                            <button className="px-6 py-3.5 bg-brand-primary text-white font-black rounded-[var(--radius-button)] hover:bg-brand-primary-hover transition-all text-sm whitespace-nowrap shadow-lg shadow-brand-primary/10">
                                                                                {uploadingState === `lecture_file_${lecture.id}` ? 'جاري الرفع...' : 'رفع ملف 📤'}
                                                                            </button>
                                                                            <input
                                                                                type="file"
                                                                                onChange={async (e) => {
                                                                                    if (e.target.files && e.target.files[0]) {
                                                                                        const url = await handleFileUpload(e.target.files[0], `lecture_file_${lecture.id}`);
                                                                                        if (url) updateLecture(section.id, lecture.id, 'fileUrl', url);
                                                                                    }
                                                                                }}
                                                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {lecture.type === 'Text' && (
                                                                <div className="space-y-4">
                                                                    <label className="text-xs font-black text-text-secondary block uppercase">المحتوى النصي</label>
                                                                    <textarea
                                                                        rows={6}
                                                                        value={lecture.textContent || ''}
                                                                        onChange={(e) => updateLecture(section.id, lecture.id, 'textContent', e.target.value)}
                                                                        placeholder="اكتب محتوى الدرس بالتفصيل..."
                                                                        className="w-full px-5 py-4 bg-white border border-border-default rounded-[var(--radius-button)] font-bold text-slate-700 focus:ring-4 focus:ring-amber-100 outline-none transition-all resize-none"
                                                                    ></textarea>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Add Buttons */}
                                                <div className="flex flex-wrap gap-4 pt-4">
                                                    <button onClick={() => addLecture(section.id, 'Video')} className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-dashed border-border-default rounded-xl text-sm font-black text-text-secondary hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                                                        <Video className="w-4 h-4" /> إضافة فيديو
                                                    </button>
                                                    <button onClick={() => addLecture(section.id, 'File')} className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-dashed border-border-default rounded-xl text-sm font-black text-text-secondary hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary-light/10 transition-all">
                                                        <File className="w-4 h-4" /> إضافة ملف
                                                    </button>
                                                    <button onClick={() => addLecture(section.id, 'Text')} className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-dashed border-border-default rounded-xl text-sm font-black text-text-secondary hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-all">
                                                        <FileText className="w-4 h-4" /> إضافة نص
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'pricing' && (
                            <motion.div
                                key="pricing"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-2xl space-y-10"
                            >
                                <h2 className="text-2xl font-black text-text-primary border-b-2 border-brand-primary-light pb-4 mb-10">التسعير والعروض</h2>

                                <div className="flex items-center justify-between p-8 border-2 border-border-subtle rounded-[var(--radius-card)] bg-surface-primary/50">
                                    <div className="max-w-sm">
                                        <h3 className="text-xl font-black text-text-primary">دورة مجانية بالكامل</h3>
                                        <p className="text-sm font-bold text-text-secondary mt-1">سيتمكن جميع الطلاب من الوصول للمحتوى فور التسجيل بدون دفع.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={formData.isFree} onChange={e => setFormData({ ...formData, isFree: e.target.checked })} />
                                        <div className="w-16 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:right-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand-primary"></div>
                                    </label>
                                </div>

                                {!formData.isFree && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-6">
                                        <label className="block text-sm font-black text-slate-700">السعر الأساسي (ج.م)</label>
                                        <div className="relative max-w-xs">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-text-muted">ج.م</span>
                                            <input
                                                type="number"
                                                value={formData.price}
                                                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                                placeholder="0.00"
                                                className="w-full pl-16 pr-6 py-5 bg-surface-primary border border-border-default rounded-[var(--radius-button)] font-black text-2xl text-text-primary focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-left"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'settings' && (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-2xl space-y-10"
                            >
                                <h2 className="text-2xl font-black text-text-primary border-b-2 border-brand-primary-light pb-4 mb-10">إعدادات إضافية وحالة النشر</h2>

                                <div className="space-y-4">
                                    <label className="text-sm font-black text-slate-700 block">رؤية وإتاحة الدورة (Visibility)</label>
                                    <select
                                        value={formData.visibility}
                                        onChange={e => setFormData({ ...formData, visibility: e.target.value })}
                                        className="w-full md:w-2/3 px-6 py-4 bg-surface-primary border border-border-default rounded-[var(--radius-button)] font-black text-text-primary focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none"
                                    >
                                        <option value="Public">عامة (تظهر في نتائج البحث والمنصة)</option>
                                        <option value="Private">خاصة (بالدعوة المباشرة فقط)</option>
                                        <option value="Unlisted">غير مدرجة (لمن يمتلك الرابط فقط)</option>
                                    </select>
                                </div>

                                <div className="pt-10 border-t border-border-subtle">
                                    <div className="flex items-start gap-6 p-8 bg-brand-primary-light/10 border-2 border-brand-primary-light rounded-[var(--radius-card)]">
                                        <div className="pt-1">
                                            <input type="checkbox" id="cert" className="w-6 h-6 text-brand-primary border-slate-300 rounded focus:ring-brand-primary" />
                                        </div>
                                        <div className="space-y-1">
                                            <label htmlFor="cert" className="font-black text-text-primary text-xl cursor-pointer">تفعيل شهادات الإتمام</label>
                                            <p className="text-sm font-bold text-text-secondary leading-relaxed">
                                                عند تفعيل هذا الخيار، سيحصل الطالب تلقائياً على شهادة إلكترونية معتمدة بمجرد إكمال كافة المحاضرات بنسبة 100%.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </PageContainer>
    );
};




