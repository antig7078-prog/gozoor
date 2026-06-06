import { supabase } from '../lib/supabase';
import { getFriendlyErrorMessage } from '../utils/error';
import type { Review } from '../types';
import { reputationService } from './reputationService';

export const reviewService = {
  /**
   * Check if user is eligible to review an item (Course, Product, Service)
   */
  async checkReviewEligibility(itemType: 'Course' | 'Product' | 'Service', itemId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { eligible: false, error: 'يجب تسجيل الدخول للتحقق من إمكانية التقييم.' };

      if (itemType === 'Service') {
        // Verify completed service orders
        const { data: orders, error } = await supabase
          .from('service_orders')
          .select('id')
          .eq('service_id', itemId)
          .eq('client_id', user.id)
          .eq('status', 'completed')
          .limit(1);

        if (error) throw error;
        return { eligible: orders && orders.length > 0, error: null };
      }

      if (itemType === 'Product') {
        // Verify user has purchased this product
        const { data: orders, error: orderError } = await supabase
          .from('orders')
          .select('id')
          .eq('buyer_id', user.id)
          .in('status', ['Paid', 'Shipped', 'Delivered']);

        if (orderError) throw orderError;
        if (!orders || orders.length === 0) return { eligible: false, error: null };

        const orderIds = orders.map(o => o.id);
        const { data: items, error: itemError } = await supabase
          .from('order_items')
          .select('id')
          .in('order_id', orderIds)
          .eq('product_id', itemId)
          .limit(1);

        if (itemError) throw itemError;
        return { eligible: items && items.length > 0, error: null };
      }

      if (itemType === 'Course') {
        // Verify user is enrolled in the course
        const { data: enrollment, error } = await supabase
          .from('enrollments')
          .select('id')
          .eq('course_id', itemId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        return { eligible: !!enrollment, error: null };
      }

      return { eligible: false, error: 'نوع العنصر غير مدعوم للتقييم.' };
    } catch (err) {
      return { eligible: false, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Add a review with eligibility check and automatically update provider rating
   */
  async addReview(reviewData: {
    item_type: 'Course' | 'Product' | 'Service';
    item_id: string;
    rating: number;
    comment?: string;
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول لإضافة تقييم.');

      // 1. Verify eligibility
      const eligibility = await this.checkReviewEligibility(reviewData.item_type, reviewData.item_id);
      if (eligibility.error) throw new Error(eligibility.error);
      if (!eligibility.eligible) {
        if (reviewData.item_type === 'Service') throw new Error('يجب عليك إكمال طلب لهذه الخدمة أولاً قبل التقييم.');
        if (reviewData.item_type === 'Product') throw new Error('يجب عليك شراء هذا المنتج أولاً قبل التقييم.');
        if (reviewData.item_type === 'Course') throw new Error('يجب عليك التسجيل في هذا الكورس أولاً قبل التقييم.');
      }

      // Check rating boundaries
      if (reviewData.rating < 1 || reviewData.rating > 5) {
        throw new Error('يجب أن يكون التقييم بين 1 و 5 نجوم.');
      }

      // 2. Insert review
      const { data: review, error: insertError } = await supabase
        .from('reviews')
        .insert([{
          user_id: user.id,
          item_type: reviewData.item_type,
          item_id: reviewData.item_id,
          rating: reviewData.rating,
          comment: reviewData.comment?.trim() || null
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      // 3. Recalculate ratings
      if (reviewData.item_type === 'Service') {
        // Find provider
        const { data: service } = await supabase
          .from('services')
          .select('freelancer_id')
          .eq('id', reviewData.item_id)
          .single();

        if (service?.freelancer_id) {
          // Get all services of provider
          const { data: services } = await supabase
            .from('services')
            .select('id')
            .eq('freelancer_id', service.freelancer_id);

          if (services && services.length > 0) {
            const serviceIds = services.map(s => s.id);
            // Get all reviews for these services
            const { data: reviews } = await supabase
              .from('reviews')
              .select('rating')
              .eq('item_type', 'Service')
              .in('item_id', serviceIds);

            if (reviews && reviews.length > 0) {
              const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
              // Update services_rating in profiles
              await supabase
                .from('profiles')
                .update({ services_rating: Number(avg.toFixed(2)) })
                .eq('id', service.freelancer_id);

              // Update overall rating
              await reputationService.updateOverallRating(service.freelancer_id);
            }
          }
        }
      } else if (reviewData.item_type === 'Product') {
        // Find seller
        const { data: product } = await supabase
          .from('products')
          .select('seller_id')
          .eq('id', reviewData.item_id)
          .single();

        if (product?.seller_id) {
          // Get all products of seller
          const { data: products } = await supabase
            .from('products')
            .select('id')
            .eq('seller_id', product.seller_id);

          if (products && products.length > 0) {
            const productIds = products.map(p => p.id);
            // Get all reviews for these products
            const { data: reviews } = await supabase
              .from('reviews')
              .select('rating')
              .eq('item_type', 'Product')
              .in('item_id', productIds);

            if (reviews && reviews.length > 0) {
              const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
              // Update products_rating in profiles
              await supabase
                .from('profiles')
                .update({ products_rating: Number(avg.toFixed(2)) })
                .eq('id', product.seller_id);

              // Update overall rating
              await reputationService.updateOverallRating(product.seller_id);
            }
          }
        }
      }

      return { data: review as Review, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Get reviews for a specific item (Course, Product, Service)
   */
  async getReviews(itemType: 'Course' | 'Product' | 'Service', itemId: string) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profile:profiles(*)')
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data as Review[], error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  }
};
