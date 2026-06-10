import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../components/shared/ConfirmModal';
import { PageContainer } from '../../components/shared/PageContainer';
import { PageHeader } from '../../components/shared/PageHeader';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import type { Category } from '../../types';

export const AdminCategories = () => {
    const [activeTab, setActiveTab] = useState<'course' | 'product'>('course');
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategory, setNewCategory] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        catId: string;
        catName: string;
    }>({
        isOpen: false,
        catId: '',
        catName: ''
    });

    const fetchCategories = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('type', activeTab)
            .order('name');
        if (!error) setCategories((data as Category[]) || []);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, [activeTab]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        setIsAdding(true);
        const { error } = await supabase
            .from('categories')
            .insert([{ name: newCategory.trim(), type: activeTab }]);

        if (error) {
            toast.error('التصنيف موجود بالفعل أو حدث خطأ');
        } else {
            toast.success('تمت إضافة التصنيف بنجاح');
            setNewCategory('');
            fetchCategories();
        }
        setIsAdding(false);
    };

    const handleDelete = async () => {
        if (!confirmConfig.catId) return;

        setIsActionLoading(true);
        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', confirmConfig.catId);

            if (error) throw error;

            toast.success(`تم حذف "${confirmConfig.catName}" بنجاح`);
            fetchCategories();
            setConfirmConfig({ isOpen: false, catId: '', catName: '' });
        } catch (error: any) {
            toast.error('حدث خطأ أثناء الحذف، قد يكون التصنيف مرتبطاً بكورسات أو منتجات حالية.');
            console.error(error);
        } finally {
            setIsActionLoading(false);
        }
    };

    return (
        <PageContainer maxWidth="xl" noPadding>
            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={() => !isActionLoading && setConfirmConfig({ ...confirmConfig, isOpen: false })}
                onConfirm={handleDelete}
                title="حذف التصنيف"
                message={`هل أنت متأكد من حذف تصنيف "${confirmConfig.catName}"؟ لا يمكن التراجع عن هذا الإجراء.`}
                isLoading={isActionLoading}
                confirmText="حذف التصنيف"
            />
            <PageHeader
                title="إدارة التصنيفات"
                description={activeTab === 'course' ? "أضف الأقسام التي ستظهر عند إنشاء الكورسات." : "أضف الأقسام التي ستظهر عند إنشاء المنتجات."}
                icon={Tag}
            />

            {/* Tabs Selector */}
            <div className="flex gap-2 border-b border-border-default mb-8 bg-white p-2 rounded-card border shadow-sm">
                <button
                    onClick={() => setActiveTab('course')}
                    className={`flex-1 sm:flex-initial px-8 py-3 rounded-button font-black text-sm transition-all duration-300 ${
                        activeTab === 'course'
                            ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                            : 'text-text-secondary hover:bg-slate-100 hover:text-text-primary'
                    }`}
                >
                    تصنيفات الكورسات
                </button>
                <button
                    onClick={() => setActiveTab('product')}
                    className={`flex-1 sm:flex-initial px-8 py-3 rounded-button font-black text-sm transition-all duration-300 ${
                        activeTab === 'product'
                            ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                            : 'text-text-secondary hover:bg-slate-100 hover:text-text-primary'
                    }`}
                >
                    تصنيفات المنتجات
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Form Side */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-card border border-border-default p-6 shadow-sm sticky top-8">
                        <h3 className="font-black text-text-primary mb-4 text-lg">
                            {activeTab === 'course' ? 'إضافة تصنيف كورسات جديد' : 'إضافة تصنيف منتجات جديد'}
                        </h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    placeholder={activeTab === 'course' ? "اسم القسم (مثلاً: تصميم)" : "اسم القسم (مثلاً: إلكترونيات)"}
                                    className="w-full px-4 py-3 bg-surface-primary border border-border-default rounded-input font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-right"
                                />
                            </div>
                            <Button
                                type="submit"
                                isLoading={isAdding}
                                variant="premium"
                                className="w-full"
                                icon={Plus}
                            >
                                إضافة القسم
                            </Button>
                        </form>
                    </div>
                </div>

                {/* List Side */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-card border border-border-default overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-border-subtle bg-surface-primary/50">
                            <h3 className="font-black text-text-primary">
                                {activeTab === 'course' ? 'تصنيفات الكورسات الحالية' : 'تصنيفات المنتجات الحالية'}
                            </h3>
                        </div>

                        {isLoading ? (
                            <div className="p-20">
                                <LoadingSpinner size="lg" />
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {categories.length === 0 ? (
                                    <div className="p-10 text-center text-text-muted font-bold">لا يوجد تصنيفات حالياً</div>
                                ) : (
                                    categories.map((cat) => (
                                        <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-surface-primary transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
                                                <span className="font-extrabold text-slate-700">{cat.name}</span>
                                            </div>
                                            <button
                                                onClick={() => setConfirmConfig({ isOpen: true, catId: cat.id, catName: cat.name })}
                                                className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-button transition-colors"
                                                title="حذف"
                                                aria-label={`حذف التصنيف ${cat.name}`}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};




