import { supabase } from '../lib/supabase';
import { getFriendlyErrorMessage } from '../utils/error';
import type { Conversation, Message } from '../types';

export const messagingService = {
  /**
   * Fetch all conversations for the currently logged in user
   */
  async getConversations() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول لعرض المحادثات.');

      // Fetch conversations where current user is either participant_1 or participant_2
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant_1_profile:profiles!participant_1(*),
          participant_2_profile:profiles!participant_2(*)
        `)
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      return { data: data as Conversation[], error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Fetch messages for a specific conversation
   */
  async getMessages(conversationId: string) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender_profile:profiles!sender_id(*)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { data: data as Message[], error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Start a new conversation or retrieve an existing one
   */
  async startConversation(params: {
    participantId: string;
    contextType: 'job' | 'service' | 'product' | 'general';
    contextId?: string;
    contextTitle?: string;
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول لبدء محادثة.');
      if (user.id === params.participantId) throw new Error('لا يمكنك بدء محادثة مع نفسك.');

      // Enforce unique sorting of IDs to prevent duplicate channels
      const [p1, p2] = [user.id, params.participantId].sort();

      // Check if conversation already exists in either direction
      const { data: existing, error: checkError } = await supabase
        .from('conversations')
        .select('*')
        .eq('participant_1', p1)
        .eq('participant_2', p2)
        .eq('context_type', params.contextType);

      if (checkError) throw checkError;

      // Filter by contextId if specified, to handle null values properly in PG
      const conversation = existing?.find(c => c.context_id === (params.contextId || null));

      if (conversation) {
        return { data: conversation as Conversation, error: null };
      }

      // If it doesn't exist, create it
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert([{
          participant_1: p1,
          participant_2: p2,
          context_type: params.contextType,
          context_id: params.contextId || null,
          context_title: params.contextTitle || null
        }])
        .select()
        .single();

      if (createError) throw createError;
      return { data: newConv as Conversation, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Send a message in a conversation
   */
  async sendMessage(conversationId: string, content: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول لإرسال رسالة.');

      // Check if content is empty
      if (!content.trim()) throw new Error('لا يمكن إرسال رسالة فارغة.');

      const { data, error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim()
        }])
        .select()
        .single();

      if (error) throw error;

      // Update last_message_at of conversation
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      return { data: data as Message, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Mark all unread messages in a conversation as read (sent by the other user)
   */
  async markAsRead(conversationId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول لتحديث حالة الرسائل.');

      const { data, error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('is_read', false)
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: getFriendlyErrorMessage(err) };
    }
  },

  /**
   * Get total unread message count for the current user across all conversations
   */
  async getUnreadCount() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { count: 0, error: null };

      // Fetch all conversations user is part of
      const { data: convs, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`);

      if (convError) throw convError;
      if (!convs || convs.length === 0) return { count: 0, error: null };

      const convIds = convs.map(c => c.id);

      // Count messages in these conversations that are not sent by the user and are unread
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', convIds)
        .neq('sender_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      return { count: count || 0, error: null };
    } catch (err) {
      return { count: 0, error: getFriendlyErrorMessage(err) };
    }
  }
};
