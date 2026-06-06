/**
 * Centralized utility to sanitize database and API errors and translate them
 * into localized, user-friendly Arabic messages.
 */

export const getFriendlyErrorMessage = (error: any): string => {
  if (!error) return 'حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.';

  // If error is already a string
  if (typeof error === 'string') {
    return error;
  }

  // Log error in development environment
  if (import.meta.env.DEV) {
    console.error('[Error Details]:', error);
  }

  const code = error.code || (error.status ? String(error.status) : '');
  const message = error.message || '';

  // Handle standard PostgreSQL / Supabase error codes
  switch (code) {
    // Integrity Constraints
    case '23505':
      return 'هذه البيانات مسجلة بالفعل في النظام.';
    case '23503':
      return 'فشلت العملية لوجود ارتباط بسجلات أخرى غير متوفرة.';
    case '23502':
      return 'الرجاء ملء جميع الحقول الإلزامية المطلوبة.';

    // Security & Permissions
    case '42501':
      return 'عذراً، ليس لديك الصلاحية الكافية لتنفيذ هذا الإجراء.';
    case 'PGRST116':
      return 'لم يتم العثور على البيانات المطلوبة.';

    // Authentication Errors
    case 'auth/user-not-found':
    case 'invalid_credentials':
      return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
    case 'email_not_confirmed':
      return 'الرجاء تأكيد حسابك عبر الرابط المرسل إلى بريدك الإلكتروني أولاً.';
    case 'user_already_exists':
      return 'البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول.';

    default:
      // Fallback searches for keyword patterns in message strings
      if (message.includes('JWT') || message.includes('jwt expired')) {
        return 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مجدداً.';
      }
      if (message.includes('network') || message.includes('Failed to fetch')) {
        return 'فشل الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت والمحاولة مجدداً.';
      }
      if (message.includes('Like not registered')) {
        return 'لا يمكنك إلغاء الإعجاب بمنشور لم تقم بالإعجاب به.';
      }
      if (message.includes('Like already registered')) {
        return 'لقد قمت بالإعجاب بهذا المنشور بالفعل.';
      }

      // Return the original message if it's clean and in Arabic, or a generic fallback
      const arabicRegex = /[\u0600-\u06FF]/;
      if (arabicRegex.test(message)) {
        return message;
      }

      return 'حدث خطأ أثناء معالجة الطلب. يرجى المحاولة لاحقاً.';
  }
};
