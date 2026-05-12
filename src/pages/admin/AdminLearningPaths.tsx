import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
    Plus, Search, Map, MoreVertical, Edit, 
    Trash2, Eye, LayoutGrid, List, BookOpen,
    Filter, Calendar, ChevronRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { PageContainer } from '../../components/shared/PageContainer';
import { PageHeader } from '../../components/shared/PageHeader';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/shared/Card';
import { Badge } from '../../components/ui/Badge';

export const AdminLearningPaths = () => {
    const navigate = useNavigate();
    const [paths, setPaths] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const fetchPaths = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('learning_paths')
            .select('*, learning_path_courses(count)')
            .order('created_at', { ascending: false });

        if (error) {
            toast.error('حدث خطأ في جلب مسارات التعلم');
        } else {
            setPaths(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchPaths();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا المسار؟')) return;

        try {
            const { error } = await supabase
                .from('learning_paths')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('تم حذف المسار بنجاح');
            fetchPaths();
        } catch (error: any) {
            toast.error('خطأ في الحذف: ' + error.message);
        }
    };

    const filteredPaths = paths.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return <LoadingSpinner fullPage message="جاري تحميل المسارات..." />;
    }

    return (
        <PageContainer maxWidth="xl">
            <PageHeader
                title="إدارة مسارات التعلم"
                description="قم بتنظيم الكورسات في مسارات تعليمية متكاملة لمساعدة الطلاب على تحقيق أهدافهم."
                icon={Map}
                actions={
                    <Button variant="primary" onClick={() => navigate('/admin/learning-paths/new')}>
                        <Plus className="w-5 h-5 ml-2" />
                        مسار جديد
                    </Button>
                }
            />

            <div className="flex flex-col md:flex-row gap-6 mb-8 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="ابحث عن مسار..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pr-12 pl-4 py-3.5 bg-white border border-border-default rounded-2xl font-bold focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-border-subtle shadow-sm">
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        <List className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {filteredPaths.length > 0 ? (
                    viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredPaths.map((path) => (
                                <motion.div
                                    layout
                                    key={path.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                >
                                    <Card className="group overflow-hidden border-border-subtle hover:border-brand-primary/20 transition-all flex flex-col h-full">
                                        <div className="h-48 bg-slate-100 relative overflow-hidden">
                                            {path.thumbnail_url ? (
                                                <img src={path.thumbnail_url} alt={path.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <Map className="w-16 h-16" />
                                                </div>
                                            )}
                                            <div className="absolute top-4 right-4">
                                                <Badge variant={path.status === 'Published' ? 'primary' : 'secondary'}>
                                                    {path.status === 'Published' ? 'منشور' : 'مسودة'}
                                                </Badge>
                                            </div>
                                        </div>
                                        
                                        <div className="p-6 flex-1 flex flex-col">
                                            <h3 className="text-lg font-black text-text-primary mb-2 line-clamp-1 group-hover:text-brand-primary transition-colors">{path.title}</h3>
                                            <p className="text-sm text-text-muted font-bold line-clamp-2 leading-relaxed mb-6 flex-1">
                                                {path.description || 'لا يوجد وصف متاح لهذا المسار حالياً.'}
                                            </p>
                                            
                                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                                <div className="flex items-center gap-2 text-brand-primary">
                                                    <BookOpen className="w-4 h-4" />
                                                    <span className="text-xs font-black">{path.learning_path_courses?.[0]?.count || 0} كورس</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => navigate(`/admin/learning-paths/edit/${path.id}`)}
                                                        className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-all"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(path.id)}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <Card className="overflow-hidden border-border-subtle">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-border-default">
                                    <tr>
                                        <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">المسار</th>
                                        <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">الحالة</th>
                                        <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">عدد الكورسات</th>
                                        <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">تاريخ الإنشاء</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredPaths.map((path) => (
                                        <tr key={path.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                                                        <Map className="w-5 h-5 text-slate-400" />
                                                    </div>
                                                    <span className="font-black text-text-primary text-sm">{path.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={path.status === 'Published' ? 'primary' : 'secondary'} size="sm">
                                                    {path.status === 'Published' ? 'منشور' : 'مسودة'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-slate-600">{path.learning_path_courses?.[0]?.count || 0}</span>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-slate-400">
                                                {new Date(path.created_at).toLocaleDateString('ar-EG')}
                                            </td>
                                            <td className="px-6 py-4 text-left">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => navigate(`/admin/learning-paths/edit/${path.id}`)} className="p-2 text-slate-400 hover:text-brand-primary rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDelete(path.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Card>
                    )
                ) : (
                    <div className="text-center py-32 bg-white border-2 border-dashed border-slate-100 rounded-[3rem]">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                            <Map className="w-12 h-12 text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-300">لا توجد مسارات تعلم حتى الآن</h3>
                        <p className="text-slate-400 font-bold mt-2 mb-8">ابدأ بتجميع الكورسات في مسارات تعليمية هادفة</p>
                        <Button variant="primary" onClick={() => navigate('/admin/learning-paths/new')}>
                            <Plus className="w-5 h-5 ml-2" />
                            إنشاء أول مسار
                        </Button>
                    </div>
                )}
            </AnimatePresence>
        </PageContainer>
    );
};
