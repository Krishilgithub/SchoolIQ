import { createClient } from "@/lib/supabase/client";
import {
  Notification,
  CreateNotificationParams,
} from "@/lib/types/notification";

/**
 * Notification Service
 * Handles creation and management of user notifications
 */
export class NotificationService {
  /**
   * Create notification(s) for user(s)
   */
  static async createNotification(
    schoolId: string,
    params: CreateNotificationParams,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient();

      // Create notification for each user
      const notifications = params.user_ids.map((user_id) => ({
        user_id,
        school_id: schoolId,
        type: params.type,
        category: params.category,
        title: params.title,
        message: params.message,
        action: params.action,
        resource_type: params.resource_type,
        resource_id: params.resource_id,
        is_read: false,
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("notifications")
        .insert(notifications);

      if (error) {
        console.error("Failed to create notifications:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Error creating notifications:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get all notifications for a user
   */
  static async getUserNotifications(
    userId: string,
    options: {
      unreadOnly?: boolean;
      category?: string;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<{ notifications: Notification[]; total: number; error?: string }> {
    try {
      const supabase = createClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from("notifications")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (options.unreadOnly) {
        query = query.eq("is_read", false);
      }

      if (options.category) {
        query = query.eq("category", options.category);
      }

      const limit = options.limit || 50;
      const offset = options.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, count, error } = await query;

      if (error) {
        console.error("Failed to fetch notifications:", error);
        return { notifications: [], total: 0, error: error.message };
      }

      return {
        notifications: (data || []) as Notification[],
        total: count || 0,
      };
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return {
        notifications: [],
        total: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Mark notification(s) as read
   */
  static async markAsRead(
    notificationIds: string[],
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in("id", notificationIds);

      if (error) {
        console.error("Failed to mark notifications as read:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Mark all user notifications as read
   */
  static async markAllAsRead(
    userId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) {
        console.error("Failed to mark all notifications as read:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Delete notification(s)
   */
  static async deleteNotifications(
    notificationIds: string[],
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("notifications")
        .delete()
        .in("id", notificationIds);

      if (error) {
        console.error("Failed to delete notifications:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting notifications:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get unread count for a user
   */
  static async getUnreadCount(
    userId: string,
  ): Promise<{ count: number; error?: string }> {
    try {
      const supabase = createClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { count, error } = await (supabase as any)
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) {
        console.error("Failed to get unread count:", error);
        return { count: 0, error: error.message };
      }

      return { count: count || 0 };
    } catch (error) {
      console.error("Error getting unread count:", error);
      return {
        count: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
