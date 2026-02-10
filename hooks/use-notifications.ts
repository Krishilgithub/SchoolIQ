"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { NotificationService } from "@/lib/services/notification";

/**
 * Hook for managing notifications
 */
export function useNotifications() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      const result = await NotificationService.getUnreadCount(user.id);
      if (!result.error) {
        setUnreadCount(result.count);
      }
    } catch (error) {
      console.error("Failed to load unread count:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    loadUnreadCount();

    // Poll for updates every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [user, loadUnreadCount]);

  const refreshCount = () => {
    loadUnreadCount();
  };

  return {
    unreadCount,
    loading,
    refreshCount,
  };
}
