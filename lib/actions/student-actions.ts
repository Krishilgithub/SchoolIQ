"use server";

import { createClient } from "@/lib/supabase/server";
import { Student } from "@/lib/types/student";
import { revalidatePath } from "next/cache";

export async function getStudentsAction(
  schoolId: string,
  params: { search?: string; gradeLevel?: string } = {},
) {
  const supabase = await createClient();
  let query = supabase.from("students").select("*").eq("school_id", schoolId);

  if (params.search) {
    query = query.or(
      `first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%,email.ilike.%${params.search}%`,
    );
  }

  if (params.gradeLevel && params.gradeLevel !== "all") {
    query = query.eq("grade_level", parseInt(params.gradeLevel));
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching students:", error);
    throw new Error(error.message);
  }

  return data as Student[];
}

export async function deleteStudentAction(studentId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .delete()
    .eq("id", studentId);

  if (error) {
    console.error("Error deleting student:", error);
    throw new Error(error.message);
  }

  revalidatePath("/school-admin/students");
  return { success: true };
}
