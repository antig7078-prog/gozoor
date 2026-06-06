import React, { useEffect, useState } from 'react';
import { reviewService } from '../../services/reviewService';
import { StarRating } from './StarRating';
import type { Review } from '../../types';
import { User, Calendar } from 'lucide-react';

interface ReviewListProps {
  itemType: 'Course' | 'Product' | 'Service';
  itemId: string;
  refreshTrigger?: number;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  itemType,
  itemId,
  refreshTrigger = 0,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      const { data, error: fetchError } = await reviewService.getReviews(itemType, itemId);
      if (fetchError) {
        setError(fetchError);
      } else {
        setReviews(data || []);
      }
      setLoading(false);
    };
    fetchReviews();
  }, [itemType, itemId, refreshTrigger]);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((n) => (
          <div key={n} className="bg-slate-100 rounded-3xl p-6 animate-pulse space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-24" />
                  <div className="h-3 bg-slate-200 rounded w-16" />
                </div>
              </div>
              <div className="h-4 bg-slate-200 rounded w-20" />
            </div>
            <div className="h-4 bg-slate-200 rounded w-full" />
            <div className="h-4 bg-slate-200 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-center text-sm font-medium">
        {error}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-slate-400">
        <p className="font-bold text-base mb-1">لا توجد تقييمات بعد</p>
        <p className="text-sm">كن أول من يشارك تجربته!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm hover:border-slate-300 transition-all duration-200"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-3">
              {review.profile?.avatar_url ? (
                <img
                  src={review.profile.avatar_url}
                  alt={review.profile.full_name || 'صورة المستخدم'}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-brand-primary/10 shadow-sm"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-400">
                  <User className="w-6 h-6" />
                </div>
              )}
              <div>
                <h4 className="font-bold text-slate-800 text-base leading-tight">
                  {review.profile?.full_name || 'مستخدم مجهول'}
                </h4>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(review.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl px-3.5 py-1.5 self-start sm:self-auto">
              <StarRating rating={review.rating} size={16} />
            </div>
          </div>

          {review.comment ? (
            <p className="text-slate-650 text-sm leading-relaxed whitespace-pre-line">
              {review.comment}
            </p>
          ) : (
            <p className="text-slate-400 text-xs italic">لا يوجد تعليق مكتوب</p>
          )}
        </div>
      ))}
    </div>
  );
};
