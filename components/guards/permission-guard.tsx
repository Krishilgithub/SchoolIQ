"use client";

import { ReactNode } from "react";
import { usePermissions } from "@/hooks/use-permissions";
import { Permission } from "@/lib/permissions/roles";

interface PermissionGuardProps {
  /** Single permission required to view content */
  requires?: Permission;
  /** Multiple permissions - user needs ANY of them */
  requiresAny?: Permission[];
  /** Multiple permissions - user needs ALL of them */
  requiresAll?: Permission[];
  /** Content to show when user has permission */
  children: ReactNode;
  /** Optional fallback content when permission is denied */
  fallback?: ReactNode;
}

/**
 * PermissionGuard Component
 *
 * Wraps content that should only be visible to users with specific permissions.
 *
 * @example
 * // Single permission
 * <PermissionGuard requires={PERMISSIONS.MANAGE_STUDENTS}>
 *   <EditStudentButton />
 * </PermissionGuard>
 *
 * @example
 * // Any of multiple permissions
 * <PermissionGuard requiresAny={[PERMISSIONS.VIEW_STUDENTS, PERMISSIONS.MANAGE_STUDENTS]}>
 *   <StudentsList />
 * </PermissionGuard>
 *
 * @example
 * // All of multiple permissions
 * <PermissionGuard requiresAll={[PERMISSIONS.MANAGE_EXAMS, PERMISSIONS.PUBLISH_RESULTS]}>
 *   <PublishResultsButton />
 * </PermissionGuard>
 *
 * @example
 * // With custom fallback
 * <PermissionGuard
 *   requires={PERMISSIONS.MANAGE_SETTINGS}
 *   fallback={<div>You don't have permission to access settings.</div>}
 * >
 *   <SettingsPanel />
 * </PermissionGuard>
 */
export function PermissionGuard({
  requires,
  requiresAny,
  requiresAll,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } =
    usePermissions();

  let hasAccess = false;

  // Check single permission
  if (requires) {
    hasAccess = hasPermission(requires);
  }
  // Check any of multiple permissions
  else if (requiresAny && requiresAny.length > 0) {
    hasAccess = hasAnyPermission(requiresAny);
  }
  // Check all of multiple permissions
  else if (requiresAll && requiresAll.length > 0) {
    hasAccess = hasAllPermissions(requiresAll);
  }
  // If no permission specified, allow access
  else {
    hasAccess = true;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
