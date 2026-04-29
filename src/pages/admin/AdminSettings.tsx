import { useState } from 'react';
import { Settings, Globe, Shield, Save, Database } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageContainer } from '../../components/shared/PageContainer';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card } from '../../components/shared/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const AdminSettings = () => {
    const [isSaving, setIsSaving] = useState(false);
    const [settings, setSettings] = useState({
        siteName: 'منصة جذور التعليمية',
        supportEmail: 'support@jozour.com',
        allowRegistration: true,
        maintenanceMode: false,
    });

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Placeholder for saving settings to Supabase
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('تم حفظ إعدادات المنصة بنجاح!');
        } catch (error) {
            toast.error('حدث خطأ أثناء الحفظ.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <PageContainer maxWidth="lg">
            <PageHeader
                title="إعدادات المنصة"
                description="التحكم في التكوينات الأساسية وخيارات تشغيل منصة جذور."
                icon={Settings}
                actions={
                    <Button
                        onClick={handleSave}
                        variant="premium"
                        isLoading={isSaving}
                        icon={Save}
                    >
                        حفظ التغييرات
                    </Button>
                }
            />

            <div className="space-y-8 pb-10">
                {/* General Settings */}
                <Card>
                    <h2 className="text-xl font-black text-text-primary flex items-center gap-3 border-b border-border-subtle pb-4 mb-6">
                        <Globe className="w-6 h-6 text-blue-500" />
                        الإعدادات العامة
                    </h2>

                    <div className="space-y-6">
                        <Input
                            label="اسم المنصة"
                            value={settings.siteName}
                            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                        />
                        <Input
                            label="البريد الإلكتروني للدعم الفني"
                            type="email"
                            value={settings.supportEmail}
                            onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                        />
                    </div>
                </Card>

                {/* System & Security */}
                <Card>
                    <h2 className="text-xl font-black text-text-primary flex items-center gap-3 border-b border-border-subtle pb-4 mb-6">
                        <Shield className="w-6 h-6 text-brand-primary" />
                        النظام والأمان
                    </h2>

                    <div className="space-y-6">
                        <div className="flex items-start justify-between gap-4 p-5 border border-border-subtle rounded-2xl bg-surface-primary/50">
                            <div>
                                <h3 className="font-black text-text-primary">السماح بتسجيل حسابات جديدة</h3>
                                <p className="text-sm font-bold text-text-secondary mt-1">عند تفعيل هذا الخيار، سيتمكن أي شخص من إنشاء حساب طالب جديد.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                                <input type="checkbox" className="sr-only peer" checked={settings.allowRegistration} onChange={e => setSettings({ ...settings, allowRegistration: e.target.checked })} />
                                <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand-primary"></div>
                            </label>
                        </div>

                        <div className="flex items-start justify-between gap-4 p-5 border border-red-100 rounded-2xl bg-red-50/20">
                            <div>
                                <h3 className="font-black text-red-700">وضع الصيانة (Maintenance Mode)</h3>
                                <p className="text-sm font-bold text-red-500/80 mt-1">تفعيل هذا الخيار سيؤدي إلى إيقاف المنصة مؤقتاً للطلاب مع ظهور رسالة صيانة.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                                <input type="checkbox" className="sr-only peer" checked={settings.maintenanceMode} onChange={e => setSettings({ ...settings, maintenanceMode: e.target.checked })} />
                                <div className="w-14 h-7 bg-red-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                            </label>
                        </div>
                    </div>
                </Card>

                {/* Database Info */}
                <Card className="relative overflow-hidden group">
                    <Database className="absolute -left-4 -top-4 w-32 h-32 text-slate-100 rotate-12 -z-0" />
                    <div className="relative z-10">
                        <h2 className="text-xl font-black text-text-primary flex items-center gap-3 border-b border-border-subtle pb-4 mb-6">
                            قاعدة البيانات والخوادم
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <p className="text-text-muted text-sm font-bold mb-1">مزود قاعدة البيانات</p>
                                <p className="font-black text-xl text-brand-primary">Supabase (PostgreSQL)</p>
                            </div>
                            <div>
                                <p className="text-text-muted text-sm font-bold mb-1">حالة الاتصال</p>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-brand-primary animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                                    <p className="font-black text-xl text-text-primary">متصل ومستقر</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </PageContainer>
    );
};





