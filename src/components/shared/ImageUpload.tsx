import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface ImageUploadProps {
    onUpload: (url: string) => void;
    defaultValue?: string;
    label?: string;
}

export const ImageUpload = ({ onUpload, defaultValue = '', label = 'صورة الخدمة/المنتج' }: ImageUploadProps) => {
    const [preview, setPreview] = useState<string>(defaultValue);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (!file.type.startsWith('image/')) {
            toast.error('يرجى اختيار صورة صحيحة');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
            toast.error('حجم الصورة كبير جداً (الحد الأقصى 5 ميجا)');
            return;
        }

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `public/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('uploads')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('uploads')
                .getPublicUrl(filePath);

            setPreview(publicUrl);
            onUpload(publicUrl);
            toast.success('تم رفع الصورة بنجاح');
        } catch (error: any) {
            console.error('Error uploading image:', error);
            toast.error('حدث خطأ أثناء رفع الصورة: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        setPreview('');
        onUpload('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-black text-text-primary mb-2">
                {label}
            </label>
            
            <div 
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`
                    relative group cursor-pointer
                    aspect-video rounded-[30px] border-2 border-dashed
                    transition-all duration-300 overflow-hidden
                    ${preview 
                        ? 'border-brand-primary' 
                        : 'border-slate-200 hover:border-brand-primary bg-slate-50 hover:bg-brand-primary/5'}
                    flex items-center justify-center
                `}
            >
                {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
                        <span className="text-sm font-bold text-brand-primary">جاري الرفع...</span>
                    </div>
                ) : preview ? (
                    <>
                        <img 
                            src={preview} 
                            alt="Preview" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                            <div className="p-3 bg-white rounded-2xl text-brand-primary shadow-xl">
                                <Upload className="w-6 h-6" />
                            </div>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage();
                                }}
                                className="p-3 bg-red-500 rounded-2xl text-white shadow-xl hover:scale-110 transition-transform"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center text-slate-400 group-hover:text-brand-primary transition-colors">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-4 shadow-sm border border-slate-100 group-hover:border-brand-primary/20 transition-all">
                            <ImageIcon className="w-10 h-10" />
                        </div>
                        <p className="font-bold text-lg">اضغط لرفع صورة</p>
                        <p className="text-xs">PNG, JPG حتى 5 ميجابايت</p>
                    </div>
                )}
            </div>

            <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
            />
        </div>
    );
};
