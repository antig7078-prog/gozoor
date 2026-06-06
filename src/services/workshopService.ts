import { supabase } from '../lib/supabase';
import { getFriendlyErrorMessage } from '../utils/error';

export const workshopService = {
  /**
   * Fetch all workshops
   */
  async getWorkshops() {
    try {
      const { data, error } = await supabase
        .from('workshops')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err) {
      return { data: [], error: getFriendlyErrorMessage(err) };
    }
  }
};
