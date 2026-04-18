import { useState } from 'react';
import { Settings, Globe, Shield, Save, Loader2, Database } from 'lucide-react';
import toast from 'react-hot-toast';

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
            // You can implement an actual 'platform_settings' table here
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('تم حفظ إعدادات المنصة بنجاح!');
        } catch (error) {
            toast.error('حدث خطأ أثناء الحفظ.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <Settings className="w-8 h-8 text-emerald-600" />
                        إعدادات المنصة
                    </h1>
                    <p className="text-slate-500 font-semibold mt-2">
                        التحكم في التكوينات الأساسية وخيارات تشغيل منصة جذور.
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex justify-center items-center gap-2 px-8 py-3.5 bg-emerald-600 border-2 border-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    حفظ التغييرات
                </button>
            </div>

            <div className="space-y-8">
                {/* General Settings */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                        <Globe className="w-6 h-6 text-blue-500" />
                        الإعدادات العامة
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">اسم المنصة</label>
                            <input
                                type="text"
                                value={settings.siteName}
                                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني للدعم الفني</label>
                            <input
                                type="email"
                                value={settings.supportEmail}
                                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* System & Security */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                        <Shield className="w-6 h-6 text-emerald-500" />
                        النظام والأمان
                    </h2>

                    <div className="space-y-6">
                        <div className="flex items-start justify-between gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                            <div>
                                <h3 className="font-bold text-slate-800">السماح بتسجيل حسابات جديدة</h3>
                                <p className="text-sm font-semibold text-slate-500 mt-1">عند تفعيل هذا الخيار، سيتمكن أي شخص من إنشاء حساب طالب جديد.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input type="checkbox" className="sr-only peer" checked={settings.allowRegistration} onChange={e => setSettings({ ...settings, allowRegistration: e.target.checked })} />
                                <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                        </div>

                        <div className="flex items-start justify-between gap-4 p-4 border border-red-100 rounded-xl bg-red-50/20">
                            <div>
                                <h3 className="font-bold text-red-700">وضع الصيانة (Maintenance Mode)</h3>
                                <p className="text-sm font-semibold text-red-500/80 mt-1">تفعيل هذا الخيار سيؤدي إلى إيقاف المنصة مؤقتاً للطلاب مع ظهور رسالة صيانة.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input type="checkbox" className="sr-only peer" checked={settings.maintenanceMode} onChange={e => setSettings({ ...settings, maintenanceMode: e.target.checked })} />
                                <div className="w-14 h-7 bg-red-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Database Info Placeholder */}
                <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm p-6 md:p-8 text-white relative overflow-hidden">
                    <Database className="absolute -left-4 -top-4 w-32 h-32 text-slate-700/50 rotate-12" />
                    <div className="relative z-10">
                        <h2 className="text-xl font-black flex items-center gap-3 border-b border-slate-700 pb-4 mb-6">
                            قاعدة البيانات والخوادم
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-slate-400 text-sm font-bold mb-1">مزود قاعدة البيانات</p>
                                <p className="font-semibold text-lg text-emerald-400">Supabase (PostgreSQL)</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm font-bold mb-1">حالة الاتصال</p>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <p className="font-semibold text-lg">متصل ومستقر</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
