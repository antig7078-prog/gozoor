import { supabase } from '../lib/supabase';
import { getFriendlyErrorMessage } from '../utils/error';

export const reputationService = {
  /**
   * Calculate level based on points
   */
  calculateLevel(points: number): 'beginner' | 'active' | 'professional' | 'trusted' | 'expert' {
    if (points >= 5000) return 'expert';
    if (points >= 2000) return 'trusted';
    if (points >= 500) return 'professional';
    if (points >= 100) return 'active';
    return 'beginner';
  },

  /**
   * Add reputation points to a user profile and update their level
   */
  async addPoints(userId: string, pointsToAdd: number) {
    try {
      // 1. Fetch current points
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('reputation_points')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      const currentPoints = profile?.reputation_points || 0;
      const newPoints = Math.max(0, currentPoints + pointsToAdd);
      const newLevel = this.calculateLevel(newPoints);

      // 2. Update points and level
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          reputation_points: newPoints,
          reputation_level: newLevel
        })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) throw updateError;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Fetch a user's reputation and rating details
   */
  async getUserReputation(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('reputation_points, reputation_level, jobs_rating, services_rating, products_rating, overall_rating')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Calculate and update a user's overall rating based on the ratings of individual sectors
   */
  async updateOverallRating(userId: string) {
    try {
      // 1. Fetch ratings
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('jobs_rating, services_rating, products_rating')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      const jobsRating = Number(profile?.jobs_rating || 0);
      const servicesRating = Number(profile?.services_rating || 0);
      const productsRating = Number(profile?.products_rating || 0);

      // Average only non-zero ratings
      const ratingsList = [jobsRating, servicesRating, productsRating].filter(r => r > 0);
      const overallRating = ratingsList.length > 0
        ? ratingsList.reduce((sum, r) => sum + r, 0) / ratingsList.length
        : 0;

      // 2. Update overall_rating
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          overall_rating: Number(overallRating.toFixed(2))
        })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) throw updateError;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  }
};
