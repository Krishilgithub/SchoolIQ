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

  // Get school admin record
  const { data: schoolAdmin, error: schoolAdminError } = await supabase
    .from("school_admins")
    .select("school_id")
    .eq("user_id", user.id)
    .single();

  if (schoolAdminError || !schoolAdmin) {
    console.error("Failed to get school admin:", schoolAdminError);
    return null;
  }

  return schoolAdmin.school_id;
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
