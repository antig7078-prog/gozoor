import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Tag, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminCategories = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [newCategory, setNewCategory] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    const fetchCategories = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('categories').select('*').order('name');
        if (!error) setCategories(data || []);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        setIsAdding(true);
        const { error } = await supabase.from('categories').insert([{ name: newCategory.trim() }]);

        if (error) {
            toast.error('التصنيف موجود بالفعل أو حدث خطأ');
        } else {
            toast.success('تمت إضافة التصنيف بنجاح');
            setNewCategory('');
            fetchCategories();
        }
        setIsAdding(false);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`هل أنت متأكد من حذف تصنيف "${name}"؟`)) return;

        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success(`تم حذف "${name}" بنجاح`);
            fetchCategories();
        } catch (error: any) {
            toast.error('حدث خطأ أثناء الحذف، قد يكون التصنيف مرتبطاً بكورسات حالية.');
            console.error(error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto" dir="rtl">
            <div className="mb-8 flex justify-between items-center text-right">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <Tag className="w-8 h-8 text-emerald-600" />
                        إدارة التصنيفات
                    </h1>
                    <p className="text-slate-500 font-bold mt-2">أضف الأقسام التي ستظهر عند إنشاء الكورسات.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Form Side */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm sticky top-8">
                        <h3 className="font-black text-slate-800 mb-4 text-lg">إضافة تصنيف جديد</h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    placeholder="اسم القسم (مثلاً: تصميم)"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-right"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isAdding}
                                className="w-full bg-emerald-600 text-white font-black py-3.5 rounded-xl shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                            >
                                {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                إضافة القسم
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Side */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-black text-slate-800">التصنيفات الحالية</h3>
                        </div>

                        {isLoading ? (
                            <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {categories.length === 0 ? (
                                    <div className="p-10 text-center text-slate-400 font-bold">لا يوجد تصنيفات حالياً</div>
                                ) : (
                                    categories.map((cat) => (
                                        <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                <span className="font-extrabold text-slate-700">{cat.name}</span>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(cat.id, cat.name)}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
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
        </div>
    );
};
