"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { AuditService } from "@/lib/services/audit";
import { CreateAuditLogParams } from "@/lib/types/audit";

/**
 * Hook for logging audit events
 * Automatically includes user and school context
 */
export function useAudit() {
  const { user, schoolId } = useAuth();

  /**
   * Log an audit event
   */
  const logEvent = async (params: CreateAuditLogParams) => {
    if (!user || !schoolId) {
      console.warn("Cannot log audit event: missing user or school context");
      return { success: false, error: "Missing context" };
    }

    // Get request info from browser
    const requestInfo = {
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : undefined,
    };

    return await AuditService.createLog(user.id, schoolId, params, requestInfo);
  };

  /**
   * Log a successful action
   */
  const logSuccess = async (
    action: CreateAuditLogParams["action"],
    resourceType: string,
    resourceId?: string,
    metadata?: Record<string, any>,
  ) => {
    return await logEvent({
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      status: "success",
      metadata,
    });
  };

  /**
   * Log a failed action
   */
  const logFailure = async (
    action: CreateAuditLogParams["action"],
    resourceType: string,
    errorMessage: string,
    resourceId?: string,
    metadata?: Record<string, any>,
  ) => {
    return await logEvent({
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      status: "failure",
      error_message: errorMessage,
      metadata,
    });
  };

  /**
   * Log an action with before/after changes
   */
  const logChange = async (
    action: CreateAuditLogParams["action"],
    resourceType: string,
    resourceId: string,
    before: Record<string, any>,
    after: Record<string, any>,
    metadata?: Record<string, any>,
  ) => {
    return await logEvent({
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      status: "success",
      changes: { before, after },
      metadata,
    });
  };

  return {
    logEvent,
    logSuccess,
    logFailure,
    logChange,
  };
}
