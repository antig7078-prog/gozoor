import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle, Heart, Send, Image, MoreHorizontal,
    Trash2, Users, Sparkles, X,
    AlertTriangle
} from 'lucide-react';
import { communityService } from '../../../services/communityService';
import { storageService } from '../../../services/storageService';
import { useAuth } from '../../../contexts/AuthContext';
import { PageContainer } from '../../../components/shared/PageContainer';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { ConfirmModal } from '../../../components/shared/ConfirmModal';
import { sanitizeInput } from '../../../utils/sanitize';

interface Comment {
    id: string;
    post_id: string;
    parent_id?: string;
    user_id: string;
    content: string;
    created_at: string;
    user_name?: string;
    user_avatar?: string;
}

interface Post {
    id: string;
    user_id: string;
    content: string;
    image_url?: string;
    likes_count: number;
    comments_count: number;
    created_at: string;
    user_name?: string;
    user_avatar?: string;
    liked_by?: string[];
    comments?: Comment[];
    replies?: Record<string, Comment[]>;
}

import { toast } from 'react-hot-toast';

const timeAgo = (dateStr: string): string => {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'الآن';
    if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
    if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
    return `منذ ${Math.floor(diff / 86400)} يوم`;
};

const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0][0];
};

export const CommunityPage = () => {
    const { user } = useAuth();
    const requireAuth = useRequireAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState('');
    const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
    const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
    const [isPosting, setIsPosting] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; postId: string | null; isLoading: boolean }>({
        isOpen: false,
        postId: null,
        isLoading: false
    });
    const [reportModal, setReportModal] = useState<{ isOpen: boolean; postId: string | null; reason: string; isLoading: boolean }>({
        isOpen: false,
        postId: null,
        reason: '',
        isLoading: false
    });
    const [replyingTo, setReplyingTo] = useState<{ commentId: string; postId: string; userName: string } | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('حجم الصورة كبير جداً (الأقصى 5 ميجا)');
                return;
            }
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
    };

    const uploadImage = async (file: File): Promise<string | null> => {
        const { url, error } = await storageService.uploadMedia(file);
        if (error) {
            console.error('Error uploading image:', error);
            return null;
        }
        return url;
    };

    const fetchPosts = async () => {
        try {
            const { data, error } = await communityService.getPosts();

            if (error) throw new Error(error);

            if (data) {
                const formattedPosts: Post[] = data.map((post: any) => {
                    const allComments = post.post_comments.map((c: any) => ({
                        id: c.id,
                        post_id: c.post_id,
                        parent_id: c.parent_id,
                        user_id: c.user_id,
                        content: c.content,
                        created_at: c.created_at,
                        user_name: c.profiles?.full_name || 'مستخدم',
                        user_avatar: c.profiles?.avatar_url || '',
                    }));

                    const mainComments = allComments.filter((c: any) => !c.parent_id);
                    const replies: Record<string, Comment[]> = {};
                    allComments.forEach((c: any) => {
                        if (c.parent_id) {
                            if (!replies[c.parent_id]) replies[c.parent_id] = [];
                            replies[c.parent_id].push(c);
                        }
                    });

                    return {
                        id: post.id,
                        user_id: post.user_id,
                        content: post.content,
                        image_url: post.image_url,
                        likes_count: post.likes_count,
                        comments_count: post.comments_count,
                        created_at: post.created_at,
                        user_name: post.profiles?.full_name || 'مستخدم',
                        user_avatar: post.profiles?.avatar_url || '',
                        liked_by: post.post_likes.map((l: any) => l.user_id),
                        comments: mainComments,
                        replies
                    };
                });
                setPosts(formattedPosts);
            }
        } catch (error: any) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleCreatePost = async () => {
        if (!requireAuth('سجّل دخولك الأول عشان تقدر تنشر بوست 📝')) return;
        if (!newPostContent.trim() && !selectedImage) return;

        setIsPosting(true);
        try {
            let imageUrl = null;
            if (selectedImage) {
                imageUrl = await uploadImage(selectedImage);
                if (!imageUrl) {
                    toast.error('فشل رفع الصورة، حاول مرة أخرى');
                    setIsPosting(false);
                    return;
                }
            }

            const sanitizedContent = sanitizeInput(newPostContent);
            const { error } = await communityService.createPost(sanitizedContent, imageUrl);

            if (error) throw new Error(error);

            setNewPostContent('');
            removeImage();
            fetchPosts();
            toast.success('تم النشر بنجاح! 🚀');
        } catch (error: any) {
            console.error('Error creating post:', error);
            toast.error(error.message || 'حدث خطأ أثناء النشر');
        } finally {
            setIsPosting(false);
        }
    };

    const handleLike = async (postId: string) => {
        if (!requireAuth('سجّل دخولك عشان تقدر تعمل لايك ❤️')) return;
        const userId = user?.id;
        if (!userId) return;

        const post = posts.find(p => p.id === postId);
        const isLiked = post?.liked_by?.includes(userId);

        try {
            const { error } = await communityService.toggleLike(postId, !!isLiked);
            if (error) throw new Error(error);

            // Refresh posts locally for better UX
            setPosts(prev => prev.map(p => {
                if (p.id !== postId) return p;
                const newLikedBy = isLiked
                    ? (p.liked_by || []).filter(id => id !== userId)
                    : [...(p.liked_by || []), userId];
                return {
                    ...p,
                    liked_by: newLikedBy,
                    likes_count: isLiked ? p.likes_count - 1 : p.likes_count + 1
                };
            }));

        } catch (error: any) {
            console.error('Error toggling like:', error);
            toast.error(error.message || 'عذراً، حدث خطأ أثناء محاولة الإعجاب');
        }
    };

    const handleComment = async (postId: string) => {
        if (!requireAuth('سجّل دخولك عشان تقدر تعلّق 💬')) return;
        const content = commentInputs[postId]?.trim();
        if (!content || !user) return;

        try {
            const parentId = replyingTo?.postId === postId ? replyingTo.commentId : null;
            const sanitizedContent = sanitizeInput(content);
            const { error } = await communityService.createComment(postId, sanitizedContent, parentId);

            if (error) throw new Error(error);

            setCommentInputs(prev => ({ ...prev, [postId]: '' }));
            setReplyingTo(null);
            fetchPosts();
            toast.success(replyingTo ? 'تم إضافة الرد' : 'تم إضافة التعليق');
        } catch (error: any) {
            console.error('Error adding comment:', error);
            toast.error(error.message || 'حدث خطأ أثناء التعليق');
        }
    };

    const handleReportPost = (postId: string) => {
        if (!requireAuth('سجّل دخولك عشان تقدر تبلّغ عن محتوى 🚩')) return;
        setReportModal({ isOpen: true, postId, reason: '', isLoading: false });
    };

    const confirmReportPost = async () => {
        if (!reportModal.postId || !reportModal.reason.trim()) {
            toast.error('يرجى كتابة سبب البلاغ');
            return;
        }
        setReportModal(prev => ({ ...prev, isLoading: true }));
        try {
            const { error } = await communityService.reportPost(reportModal.postId, reportModal.reason.trim());
            if (error) throw new Error(error);
            toast.success('تم إرسال البلاغ للادمن للمراجعة');
            setReportModal({ isOpen: false, postId: null, reason: '', isLoading: false });
        } catch (error: any) {
            console.error('Error reporting post:', error);
            toast.error(error.message || 'حدث خطأ أثناء إرسال البلاغ');
            setReportModal(prev => ({ ...prev, isLoading: false }));
        }
    };

    const handleDeletePost = async (postId: string) => {
        setDeleteModal({ isOpen: true, postId, isLoading: false });
    };

    const confirmDeletePost = async () => {
        if (!deleteModal.postId) return;
        setDeleteModal(prev => ({ ...prev, isLoading: true }));
        try {
            const { error } = await communityService.deletePost(deleteModal.postId);
            if (error) throw new Error(error);
            setPosts(prev => prev.filter(p => p.id !== deleteModal.postId));
            toast.success('تم حذف البوست بنجاح');
            setDeleteModal({ isOpen: false, postId: null, isLoading: false });
        } catch (error: any) {
            console.error('Error deleting post:', error);
            toast.error(error.message || 'حدث خطأ أثناء الحذف');
            setDeleteModal(prev => ({ ...prev, isLoading: false }));
        }
    };

    const toggleComments = (postId: string) => {
        setExpandedComments(prev => {
            const n = new Set(prev);
            n.has(postId) ? n.delete(postId) : n.add(postId);
            return n;
        });
    };

    if (loading) return <LoadingSpinner fullPage message="جاري تحميل المجتمع الزراعي..." />;

    return (
        <PageContainer maxWidth="lg">
            <PageHeader
                badge={
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-black tracking-widest uppercase">
                        <Sparkles className="w-3 h-3" />
                        شارك خبرتك وتعلّم من الآخرين
                    </div>
                }
                title={<>المجتمع <span className="text-brand-primary">الزراعي</span></>}
                description="مكانك لمشاركة الأفكار، طرح الأسئلة، والتواصل مع زملائك في المجال الزراعي."
                icon={Users}
            />

            {/* Report Modal */}
            <AnimatePresence>
                {reportModal.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setReportModal({ isOpen: false, postId: null, reason: '', isLoading: false })}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6 sm:p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                                        <AlertTriangle className="w-6 h-6 text-amber-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-text-primary leading-tight">إبلاغ عن محتوى</h3>
                                        <p className="text-text-muted text-sm font-bold">ساعدنا في الحفاظ على مجتمع آمن</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-text-primary mb-2">سبب الإبلاغ</label>
                                        <textarea
                                            value={reportModal.reason}
                                            onChange={(e) => setReportModal(prev => ({ ...prev, reason: e.target.value }))}
                                            placeholder="اكتب سبب الإبلاغ هنا..."
                                            className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-brand-primary focus:ring-0 transition-all font-bold text-sm resize-none"
                                            rows={4}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-8">
                                    <button
                                        onClick={() => setReportModal({ isOpen: false, postId: null, reason: '', isLoading: false })}
                                        className="px-6 py-4 rounded-2xl bg-slate-100 text-text-muted font-black text-sm hover:bg-slate-200 transition-all"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        onClick={confirmReportPost}
                                        disabled={reportModal.isLoading || !reportModal.reason.trim()}
                                        className="px-6 py-4 rounded-2xl bg-brand-primary text-white font-black text-sm hover:bg-brand-primary-hover shadow-lg shadow-brand-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {reportModal.isLoading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : 'إرسال البلاغ'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Create Post */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-border-subtle p-5 sm:p-8 shadow-xl shadow-slate-200/40 mb-8"
            >
                <div className="flex gap-4">
                    <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0 text-brand-primary font-black text-sm sm:text-lg">
                        {user?.user_metadata?.full_name ? getInitials(user.user_metadata.full_name) : '👤'}
                    </div>
                    <div className="flex-1">
                        <textarea
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            placeholder="شارك فكرة، سؤال، أو تجربة زراعية..."
                            rows={3}
                            className="w-full resize-none bg-surface-primary border border-border-subtle rounded-2xl p-4 text-text-primary font-bold placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm sm:text-base"
                        />

                        {/* Image Preview */}
                        <AnimatePresence>
                            {imagePreview && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="relative mt-4 rounded-2xl overflow-hidden border border-border-subtle group"
                                >
                                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                                    <button
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    id="post-image"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                                <label
                                    htmlFor="post-image"
                                    className="p-2.5 rounded-xl bg-surface-primary text-text-muted hover:text-brand-primary hover:bg-brand-primary/5 transition-all cursor-pointer"
                                >
                                    <Image className="w-5 h-5" />
                                </label>
                            </div>
                            <Button
                                variant="premium"
                                size="sm"
                                icon={Send}
                                onClick={handleCreatePost}
                                disabled={(!newPostContent.trim() && !selectedImage) || isPosting}
                            >
                                {isPosting ? 'جاري النشر...' : 'انشر'}
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Posts Feed */}
            <div className="space-y-6 sm:space-y-8">
                <AnimatePresence>
                    {posts.map((post, index) => {
                        const isLiked = (post.liked_by || []).includes(user?.id || '');
                        const isOwner = post.user_id === user?.id;
                        const showComments = expandedComments.has(post.id);

                        return (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-border-subtle p-5 sm:p-8 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-brand-primary/5 transition-all duration-500"
                            >
                                {/* Post Header */}
                                <div className="flex items-start justify-between mb-5">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-accent/20 flex items-center justify-center text-brand-primary font-black text-sm sm:text-lg border-2 border-brand-primary/10">
                                            {post.user_name ? getInitials(post.user_name) : '؟'}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-text-primary text-sm sm:text-base">{post.user_name || 'مستخدم مجهول'}</h4>
                                            <span className="text-text-muted text-xs font-bold">{timeAgo(post.created_at)}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleReportPost(post.id)}
                                            className="p-2 rounded-xl text-text-muted hover:text-amber-500 hover:bg-amber-50 transition-all"
                                            title="إبلاغ عن محتوى غير لائق"
                                        >
                                            <AlertTriangle className="w-4 h-4" />
                                        </button>
                                        {isOwner && (
                                            <button
                                                onClick={() => handleDeletePost(post.id)}
                                                className="p-2 rounded-xl text-text-muted hover:text-red-500 hover:bg-red-50 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Post Content */}
                                <p className="text-text-primary font-bold text-sm sm:text-base leading-relaxed mb-6 whitespace-pre-wrap">
                                    {post.content}
                                </p>

                                {post.image_url && (
                                    <div className="rounded-2xl overflow-hidden mb-6 border border-border-subtle">
                                        <img src={post.image_url} alt="Post" className="w-full object-cover max-h-96" />
                                    </div>
                                )}

                                {/* Counters */}
                                <div className="flex items-center justify-between text-xs text-text-muted font-bold pb-4 border-b border-border-subtle mb-4">
                                    <span>{post.likes_count > 0 ? `${post.likes_count} إعجاب` : ''}</span>
                                    <span>{post.comments_count > 0 ? `${post.comments_count} تعليق` : ''}</span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleLike(post.id)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm transition-all ${isLiked
                                            ? 'text-red-500 bg-red-50 hover:bg-red-100'
                                            : 'text-text-muted bg-surface-primary hover:bg-brand-primary/5 hover:text-brand-primary'
                                            }`}
                                    >
                                        <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                                        إعجاب
                                    </button>
                                    <button
                                        onClick={() => toggleComments(post.id)}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm text-text-muted bg-surface-primary hover:bg-brand-primary/5 hover:text-brand-primary transition-all"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                        تعليق
                                    </button>
                                </div>

                                {/* Comments Section */}
                                <AnimatePresence>
                                    {showComments && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="mt-5 pt-5 border-t border-border-subtle space-y-4">
                                                {(post.comments || []).map((comment) => (
                                                    <div key={comment.id} className="space-y-3">
                                                        <div className="flex gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-surface-primary flex items-center justify-center text-text-muted font-black text-xs shrink-0">
                                                                {comment.user_name ? getInitials(comment.user_name) : '؟'}
                                                            </div>
                                                            <div className="flex-1 bg-surface-primary rounded-2xl p-3 sm:p-4 relative group">
                                                                <span className="font-black text-text-primary text-xs block mb-1">{comment.user_name}</span>
                                                                <p className="text-text-secondary text-xs sm:text-sm font-bold leading-relaxed">{comment.content}</p>
                                                                <div className="flex items-center gap-4 mt-2">
                                                                    <span className="text-text-muted text-[10px] font-bold">{timeAgo(comment.created_at)}</span>
                                                                    {isOwner && (
                                                                        <button
                                                                            onClick={() => {
                                                                                setReplyingTo({ commentId: comment.id, postId: post.id, userName: comment.user_name || '' });
                                                                                setCommentInputs(prev => ({ ...prev, [post.id]: `@${comment.user_name} ` }));
                                                                            }}
                                                                            className="text-brand-primary text-[10px] font-black hover:underline"
                                                                        >
                                                                            رد
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Nested Replies */}
                                                        {post.replies?.[comment.id]?.map(reply => (
                                                            <div key={reply.id} className="flex gap-3 mr-8 sm:mr-12">
                                                                <div className="w-7 h-7 rounded-full bg-brand-primary/5 flex items-center justify-center text-brand-primary font-black text-[10px] shrink-0 border border-brand-primary/10">
                                                                    {reply.user_name ? getInitials(reply.user_name) : '؟'}
                                                                </div>
                                                                <div className="flex-1 bg-brand-primary/5 rounded-2xl p-3 border border-brand-primary/10">
                                                                    <span className="font-black text-text-primary text-[10px] block mb-1">{reply.user_name}</span>
                                                                    <p className="text-text-secondary text-xs font-bold leading-relaxed">{reply.content}</p>
                                                                    <span className="text-text-muted text-[9px] font-bold mt-1 block">{timeAgo(reply.created_at)}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}

                                                {/* Replying Status */}
                                                {replyingTo && replyingTo.postId === post.id && (
                                                    <div className="flex items-center justify-between bg-brand-primary/10 px-4 py-2 rounded-xl text-[10px] font-bold text-brand-primary">
                                                        <span>جاري الرد على: {replyingTo.userName}</span>
                                                        <button onClick={() => {
                                                            setReplyingTo(null);
                                                            setCommentInputs(prev => ({ ...prev, [post.id]: '' }));
                                                        }}><X className="w-3 h-3" /></button>
                                                    </div>
                                                )}

                                                {/* Add Comment */}
                                                <div className="flex gap-3 items-center">
                                                    <div className="w-9 h-9 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black text-xs shrink-0">
                                                        {user?.user_metadata?.full_name ? getInitials(user.user_metadata.full_name) : '👤'}
                                                    </div>
                                                    <div className="flex-1 flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={commentInputs[post.id] || ''}
                                                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                            onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                                                            placeholder="اكتب تعليق..."
                                                            className="flex-1 bg-surface-primary border border-border-subtle rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                                                        />
                                                        <button
                                                            onClick={() => handleComment(post.id)}
                                                            disabled={!commentInputs[post.id]?.trim()}
                                                            className="p-2.5 bg-brand-primary text-white rounded-xl hover:bg-brand-primary-hover disabled:opacity-30 transition-all"
                                                        >
                                                            <Send className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, postId: null, isLoading: false })}
                onConfirm={confirmDeletePost}
                isLoading={deleteModal.isLoading}
                title="حذف المنشور"
                message="هل أنت متأكد من حذف هذا المنشور نهائياً؟ لا يمكن التراجع عن هذا الإجراء."
                confirmText="حذف الآن"
                cancelText="تراجع"
                type="danger"
            />
        </PageContainer>
    );
};
