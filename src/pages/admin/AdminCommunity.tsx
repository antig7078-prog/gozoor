import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
    Users, MessageCircle, Heart, Trash2, 
    AlertTriangle, CheckCircle, XCircle, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageContainer } from '../../components/shared/PageContainer';
import { PageHeader } from '../../components/shared/PageHeader';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { toast } from 'react-hot-toast';
import { ConfirmModal } from '../../components/shared/ConfirmModal';

interface PostReport {
    id: string;
    post_id: string;
    reporter_id: string;
    reason: string;
    status: 'pending' | 'resolved' | 'dismissed';
    created_at: string;
    post_content?: string;
    post_user_name?: string;
    reporter_name?: string;
}

interface CommunityPost {
    id: string;
    content: string;
    user_id: string;
    user_name: string;
    likes_count: number;
    comments_count: number;
    created_at: string;
    image_url?: string;
}

export const AdminCommunity = () => {
    const [activeTab, setActiveTab] = useState<'posts' | 'reports'>('reports');
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [reports, setReports] = useState<PostReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; postId: string | null; isLoading: boolean }>({
        isOpen: false,
        postId: null,
        isLoading: false
    });

    const fetchPosts = async () => {
        const { data, error } = await supabase
            .from('posts')
            .select('*, profiles:user_id(full_name)')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setPosts(data.map((p: any) => ({
                ...p,
                user_name: p.profiles?.full_name || 'مستخدم مجهول'
            })));
        }
    };

    const fetchReports = async () => {
        const { data, error } = await supabase
            .from('post_reports')
            .select(`
                *,
                posts:post_id(content, profiles:user_id(full_name)),
                profiles:reporter_id(full_name)
            `)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setReports(data.map((r: any) => ({
                ...r,
                post_content: r.posts?.content,
                post_user_name: r.posts?.profiles?.full_name,
                reporter_name: r.profiles?.full_name || 'مبلغ مجهول'
            })));
        }
    };

    const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchPosts(), fetchReports()]);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDeletePost = async (postId: string) => {
        setDeleteModal({ isOpen: true, postId, isLoading: false });
    };

    const confirmDeletePost = async () => {
        if (!deleteModal.postId) return;
        setDeleteModal(prev => ({ ...prev, isLoading: true }));
        try {
            const { error } = await supabase.from('posts').delete().eq('id', deleteModal.postId);
            if (error) throw error;
            
            // If deleting from a report, we should also resolve the report
            const relatedReports = reports.filter(r => r.post_id === deleteModal.postId);
            for (const r of relatedReports) {
                await supabase.from('post_reports').update({ status: 'resolved' }).eq('id', r.id);
            }

            toast.success('تم حذف المنشور بنجاح');
            loadData();
            setDeleteModal({ isOpen: false, postId: null, isLoading: false });
        } catch (error) {
            toast.error('حدث خطأ أثناء الحذف');
            setDeleteModal(prev => ({ ...prev, isLoading: false }));
        }
    };

    const handleActionOnReport = async (reportId: string, action: 'resolved' | 'dismissed') => {
        try {
            const { error } = await supabase
                .from('post_reports')
                .update({ status: action })
                .eq('id', reportId);
            
            if (error) throw error;
            toast.success(action === 'resolved' ? 'تم حل البلاغ' : 'تم تجاهل البلاغ');
            fetchReports();
        } catch (error) {
            toast.error('فشل تحديث حالة البلاغ');
        }
    };

    if (loading) return <LoadingSpinner fullPage message="جاري تحميل بيانات المجتمع..." />;

    return (
        <PageContainer maxWidth="xl">
            <PageHeader
                title="إدارة المجتمع"
                description="مراقبة المنشورات، التعامل مع البلاغات، والحفاظ على بيئة المجتمع الزراعي."
                icon={Users}
            />

            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => setActiveTab('reports')}
                    className={`px-6 py-3 rounded-2xl font-black transition-all ${activeTab === 'reports' 
                        ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                        : 'bg-white text-text-muted hover:bg-brand-primary/5'}`}
                >
                    البلاغات ({reports.filter(r => r.status === 'pending').length})
                </button>
                <button
                    onClick={() => setActiveTab('posts')}
                    className={`px-6 py-3 rounded-2xl font-black transition-all ${activeTab === 'posts' 
                        ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                        : 'bg-white text-text-muted hover:bg-brand-primary/5'}`}
                >
                    كل المنشورات
                </button>
            </div>

            <div className="space-y-6">
                {activeTab === 'reports' ? (
                    reports.length > 0 ? (
                        reports.map(report => (
                            <motion.div
                                key={report.id}
                                layout
                                className="bg-white rounded-[2rem] border border-border-subtle p-6 shadow-sm"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-3">
                                        <div className={`p-3 rounded-xl ${report.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
                                            <AlertTriangle className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-text-primary">بلاغ عن محتوى غير لائق</h4>
                                            <p className="text-sm text-text-muted">بواسطة: <span className="font-bold">{report.reporter_name}</span> • {new Date(report.created_at).toLocaleDateString('ar-EG')}</p>
                                        </div>
                                    </div>
                                    <Badge variant={report.status === 'pending' ? 'warning' : 'secondary'}>
                                        {report.status === 'pending' ? 'قيد المراجعة' : report.status === 'resolved' ? 'تم الحل' : 'تم التجاهل'}
                                    </Badge>
                                </div>

                                <div className="bg-surface-primary rounded-2xl p-4 mb-4 border border-border-subtle">
                                    <p className="text-xs font-black text-brand-primary mb-2 uppercase tracking-wider">سبب البلاغ:</p>
                                    <p className="text-sm font-bold text-text-primary">{report.reason}</p>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-4 mb-6 border-l-4 border-slate-300">
                                    <p className="text-xs font-black text-text-muted mb-2">محتوى المنشور (كاتبه: {report.post_user_name}):</p>
                                    <p className="text-sm text-text-secondary line-clamp-3">{report.post_content || 'تم حذف المنشور بالفعل'}</p>
                                </div>

                                {report.status === 'pending' && (
                                    <div className="flex gap-3">
                                        <Button 
                                            variant="danger" 
                                            size="sm" 
                                            icon={Trash2}
                                            onClick={() => handleDeletePost(report.post_id)}
                                        >
                                            حذف المنشور
                                        </Button>
                                        <Button 
                                            variant="secondary" 
                                            size="sm" 
                                            icon={CheckCircle}
                                            onClick={() => handleActionOnReport(report.id, 'dismissed')}
                                        >
                                            تجاهل البلاغ
                                        </Button>
                                    </div>
                                )}
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-border-default">
                            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-slate-200" />
                            <p className="text-text-muted font-bold">لا يوجد بلاغات حالياً</p>
                        </div>
                    )
                ) : (
                    <div className="bg-white rounded-[2rem] border border-border-subtle overflow-hidden">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-border-subtle">
                                    <th className="p-4 font-black text-text-muted text-sm">المستخدم</th>
                                    <th className="p-4 font-black text-text-muted text-sm">المحتوى</th>
                                    <th className="p-4 font-black text-text-muted text-sm text-center">التفاعل</th>
                                    <th className="p-4 font-black text-text-muted text-sm">التاريخ</th>
                                    <th className="p-4 font-black text-text-muted text-sm">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.map(post => (
                                    <tr key={post.id} className="border-b border-border-subtle hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 font-bold text-sm">{post.user_name}</td>
                                        <td className="p-4 text-sm max-w-xs truncate">{post.content}</td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <span className="flex items-center gap-1 text-xs font-bold"><Heart className="w-3 h-3 text-red-500" /> {post.likes_count}</span>
                                                <span className="flex items-center gap-1 text-xs font-bold"><MessageCircle className="w-3 h-3 text-blue-500" /> {post.comments_count}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-xs text-text-muted">{new Date(post.created_at).toLocaleDateString('ar-EG')}</td>
                                        <td className="p-4">
                                            <button 
                                                onClick={() => handleDeletePost(post.id)}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, postId: null, isLoading: false })}
                onConfirm={confirmDeletePost}
                isLoading={deleteModal.isLoading}
                title="حذف المنشور"
                message="هل أنت متأكد من حذف هذا المنشور نهائياً من المجتمع؟ لا يمكن التراجع عن هذا الإجراء."
                confirmText="حذف الآن"
                cancelText="تراجع"
                type="danger"
            />
        </PageContainer>
    );
};
