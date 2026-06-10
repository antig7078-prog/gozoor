import { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Save, Camera, Trophy, BookOpen, Phone, MessageCircle, Globe, Briefcase, FileText, ShieldCheck, CheckCircle2, Clock, AlertTriangle, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageContainer } from '../../components/shared/PageContainer';
import { PageHeader } from '../../components/shared/PageHeader';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { Card } from '../../components/shared/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { motion } from 'framer-motion';
import { sanitizeInput, sanitizeUrl } from '../../utils/sanitize';
import { ImageUpload } from '../../components/shared/ImageUpload';

export const UserProfile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [bio, setBio] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [portfolioUrl, setPortfolioUrl] = useState('');
    const [verificationStatus, setVerificationStatus] = useState<'unverified' | 'pending' | 'verified' | 'rejected'>('unverified');
    const [identityDocumentUrl, setIdentityDocumentUrl] = useState('');
    const [identityDocumentBackUrl, setIdentityDocumentBackUrl] = useState('');
    const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const { data, error } = await userService.getProfile(user.id);

                if (error) throw new Error(error);
                setFullName(data?.full_name || '');
                setPhone(data?.phone || '');
                setWhatsapp(data?.whatsapp || '');
                setBio(data?.bio || '');
                setSpecialization(data?.specialization || '');
                setPortfolioUrl(data?.portfolio_url || '');
                setVerificationStatus(data?.verification_status || 'unverified');
                setIdentityDocumentUrl(data?.identity_document_url || '');
                setIdentityDocumentBackUrl(data?.identity_document_back_url || '');
            } catch (error: any) {
                console.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        if (!user) return;
        try {
            const { data, error } = await userService.getProfile(user.id);
            if (error) throw new Error(error);
            setFullName(data?.full_name || '');
            setPhone(data?.phone || '');
            setWhatsapp(data?.whatsapp || '');
            setBio(data?.bio || '');
            setSpecialization(data?.specialization || '');
            setPortfolioUrl(data?.portfolio_url || '');
            setVerificationStatus(data?.verification_status || 'unverified');
            setIdentityDocumentUrl(data?.identity_document_url || '');
            setIdentityDocumentBackUrl(data?.identity_document_back_url || '');
        } catch (error: any) {
            console.error(error.message);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        try {
            const { error } = await userService.updateProfile(user.id, { 
                full_name: sanitizeInput(fullName),
                phone: sanitizeInput(phone),
                whatsapp: sanitizeInput(whatsapp),
                bio: sanitizeInput(bio),
                specialization: sanitizeInput(specialization),
                portfolio_url: sanitizeUrl(portfolioUrl)
            });

            if (error) throw new Error(error);
            
            await fetchProfile();
            
            const { data: verifyData } = await userService.getProfile(user.id);
            const saved = verifyData?.full_name === sanitizeInput(fullName);
            
            if (!saved) {
                toast.error('فشل الحفظ: البيانات لم تُحفظ في قاعدة البيانات. تحقق من صلاحيات الحساب.');
            } else {
                toast.success('تم تحديث الملف الشخصي بنجاح');
            }
        } catch (error: any) {
            toast.error('فشل التحديث: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleRequestVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (!fullName.trim()) {
            toast.error('يرجى ملء الاسم بالكامل أولاً');
            return;
        }

        if (!phone.trim()) {
            toast.error('يرجى ملء رقم الهاتف أولاً');
            return;
        }

        if (!whatsapp.trim()) {
            toast.error('يرجى ملء رقم الواتساب أولاً');
            return;
        }


        if (!identityDocumentUrl) {
            toast.error('يرجى رفع صورة وجه البطاقة');
            return;
        }

        if (!identityDocumentBackUrl) {
            toast.error('يرجى رفع صورة ظهر البطاقة');
            return;
        }

        setIsSubmittingVerification(true);
        try {
            const { error } = await userService.updateProfile(user.id, {
                full_name: sanitizeInput(fullName),
                phone: sanitizeInput(phone),
                whatsapp: sanitizeInput(whatsapp),
                bio: sanitizeInput(bio),
                specialization: sanitizeInput(specialization),
                portfolio_url: sanitizeUrl(portfolioUrl),
                identity_document_url: identityDocumentUrl,
                identity_document_back_url: identityDocumentBackUrl,
                verification_status: 'pending'
            });

            if (error) throw new Error(error);
            
            await fetchProfile();
            
            const { data: verifyData } = await userService.getProfile(user.id);
            const saved = verifyData?.verification_status === 'pending';
            
            if (!saved) {
                toast.error('فشل الحفظ: طلب التوثيق لم يُحفظ في قاعدة البيانات. تحقق من صلاحيات الحساب.');
            } else {
                setVerificationStatus('pending');
                toast.success('تم إرسال طلب إثبات الهوية بنجاح! جاري مراجعته من قبل الإدارة.');
            }
        } catch (error: any) {
            toast.error('فشل إرسال الطلب: ' + error.message);
        } finally {
            setIsSubmittingVerification(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullPage message="جاري تحميل الملف الشخصي..." />;
    }

    return (
        <PageContainer maxWidth="xl" noPadding>
            <PageHeader
                title="الملف الشخصي"
                description="تحكم في بياناتك الشخصية وتفضيلات حسابك على جذور."
                icon={User}
            />

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Side: Avatar & Info Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full lg:w-80 space-y-6"
                >
                    <Card className="text-center" padding="lg">
                        <div className="relative inline-block group mb-6">
                            <div className="w-32 h-32 rounded-full bg-brand-primary/5 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-105">
                                <User className="w-16 h-16 text-brand-primary" />
                            </div>
                            <button className="absolute bottom-0 right-0 p-3 bg-brand-primary text-white rounded-full shadow-lg hover:bg-brand-primary-hover transition-all scale-0 group-hover:scale-100 origin-bottom-left duration-300">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>

                        <h2 className="text-xl font-black text-text-primary truncate">{fullName || 'مستخدم جديد'}</h2>
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                            <Badge variant="secondary" size="sm">
                                حساب نشط
                            </Badge>
                        </div>
                    </Card>

                    <div className="bg-brand-primary/5 rounded-[var(--radius-card)] border border-brand-primary/10 p-6 space-y-6 relative overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-brand-primary/10 rounded-full blur-2xl" />
                        <h3 className="font-black text-brand-primary text-xs uppercase tracking-widest relative z-10">إحصائيات سريعة</h3>
                        <div className="grid grid-cols-1 gap-4 relative z-10">
                            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-brand-primary/10 flex items-center gap-4">
                                <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xl font-black text-text-primary leading-none">0</p>
                                    <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-tighter">دورات مكتملة</p>
                                </div>
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-brand-primary/10 flex items-center gap-4">
                                <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                                    <Trophy className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xl font-black text-text-primary leading-none">0</p>
                                    <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-tighter">شهادات معتمدة</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side: Profile Form */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex-1"
                >
                    <Card hoverable={false} padding="lg">
                        <form onSubmit={handleSave} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Input
                                    label="الاسم بالكامل *"
                                    icon={User}
                                    placeholder="ادخل اسمك بالكامل"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />

                                <Input
                                    label="البريد الإلكتروني"
                                    icon={Mail}
                                    disabled
                                    value={user?.email || ''}
                                    helperText="لا يمكن تغيير البريد الإلكتروني لدواعي أمنية."
                                    className="cursor-not-allowed"
                                />

                                <Input
                                    label="رقم الهاتف"
                                    icon={Phone}
                                    placeholder="ادخل رقم هاتفك"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />

                                <Input
                                    label="رقم الواتساب"
                                    icon={MessageCircle}
                                    placeholder="ادخل رقم الواتساب الخاص بك"
                                    value={whatsapp}
                                    onChange={(e) => setWhatsapp(e.target.value)}
                                />

                                <Input
                                    label="التخصص المهني"
                                    icon={Briefcase}
                                    placeholder="مثال: مصمم جرافيك، مبرمج ويب، كاتب محتوى"
                                    value={specialization}
                                    onChange={(e) => setSpecialization(e.target.value)}
                                />

                                <Input
                                    label="رابط معرض الأعمال (Portfolio)"
                                    icon={Globe}
                                    placeholder="https://behance.net/username"
                                    value={portfolioUrl}
                                    onChange={(e) => setPortfolioUrl(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-black text-text-secondary flex items-center gap-2 mb-2">
                                    <FileText className="w-4 h-4 text-brand-primary" />
                                    نبذة تعريفية (Bio)
                                </label>
                                <textarea
                                    className="w-full min-h-[150px] p-4 rounded-2xl border border-slate-100 bg-slate-50/30 focus:bg-white focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/5 transition-all font-bold text-slate-700 outline-none resize-none"
                                    placeholder="اكتب نبذة عن خبراتك ومهاراتك لكي يراها العملاء..."
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                />
                                <p className="text-[10px] text-text-muted font-bold">هذه النبذة ستظهر للعملاء في صفحات الخدمات التي تقدمها.</p>
                            </div>

                            <div className="pt-8 border-t border-border-subtle flex justify-end">
                                <Button
                                    type="submit"
                                    variant="premium"
                                    size="lg"
                                    isLoading={saving}
                                    icon={Save}
                                >
                                    حفظ التغييرات
                                </Button>
                            </div>
                        </form>
                    </Card>

                    <Card hoverable={false} padding="lg" className="mt-8 overflow-hidden relative border border-border-subtle shadow-lg">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl" />
                        
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-50 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shadow-inner">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-text-primary">إثبات الهوية وتوثيق الحساب</h3>
                                <p className="text-xs text-text-muted font-bold mt-1">يلزم توثيق الهوية لتتمكن من نشر الوظائف، التقديم عليها، أو عرض المنتجات للبيع.</p>
                            </div>
                        </div>

                        {/* Status Banners */}
                        <div className="mb-8 relative z-10">
                            {verificationStatus === 'verified' && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-4">
                                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-emerald-950 text-base">تم توثيق الحساب بنجاح ✅</h4>
                                        <p className="text-xs text-emerald-700 font-bold mt-1 leading-relaxed">
                                            لقد تم إثبات هويتك وتفعيل حسابك بالكامل. يمكنك الآن الاستمتاع بجميع ميزات المنصة مثل رفع المنتجات وإضافة فرص العمل والتقدم إليها بحرية كاملة.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {verificationStatus === 'pending' && (
                                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-4">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                                        <Clock className="w-6 h-6 animate-pulse" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-blue-950 text-base">طلب التوثيق قيد المراجعة ⏳</h4>
                                        <p className="text-xs text-blue-700 font-bold mt-1 leading-relaxed">
                                            لقد استلمنا بيانات التوثيق الخاصة بك وصورة الهوية. تجري مراجعة طلبك حالياً من قبل فريق الإدارة لتأكيد الحساب في أسرع وقت. شكراً لصبرك!
                                        </p>
                                    </div>
                                </div>
                            )}

                            {verificationStatus === 'rejected' && (
                                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4">
                                    <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-red-950 text-base">تم رفض طلب التوثيق ❌</h4>
                                        <p className="text-xs text-red-700 font-bold mt-1 leading-relaxed">
                                            مع الأسف، تم رفض طلب التوثيق الخاص بك من قبل الإدارة. يرجى مراجعة البيانات المرفوعة وصورة الهوية والتأكد من وضوحها ثم إعادة تقديم الطلب.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {verificationStatus === 'unverified' && (
                                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
                                    <div className="p-2 bg-amber-100/80 text-amber-600 rounded-xl">
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-amber-950 text-base">حسابك غير موثق حالياً ⚠️</h4>
                                        <p className="text-xs text-amber-800 font-bold mt-1 leading-relaxed">
                                            لتتمكن من ممارسة الأنشطة التفاعلية مثل نشر الوظائف أو التقديم عليها أو بيع المنتجات، يرجى ملء النموذج أدناه وإرفاق صورة إثبات الهوية للتوثيق.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Verification Form (only if unverified or rejected) */}
                        {(verificationStatus === 'unverified' || verificationStatus === 'rejected') && (
                            <form onSubmit={handleRequestVerification} className="space-y-6 relative z-10">
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-sm font-black text-text-primary block">صورة إثبات الهوية (وجه وضهر) *</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1">
                                                <ImageUpload
                                                    onUpload={(url) => setIdentityDocumentUrl(url)}
                                                    defaultValue={identityDocumentUrl}
                                                    label="صورة وجه البطاقة *"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <ImageUpload
                                                    onUpload={(url) => setIdentityDocumentBackUrl(url)}
                                                    defaultValue={identityDocumentBackUrl}
                                                    label="صورة ظهر البطاقة *"
                                                />
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-text-muted font-bold mt-2">تأكد من وضوح الصورة والبيانات بالكامل لتجنب رفض الطلب.</p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-50 flex justify-end">
                                    <Button
                                        type="submit"
                                        variant="premium"
                                        size="lg"
                                        isLoading={isSubmittingVerification}
                                        icon={Send}
                                    >
                                        إرسال طلب التوثيق للإدارة
                                    </Button>
                                </div>
                            </form>
                        )}

                        {/* Read-only details if pending or verified */}
                        {(verificationStatus === 'pending' || verificationStatus === 'verified') && (
                            <div className="space-y-6 relative z-10 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <span className="text-xs font-black text-text-muted block mb-2">مستندات إثبات الهوية المرفوعة</span>
                                        <div className="flex flex-wrap gap-4">
                                            {identityDocumentUrl && (
                                                <a 
                                                    href={identityDocumentUrl} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-brand-primary hover:text-brand-primary/80 transition-colors shadow-sm"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                    عرض صورة وجه البطاقة
                                                </a>
                                            )}
                                            {identityDocumentBackUrl && (
                                                <a 
                                                    href={identityDocumentBackUrl} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-brand-primary hover:text-brand-primary/80 transition-colors shadow-sm"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                    عرض صورة ظهر البطاقة
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </motion.div>
            </div>
        </PageContainer>
    );
};






