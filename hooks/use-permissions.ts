"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Permission, getRolePermissions } from "@/lib/permissions/roles";

/**
 * Hook to check permissions for the current user
 */
export function usePermissions() {
  const { profile } = useAuth();

  /**
   * Check if the current user has a specific permission
   */
  const hasPermission = (permission: Permission): boolean => {
    if (!profile?.role) return false;

    const rolePermissions = getRolePermissions(profile.role);
    return rolePermissions.includes(permission);
  };

  /**
   * Check if the current user has ANY of the specified permissions
   */
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some((permission) => hasPermission(permission));
  };

  /**
   * Check if the current user has ALL of the specified permissions
   */
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every((permission) => hasPermission(permission));
  };

  /**
   * Get all permissions for the current user's role
   */
  const getUserPermissions = (): Permission[] => {
    if (!profile?.role) return [];
    return getRolePermissions(profile.role);
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissions,
    role: profile?.role,
  };
}
