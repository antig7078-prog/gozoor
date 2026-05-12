import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle, Heart, Send, Image, MoreHorizontal,
    Trash2, Users, Sparkles, X
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { PageContainer } from '../../../components/shared/PageContainer';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { ConfirmModal } from '../../../components/shared/ConfirmModal';

interface Comment {
    id: string;
    post_id: string;
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
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `posts/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('uploads')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('uploads')
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        }
    };

    const fetchPosts = async () => {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select(`
                    *,
                    profiles:user_id (full_name, avatar_url),
                    post_likes (user_id),
                    post_comments (
                        *,
                        profiles:user_id (full_name, avatar_url)
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                const formattedPosts: Post[] = data.map((post: any) => ({
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
                    comments: post.post_comments.map((c: any) => ({
                        id: c.id,
                        post_id: c.post_id,
                        user_id: c.user_id,
                        content: c.content,
                        created_at: c.created_at,
                        user_name: c.profiles?.full_name || 'مستخدم',
                        user_avatar: c.profiles?.avatar_url || '',
                    }))
                }));
                setPosts(formattedPosts);
            }
        } catch (error) {
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

            const { error } = await supabase.from('posts').insert([{
                user_id: user?.id,
                content: newPostContent.trim(),
                image_url: imageUrl
            }]);

            if (error) throw error;
            
            setNewPostContent('');
            removeImage();
            fetchPosts();
            toast.success('تم النشر بنجاح! 🚀');
        } catch (error) {
            console.error('Error creating post:', error);
            toast.error('حدث خطأ أثناء النشر');
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
            if (isLiked) {
                // Unlike
                const { error: deleteError } = await supabase
                    .from('post_likes')
                    .delete()
                    .match({ post_id: postId, user_id: userId });
                
                if (deleteError) throw deleteError;

                // Update count
                await supabase.rpc('decrement_likes', { post_id_val: postId });
            } else {
                // Like
                const { error: insertError } = await supabase
                    .from('post_likes')
                    .insert([{ post_id: postId, user_id: userId }]);
                
                if (insertError) throw insertError;

                // Update count
                await supabase.rpc('increment_likes', { post_id_val: postId });
            }
            
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

        } catch (error) {
            console.error('Error toggling like:', error);
            toast.error('عذراً، حدث خطأ أثناء محاولة الإعجاب');
        }
    };

    const handleComment = async (postId: string) => {
        if (!requireAuth('سجّل دخولك عشان تقدر تعلّق 💬')) return;
        const content = commentInputs[postId]?.trim();
        if (!content || !user) return;

        try {
            const { error: commentError } = await supabase
                .from('post_comments')
                .insert([{
                    post_id: postId,
                    user_id: user.id,
                    content
                }]);

            if (commentError) throw commentError;

            // Update count
            await supabase.rpc('increment_comments', { post_id_val: postId });

            setCommentInputs(prev => ({ ...prev, [postId]: '' }));
            fetchPosts();
            toast.success('تم إضافة التعليق');
        } catch (error) {
            console.error('Error adding comment:', error);
            toast.error('حدث خطأ أثناء التعليق');
        }
    };

    const handleDeletePost = async (postId: string) => {
        setDeleteModal({ isOpen: true, postId, isLoading: false });
    };

    const confirmDeletePost = async () => {
        if (!deleteModal.postId) return;
        setDeleteModal(prev => ({ ...prev, isLoading: true }));
        try {
            const { error } = await supabase.from('posts').delete().eq('id', deleteModal.postId);
            if (error) throw error;
            setPosts(prev => prev.filter(p => p.id !== deleteModal.postId));
            toast.success('تم حذف البوست بنجاح');
            setDeleteModal({ isOpen: false, postId: null, isLoading: false });
        } catch (error) {
            console.error('Error deleting post:', error);
            toast.error('حدث خطأ أثناء الحذف');
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
                                    {isOwner && (
                                        <button
                                            onClick={() => handleDeletePost(post.id)}
                                            className="p-2 rounded-xl text-text-muted hover:text-red-500 hover:bg-red-50 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
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
                                                    <div key={comment.id} className="flex gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-surface-primary flex items-center justify-center text-text-muted font-black text-xs shrink-0">
                                                            {comment.user_name ? getInitials(comment.user_name) : '؟'}
                                                        </div>
                                                        <div className="flex-1 bg-surface-primary rounded-2xl p-3 sm:p-4">
                                                            <span className="font-black text-text-primary text-xs block mb-1">{comment.user_name}</span>
                                                            <p className="text-text-secondary text-xs sm:text-sm font-bold leading-relaxed">{comment.content}</p>
                                                            <span className="text-text-muted text-[10px] font-bold mt-2 block">{timeAgo(comment.created_at)}</span>
                                                        </div>
                                                    </div>
                                                ))}

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
