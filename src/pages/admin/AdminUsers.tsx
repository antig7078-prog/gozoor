import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Mail, CheckCircle, Trash2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../components/shared/ConfirmModal';
import { PageContainer } from '../../components/shared/PageContainer';
import { PageHeader } from '../../components/shared/PageHeader';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { SearchBar } from '../../components/shared/SearchBar';
import { EmptyState } from '../../components/shared/EmptyState';
import type { Profile } from '../../types';

export const AdminUsers = () => {
    const [users, setUsers] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'danger' | 'warning' | 'info';
        onConfirm: () => void;
        confirmText: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => { },
        confirmText: 'تأكيد'
    });

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
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

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = (user: Profile) => {
        setConfirmConfig({
            isOpen: true,
            title: 'حذف المستخدم',
            message: `هل أنت متأكد من حذف الحساب الخاص بـ "${user.full_name || user.email}"؟ لا يمكن التراجع عن هذا الإجراء وسيتم مسح كافة البيانات المرتبطة.`,
            type: 'danger',
            confirmText: 'حذف الحساب',
            onConfirm: async () => {
                setIsActionLoading(true);
                try {
                    const { error } = await supabase.from('profiles').delete().eq('id', user.id);
                    if (error) throw error;
                    toast.success('تم حذف المستخدم بنجاح');
                    setUsers(prev => prev.filter(u => u.id !== user.id));
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    toast.error('فشل في حذف المستخدم');
                } finally {
                    setIsActionLoading(false);
                }
            }
        });
    };

    const handleRoleToggle = (user: Profile) => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        setConfirmConfig({
            isOpen: true,
            title: 'تغيير رتبة المستخدم',
            message: `هل أنت متأكد من تحويل "${user.full_name || user.email}" إلى ${newRole === 'admin' ? 'مسؤول (Admin)' : 'طالب (User)'}؟`,
            type: 'warning',
            confirmText: 'تغيير الرتبة',
            onConfirm: async () => {
                setIsActionLoading(true);
                try {
                    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', user.id);
                    if (error) throw error;
                    toast.success('تم تغيير الرتبة بنجاح');
                    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole as any } : u));
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    toast.error('فشل تغيير الصلاحيات');
                } finally {
                    setIsActionLoading(false);
                }
            }
        });
    };

    const filteredUsers = users.filter(u =>
        (u.full_name && u.full_name.includes(searchTerm)) ||
        (u.email && u.email.includes(searchTerm))
    );

    return (
        <PageContainer maxWidth="xl" noPadding>
            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={() => !isActionLoading && setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                type={confirmConfig.type}
                confirmText={confirmConfig.confirmText}
                isLoading={isActionLoading}
            />

            <PageHeader
                title="إدارة المستخدمين"
                description="عرض وإدارة جميع حسابات الطلاب والمسؤولين في منصة جذور."
                icon={Users}
                actions={
                    <SearchBar
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                        showFilter={false}
                    />
                }
            />

            <div className="bg-white rounded-card border border-border-default shadow-sm overflow-hidden">
                <div className="responsive-table-container overflow-x-auto hide-scrollbar">
                    <table className="w-full text-right min-w-[700px]">
                        <thead className="bg-surface-primary border-b border-border-default text-text-secondary text-sm">
                            <tr>
                                <th className="px-6 py-4 font-bold">المستخدم</th>
                                <th className="px-6 py-4 font-bold">تاريخ الانضمام</th>
                                <th className="px-6 py-4 font-bold">الحالة</th>
                                <th className="px-6 py-4 font-bold text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20">
                                        <LoadingSpinner size="lg" message="جاري تحميل المستخدمين..." />
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-12">
                                        <EmptyState
                                            icon={Users}
                                            title="لم يتم العثور على مستخدمين!"
                                            message="تأكد من إنشاء جدول profiles في قاعدة البيانات أو حاول استخدام مصطلح بحث مختلف."
                                            className="border-none shadow-none"
                                        />
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-surface-primary/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-brand-primary-light flex items-center justify-center text-brand-primary font-bold">
                                                    {user.full_name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-text-primary">{user.full_name || 'مستخدم جديد'}</p>
                                                    <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
                                                        <Mail className="w-3 h-3" /> {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-text-secondary">
                                                {new Date(user.created_at).toLocaleDateString('ar-EG')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-button text-xs font-bold bg-brand-primary-light text-brand-primary`}>
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                نشط
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => handleDeleteUser(user)}
                                                    className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-button transition-colors"
                                                    title="حذف"
                                                    aria-label={`حذف المستخدم ${user.full_name}`}
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleRoleToggle(user)}
                                                    className="p-2 text-text-muted hover:text-indigo-600 hover:bg-indigo-50 rounded-button transition-colors"
                                                    title="تبديل الصلاحية"
                                                    aria-label={`تغيير صلاحية ${user.full_name}`}
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
        </PageContainer>
    );
};
