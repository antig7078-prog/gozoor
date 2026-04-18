import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import {
    PlusCircle, CheckCircle, Video, FileText, File, ListChecks,
    Image as ImageIcon, GripVertical, CreditCard, Sliders, PlayCircle, Save, Send, Loader2, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

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
        instructorName: '', // مضاف
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
            toast.loading('جاري رفع الملف لمعالجة البيانات...', { id: 'upload' });

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
            const filePath = `uploads/${fileName}`;

            const { error } = await supabase.storage
                .from('course-content') // NOTE: Bucket 'course-content' should be created publicly in Supabase
                .upload(filePath, file, { cacheControl: '3600', upsert: false });

            if (error) throw error;

            const { data: publicUrlData } = supabase.storage
                .from('course-content')
                .getPublicUrl(filePath);

            toast.success('تم الرفع بنجاح!', { id: 'upload' });
            return publicUrlData.publicUrl;
        } catch (error: any) {
            toast.error('حدث خطأ أثناء الرفع! تأكد من وجود Storage Bucket باسم course-content ⚠️', { id: 'upload', duration: 6000 });
            console.error(error);
            return null;
        } finally {
            setUploadingState(null);
        }
    };

    // Fetch categories for selection
    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase.from('categories').select('*').order('name');
            if (data) setCategories(data);
        };
        fetchCategories();
    }, []);

    // If editing, fetch course data
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
                    instructorName: course.instructor_name || '', // مضاف
                    isFree: course.is_free || false,
                    price: course.price || 0,
                    status: course.status || 'Draft',
                    visibility: course.visibility || 'Public',
                    thumbnailUrl: course.thumbnail_url || '',
                    introVideoUrl: course.intro_video_url || '',
                });

                // Fetch curriculum
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
                category: formData.category, // مضاف
                instructor_name: formData.instructorName, // مضاف
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

            // Sync curriculum (Robust approach)
            if (currentCourseId) {
                if (isEditing) {
                    // 1. Delete existing lectures first (to prevent FK conflicts if needed, though CASCADE is better)
                    // We don't delete lectures directly because they are linked to section_id
                    // But we delete sections which should cascade to lectures if DB is set up correctly
                    const { error: delErr } = await supabase.from('course_sections').delete().eq('course_id', currentCourseId);
                    if (delErr) {
                        console.error('Error deleting old sections:', delErr);
                        throw new Error('فشل تحديث المحتوى القديم');
                    }
                }

                // 2. Insert new sections and their lectures
                for (let i = 0; i < sections.length; i++) {
                    const sec = sections[i];
                    console.log(`Inserting section ${i + 1}: ${sec.title}`);

                    const { data: newSec, error: secErr } = await supabase
                        .from('course_sections')
                        .insert({ course_id: currentCourseId, title: sec.title, sort_order: i })
                        .select()
                        .single();

                    if (secErr || !newSec) {
                        console.error('Error inserting section:', secErr);
                        continue;
                    }

                    const lecturesToInsert = sec.lectures.map((l: any, lIdx: number) => ({
                        section_id: newSec.id,
                        title: l.title,
                        lecture_type: l.type,
                        is_free_preview: l.isFreePreview,
                        video_url: l.videoUrl || null,
                        file_url: l.fileUrl || null,
                        text_content: l.textContent || null,
                        sort_order: lIdx
                    }));

                    if (lecturesToInsert.length > 0) {
                        const { error: lecErr } = await supabase.from('course_lectures').insert(lecturesToInsert);
                        if (lecErr) console.error('Error inserting lectures for section:', sec.title, lecErr);
                    }
                }
            }

            toast.success(status === 'Published' ? 'تم نشر الدورة والمحتوى بنجاح!' : 'تم حفظ بيانات الدورة بنجاح!');
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
        return (
            <div className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                <p className="text-slate-500 font-bold">جاري تحميل بيانات الدورة...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto" dir="rtl">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">
                        {isEditing ? 'تعديل الدورة التعليمية' : 'إضافة دورة جديدة'}
                    </h1>
                    <p className="text-slate-500 font-semibold mt-2">
                        {isEditing ? 'تعديل بيانات الدورة والمحتوى العلمي المحفوظ.' : 'قم بملء البيانات أدناه لإنشاء وتجهيز دورتك التعليمية الزراعية الجديدة.'}
                    </p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button
                        onClick={() => handleSave('Draft')}
                        disabled={isSaving}
                        className="flex-1 md:flex-none justify-center flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" />
                        حفظ كمسودة
                    </button>
                    <button
                        onClick={() => handleSave('Published')}
                        disabled={isSaving}
                        className="flex-1 md:flex-none justify-center flex items-center gap-2 px-6 py-3 bg-emerald-600 border-2 border-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all disabled:opacity-50"
                    >
                        <Send className="w-5 h-5" />
                        {isEditing ? 'تحديث ونشر' : 'نشر الدورة'}
                    </button>
                </div>
            </div>

            {/* Tabs & Content Container */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row overflow-hidden min-h-[700px]">

                {/* Vertical Tabs */}
                <div className="w-full md:w-72 bg-slate-50/50 border-b md:border-b-0 md:border-l border-slate-200 p-6 space-y-2 flex md:flex-col overflow-x-auto">
                    <button onClick={() => setActiveTab('basic')} className={`min-w-fit md:w-full flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'basic' ? 'bg-white shadow-md border border-slate-200 text-emerald-600' : 'text-slate-500 hover:bg-slate-100 border border-transparent'}`}>
                        <FileText className="w-5 h-5" /> المعلومات الأساسية
                    </button>
                    <button onClick={() => setActiveTab('curriculum')} className={`min-w-fit md:w-full flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'curriculum' ? 'bg-white shadow-md border border-slate-200 text-emerald-600' : 'text-slate-500 hover:bg-slate-100 border border-transparent'}`}>
                        <ListChecks className="w-5 h-5" /> المحتوى العلمي
                    </button>
                    <button onClick={() => setActiveTab('pricing')} className={`min-w-fit md:w-full flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'pricing' ? 'bg-white shadow-md border border-slate-200 text-emerald-600' : 'text-slate-500 hover:bg-slate-100 border border-transparent'}`}>
                        <CreditCard className="w-5 h-5" /> التسعير والعروض
                    </button>
                    <button onClick={() => setActiveTab('settings')} className={`min-w-fit md:w-full flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'settings' ? 'bg-white shadow-md border border-slate-200 text-emerald-600' : 'text-slate-500 hover:bg-slate-100 border border-transparent'}`}>
                        <Sliders className="w-5 h-5" /> إعدادات إضافية
                    </button>
                </div>

                {/* Form Area */}
                <div className="flex-1 p-6 md:p-10 overflow-y-auto">

                    {/* Basic Tab */}
                    {activeTab === 'basic' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl space-y-8">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 border-b border-slate-100 pb-4 mb-8">التفاصيل الأساسية</h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">عنوان الدورة *</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="مثال: الدورة الشاملة في زراعة القمح"
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder-slate-400"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">عنوان فرعي</label>
                                        <input
                                            type="text"
                                            value={formData.subtitle}
                                            onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                                            placeholder="نبذة مختصرة عما تقدمه الدورة..."
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder-slate-400"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">وصف الدورة التفصيلي</label>
                                        <textarea
                                            rows={6}
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="ماذا سيتعلم الطالب؟ وما هي المخرجات..."
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder-slate-400"
                                        ></textarea>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">المستوى</label>
                                            <select
                                                value={formData.level}
                                                onChange={e => setFormData({ ...formData, level: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500"
                                            >
                                                <option value="Beginner">مبتدئ</option>
                                                <option value="Intermediate">متوسط</option>
                                                <option value="Advanced">متقدم</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">التصنيف (Category)</label>
                                            <select
                                                value={formData.category}
                                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500"
                                            >
                                                <option value="">اختر القسم...</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">اسم المحاضر</label>
                                            <input
                                                type="text"
                                                value={formData.instructorName}
                                                onChange={e => setFormData({ ...formData, instructorName: e.target.value })}
                                                placeholder="اسم مقدم الدورة..."
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">لغة الدورة</label>
                                            <select
                                                value={formData.language}
                                                onChange={e => setFormData({ ...formData, language: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500"
                                            >
                                                <option>العربية</option>
                                                <option>الإنجليزية</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <h2 className="text-2xl font-black text-slate-800 border-b border-slate-100 pb-4 mb-4">الوسائط المرئية</h2>
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 space-y-3 p-4 border border-slate-100 rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                                        <label className="block text-sm font-bold text-slate-700 mb-1">صورة الغلاف</label>
                                        <input
                                            type="url"
                                            placeholder="الرابط (URL) المباشر للصورة كبديل للرفع"
                                            value={formData.thumbnailUrl || ''}
                                            onChange={e => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                        />
                                        <div className="relative border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl p-6 text-center hover:bg-emerald-50/50 hover:border-emerald-400 transition-all cursor-pointer group">
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
                                                <Loader2 className="w-8 h-8 mx-auto text-emerald-500 animate-spin" />
                                            ) : formData.thumbnailUrl ? (
                                                <img src={formData.thumbnailUrl} alt="Cover Preview" className="mx-auto h-24 w-auto object-contain rounded-lg shadow-sm" />
                                            ) : (
                                                <>
                                                    <ImageIcon className="w-10 h-10 text-slate-400 group-hover:text-emerald-500 transition-colors mx-auto mb-2" />
                                                    <p className="text-sm font-bold text-slate-700">اضغط لرفع غلاف الدورة 📥</p>
                                                    <p className="text-xs text-slate-400 mt-2">Max: 2MB, JPG/PNG</p>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-3 p-4 border border-slate-100 rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                                        <label className="block text-sm font-bold text-slate-700 mb-1">فيديو ترويجي (Promo)</label>
                                        <input
                                            type="url"
                                            placeholder="الرابط (URL) المباشر للفيديو كبديل للرفع"
                                            value={formData.introVideoUrl || ''}
                                            onChange={e => setFormData({ ...formData, introVideoUrl: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />
                                        <div className="relative border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl p-6 text-center hover:bg-blue-50/50 hover:border-blue-400 transition-all cursor-pointer group">
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
                                                <Loader2 className="w-8 h-8 mx-auto text-blue-500 animate-spin" />
                                            ) : formData.introVideoUrl ? (
                                                <div className="text-blue-500 font-bold text-sm bg-blue-50 p-2 rounded-lg flex items-center justify-center gap-2">
                                                    <CheckCircle className="w-5 h-5" /> الفيديو جاهز
                                                </div>
                                            ) : (
                                                <>
                                                    <PlayCircle className="w-10 h-10 text-slate-400 group-hover:text-blue-500 transition-colors mx-auto mb-2" />
                                                    <p className="text-sm font-bold text-slate-700">اضغط لرفع فيديو ترويجي 📥</p>
                                                    <p className="text-xs text-slate-400 mt-2">Max: 50MB, MP4</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Curriculum Tab */}
                    {activeTab === 'curriculum' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-8">
                                <h2 className="text-2xl font-black text-slate-800">تكوين المحتوى العلمي</h2>
                                <button onClick={addSection} className="text-sm font-bold bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                                    <PlusCircle className="w-5 h-5" /> إضافة قسم جديد
                                </button>
                            </div>

                            <div className="space-y-8">
                                {sections.map((section, idx) => (
                                    <div key={section.id} className="border border-slate-200 bg-slate-50/50 rounded-2xl p-6 shadow-sm">
                                        {/* Section Header */}
                                        <div className="flex items-center gap-4 mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                            <GripVertical className="w-6 h-6 text-slate-400" />
                                            <span className="font-black text-slate-700 text-lg whitespace-nowrap">القسم {idx + 1}:</span>
                                            <input
                                                type="text"
                                                value={section.title}
                                                onChange={e => {
                                                    const newSecs = [...sections];
                                                    newSecs[idx].title = e.target.value;
                                                    setSections(newSecs);
                                                }}
                                                placeholder="اكتب عنوان القسم..."
                                                className="flex-1 bg-slate-50 px-4 py-2.5 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all"
                                            />
                                            <button onClick={() => deleteSection(section.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Lectures List */}
                                        <div className="space-y-4 pr-2 md:pr-10 border-r-2 border-slate-200">
                                            {section.lectures.map((lecture: any, lIdx: number) => (
                                                <div key={lecture.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative group">

                                                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-2 rounded-lg bg-slate-50">
                                                                {lecture.type === 'Video' && <Video className="w-5 h-5 text-blue-500" />}
                                                                {lecture.type === 'File' && <File className="w-5 h-5 text-emerald-500" />}
                                                                {lecture.type === 'Text' && <FileText className="w-5 h-5 text-amber-500" />}
                                                            </div>
                                                            <span className="text-sm font-bold text-slate-400 whitespace-nowrap">درس {lIdx + 1}</span>
                                                        </div>

                                                        <input
                                                            type="text"
                                                            value={lecture.title}
                                                            placeholder="عنوان الدرس..."
                                                            onChange={(e) => updateLecture(section.id, lecture.id, 'title', e.target.value)}
                                                            className="flex-1 font-bold text-base text-slate-800 bg-transparent border-b-2 border-transparent focus:border-emerald-500 outline-none px-2 py-1 transition-all"
                                                        />

                                                        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-r border-slate-100 pt-3 md:pt-0 pr-0 md:pr-4">
                                                            <label className="flex items-center gap-2 text-sm font-bold text-slate-500 cursor-pointer hover:text-slate-700 transition-colors">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={lecture.isFreePreview}
                                                                    onChange={(e) => updateLecture(section.id, lecture.id, 'isFreePreview', e.target.checked)}
                                                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                                                                />
                                                                معاينة مجانية
                                                            </label>
                                                            <button onClick={() => deleteLecture(section.id, lecture.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Content Input Fields based on Type */}
                                                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-5">
                                                        {lecture.type === 'Video' && (
                                                            <div className="space-y-3">
                                                                <label className="text-xs font-bold text-slate-500 block">إضافة رابط فيديو خارجي (YouTube / Vimeo / MP4)</label>
                                                                <div className="flex items-center gap-3">
                                                                    <input
                                                                        type="url"
                                                                        value={lecture.videoUrl || ''}
                                                                        onChange={(e) => updateLecture(section.id, lecture.id, 'videoUrl', e.target.value)}
                                                                        placeholder="https://..."
                                                                        className="flex-1 text-sm p-3 font-semibold text-slate-700 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white"
                                                                    />
                                                                    <div className="relative">
                                                                        <button type="button" className="px-5 py-3 h-full bg-blue-100 text-blue-700 font-bold rounded-lg hover:bg-blue-200 transition-colors text-sm whitespace-nowrap overflow-hidden">
                                                                            {uploadingState === `lecture_video_${lecture.id}` ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'أو الرفع مباشرة 📤'}
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
                                                            <div className="space-y-3">
                                                                <label className="text-xs font-bold text-slate-500 block">إضافة رابط ملف خارجي (Google Drive, Excel, Docs)</label>
                                                                <div className="flex items-center gap-3">
                                                                    <input
                                                                        type="url"
                                                                        value={lecture.fileUrl || ''}
                                                                        onChange={(e) => updateLecture(section.id, lecture.id, 'fileUrl', e.target.value)}
                                                                        placeholder="https://..."
                                                                        className="flex-1 text-sm p-3 font-semibold text-slate-700 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white"
                                                                    />
                                                                    <div className="relative">
                                                                        <button type="button" className="px-5 py-3 h-full bg-emerald-100 text-emerald-700 font-bold rounded-lg hover:bg-emerald-200 transition-colors text-sm whitespace-nowrap overflow-hidden">
                                                                            {uploadingState === `lecture_file_${lecture.id}` ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'أو الرفع مباشرة 📤'}
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
                                                            <div>
                                                                <label className="text-xs font-bold text-slate-500 mb-2 block">المحتوى النصي والمقالات</label>
                                                                <textarea
                                                                    rows={4}
                                                                    value={lecture.textContent || ''}
                                                                    onChange={(e) => updateLecture(section.id, lecture.id, 'textContent', e.target.value)}
                                                                    placeholder="اكتب محتوى الدرس بالتفصيل..."
                                                                    className="w-full text-sm p-3 font-semibold text-slate-700 border border-slate-200 rounded-lg outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-white"
                                                                ></textarea>
                                                            </div>
                                                        )}
                                                    </div>

                                                </div>
                                            ))}

                                            {/* Add Lecture Buttons */}
                                            <div className="flex flex-wrap gap-3 pt-4">
                                                <button onClick={() => addLecture(section.id, 'Video')} className="px-4 py-2.5 bg-white border-2 border-dashed border-slate-300 rounded-lg text-sm font-bold text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center gap-2">
                                                    <Video className="w-4 h-4" /> إضافة فيديو
                                                </button>
                                                <button onClick={() => addLecture(section.id, 'File')} className="px-4 py-2.5 bg-white border-2 border-dashed border-slate-300 rounded-lg text-sm font-bold text-slate-600 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center gap-2">
                                                    <File className="w-4 h-4" /> إضافة ملف
                                                </button>
                                                <button onClick={() => addLecture(section.id, 'Text')} className="px-4 py-2.5 bg-white border-2 border-dashed border-slate-300 rounded-lg text-sm font-bold text-slate-600 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-all flex items-center gap-2">
                                                    <FileText className="w-4 h-4" /> إضافة نص مقروء
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Pricing Tab */}
                    {activeTab === 'pricing' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl space-y-8">
                            <h2 className="text-2xl font-black text-slate-800 border-b border-slate-100 pb-4 mb-8">التسعير والعروض</h2>

                            <div className="flex items-center gap-6 p-6 border-2 border-slate-200 rounded-2xl bg-slate-50">
                                <div className="flex-1">
                                    <h3 className="text-lg font-black text-slate-900">جعل الدورة مجانية بالكامل</h3>
                                    <p className="text-sm font-semibold text-slate-500 mt-1">سيتمكن الطلاب من التسجيل في هذه الدورة والوصول لجميع المحتويات بدون أي مقابل مادي.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={formData.isFree} onChange={e => setFormData({ ...formData, isFree: e.target.checked })} />
                                    <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                            </div>

                            {!formData.isFree && (
                                <div className="space-y-6 pt-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">السعر الأساسي (ج.م)</label>
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                            placeholder="مثال: 1500"
                                            className="w-full md:w-1/2 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-left"
                                        />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl space-y-8">
                            <h2 className="text-2xl font-black text-slate-800 border-b border-slate-100 pb-4 mb-8">إعدادات إضافية وحالة النشر</h2>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">رؤية وإتاحة الدورة (Visibility)</label>
                                <select
                                    value={formData.visibility}
                                    onChange={e => setFormData({ ...formData, visibility: e.target.value })}
                                    className="w-full md:w-1/2 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500"
                                >
                                    <option value="Public">عامة (تظهر للجميع في سلة المنصة)</option>
                                    <option value="Private">خاصة (بالدعوة فقط أو للطلاب المسجلين سلفاً)</option>
                                    <option value="Unlisted">غير مدرجة (متاحة لمن يمتلك الرابط فقط)</option>
                                </select>
                            </div>

                            <div className="pt-8 border-t border-slate-100">
                                <div className="flex items-center gap-4 mb-4">
                                    <input type="checkbox" id="cert" className="w-6 h-6 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500" />
                                    <div>
                                        <label htmlFor="cert" className="font-black text-slate-800 text-lg cursor-pointer">إتاحة شهادة إتمام الدورة</label>
                                        <p className="text-sm font-semibold text-slate-500 cursor-pointer">يحصل الطالب على شهادة إلكترونية معتمدة من المنصة بعد إكماله لـ 100% من محتوى الدورة.</p>
                                    </div>
                                </div>
                            </div>

                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};
