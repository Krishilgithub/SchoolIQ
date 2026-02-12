import { createClient } from "@/lib/supabase/server";
import {
  AuditLogEntry,
  CreateAuditLogParams,
  AuditLogFilters,
} from "@/lib/types/audit";

/**
 * Audit Service
 * Handles creation and querying of audit logs
 */
export class AuditService {
  /**
   * Create a new audit log entry
   */
  static async createLog(
    userId: string,
    schoolId: string,
    params: CreateAuditLogParams,
    requestInfo?: {
      ip?: string;
      userAgent?: string;
    },
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = await createClient();

      const logEntry = {
        user_id: userId,
        school_id: schoolId,
        action: params.action,
        resource_type: params.resource_type,
        resource_id: params.resource_id,
        status: params.status,
        metadata: params.metadata,
        changes: params.changes,
        error_message: params.error_message,
        ip_address: requestInfo?.ip,
        user_agent: requestInfo?.userAgent,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("audit_logs")
        .insert(logEntry);

      if (error) {
        console.error("Failed to create audit log:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Error creating audit log:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Query audit logs with filters
   */
  static async getLogs(
    schoolId: string,
    filters: AuditLogFilters = {},
  ): Promise<{ logs: AuditLogEntry[]; total: number; error?: string }> {
    try {
      const supabase = await createClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from("audit_logs")
        .select("*, profiles(first_name, last_name, email)", { count: "exact" })
        .eq("school_id", schoolId)
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters.user_id) {
        query = query.eq("user_id", filters.user_id);
      }
      if (filters.action) {
        query = query.eq("action", filters.action);
      }
      if (filters.resource_type) {
        query = query.eq("resource_type", filters.resource_type);
      }
      if (filters.resource_id) {
        query = query.eq("resource_id", filters.resource_id);
      }
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.start_date) {
        query = query.gte("created_at", filters.start_date.toISOString());
      }
      if (filters.end_date) {
        query = query.lte("created_at", filters.end_date.toISOString());
      }

      // Pagination
      const limit = filters.limit || 50;
      const offset = filters.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, count, error } = await query;

      if (error) {
        console.error("Failed to fetch audit logs:", error);
        return { logs: [], total: 0, error: error.message };
      }

      return {
        logs: (data || []) as AuditLogEntry[],
        total: count || 0,
      };
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      return {
        logs: [],
        total: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get audit logs for a specific resource
   */
  static async getResourceHistory(
    schoolId: string,
    resourceType: string,
    resourceId: string,
  ): Promise<{ logs: AuditLogEntry[]; error?: string }> {
    const result = await this.getLogs(schoolId, {
      resource_type: resourceType,
      resource_id: resourceId,
      limit: 100,
    });

    return {
      logs: result.logs,
      error: result.error,
    };
  }

  /**
   * Get recent activity for a user
   */
  static async getUserActivity(
    schoolId: string,
    userId: string,
    limit: number = 20,
  ): Promise<{ logs: AuditLogEntry[]; error?: string }> {
    const result = await this.getLogs(schoolId, {
      user_id: userId,
      limit,
    });

    return {
      logs: result.logs,
      error: result.error,
    };
  }

  /**
   * Get activity statistics for a date range
   */
  static async getActivityStats(
    schoolId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    total: number;
    by_action: Record<string, number>;
    by_user: Record<string, number>;
    by_status: Record<string, number>;
    error?: string;
  }> {
    try {
      const supabase = await createClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("audit_logs")
        .select("action, user_id, status")
        .eq("school_id", schoolId)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (error) {
        console.error("Failed to fetch activity stats:", error);
        return {
          total: 0,
          by_action: {},
          by_user: {},
          by_status: {},
          error: error.message,
        };
      }

      const logs = data || [];

      // Calculate statistics
      const by_action: Record<string, number> = {};
      const by_user: Record<string, number> = {};
      const by_status: Record<string, number> = {};

      logs.forEach((log: any) => {
        by_action[log.action] = (by_action[log.action] || 0) + 1;
        by_user[log.user_id] = (by_user[log.user_id] || 0) + 1;
        by_status[log.status] = (by_status[log.status] || 0) + 1;
      });

      return {
        total: logs.length,
        by_action,
        by_user,
        by_status,
      };
    } catch (error) {
      console.error("Error calculating activity stats:", error);
      return {
        total: 0,
        by_action: {},
        by_user: {},
        by_status: {},
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
