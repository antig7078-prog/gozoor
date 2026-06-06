import React, { useState, useEffect } from 'react';
import { reviewService } from '../../services/reviewService';
import { StarRating } from './StarRating';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ReviewFormProps {
  itemType: 'Course' | 'Product' | 'Service';
  itemId: string;
  onReviewSubmitted?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  itemType,
  itemId,
  onReviewSubmitted,
}) => {
  const [isEligible, setIsEligible] = useState<boolean>(false);
  const [eligibilityChecked, setEligibilityChecked] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    const checkEligibility = async () => {
      try {
        const { eligible } = await reviewService.checkReviewEligibility(itemType, itemId);
        setIsEligible(eligible);
      } catch (err) {
        setIsEligible(false);
      } finally {
        setEligibilityChecked(true);
      }
    };
    checkEligibility();
  }, [itemType, itemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError('يجب اختيار تقييم بين 1 و 5 نجوم.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: submitError } = await reviewService.addReview({
        item_type: itemType,
        item_id: itemId,
        rating,
        comment: comment.trim() || undefined,
      });

      if (submitError) {
        setError(submitError);
      } else {
        setSuccess(true);
        setComment('');
        setRating(5);
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
      }
    } catch (err) {
      setError('حدث خطأ أثناء إرسال تقييمك. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  if (!eligibilityChecked) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  // If the user isn't eligible, don't show the form (or show a friendly placeholder)
  if (!isEligible) {
    return (
      <div className="p-4 bg-slate-100 rounded-2xl text-slate-500 text-sm font-medium flex items-center gap-2 border border-slate-200">
        <AlertCircle className="w-5 h-5 text-slate-400 shrink-0" />
        <span>
          {itemType === 'Course' && 'يمكنك كتابة تقييم بعد التسجيل في هذا الكورس.'}
          {itemType === 'Product' && 'يمكنك كتابة تقييم بعد شراء هذا المنتج بنجاح.'}
          {itemType === 'Service' && 'يمكنك كتابة تقييم بعد طلب وإكمال هذه الخدمة.'}
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
      <h3 className="text-lg font-black text-slate-800">أضف تقييمك</h3>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl flex items-center gap-2 text-sm">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>تم إرسال تقييمك بنجاح. شكراً لك!</span>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-bold text-slate-600">التقييم بالنجوم</label>
        <StarRating rating={rating} interactive size={28} onChange={setRating} />
      </div>

      <div className="space-y-2">
        <label htmlFor="review-comment" className="block text-sm font-bold text-slate-600">رأيك بالتفصيل (اختياري)</label>
        <textarea
          id="review-comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="اكتب تجربتك مع الكورس/المنتج/الخدمة لتساعد المستخدمين الآخرين..."
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 placeholder-slate-400 text-sm transition-all"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto px-6 py-3 bg-brand-primary hover:bg-brand-primary-hover disabled:bg-slate-300 text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/10 transition-all duration-200"
      >
        {loading ? 'جاري الإرسال...' : 'إرسال التقييم'}
      </button>
    </form>
  );
};
