import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Save, Loader2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export const UserProfile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fullName, setFullName] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;
                setFullName(data?.full_name || '');
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
            const { error } = await supabase
                .from('profiles')
                .update({ full_name: fullName })
                .eq('id', user.id);

            if (error) throw error;
            toast.success('تم تحديث الملف الشخصي بنجاح');
        } catch (error: any) {
            toast.error('فشل التحديث: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto" dir="rtl">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                    <User className="w-8 h-8 text-emerald-600" />
                    الملف الشخصي
                </h1>
                <p className="text-slate-500 font-semibold mt-2">قم بتحديث بياناتك الشخصية ومعلومات حسابك.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8">
                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Email - Read Only */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني</label>
                            <div className="relative">
                                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    disabled
                                    value={user?.email}
                                    className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-500 cursor-not-allowed"
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 pr-1">لا يمكن تغيير البريد الإلكتروني لدواعي أمنية.</p>
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">الاسم بالكامل</label>
                            <div className="relative">
                                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="ادخل اسمك بالكامل"
                                    className="w-full pl-4 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-right"
                                />
                            </div>
                        </div>

                        {/* Role Badge */}
                        <div className="pt-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-black">
                                <Shield className="w-3.5 h-3.5" />
                                نوع الحساب: {user?.user_metadata?.role === 'admin' ? 'مدير نظام' : 'طالب'}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white font-black rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transform active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                حفظ التغييرات
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
