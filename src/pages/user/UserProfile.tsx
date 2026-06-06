import { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Save, Camera, Trophy, BookOpen, Phone, MessageCircle, Globe, Briefcase, FileText } from 'lucide-react';
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
            } catch (error: any) {
                console.error(error.message);
            } finally {
                setLoading(false);
            }
        };

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
            toast.success('تم تحديث الملف الشخصي بنجاح');
        } catch (error: any) {
            toast.error('فشل التحديث: ' + error.message);
        } finally {
            setSaving(false);
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
                </motion.div>
            </div>
        </PageContainer>
    );
};






