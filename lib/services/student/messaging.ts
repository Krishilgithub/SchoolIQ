// Student Messaging Service
// Handles communication between students and teachers

import { createClient } from "@/lib/supabase/server";

export interface StudentMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  body: string;
  message_type: "personal" | "announcement" | "alert" | "assignment" | "exam";
  parent_message_id?: string;
  attachments?: any[];
  is_read: boolean;
  read_at?: string;
  priority: "low" | "normal" | "high" | "urgent";
  created_at: string;
  sender?: any;
  recipient?: any;
}

export const studentMessagingService = {
  /**
   * Get all messages for a student (inbox)
   */
  async getInbox(studentId: string): Promise<StudentMessage[]> {
    const supabase = await createClient();

    const { data: messages, error } = await supabase
      .from("student_messages")
      .select(
        `
        *,
        sender:profiles!student_messages_sender_id_fkey (
          id,
          first_name,
          last_name,
          email,
          role
        )
      `,
      )
      .eq("recipient_id", studentId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching inbox:", error);
      return [];
    }

    return messages || [];
  },

  /**
   * Get sent messages
   */
  async getSentMessages(studentId: string): Promise<StudentMessage[]> {
    const supabase = await createClient();

    const { data: messages, error } = await supabase
      .from("student_messages")
      .select(
        `
        *,
        recipient:profiles!student_messages_recipient_id_fkey (
          id,
          first_name,
          last_name,
          email,
          role
        )
      `,
      )
      .eq("sender_id", studentId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching sent messages:", error);
      return [];
    }

    return messages || [];
  },

  /**
   * Get unread messages count
   */
  async getUnreadCount(studentId: string): Promise<number> {
    const supabase = await createClient();

    const { count, error } = await supabase
      .from("student_messages")
      .select("*", { count: "exact", head: true })
      .eq("recipient_id", studentId)
      .eq("is_read", false);

    if (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }

    return count || 0;
  },

  /**
   * Get a specific message by ID
   */
  async getMessage(messageId: string): Promise<StudentMessage | null> {
    const supabase = await createClient();

    const { data: message, error } = await supabase
      .from("student_messages")
      .select(
        `
        *,
        sender:profiles!student_messages_sender_id_fkey (
          id,
          first_name,
          last_name,
          email,
          role
        ),
        recipient:profiles!student_messages_recipient_id_fkey (
          id,
          first_name,
          last_name,
          email,
          role
        )
      `,
      )
      .eq("id", messageId)
      .single();

    if (error) {
      console.error("Error fetching message:", error);
      return null;
    }

    return message;
  },

  /**
   * Send a message
   */
  async sendMessage(
    senderId: string,
    recipientId: string,
    subject: string,
    body: string,
    messageType: string = "personal",
    priority: string = "normal",
    attachments: any[] = [],
  ): Promise<string | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("student_messages")
      .insert({
        sender_id: senderId,
        recipient_id: recipientId,
        subject,
        body,
        message_type: messageType,
        priority,
        attachments,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error sending message:", error);
      return null;
    }

    return data?.id || null;
  },

  /**
   * Reply to a message
   */
  async replyToMessage(
    messageId: string,
    senderId: string,
    recipientId: string,
    body: string,
    attachments: any[] = [],
  ): Promise<string | null> {
    const supabase = await createClient();

    // Get original message for subject
    const original = await this.getMessage(messageId);
    if (!original) {
      return null;
    }

    const subject = original.subject.startsWith("Re:")
      ? original.subject
      : `Re: ${original.subject}`;

    const { data, error } = await supabase
      .from("student_messages")
      .insert({
        sender_id: senderId,
        recipient_id: recipientId,
        subject,
        body,
        parent_message_id: messageId,
        message_type: original.message_type,
        priority: original.priority,
        attachments,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error replying to message:", error);
      return null;
    }

    return data?.id || null;
  },

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<boolean> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("student_messages")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("id", messageId);

    if (error) {
      console.error("Error marking message as read:", error);
      return false;
    }

    return true;
  },

  /**
   * Mark multiple messages as read
   */
  async markMultipleAsRead(messageIds: string[]): Promise<boolean> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("student_messages")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .in("id", messageIds);

    if (error) {
      console.error("Error marking messages as read:", error);
      return false;
    }

    return true;
  },

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<boolean> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("student_messages")
      .delete()
      .eq("id", messageId);

    if (error) {
      console.error("Error deleting message:", error);
      return false;
    }

    return true;
  },

  /**
   * Get message thread (conversation)
   */
  async getMessageThread(messageId: string): Promise<StudentMessage[]> {
    const supabase = await createClient();

    // Get the original message
    const original = await this.getMessage(messageId);
    if (!original) {
      return [];
    }

    // Find the root message
    let rootId = messageId;
    if (original.parent_message_id) {
      rootId = original.parent_message_id;
    }

    // Get all messages in the thread
    const { data: thread, error } = await supabase
      .from("student_messages")
      .select(
        `
        *,
        sender:profiles!student_messages_sender_id_fkey (
          id,
          first_name,
          last_name,
          role
        ),
        recipient:profiles!student_messages_recipient_id_fkey (
          id,
          first_name,
          last_name,
          role
        )
      `,
      )
      .or(`id.eq.${rootId},parent_message_id.eq.${rootId}`)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching thread:", error);
      return [];
    }

    return thread || [];
  },

  /**
   * Get messages by type (announcements, alerts, etc.)
   */
  async getMessagesByType(
    studentId: string,
    messageType: string,
  ): Promise<StudentMessage[]> {
    const messages = await this.getInbox(studentId);
    return messages.filter((m) => m.message_type === messageType);
  },

  /**
   * Get priority messages
   */
  async getPriorityMessages(studentId: string): Promise<StudentMessage[]> {
    const messages = await this.getInbox(studentId);
    return messages.filter(
      (m) => m.priority === "high" || m.priority === "urgent",
    );
  },

  /**
   * Search messages
   */
  async searchMessages(
    studentId: string,
    searchQuery: string,
  ): Promise<StudentMessage[]> {
    const inbox = await this.getInbox(studentId);
    const sent = await this.getSentMessages(studentId);
    const allMessages = [...inbox, ...sent];

    const query = searchQuery.toLowerCase();

    return allMessages.filter(
      (message) =>
        message.subject.toLowerCase().includes(query) ||
        message.body.toLowerCase().includes(query) ||
        message.sender?.first_name?.toLowerCase().includes(query) ||
        message.sender?.last_name?.toLowerCase().includes(query) ||
        message.recipient?.first_name?.toLowerCase().includes(query) ||
        message.recipient?.last_name?.toLowerCase().includes(query),
    );
  },

  /**
   * Get messaging statistics
   */
  async getMessagingStats(studentId: string): Promise<any> {
    const inbox = await this.getInbox(studentId);
    const sent = await this.getSentMessages(studentId);
    const unreadCount = await this.getUnreadCount(studentId);

    return {
      totalInbox: inbox.length,
      totalSent: sent.length,
      unread: unreadCount,
      byType: {
        personal: inbox.filter((m) => m.message_type === "personal").length,
        announcement: inbox.filter((m) => m.message_type === "announcement")
          .length,
        alert: inbox.filter((m) => m.message_type === "alert").length,
        assignment: inbox.filter((m) => m.message_type === "assignment").length,
        exam: inbox.filter((m) => m.message_type === "exam").length,
      },
      byPriority: {
        urgent: inbox.filter((m) => m.priority === "urgent").length,
        high: inbox.filter((m) => m.priority === "high").length,
        normal: inbox.filter((m) => m.priority === "normal").length,
        low: inbox.filter((m) => m.priority === "low").length,
      },
    };
  },
};
