import { supabase } from '../lib/supabase';
import { getFriendlyErrorMessage } from '../utils/error';

export const userService = {
  /**
   * Fetch a single user profile by ID
   */
  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone, whatsapp, bio, specialization, portfolio_url, role, avatar_url')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Fetch a user's full public profile by ID (for public profile page)
   */
  async getPublicProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, bio, specialization, portfolio_url, role, reputation_points, reputation_level, jobs_rating, services_rating, products_rating, overall_rating, created_at')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Update a user's own profile
   */
  async updateProfile(
    userId: string,
    profileData: {
      full_name: string;
      phone?: string;
      whatsapp?: string;
      bio?: string;
      specialization?: string;
      portfolio_url?: string;
      avatar_url?: string;
    }
  ) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Fetch all profiles (Admin only)
   */
  async getUsersList() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  async deleteUser(userId: string) {
    try {
      const { error } = await supabase
        .rpc('delete_user', { target_user_id: userId });

      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Update user role (Admin only)
   */
  async updateUserRole(userId: string, role: string) {
    try {
      const { error } = await supabase
        .rpc('update_user_role', { target_user_id: userId, new_role: role });

      if (error) throw error;
      
      // Fetch updated profile to maintain interface compatibility
      const { data, error: fetchErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (fetchErr) throw fetchErr;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Get total count of users by role
   */
  async getUserCount(role: string = 'user') {
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', role);

      if (error) throw error;
      return { count: count || 0, error: null };
    } catch (err) {
      return { count: 0, error: getFriendlyErrorMessage(err) };
    }
  }
};
