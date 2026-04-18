import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Search, Mail, Shield, Loader2, Ban, CheckCircle, ShieldAlert, Trash2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminUsers = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Fetching from a hypothetical 'profiles' table that synchronizes with auth.users
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                // We use a try-catch because the table might not exist yet
                const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
                if (error) {
                    console.log("Profiles table might not exist yet.");
                    setUsers([]);
                } else {
                    setUsers(data || []);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter(u =>
        (u.full_name && u.full_name.includes(searchTerm)) ||
        (u.email && u.email.includes(searchTerm))
    );

    return (
        <div className="max-w-7xl mx-auto" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <Users className="w-8 h-8 text-emerald-600" />
                        إدارة المستخدمين
                    </h1>
                    <p className="text-slate-500 font-semibold mt-2">
                        عرض وإدارة جميع حسابات الطلاب والمسؤولين في منصة جذور.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4 items-center bg-slate-50/50">
                    <div className="relative w-full md:w-96">
                        <Search className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                            <tr>
                                <th className="px-6 py-4 font-bold">المستخدم</th>
                                <th className="px-6 py-4 font-bold">تاريخ الانضمام</th>
                                <th className="px-6 py-4 font-bold">الدور (Role)</th>
                                <th className="px-6 py-4 font-bold">الحالة</th>
                                <th className="px-6 py-4 font-bold text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-4" />
                                        <span className="text-slate-500 font-bold">جاري تحميل المستخدمين...</span>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Users className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <span className="text-slate-500 font-bold text-lg">لم يتم العثور على مستخدمين!</span>
                                        <p className="text-slate-400 text-sm mt-1">تأكد من إنشاء جدول profiles في قاعدة البيانات أو لا توجد نتائج للبحث.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                                                    {user.full_name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{user.full_name || 'طالب جديد'}</p>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                        <Mail className="w-3 h-3" /> {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-slate-600">
                                                {new Date(user.created_at).toLocaleDateString('ar-EG')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                                                {user.role === 'admin' ? <ShieldAlert className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                                                {user.role === 'admin' ? 'مسؤول (Admin)' : 'طالب (User)'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${user.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                {user.status === 'active' ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                                                {user.status === 'active' ? 'نشط' : 'محظور'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
                                                            const { error } = await supabase.from('profiles').delete().eq('id', user.id);
                                                            if (error) toast.error('فشل في حذف المستخدم');
                                                            else {
                                                                toast.success('تم حذف المستخدم بنجاح');
                                                                setUsers(users.filter(u => u.id !== user.id));
                                                            }
                                                        }
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="حذف"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        const newRole = user.role === 'admin' ? 'user' : 'admin';
                                                        const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', user.id);
                                                        if (error) toast.error('فشل تغيير الصلاحيات');
                                                        else {
                                                            toast.success('تم تغيير الرتبة بنجاح');
                                                            setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
                                                        }
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="تبديل الصلاحية"
                                                >
                                                    <ShieldCheck className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
