import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userService } from '../../../services/userService';
import { marketplaceService } from '../../../services/marketplaceService';
import { courseService } from '../../../services/courseService';
import { useAuth } from '../../../contexts/AuthContext';
import { Store, ArrowRight, Info, Image as ImageIcon, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { PageContainer } from '../../../components/shared/PageContainer';
import { PageHeader } from '../../../components/shared/PageHeader';
import { ImageUpload } from '../../../components/shared/ImageUpload';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { sanitizeInput, sanitizeUrl } from '../../../utils/sanitize';

export const AddProduct = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);
    const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
    const [hasMissingProfileInfo, setHasMissingProfileInfo] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        const checkProfileAndCategories = async () => {
            if (!user) return;
            try {
                // Check profile
                const { data: profileData, error: profileError } = await userService.getProfile(user.id);
                if (profileError) throw new Error(profileError);

                if (profileData) {
                    setVerificationStatus(profileData.verification_status || 'unverified');
                    const hasMissing = !profileData.full_name?.trim() || !profileData.phone?.trim() || !profileData.whatsapp?.trim();
                    setHasMissingProfileInfo(hasMissing);
                }

                // Fetch product categories
                const { data: catData, error: catError } = await courseService.getCategories('product');
                if (!catError && catData) {
                    setCategories(catData);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setProfileLoading(false);
            }
        };

        checkProfileAndCategories();
    }, [user, navigate]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        stock: '1',
        category: '',
        image_url: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        try {
            const { error } = await marketplaceService.createProduct({
                title: sanitizeInput(formData.title),
                description: sanitizeInput(formData.description),
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock, 10),
                category: sanitizeInput(formData.category),
                image_url: sanitizeUrl(formData.image_url),
                seller_id: user.id
            });

            if (error) throw new Error(error);
            toast.success('تم إضافة المنتج بنجاح!');
            navigate('/user-products');
        } catch (error: any) {
            toast.error(error.message || 'حدث خطأ أثناء إضافة المنتج');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <PageContainer maxWidth="lg">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                {profileLoading ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                        <LoadingSpinner size="lg" />
                        <p className="text-text-muted font-bold">جاري التحقق من بيانات ملفك الشخصي...</p>
                    </div>
                ) : hasMissingProfileInfo ? (
                    <div className="bg-white border border-border-subtle rounded-[2.5rem] p-10 sm:p-16 text-center space-y-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/5 rounded-full blur-3xl" />
                        
                        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner relative z-10">
                            <AlertTriangle className="w-10 h-10 animate-pulse" />
                        </div>
                        
                        <div className="space-y-3 relative z-10 max-w-xl mx-auto">
                            <h3 className="text-2xl font-black text-text-primary">برجاء إكمال بياناتك الشخصية أولاً ⚠️</h3>
                            <p className="text-sm font-bold text-text-secondary leading-relaxed">
                                لتتمكن من إضافة منتجات جديدة للسوق، يجب أولاً إكمال بياناتك الشخصية الأساسية (الاسم بالكامل، رقم الهاتف، ورقم الواتساب) في ملفك الشخصي.
                            </p>
                        </div>

                        <div className="pt-6 flex flex-col sm:flex-row justify-center gap-4 relative z-10 font-bold">
                            <Link
                                to="/profile"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-2xl shadow-lg shadow-brand-primary/20 transition-all text-sm font-black"
                            >
                                تحديث الملف الشخصي الآن
                            </Link>
                            <Link
                                to="/user-products"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-50 border border-slate-200 text-text-secondary hover:bg-slate-100 rounded-2xl shadow-sm transition-all text-sm"
                            >
                                العودة للخلف
                            </Link>
                        </div>
                    </div>
                ) : verificationStatus !== 'verified' ? (
                    <div className="bg-white border border-border-subtle rounded-[2.5rem] p-10 sm:p-16 text-center space-y-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/5 rounded-full blur-3xl" />
                        
                        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner relative z-10">
                            <AlertTriangle className="w-10 h-10 animate-pulse" />
                        </div>
                        
                        <div className="space-y-3 relative z-10 max-w-xl mx-auto">
                            <h3 className="text-2xl font-black text-text-primary">مطلوب توثيق الحساب وإثبات الهوية ⚠️</h3>
                            <p className="text-sm font-bold text-text-secondary leading-relaxed">
                                لتتمكن من إضافة منتجات جديدة للسوق، يجب أولاً توثيق حسابك وإثبات هويتك من خلال رفع صورة بطاقة الرقم القومي وملء بياناتك الشخصية الأساسية.
                            </p>
                            
                            {verificationStatus === 'pending' && (
                                <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-xs font-bold text-blue-700">
                                    ⏳ طلب التوثيق الخاص بك قيد المراجعة حالياً من قبل الإدارة. سيتم تفعيل حسابك فور الموافقة عليه.
                                </div>
                            )}

                            {verificationStatus === 'rejected' && (
                                <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-bold text-red-700">
                                    ❌ لقد تم رفض طلبك السابق. يرجى تعديل المستندات وإعادة تقديم الطلب من الملف الشخصي.
                                </div>
                            )}
                        </div>

                        <div className="pt-6 flex flex-col sm:flex-row justify-center gap-4 relative z-10 font-bold">
                            <Link
                                to="/profile"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-2xl shadow-lg shadow-brand-primary/20 transition-all text-sm font-black"
                            >
                                الانتقال لصفحة توثيق الحساب
                            </Link>
                            <Link
                                to="/user-products"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-50 border border-slate-200 text-text-secondary hover:bg-slate-100 rounded-2xl shadow-sm transition-all text-sm"
                            >
                                العودة للخلف
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        <PageHeader
                            title="إضافة منتج جديد"
                            description="قم بإضافة منتجك الجديد إلى سوق جذور وشاركه مع المجتمع."
                            icon={Store}
                            actions={
                                <div className="w-full sm:w-auto">
                                    <Link
                                        to="/user-products"
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-border-default text-text-secondary rounded-[var(--radius-button)] font-black text-xs hover:bg-slate-50 transition-all shadow-sm w-full sm:w-auto"
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                        <span>الرجوع لمنتجاتي</span>
                                    </Link>
                                </div>
                            }
                        />

                        <div className="bg-white rounded-[var(--radius-card)] border border-border-subtle shadow-2xl shadow-slate-200/50 overflow-hidden">
                            <div className="p-8 md:p-12 border-b border-slate-50 bg-surface-primary/30">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                                        <Info className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-text-primary">بيانات المتجر</h3>
                                        <p className="text-text-muted font-bold mt-1">سيتم مراجعة منتجك من قبل الإدارة قبل ظهوره في المتجر العام لضمان الجودة.</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 md:p-12 space-y-8 md:space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                    {/* Title */}
                                    <div className="space-y-3 md:col-span-2">
                                        <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                                            اسم المنتج
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            required
                                            value={formData.title}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 bg-surface-primary border border-border-subtle rounded-[var(--radius-button)] focus:bg-white focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-text-primary"
                                            placeholder="مثال: حقيبة لابتوب جلدية فاخرة"
                                        />
                                    </div>

                                    {/* Price */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                                            السعر (ج.م)
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="price"
                                                required
                                                min="0.01"
                                                step="0.01"
                                                value={formData.price}
                                                onChange={handleChange}
                                                className="w-full px-6 py-4 bg-surface-primary border border-border-subtle rounded-[var(--radius-button)] focus:bg-white focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-black text-text-primary pr-12"
                                                placeholder="0.00"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 font-black text-xs uppercase">EGP</div>
                                        </div>
                                    </div>

                                    {/* Stock */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                                            الكمية المتوفرة
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="stock"
                                            required
                                            min="1"
                                            value={formData.stock}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 bg-surface-primary border border-border-subtle rounded-[var(--radius-button)] focus:bg-white focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-black text-text-primary"
                                            placeholder="10"
                                        />
                                    </div>

                                    {/* Category */}
                                    <div className="space-y-3 md:col-span-2">
                                        <label className="text-sm font-black text-slate-700 flex items-center gap-2">التصنيف</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 bg-surface-primary border border-border-subtle rounded-[var(--radius-button)] focus:bg-white focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-text-primary appearance-none"
                                        >
                                            <option value="">اختر تصنيفاً للمنتج...</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.name}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                            <option value="أخرى">أخرى</option>
                                        </select>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-3 md:col-span-2">
                                        <label className="text-sm font-black text-slate-700 flex items-center gap-2">وصف المنتج</label>
                                        <textarea
                                            name="description"
                                            rows={5}
                                            value={formData.description}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 bg-surface-primary border border-border-subtle rounded-[var(--radius-button)] focus:bg-white focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-text-primary resize-none leading-relaxed"
                                            placeholder="اكتب تفاصيل ومميزات المنتج بوضوح..."
                                        />
                                    </div>

                                    {/* Image Upload */}
                                    <div className="md:col-span-2">
                                        <ImageUpload 
                                            onUpload={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                                            defaultValue={formData.image_url}
                                            label="صورة المنتج"
                                        />
                                    </div>
                                </div>

                                <div className="pt-10 border-t border-slate-50 flex flex-col sm:flex-row justify-end gap-4">
                                    <Link
                                        to="/user-products"
                                        className="px-10 py-4 bg-surface-primary text-text-secondary rounded-[var(--radius-button)] font-black text-sm hover:bg-slate-100 transition-all text-center order-2 sm:order-1"
                                    >
                                        إلغاء
                                    </Link>
                                    <Button
                                        type="submit"
                                        isLoading={isSubmitting}
                                        variant="premium"
                                        size="lg"
                                        className="px-12 order-1 sm:order-2"
                                        icon={CheckCircle2}
                                    >
                                        نشر المنتج للمراجعة
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </>
                )}
            </motion.div>
        </PageContainer>
    );
};
