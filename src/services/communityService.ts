import { supabase } from '../lib/supabase';
import { getFriendlyErrorMessage } from '../utils/error';

export const communityService = {
  /**
   * Fetch posts with profiles, likes, and comments
   */
  async getPosts() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (full_name, avatar_url, role),
          post_likes (user_id),
          post_comments (
            *,
            profiles:user_id (full_name, avatar_url, role)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Create new community post
   */
  async createPost(content: string, imageUrl?: string | null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول لنشر مشاركة في مجتمع المزارعين.');

      const { data, error } = await supabase
        .from('posts')
        .insert([{
          user_id: user.id,
          content,
          image_url: imageUrl || null
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Delete post
   */
  async deletePost(postId: string) {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Like / Unlike a post
   */
  async toggleLike(postId: string, isLiked: boolean) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول للتفاعل مع المنشورات.');

      if (isLiked) {
        // Delete like row
        const { error: deleteError } = await supabase
          .from('post_likes')
          .delete()
          .match({ post_id: postId, user_id: user.id });

        if (deleteError) throw deleteError;

        // Decrement likes count
        await supabase.rpc('decrement_likes', { post_id_val: postId });
      } else {
        // Insert like row
        const { error: insertError } = await supabase
          .from('post_likes')
          .insert([{ post_id: postId, user_id: user.id }]);

        if (insertError) throw insertError;

        // Increment likes count
        await supabase.rpc('increment_likes', { post_id_val: postId });
      }

      return { error: null };
    } catch (err) {
      return { error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Fetch comments for a post
   */
  async getComments(postId: string) {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          profiles:user_id (full_name, avatar_url, role)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Create comment / reply
   */
  async createComment(postId: string, content: string, parentId?: string | null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول للتعليق.');

      const { data, error } = await supabase
        .from('post_comments')
        .insert([{
          post_id: postId,
          user_id: user.id,
          parent_id: parentId || null,
          content
        }])
        .select()
        .single();

      if (error) throw error;

      // Increment comments count on post
      await supabase.rpc('increment_comments', { post_id_val: postId });

      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Report post
   */
  async reportPost(postId: string, reason: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول للإبلاغ عن المحتوى.');

      const { data, error } = await supabase
        .from('post_reports')
        .insert([{
          post_id: postId,
          reporter_id: user.id,
          reason
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Fetch all post reports (Admin)
   */
  async getReports() {
    try {
      const { data, error } = await supabase
        .from('post_reports')
        .select(`
          *,
          posts:post_id (
            content,
            profiles:user_id (full_name)
          ),
          profiles:reporter_id (full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Update report status (Admin)
   */
  async updateReportStatus(reportId: string, status: 'resolved' | 'dismissed') {
    try {
      const { error } = await supabase
        .from('post_reports')
        .update({ status })
        .eq('id', reportId);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: getFriendlyErrorMessage(err) };
    }
  }
};
