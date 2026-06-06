import { supabase } from '../lib/supabase';
import { getFriendlyErrorMessage } from '../utils/error';

export const storageService = {
  /**
   * Upload a file to a specific storage bucket
   */
  async uploadFile(bucketName: string, filePath: string, file: File) {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      return { url: publicUrlData.publicUrl, error: null };
    } catch (err) {
      return { url: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Upload course thumbnail or media to general uploads bucket
   */
  async uploadMedia(file: File) {
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'mp4', 'pdf'];
    
    if (!fileExt || !allowedExts.includes(fileExt)) {
      return { url: null, error: `نوع الملف غير مسموح به. الأنواع المسموحة: ${allowedExts.join(', ')}` };
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { url: null, error: 'حجم الملف كبير جداً. الحد الأقصى المسموح به هو 10 ميجابايت.' };
    }

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `media/${fileName}`;
    return this.uploadFile('uploads', filePath, file);
  },

  /**
   * Upload payment proof
   */
  async uploadPaymentProof(file: File) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { url: null, error: 'يجب تسجيل الدخول لإرفاق إثبات الدفع' };

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allowedExts = ['jpg', 'jpeg', 'png', 'pdf'];

    if (!fileExt || !allowedExts.includes(fileExt)) {
      return { url: null, error: `نوع الملف غير مسموح به. الأنواع المسموحة: ${allowedExts.join(', ')}` };
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { url: null, error: 'حجم الملف كبير جداً. الحد الأقصى المسموح به هو 5 ميجابايت.' };
    }

    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;
    return this.uploadFile('payment-proofs', filePath, file);
  },

  /**
   * Upload course lecture video or file (Admin Only)
   */
  async uploadCourseContent(file: File, courseId: string) {
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${courseId}/${fileName}`;
    return this.uploadFile('course-content', filePath, file);
  }
};
