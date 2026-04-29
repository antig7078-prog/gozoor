import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Eye, 
    ExternalLink,
    AlertCircle,
    UserCheck,
    Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { PageContainer } from '../../components/shared/PageContainer';
import { SearchBar } from '../../components/shared/SearchBar';
import { EmptyState } from '../../components/shared/EmptyState';
import { PageHeader } from '../../components/shared/PageHeader';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';

export const AdminEnrollments = () => {
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const lastFocusedElement = useRef<HTMLElement | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    const fetchEnrollments = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('enrollments')
                .select(`
                    *,
                    profiles:user_id (full_name, email),
                    courses:course_id (title)
                `)
                .order('enrolled_at', { ascending: false });

            if (error) throw error;
            setEnrollments(data || []);
        } catch (error: any) {
            toast.error('حدث خطأ أثناء جلب الطلبات');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEnrollments();
    }, []);

    // Focus Management for Image Modal
    useEffect(() => {
        if (selectedImage) {
            lastFocusedElement.current = document.activeElement as HTMLElement;
            const timer = setTimeout(() => {
                const focusable = modalRef.current?.querySelectorAll('button, a, [tabindex]:not([tabindex="-1"])');
                if (focusable && focusable.length > 0) (focusable[0] as HTMLElement).focus();
            }, 50);
            return () => clearTimeout(timer);
        } else if (lastFocusedElement.current) {
            lastFocusedElement.current.focus();
        }
    }, [selectedImage]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!selectedImage) return;
            
            if (e.key === 'Escape') {
                setSelectedImage(null);
                return;
            }

            if (e.key === 'Tab') {
                const focusable = modalRef.current?.querySelectorAll('button, a, [tabindex]:not([tabindex="-1"])');
                if (!focusable || focusable.length === 0) return;

                const first = focusable[0] as HTMLElement;
                const last = focusable[focusable.length - 1] as HTMLElement;

                if (e.shiftKey && document.activeElement === first) {
                    last.focus();
                    e.preventDefault();
                } else if (!e.shiftKey && document.activeElement === last) {
                    first.focus();
                    e.preventDefault();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedImage]);

    const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
        try {
            const { error } = await supabase
                .from('enrollments')
                .update({ status })
                .eq('id', id);

            if (error) throw error;
            
            toast.success(status === 'approved' ? 'تم الموافقة على الطلب بنجاح' : 'تم رفض الطلب');
            setEnrollments(prev => prev.map(e => e.id === id ? { ...e, status } : e));
        } catch (error: any) {
            toast.error('حدث خطأ أثناء تحديث الحالة');
        }
    };

    const filteredEnrollments = enrollments.filter(e => {
        const matchesSearch = 
            e.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.courses?.title?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = statusFilter === 'all' || e.status === statusFilter;
        
        return matchesSearch && matchesFilter;
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-brand-primary-light text-brand-primary border-brand-primary/20';
            case 'rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'approved': return 'تمت الموافقة';
            case 'rejected': return 'مرفوض';
            default: return 'قيد المراجعة';
        }
    };

    return (
        <PageContainer maxWidth="xl" noPadding>
            {/* Header */}
            <PageHeader 
                title="إدارة طلبات الالتحاق"
                description="مراجعة وتفعيل اشتراكات الطلاب في الكورسات"
                icon={UserCheck}
            />

            {/* Filters Area */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1">
                    <SearchBar 
                        placeholder="ابحث باسم الطالب، الإيميل، أو الكورس..."
                        value={searchTerm}
                        onChange={setSearchTerm}
                        className="w-full"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-white border border-border-default rounded-[var(--radius-input)] px-6 py-3.5 outline-none focus:ring-4 focus:ring-brand-primary/20 focus:border-brand-primary font-bold text-slate-700 transition-all appearance-none cursor-pointer"
                    >
                        <option value="all">كل الحالات</option>
                        <option value="pending">قيد المراجعة</option>
                        <option value="approved">تمت الموافقة</option>
                        <option value="rejected">مرفوض</option>
                    </select>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-[var(--radius-card)] border border-border-default shadow-sm overflow-hidden">
                <div className="overflow-x-auto hide-scrollbar">
                    <table className="w-full text-right border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-surface-primary border-b border-border-default">
                                <th className="px-6 py-5 font-black text-text-primary">الطالب</th>
                                <th className="px-6 py-5 font-black text-text-primary">الكورس</th>
                                <th className="px-6 py-5 font-black text-text-primary">التاريخ</th>
                                <th className="px-6 py-5 font-black text-text-primary text-center">إيصال الدفع</th>
                                <th className="px-6 py-5 font-black text-text-primary text-center">الحالة</th>
                                <th className="px-6 py-5 font-black text-text-primary text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-8 h-20 bg-surface-primary/50"></td>
                                    </tr>
                                ))
                            ) : filteredEnrollments.length === 0 ? (
                                <tr>
                                    <td colSpan={6}>
                                        <EmptyState 
                                            icon={AlertCircle}
                                            title="لا توجد طلبات"
                                            message={searchTerm || statusFilter !== 'all' ? "لا توجد طلبات تطابق معايير البحث الحالية." : "لا توجد طلبات التحاق حالياً في النظام."}
                                            className="border-none py-20"
                                        />
                                    </td>
                                </tr>
                            ) : (
                                filteredEnrollments.map((e) => (
                                    <tr key={e.id} className="hover:bg-brand-primary-light/10 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="font-black text-text-primary">{e.profiles?.full_name}</div>
                                            <div className="text-xs text-text-secondary font-bold">{e.profiles?.email}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="font-black text-text-primary">{e.courses?.title}</div>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-bold text-text-secondary">
                                            {new Date(e.enrolled_at).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            {e.proof_image_url ? (
                                                <button
                                                    onClick={() => setSelectedImage(e.proof_image_url)}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-primary/10 text-brand-primary rounded-[var(--radius-button)] hover:bg-brand-primary hover:text-white transition-all text-xs font-black"
                                                    aria-label="عرض إيصال الدفع"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    عرض الإيصال
                                                </button>
                                            ) : (
                                                <span className="text-slate-300 text-xs font-bold italic">لا يوجد إيصال</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-black border ${getStatusStyle(e.status)}`}>
                                                {getStatusText(e.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-2">
                                                {e.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateStatus(e.id, 'approved')}
                                                            className="p-2 bg-brand-primary-light text-brand-primary rounded-[var(--radius-button)] hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                                                            title="موافقة"
                                                            aria-label="موافقة على الطلب"
                                                        >
                                                            <CheckCircle2 className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(e.id, 'rejected')}
                                                            className="p-2 bg-rose-50 text-rose-600 rounded-[var(--radius-button)] hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                                            title="رفض"
                                                            aria-label="رفض الطلب"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}
                                                {e.status !== 'pending' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(e.id, 'pending')}
                                                        className="p-2 bg-slate-100 text-text-secondary rounded-[var(--radius-button)] hover:bg-slate-200 transition-all shadow-sm"
                                                        title="إرجاع للمراجعة"
                                                        aria-label="إرجاع الطلب للمراجعة"
                                                    >
                                                        <Clock className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Image Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-brand-bg/90 backdrop-blur-sm"
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.div
                            ref={modalRef}
                            role="dialog"
                            aria-modal="true"
                            aria-label="عرض إيصال الدفع"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-4xl w-full bg-white rounded-[var(--radius-card)] overflow-hidden shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-border-subtle flex items-center justify-between">
                                <h3 className="font-black text-text-primary">إيصال الدفع</h3>
                                <div className="flex gap-2">
                                    <a 
                                        href={selectedImage} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="p-2 text-text-secondary hover:text-brand-primary transition-colors"
                                        aria-label="فتح الصورة في نافذة جديدة"
                                    >
                                        <ExternalLink className="w-6 h-6" />
                                    </a>
                                    <button 
                                        onClick={() => setSelectedImage(null)} 
                                        className="p-2 text-text-muted hover:text-rose-500 transition-colors"
                                        aria-label="إغلاق النافذة"
                                    >
                                        <XCircle className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 overflow-y-auto max-h-[80vh]">
                                <img src={selectedImage} alt="Payment Proof" loading="lazy" className="w-full h-auto rounded-[var(--radius-button)] shadow-lg" />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </PageContainer>
    );
};




