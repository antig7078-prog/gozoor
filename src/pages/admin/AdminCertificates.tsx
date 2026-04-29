import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
    Trophy,
    X,
    ExternalLink,
    FileUp,
    User,
    BookOpen,
    Clock,
    CheckCircle,
    XCircle,
    Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageContainer } from '../../components/shared/PageContainer';
import { PageHeader } from '../../components/shared/PageHeader';
import { SearchBar } from '../../components/shared/SearchBar';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { EmptyState } from '../../components/shared/EmptyState';
import { StatCard } from '../../components/shared/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/shared/Card';

export const AdminCertificates = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('certificate_requests')
                .select(`
                    *,
                    profiles:user_id(full_name, email),
                    courses:course_id(title)
                `)
                .order('requested_at', { ascending: false });

            if (error) {
                console.error("Error fetching certificates:", error);
                toast.error(`خطأ: ${error.message}`);
                setRequests([]);
                return;
            }

            setRequests(data || []);
        } catch (error) {
            console.error("Catch error:", error);
            setRequests([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected', certUrl?: string) => {
        setIsUpdating(id);
        try {
            const { error } = await supabase
                .from('certificate_requests')
                .update({
                    status,
                    certificate_url: certUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            toast.success(status === 'approved' ? 'تمت الموافقة على الشهادة' : 'تم رفض الطلب');
            fetchRequests();
        } catch (error) {
            toast.error('فشل تحديث الطلب');
        } finally {
            setIsUpdating(null);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, requestId: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUpdating(requestId);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${requestId}-${Date.now()}.${fileExt}`;
            const filePath = `certificates/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('certificates')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('certificates')
                .getPublicUrl(filePath);

            await handleUpdateStatus(requestId, 'approved', publicUrl);
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error(`فشل رفع الملف: ${error.message || 'خطأ غير معروف'}`);
        } finally {
            setIsUpdating(null);
        }
    };

    const filteredRequests = requests.filter(req =>
        req.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.courses?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusVariant = (status: string): "success" | "warning" | "danger" | "premium" | "secondary" | "primary" => {
        switch (status) {
            case 'approved': return 'success';
            case 'pending': return 'warning';
            case 'rejected': return 'danger';
            default: return 'secondary';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return CheckCircle;
            case 'pending': return Clock;
            case 'rejected': return XCircle;
            default: return Clock;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'approved': return 'تم الإصدار';
            case 'pending': return 'قيد الانتظار';
            case 'rejected': return 'مرفوض';
            default: return 'غير معروف';
        }
    };

    if (isLoading) {
        return <LoadingSpinner fullPage message="جاري تحميل طلبات الشهادات..." />;
    }

    return (
        <PageContainer maxWidth="xl">
            <PageHeader
                title="إدارة طلبات الشهادات"
                description="مراجعة وإصدار شهادات إتمام الدورات"
                icon={Trophy}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <StatCard
                    label="إجمالي الطلبات"
                    value={requests.length}
                    icon={Trophy}
                />
                <StatCard
                    label="تم الإصدار"
                    value={requests.filter(r => r.status === 'approved').length}
                    icon={CheckCircle}
                />
                <StatCard
                    label="طلبات معلقة"
                    value={requests.filter(r => r.status === 'pending').length}
                    icon={Clock}
                />
            </div>

            <Card className="overflow-hidden p-0" hoverable={false}>
                <div className="p-6 border-b border-border-subtle bg-surface-primary/30">
                    <SearchBar
                        placeholder="ابحث باسم الطالب أو الكورس..."
                        value={searchTerm}
                        onChange={setSearchTerm}
                        className="md:w-full"
                    />
                </div>

                <div className="overflow-x-auto hide-scrollbar">
                    <table className="w-full text-right border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-surface-primary/50 border-b border-border-subtle">
                                <th className="px-8 py-5 font-black text-text-muted text-xs uppercase tracking-widest">الطالب</th>
                                <th className="px-8 py-5 font-black text-text-muted text-xs uppercase tracking-widest">الدورة التدريبية</th>
                                <th className="px-8 py-5 font-black text-text-muted text-xs uppercase tracking-widest">تاريخ الطلب</th>
                                <th className="px-8 py-5 font-black text-text-muted text-xs uppercase tracking-widest text-center">الحالة</th>
                                <th className="px-8 py-5 font-black text-text-muted text-xs uppercase tracking-widest text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={5}>
                                        <EmptyState
                                            icon={Shield}
                                            title="لا توجد طلبات!"
                                            message={searchTerm ? `لا توجد نتائج للبحث عن "${searchTerm}"` : "لا توجد طلبات شهادات حالياً للمراجعة."}
                                        />
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-brand-primary/5 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-text-muted group-hover:bg-white transition-colors shadow-sm">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-text-primary font-black">{req.profiles?.full_name}</p>
                                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-tight">{req.profiles?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <Badge variant="secondary" size="sm">
                                                <BookOpen className="w-3 h-3 ml-1 inline-block" />
                                                {req.courses?.title}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-text-secondary font-bold text-xs uppercase tracking-tight">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(req.requested_at).toLocaleDateString('ar-EG')}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex justify-center">
                                                {(() => {
                                                    const StatusIcon = getStatusIcon(req.status);
                                                    return (
                                                        <Badge variant={getStatusVariant(req.status)} size="sm">
                                                            <StatusIcon className="w-3 h-3 ml-1 inline-block" />
                                                            {getStatusText(req.status)}
                                                        </Badge>
                                                    );
                                                })()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-center gap-3">
                                                {req.status === 'pending' ? (
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="premium"
                                                            size="sm"
                                                            icon={FileUp}
                                                            className="cursor-pointer"
                                                            isLoading={isUpdating === req.id}
                                                        >
                                                            رفع وموافقة
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                onChange={(e) => handleFileUpload(e, req.id)}
                                                                disabled={isUpdating === req.id}
                                                            />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            icon={X}
                                                            className="text-red-500 hover:bg-red-50"
                                                            onClick={() => handleUpdateStatus(req.id, 'rejected')}
                                                            disabled={isUpdating === req.id}
                                                        />
                                                    </div>
                                                ) : (
                                                    req.certificate_url && (
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            icon={ExternalLink}
                                                            onClick={() => window.open(req.certificate_url, '_blank')}
                                                        >
                                                            عرض الشهادة
                                                        </Button>
                                                    )
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </PageContainer>
    );
};




