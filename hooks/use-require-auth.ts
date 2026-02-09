"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { toast } from "sonner";

type UserRole =
  | "super_admin"
  | "school_admin"
  | "admin"
  | "teacher"
  | "student"
  | "parent"
  | "guardian"
  | "staff";

interface UseRequireAuthOptions {
  /**
   * Required roles to access the page
   */
  requiredRoles?: UserRole[];
  /**
   * Check if user is super admin
   */
  requireSuperAdmin?: boolean;
  /**
   * Redirect path if unauthorized (default: /unauthorized)
   */
  unauthorizedRedirect?: string;
  /**
   * Redirect path if not authenticated (default: /auth/login)
   */
  loginRedirect?: string;
}

/**
 * Hook to require authentication and authorization
 * Redirects to login if not authenticated
 * Redirects to unauthorized page if user doesn't have required role
 */
export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const {
    requiredRoles,
    requireSuperAdmin = false,
    unauthorizedRedirect = "/unauthorized",
    loginRedirect = "/auth/login",
  } = options;

  const { user, profile, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't check while loading
    if (isLoading) return;

    // Not authenticated - redirect to login
    if (!user) {
      toast.error("Please sign in to continue");
      router.push(loginRedirect);
      return;
    }

    // No profile loaded yet
    if (!profile) {
      console.warn("Profile not loaded for authenticated user");
      return;
    }

    // Check super admin requirement
    if (requireSuperAdmin && !profile.is_super_admin) {
      toast.error("Super admin access required");
      router.push(unauthorizedRedirect);
      return;
    }

    // Check role requirement
    if (requiredRoles && requiredRoles.length > 0) {
      const userRole = profile.role as UserRole;
      const hasRequiredRole = requiredRoles.includes(userRole);

      // Super admins have access to everything
      const isSuperAdmin = profile.is_super_admin;

      if (!hasRequiredRole && !isSuperAdmin) {
        toast.error("You don't have permission to access this page");
        router.push(unauthorizedRedirect);
        return;
      }
    }
  }, [
    user,
    profile,
    isLoading,
    requiredRoles,
    requireSuperAdmin,
    router,
    unauthorizedRedirect,
    loginRedirect,
  ]);

  return {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    isAuthorized:
      !!profile &&
      (requireSuperAdmin
        ? profile.is_super_admin
        : !requiredRoles ||
          requiredRoles.length === 0 ||
          requiredRoles.includes(profile.role as UserRole) ||
          profile.is_super_admin),
  };
}

/**
 * Hook to require super admin access
 */
export function useRequireSuperAdmin() {
  return useRequireAuth({ requireSuperAdmin: true });
}

/**
 * Hook to require school admin access
 */
export function useRequireSchoolAdmin() {
  return useRequireAuth({
    requiredRoles: ["school_admin", "admin"],
  });
}

/**
 * Hook to require teacher access
 */
export function useRequireTeacher() {
  return useRequireAuth({
    requiredRoles: ["teacher", "school_admin", "admin"],
  });
}
