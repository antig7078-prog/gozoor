import { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { ShieldCheck, Mail, Phone, FileText, CheckCircle2, XCircle, Search, ExternalLink, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../components/shared/ConfirmModal';
import { PageContainer } from '../../components/shared/PageContainer';
import { PageHeader } from '../../components/shared/PageHeader';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { EmptyState } from '../../components/shared/EmptyState';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import type { Profile } from '../../types';

export const AdminVerifications = () => {
    const [requests, setRequests] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('all'); // all, pending, verified, rejected
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

    // Modal State
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'danger' | 'warning' | 'info' | 'success';
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

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await userService.getPendingVerifications();
            if (error) {
                toast.error('فشل تحميل طلبات التوثيق');
                setRequests([]);
            } else {
                setRequests(data || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = (user: Profile) => {
        setConfirmConfig({
            isOpen: true,
            title: 'تأكيد توثيق الحساب',
            message: `هل أنت متأكد من قبول طلب توثيق الهوية لـ "${user.full_name || user.email}"؟ سيتم تفعيل كامل صلاحيات النشر والتقديم له على المنصة.`,
            type: 'success',
            confirmText: 'قبول التوثيق وتأكيد الحساب',
            onConfirm: async () => {
                setIsActionLoading(true);
                try {
                    const { error } = await userService.updateVerificationStatus(user.id, 'verified');
                    if (error) throw new Error(error);
                    toast.success('تم توثيق الحساب وتفعيله بنجاح');
                    setRequests(prev => prev.map(r => r.id === user.id ? { ...r, verification_status: 'verified' } : r));
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                } catch (error: any) {
                    toast.error(error.message || 'فشل توثيق الحساب');
                } finally {
                    setIsActionLoading(false);
                }
            }
        });
    };

    const handleReject = (user: Profile) => {
        setConfirmConfig({
            isOpen: true,
            title: 'رفض طلب التوثيق',
            message: `هل أنت متأكد من رفض طلب توثيق الهوية لـ "${user.full_name || user.email}"؟ سيتم إبلاغه بالرفض ويمكنه المحاولة ورفع المستندات مرة أخرى.`,
            type: 'danger',
            confirmText: 'رفض طلب التوثيق',
            onConfirm: async () => {
                setIsActionLoading(true);
                try {
                    const { error } = await userService.updateVerificationStatus(user.id, 'rejected');
                    if (error) throw new Error(error);
                    toast.success('تم رفض طلب التوثيق بنجاح');
                    setRequests(prev => prev.map(r => r.id === user.id ? { ...r, verification_status: 'rejected' } : r));
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                } catch (error: any) {
                    toast.error(error.message || 'فشل رفض الطلب');
                } finally {
                    setIsActionLoading(false);
                }
            }
        });
    };

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'verified':
                return <Badge variant="success">مؤكد</Badge>;
            case 'pending':
                return <Badge variant="warning">قيد الانتظار</Badge>;
            case 'rejected':
                return <Badge variant="danger">مرفوض</Badge>;
            default:
                return <Badge variant="secondary">غير موثق</Badge>;
        }
    };

    // Filter logic
    const filteredRequests = requests.filter(r => {
        const matchesSearch = 
            (r.full_name && r.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (r.email && r.email.toLowerCase().includes(searchTerm.toLowerCase()));
            
        const matchesStatus = selectedStatus === 'all' || r.verification_status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    return (
        <PageContainer maxWidth="xl" noPadding>
            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={() => !isActionLoading && setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                type={confirmConfig.type === 'success' ? 'info' : confirmConfig.type}
                confirmText={confirmConfig.confirmText}
                isLoading={isActionLoading}
            />

            {/* Document Preview Modal */}
            {previewImageUrl && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
                    onClick={() => setPreviewImageUrl(null)}
                >
                    <div 
                        className="bg-white rounded-3xl p-4 max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                            <span className="font-black text-text-primary text-base">مستند إثبات الهوية الوطنية</span>
                            <button 
                                onClick={() => setPreviewImageUrl(null)}
                                className="p-1 rounded-full hover:bg-slate-100 text-text-muted transition-colors font-bold text-lg"
                            >
                                إغلاق ✕
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-50 rounded-2xl p-2 min-h-[300px]">
                            <img 
                                src={previewImageUrl} 
                                alt="National ID Document Preview" 
                                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-sm"
                            />
                        </div>
                        <div className="mt-4 flex justify-between items-center text-xs text-text-muted font-bold">
                            <span>اضغط خارج الصورة للإغلاق</span>
                            <a 
                                href={previewImageUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-brand-primary flex items-center gap-1 hover:underline"
                            >
                                <ExternalLink className="w-4 h-4" />
                                فتح في علامة تبويب جديدة
                            </a>
                        </div>
                    </div>
                </div>
            )}

            <PageHeader
                title="إدارة طلبات توثيق الحسابات"
                description="مراجعة وفحص مستندات الهوية والبطاقات الشخصية للتحقق من هوية ناشري الوظائف والمنتجات."
                icon={ShieldCheck}
            />

            {/* Filter and Search Bar */}
            <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-card border border-border-default shadow-sm">
                <div className="relative w-full md:w-80">
                    <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                        type="text"
                        placeholder="ابحث بالاسم، البريد، أو الرقم القومي..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-4 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-button text-sm focus:outline-none focus:border-brand-primary font-bold"
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                    {[
                        { label: 'الكل', value: 'all' },
                        { label: 'قيد الانتظار', value: 'pending' },
                        { label: 'مؤكدة', value: 'verified' },
                        { label: 'مرفوضة', value: 'rejected' },
                    ].map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setSelectedStatus(tab.value)}
                            className={`px-5 py-2.5 rounded-button text-xs font-black whitespace-nowrap transition-all duration-200 ${
                                selectedStatus === tab.value
                                    ? 'bg-brand-primary text-white shadow-md'
                                    : 'bg-slate-50 text-text-secondary hover:bg-slate-100'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table / Listing */}
            <div className="bg-white rounded-card border border-border-default shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="py-20">
                        <LoadingSpinner message="جاري تحميل طلبات التوثيق..." />
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="py-16">
                        <EmptyState
                            title="لا توجد طلبات توثيق"
                            message="لم يتم العثور على أي طلبات تطابق معايير البحث أو التصفية الحالية."
                            icon={ShieldCheck}
                        />
                    </div>
                ) : (
                    <div className="responsive-table-container overflow-x-auto hide-scrollbar">
                        <table className="w-full text-right min-w-[950px]">
                            <thead className="bg-surface-primary border-b border-border-default text-text-secondary text-sm">
                                <tr>
                                    <th className="px-6 py-4 font-bold">صاحب الحساب</th>
                                    <th className="px-6 py-4 font-bold">المستندات</th>
                                    <th className="px-6 py-4 font-bold">الحالة</th>
                                    <th className="px-6 py-4 font-bold text-center">إجراءات التحقق</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-brand-primary overflow-hidden">
                                                    {req.avatar_url ? (
                                                        <img src={req.avatar_url} alt={req.full_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        req.full_name ? req.full_name.charAt(0) : 'U'
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-text-primary text-sm">{req.full_name || 'بدون اسم'}</div>
                                                    <div className="flex flex-col gap-0.5 mt-1">
                                                        <span className="text-xs text-text-muted flex items-center gap-1">
                                                            <Mail className="w-3.5 h-3.5" />
                                                            {req.email}
                                                        </span>
                                                        {(req.phone || req.whatsapp) && (
                                                            <span className="text-[10px] text-text-muted flex items-center gap-1 font-mono">
                                                                <Phone className="w-3.5 h-3.5" />
                                                                {req.whatsapp || req.phone}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2 min-w-[150px]">
                                                {req.identity_document_url ? (
                                                    <div className="flex items-center justify-between gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                                                        <button
                                                            onClick={() => setPreviewImageUrl(req.identity_document_url || null)}
                                                            className="inline-flex items-center gap-1.5 text-slate-700 hover:text-brand-primary text-xs font-black transition-colors"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            وجه البطاقة
                                                        </button>
                                                        <a
                                                            href={req.identity_document_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-text-muted hover:text-brand-primary transition-colors"
                                                            title="تحميل"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-red-500 font-bold">بدون صورة وجه</span>
                                                )}

                                                {req.identity_document_back_url ? (
                                                    <div className="flex items-center justify-between gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                                                        <button
                                                            onClick={() => setPreviewImageUrl(req.identity_document_back_url || null)}
                                                            className="inline-flex items-center gap-1.5 text-slate-700 hover:text-brand-primary text-xs font-black transition-colors"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            ظهر البطاقة
                                                        </button>
                                                        <a
                                                            href={req.identity_document_back_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-text-muted hover:text-brand-primary transition-colors"
                                                            title="تحميل"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-red-500 font-bold">بدون صورة ظهر</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(req.verification_status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {req.verification_status === 'pending' ? (
                                                    <>
                                                        <Button
                                                            variant="premium"
                                                            size="sm"
                                                            icon={CheckCircle2}
                                                            onClick={() => handleApprove(req)}
                                                        >
                                                            تأكيد
                                                        </Button>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            icon={XCircle}
                                                            onClick={() => handleReject(req)}
                                                        >
                                                            رفض
                                                        </Button>
                                                    </>
                                                ) : req.verification_status === 'verified' ? (
                                                    <button
                                                        onClick={() => handleReject(req)}
                                                        className="text-xs font-black text-red-500 hover:text-red-600 hover:underline"
                                                    >
                                                        إلغاء التوثيق
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleApprove(req)}
                                                        className="text-xs font-black text-brand-primary hover:underline"
                                                    >
                                                        إعادة تفعيل وتوثيق
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </PageContainer>
    );
};
