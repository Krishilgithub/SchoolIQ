import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Get the current logged-in user's ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user.id;
}

/**
 * Get the school ID for the current logged-in school admin
 */
export async function getCurrentSchoolId(): Promise<string | null> {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  // First, try to get school ID from school_admins table
  const { data: schoolAdmin, error: schoolAdminError } = await supabase
    .from("school_admins")
    .select("school_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (schoolAdmin?.school_id) {
    return schoolAdmin.school_id;
  }

  // Fallback: Check school_members table for admin role
  const { data: schoolMember, error: schoolMemberError } = await supabase
    .from("school_members")
    .select("school_id, role")
    .eq("user_id", user.id)
    .eq("role", "school_admin")
    .eq("status", "active")
    .maybeSingle();

  if (schoolMember?.school_id) {
    console.warn(
      "Admin user found in school_members but not in school_admins. Run fix_school_admin_access.sql to fix this.",
    );
    return schoolMember.school_id;
  }

  // Last fallback: Check profile for school_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("school_id, role")
    .eq("id", user.id)
    .eq("role", "school_admin")
    .maybeSingle();

  if (profile?.school_id) {
    console.warn(
      "Admin user has school_id in profile but not in school_admins. Run fix_school_admin_access.sql to fix this.",
    );
    return profile.school_id;
  }

  console.error("No school found for admin user:", {
    userId: user.id,
    schoolAdminError,
    schoolMemberError,
  });
  return null;
}

/**
 * Get the current user's profile
 */
export async function getCurrentUserProfile() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Failed to get profile:", profileError);
    return null;
  }

  return profile;
}

/**
 * Check if user is a school admin
 */
export async function isSchoolAdmin(): Promise<boolean> {
  const schoolId = await getCurrentSchoolId();
  return schoolId !== null;
}

/**
 * Check if user is a super admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return false;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return false;
  }

  return profile.is_super_admin || false;
}
