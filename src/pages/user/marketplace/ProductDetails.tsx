import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShoppingBag, 
    ShoppingCart, 
    Star, 
    ChevronRight, 
    Check, 
    Package, 
    ArrowRight, 
    MessageSquare, 
    MessageCircle, 
    User, 
    Calendar,
    Sparkles,
    Send
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../../lib/supabase';
import { useCartStore } from '../../../lib/store/cartStore';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { useAuth } from '../../../contexts/AuthContext';
import { PageContainer } from '../../../components/shared/PageContainer';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/shared/Card';
import { StarRating } from '../../../components/shared/StarRating';
import { reviewService } from '../../../services/reviewService';
import { messagingService } from '../../../services/messagingService';
import { notificationService } from '../../../services/notificationService';

interface Product {
    id: string;
    seller_id: string;
    title: string;
    description: string;
    price: number;
    stock: number;
    image_url: string;
    category: string;
    profiles?: {
        full_name: string;
        whatsapp: string;
        phone: string;
        avatar_url?: string;
    }
}

export const ProductDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const requireAuth = useRequireAuth();
    
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewsRefresh, setReviewsRefresh] = useState(0);
    const [userRating, setUserRating] = useState(5);
    const [userComment, setUserComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    // Edit review states
    const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
    const [editingRating, setEditingRating] = useState<number>(5);
    const [editingComment, setEditingComment] = useState<string>('');

    useEffect(() => {
        const fetchProductAndReviews = async () => {
            if (!id) return;
            try {
                // Fetch product details
                const { data: productData, error: productError } = await supabase
                    .from('products')
                    .select('*, profiles:seller_id(full_name, whatsapp, phone, avatar_url)')
                    .eq('id', id)
                    .single();

                if (productError) throw productError;
                if (productData) setProduct(productData);

                // Fetch reviews
                const { data: reviewsData, error: reviewsError } = await reviewService.getReviews('Product', id);
                if (reviewsError) throw reviewsError;
                if (reviewsData) setReviews(reviewsData);

            } catch (error) {
                console.error('Error fetching product details/reviews:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProductAndReviews();
    }, [id, reviewsRefresh]);

    // Re-fetch reviews separately when reviewsRefresh changes
    useEffect(() => {
        const fetchReviewsOnly = async () => {
            if (!id) return;
            try {
                const { data: reviewsData, error: reviewsError } = await reviewService.getReviews('Product', id);
                if (reviewsError) throw reviewsError;
                if (reviewsData) setReviews(reviewsData);
            } catch (err) {
                console.error('Error fetching reviews:', err);
            }
        };
        fetchReviewsOnly();
    }, [id, reviewsRefresh]);

    const addItem = useCartStore((state) => state.addItem);
    const isOwner = user?.id === product?.seller_id;

    // Calculate rating details
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
        ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
        : 5.0; // default state if no reviews

    // Calculate count of each star level
    const starCounts = [0, 0, 0, 0, 0];
    reviews.forEach(r => {
        const ratingIndex = Math.min(Math.max(r.rating - 1, 0), 4);
        starCounts[ratingIndex]++;
    });

    const addToCart = () => {
        if (!requireAuth('سجّل دخولك الأول عشان تقدر تضيف منتجات للسلة 🛒')) return;
        if (!product) return;
        
        if (isOwner) {
            toast.error('لا يمكنك إضافة منتجك الخاص إلى السلة!');
            return;
        }

        addItem({
            id: product.id,
            seller_id: product.seller_id,
            title: product.title,
            price: product.price,
            image_url: product.image_url
        });
        toast.success(`تمت إضافة ${product.title} إلى السلة بنجاح!`);
    };

    const contactSellerWhatsApp = () => {
        if (isOwner) {
            toast.error('لا يمكنك التواصل مع نفسك!');
            return;
        }

        if (!product?.profiles?.whatsapp && !product?.profiles?.phone) {
            toast.error('عذراً، التاجر لم يضف بيانات التواصل بعد.');
            return;
        }

        if (product.profiles.whatsapp) {
            window.open(`https://wa.me/${product.profiles.whatsapp}`, '_blank');
        } else {
            window.location.href = `tel:${product.profiles.phone}`;
        }
    };

    const contactSellerThroughSite = async () => {
        if (!requireAuth('سجّل دخولك الأول لتتمكن من مراسلة التاجر 💬')) return;
        if (!product) return;
        if (isOwner) {
            toast.error('لا يمكنك التواصل مع نفسك!');
            return;
        }

        const loadingToast = toast.loading('جاري فتح المحادثة مع التاجر...');
        try {
            const { data, error } = await messagingService.startConversation({
                participantId: product.seller_id,
                contextType: 'product',
                contextId: product.id,
                contextTitle: product.title
            });

            if (error) throw new Error(error);
            
            toast.dismiss(loadingToast);
            toast.success(`تم بدء محادثة مع التاجر بنجاح!`);
            
            if (data?.id) {
                navigate(`/messages?conversationId=${data.id}`);
            } else {
                navigate('/messages');
            }
        } catch (error: any) {
            toast.dismiss(loadingToast);
            toast.error(error.message || 'فشل بدء المحادثة');
            console.error(error);
        }
    };

    const handleStartEdit = (rev: any) => {
        setEditingReviewId(rev.id);
        setEditingRating(rev.rating);
        setEditingComment(rev.comment || '');
    };

    const handleCancelEdit = () => {
        setEditingReviewId(null);
        setEditingRating(5);
        setEditingComment('');
    };

    const handleUpdateReview = async (reviewId: string) => {
        if (editingRating < 1 || editingRating > 5) {
            toast.error('يرجى تحديد التقييم بالنجوم (1-5).');
            return;
        }

        setSubmittingReview(true);
        try {
            const { error } = await reviewService.updateReview(reviewId, editingRating, editingComment);
            if (error) throw new Error(error);

            toast.success('تم تحديث تقييمك بنجاح!');
            setEditingReviewId(null);
            setReviewsRefresh(prev => prev + 1);
        } catch (err: any) {
            console.error('Error updating review:', err);
            toast.error(err.message || 'فشل تحديث التقييم. حاول مرة أخرى.');
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا التقييم؟')) return;

        try {
            const { success, error } = await reviewService.deleteReview(reviewId);
            if (error) throw new Error(error);

            toast.success('تم حذف التقييم بنجاح!');
            setReviewsRefresh(prev => prev + 1);
        } catch (err: any) {
            console.error('Error deleting review:', err);
            toast.error(err.message || 'فشل حذف التقييم. حاول مرة أخرى.');
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!requireAuth('يجب تسجيل الدخول أولاً لإضافة تقييم 🌟')) return;
        if (!product) return;
        
        if (isOwner) {
            toast.error('لا يمكنك تقييم منتجك الخاص!');
            return;
        }
        if (userRating < 1 || userRating > 5) {
            toast.error('يرجى تحديد التقييم بالنجوم (1-5).');
            return;
        }

        setSubmittingReview(true);
        try {
            const { error } = await reviewService.addReview({
                item_type: 'Product',
                item_id: product.id,
                rating: userRating,
                comment: userComment.trim() || undefined
            });

            if (error) throw new Error(error);
            
            toast.success('تمت إضافة تقييمك بنجاح! شكراً لك.');
            setUserComment('');
            setUserRating(5);
            setReviewsRefresh(prev => prev + 1);

            // Send notification to the product seller
            if (product.seller_id) {
                notificationService.sendNotification({
                    userId: product.seller_id,
                    title: 'تقييم جديد لمنتجك',
                    content: `قام أحد المشترين بإضافة تقييم بقيمة (${userRating} نجوم) لمنتجك "${product.title}".`,
                    type: 'success',
                    link: `/marketplace/product/${product.id}`
                }).catch(err => console.error('Error sending review notification:', err));
            }
        } catch (err: any) {
            console.error('Error submitting review:', err);
            toast.error(err.message || 'فشل إرسال التقييم. حاول مرة أخرى.');
        } finally {
            setSubmittingReview(false);
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    if (loading) {
        return <LoadingSpinner fullPage message="جاري استعراض تفاصيل المنتج..." />;
    }

    if (!product) {
        return (
            <PageContainer>
                <div className="text-center py-32 bg-white rounded-[2.5rem] border border-border-subtle shadow-xl max-w-2xl mx-auto" dir="rtl">
                    <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-10 h-10 text-slate-350" />
                    </div>
                    <h2 className="text-3xl font-black text-text-primary mb-4">المنتج غير متوفر</h2>
                    <p className="text-text-secondary mb-8 font-bold">عذراً، لم نتمكن من العثور على المنتج الذي تبحث عنه.</p>
                    <Link 
                        to="/marketplace" 
                        className="inline-flex items-center gap-3 px-8 py-4 bg-brand-primary text-white rounded-full font-black shadow-lg shadow-brand-primary/20 hover:scale-105 transition-transform"
                    >
                        <ArrowRight className="w-5 h-5" />
                        العودة للتسوق
                    </Link>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer maxWidth="xl">
            {/* Navigation Path Breadcrumb */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8" dir="rtl">
                <Link to="/marketplace" className="inline-flex items-center gap-2 text-text-muted hover:text-brand-primary font-black transition-colors group">
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    <span>العودة لمتجر جذور</span>
                </Link>
                <div className="flex items-center gap-2 text-xs font-bold text-text-muted">
                    <span>السوق</span>
                    <ChevronRight className="w-3 h-3 rotate-180" />
                    <span>{product.category || 'منتجات'}</span>
                    <ChevronRight className="w-3 h-3 rotate-180" />
                    <span className="text-brand-primary truncate max-w-[200px]">{product.title}</span>
                </div>
            </div>

            {/* Product Overview Layout Card */}
            <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-100/50 border border-slate-100 flex flex-col lg:flex-row relative mb-12" dir="rtl">
                <div className="absolute top-0 right-0 w-full h-1.5 bg-brand-primary"></div>
                
                {/* Visual Area (Product Image) */}
                <div className="lg:w-1/2 bg-slate-50 relative overflow-hidden flex items-center justify-center min-h-[350px] sm:min-h-[450px] lg:min-h-[600px] border-l border-slate-100">
                    {product.image_url ? (
                        <motion.img
                            initial={{ scale: 1.05 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.8 }}
                            src={product.image_url}
                            alt={product.title}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-103"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-3 text-slate-350">
                            <ShoppingBag className="w-32 h-32 stroke-[1]" />
                            <span className="font-bold text-sm">لا توجد صورة للمنتج</span>
                        </div>
                    )}
                    
                    {/* Premium Rating Badge Overlay */}
                    <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100/50 z-20 hover:scale-105 transition-transform duration-300">
                        <div className="p-2.5 bg-amber-50 rounded-xl text-amber-500">
                            <Star className="w-5 h-5 fill-amber-400 stroke-amber-500" />
                        </div>
                        <div>
                            <div className="text-[10px] text-text-muted font-black tracking-widest uppercase">التقييم العام</div>
                            <div className="text-base font-black text-text-primary flex items-baseline gap-1">
                                <span>{averageRating}</span>
                                <span className="text-[10px] text-slate-400 font-bold">({totalReviews} تقييم)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details and Description Info Panel */}
                <div className="lg:w-1/2 p-6 sm:p-10 lg:p-16 flex flex-col justify-between">
                    <div>
                        {/* Upper Badges */}
                        <div className="mb-6 flex flex-wrap gap-2.5 items-center">
                            <Badge variant="premium" size="sm" className="bg-brand-primary/10 text-brand-primary border-brand-primary/10">
                                {product.category || 'عام'}
                            </Badge>
                            <Badge variant="secondary" size="sm" className="bg-indigo-50 text-indigo-600 border-indigo-100">
                                <Check className="w-3.5 h-3.5 ml-1 inline-block" />
                                منتج موثق ومفحوص
                            </Badge>
                        </div>

                        {/* Title and Price */}
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-800 mb-5 leading-tight">{product.title}</h1>
                        
                        <div className="inline-flex items-baseline gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-3.5 mb-8">
                            <span className="text-3xl sm:text-4xl font-black text-brand-primary">{product.price.toLocaleString('ar-EG')}</span>
                            <span className="text-sm font-bold text-text-muted">جنيه مصري</span>
                        </div>

                        {/* Description Box */}
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-5 bg-brand-primary rounded-full"></div>
                                <h3 className="text-lg font-black text-slate-800">تفاصيل المنتج</h3>
                            </div>
                            <p className="text-slate-600 leading-relaxed font-semibold text-sm sm:text-base bg-slate-50/50 p-5 rounded-2xl border border-slate-100/50 whitespace-pre-line">
                                {product.description || 'هذا المنتج يقدم لك جودة استثنائية وتجربة مستخدم فريدة مصممة لتلبية احتياجاتك الإبداعية والمهنية في منصة جذور.'}
                            </p>
                        </div>

                        {/* Vendor & Stock Badges */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            <Card className="p-4 bg-slate-50/60 border-slate-100 hover:border-slate-200 transition-colors" hoverable={false}>
                                <div className="flex items-center gap-2 text-text-muted text-[10px] font-black uppercase tracking-widest mb-1.5">
                                    <Package className="w-4 h-4 text-slate-400" />
                                    حالة المخزون
                                </div>
                                <div className={`text-sm font-black ${product.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {product.stock > 0 ? `${product.stock} قطع متوفرة في المستودع` : 'عذراً، نفدت الكمية'}
                                </div>
                            </Card>

                            <Link to={`/profile/${product.seller_id}`} className="block">
                                <Card className="p-4 bg-slate-50/60 border-slate-100 hover:border-brand-primary/30 transition-colors cursor-pointer" hoverable={false}>
                                    <div className="flex items-center gap-2 text-text-muted text-[10px] font-black uppercase tracking-widest mb-1.5">
                                        <User className="w-4 h-4 text-slate-400" />
                                        التاجر / المعلن
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {product.profiles?.avatar_url && (
                                            <img 
                                                src={product.profiles.avatar_url} 
                                                alt={product.profiles.full_name} 
                                                className="w-5 h-5 rounded-full object-cover"
                                            />
                                        )}
                                        <div className="text-sm font-black text-brand-primary hover:underline truncate">
                                            {product.profiles?.full_name || 'بائع معتمد'}
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        </div>
                    </div>

                    {/* Quick Purchase & Messaging Contact Buttons */}
                    <div className="space-y-4 pt-6 border-t border-slate-100">
                        {isOwner && (
                            <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-xl text-center font-bold text-xs">
                                💡 هذا منتجك الخاص، يمكنك إدارته من لوحة التحكم.
                            </div>
                        )}
                        
                        <Button 
                            onClick={addToCart}
                            disabled={product.stock <= 0 || isOwner}
                            variant="primary"
                            size="lg"
                            className="w-full py-4 text-base font-black shadow-lg shadow-brand-primary/20 hover:shadow-xl hover:shadow-brand-primary/30 active:scale-98 transition-all flex items-center justify-center gap-2 rounded-2xl"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            {isOwner ? 'منتجك الخاص' : 'شراء وإضافة إلى السلة الآن'}
                        </Button>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Contact through Site Chat */}
                            <button 
                                onClick={contactSellerThroughSite}
                                disabled={isOwner}
                                className="w-full py-3.5 px-6 border border-indigo-200 text-indigo-600 bg-indigo-50/30 hover:bg-indigo-50/80 active:scale-98 transition-all flex items-center justify-center gap-2 rounded-xl text-sm font-black disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <MessageSquare className="w-4.5 h-4.5" />
                                <span>تواصل مع التاجر عبر الموقع</span>
                            </button>

                            {/* Contact via WhatsApp */}
                            <button 
                                onClick={contactSellerWhatsApp}
                                disabled={isOwner}
                                className="w-full py-3.5 px-6 border border-emerald-200 text-emerald-600 bg-emerald-50/30 hover:bg-emerald-50/80 active:scale-98 transition-all flex items-center justify-center gap-2 rounded-xl text-sm font-black disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <MessageCircle className="w-4.5 h-4.5 text-emerald-500" />
                                <span>التواصل عبر الواتس آب</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ratings, Statistics & Review Form Section */}
            <div className="mt-16 bg-white rounded-[2.5rem] border border-slate-100 p-6 sm:p-10 shadow-xl shadow-slate-100/50" dir="rtl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8 mb-10">
                    <div>
                        <div className="flex items-center gap-2 text-brand-primary mb-2">
                            <Sparkles className="w-5 h-5 fill-brand-primary/20" />
                            <span className="text-xs font-black tracking-widest uppercase">آراء وتجارب المشترين</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-800">تقييمات ومراجعات العملاء</h2>
                    </div>

                    {/* Dynamic Ratings Summary */}
                    <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-4 sm:p-6 rounded-2xl self-start md:self-auto">
                        <div className="text-center px-4 border-l border-slate-200">
                            <div className="text-3xl sm:text-4xl font-black text-slate-800">{averageRating}</div>
                            <div className="text-[10px] font-black text-slate-400 mt-1">من أصل 5 نجوم</div>
                        </div>
                        <div>
                            <StarRating rating={Math.round(averageRating)} size={18} />
                            <div className="text-xs font-bold text-slate-400 mt-1">{totalReviews} تقييمات مكتوبة ومسجلة</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* Add Review Form Column (4 cols) */}
                    <div className="lg:col-span-5">
                        <div className="bg-slate-50/50 border border-slate-150 rounded-3xl p-6 sm:p-8">
                            <h3 className="text-lg font-black text-slate-800 mb-2">أضف تقييمك ورأيك</h3>
                            <p className="text-xs text-slate-400 font-bold mb-6">شاركنا رأيك الإيجابي أو ملاحظاتك لمساعدة الآخرين في اتخاذ القرار.</p>

                            {isOwner ? (
                                <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-xl text-center font-bold text-xs">
                                    💡 لا يمكنك إضافة تقييم أو مراجعة لمنتجك الخاص.
                                </div>
                            ) : (
                                <form onSubmit={handleSubmitReview} className="space-y-6">
                                    {/* Stars Selector */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-slate-700">حدد تقييمك بالنجوم</label>
                                        <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex justify-center shadow-sm">
                                            <StarRating 
                                                rating={userRating} 
                                                interactive={true} 
                                                onChange={setUserRating} 
                                                size={32} 
                                            />
                                        </div>
                                    </div>

                                    {/* Comment field */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-slate-700">ملاحظاتك ومراجعتك (اختياري)</label>
                                        <textarea
                                            rows={4}
                                            placeholder="اكتب هنا تجربتك مع المنتج، الجودة، التوصيل، تعاملك مع التاجر..."
                                            value={userComment}
                                            onChange={(e) => setUserComment(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-semibold text-sm text-slate-700 placeholder-slate-400"
                                        ></textarea>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={submittingReview}
                                        className="w-full py-3.5 rounded-xl text-sm font-black shadow-md shadow-brand-primary/10 flex items-center justify-center gap-2"
                                        icon={Send}
                                    >
                                        {submittingReview ? 'جاري الإرسال...' : 'إرسال التقييم الآن'}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Review List Column (7 cols) */}
                    <div className="lg:col-span-7 space-y-6">
                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <span>جميع المراجعات</span>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-xs font-black">{totalReviews}</span>
                        </h3>

                        {reviews.length === 0 ? (
                            <div className="text-center p-12 bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-slate-400">
                                <Star className="w-12 h-12 stroke-[1] mx-auto mb-3 text-slate-350" />
                                <p className="font-bold text-base mb-1">لا توجد تقييمات لهذا المنتج بعد</p>
                                <p className="text-xs">كن أول من يضيف تقييماً ويشاركنا تجربته الاستثنائية!</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                                <AnimatePresence initial={false}>
                                    {reviews.map((rev) => (
                                        <motion.div
                                            key={rev.id}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="bg-white border border-slate-150 hover:border-slate-200 rounded-3xl p-6 shadow-sm transition-all duration-200"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                                                <div className="flex items-center gap-3">
                                                    {rev.profile?.avatar_url ? (
                                                        <img
                                                            src={rev.profile.avatar_url}
                                                            alt={rev.profile.full_name || 'صورة المستخدم'}
                                                            className="w-11 h-11 rounded-xl object-cover border border-slate-100"
                                                        />
                                                    ) : (
                                                        <div className="w-11 h-11 rounded-xl bg-slate-150 flex items-center justify-center text-slate-400 border border-slate-200/50">
                                                            <User className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h4 className="font-black text-slate-800 text-sm leading-tight">
                                                            {rev.profile?.full_name || 'مستخدم مجهول'}
                                                        </h4>
                                                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold mt-1">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            <span>{formatDate(rev.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 self-start sm:self-auto">
                                                    {user && rev.user_id === user.id && editingReviewId !== rev.id && (
                                                        <div className="flex items-center gap-2.5 text-xs font-bold text-text-muted border-l border-slate-200 pl-3">
                                                            <button 
                                                                onClick={() => handleStartEdit(rev)} 
                                                                className="text-indigo-600 hover:text-indigo-850 hover:underline transition-colors"
                                                            >
                                                                تعديل
                                                            </button>
                                                            <span className="text-slate-200">|</span>
                                                            <button 
                                                                onClick={() => handleDeleteReview(rev.id)} 
                                                                className="text-rose-500 hover:text-rose-700 hover:underline transition-colors"
                                                            >
                                                                حذف
                                                            </button>
                                                        </div>
                                                    )}
                                                    <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-1 flex">
                                                        <StarRating rating={rev.rating} size={14} />
                                                    </div>
                                                </div>
                                            </div>

                                            {editingReviewId === rev.id ? (
                                                <div className="space-y-4 pt-2">
                                                    <div className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                                                        <span className="text-xs font-black text-slate-700">تعديل التقييم بالنجوم:</span>
                                                        <StarRating 
                                                            rating={editingRating} 
                                                            interactive={true} 
                                                            onChange={setEditingRating} 
                                                            size={20} 
                                                        />
                                                    </div>
                                                    <textarea
                                                        rows={3}
                                                        value={editingComment}
                                                        onChange={(e) => setEditingComment(e.target.value)}
                                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-semibold text-sm text-slate-700 placeholder-slate-400"
                                                        placeholder="تعديل تعليقك ومراجعتك هنا..."
                                                    />
                                                    <div className="flex gap-2">
                                                        <Button 
                                                            onClick={() => handleUpdateReview(rev.id)} 
                                                            disabled={submittingReview}
                                                            size="sm"
                                                            className="px-4 py-2 text-xs font-black"
                                                        >
                                                            {submittingReview ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                                                        </Button>
                                                        <Button 
                                                            onClick={handleCancelEdit} 
                                                            variant="secondary"
                                                            size="sm"
                                                            className="px-4 py-2 text-xs font-black border-slate-200 text-slate-500"
                                                        >
                                                            إلغاء
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : rev.comment ? (
                                                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line font-medium">
                                                    {rev.comment}
                                                </p>
                                            ) : (
                                                <p className="text-slate-400 text-xs italic font-medium">لا يوجد تعليق مكتوب</p>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};
