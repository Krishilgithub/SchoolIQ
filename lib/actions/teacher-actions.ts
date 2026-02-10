"use server";

import { createClient } from "@/lib/supabase/server";
import { Teacher } from "@/lib/types/teacher";
import { revalidatePath } from "next/cache";

export async function getTeachersAction(
  schoolId: string,
  params: { search?: string } = {},
) {
  const supabase = createClient();
  let query = supabase
    .from("profiles")
    .select("*")
    .eq("school_id", schoolId)
    .eq("role", "teacher");

  if (params.search) {
    query = query.ilike("full_name", `%${params.search}%`);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching teachers:", error);
    throw new Error(error.message);
  }

  return data as Teacher[];
}

export async function deleteTeacherAction(teacherId: string) {
  const supabase = createClient();
  // Logic to delete or soft delete. For profiles, usually we disable access rather than delete,
  // but assuming standard delete for now or calling a stored procedure if complex cleanup needed.
  // However, profiles are linked to auth.users. Deleting a profile might not be enough if auth user remains.
  // For now, let's assume direct deletion from profiles table is allowed and cascades or is handled.

  // Better safeguard: check if they have active classes?
  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", teacherId)
    .eq("role", "teacher");

  if (error) {
    console.error("Error deleting teacher:", error);
    throw new Error(error.message);
  }

  revalidatePath("/school-admin/teachers");
  return { success: true };
}
