"use server";

import { createClient } from "@/lib/supabase/server";
import {
  CreateAssignmentParams,
  UpdateAssignmentParams,
} from "@/lib/types/assignment";
import { revalidatePath } from "next/cache";

export async function getAssignmentsAction(
  schoolId: string,
  params: { classId?: string; subjectId?: string; teacherId?: string } = {},
) {
  const supabase = createClient();
  let query = supabase
    .from("assignments")
    .select(
      `
    *,
    class:class_id(name),
    subject:subject_id(name),
    teacher:teacher_id(full_name)
  `,
    )
    .eq("school_id", schoolId);

  if (params.classId) query = query.eq("class_id", params.classId);
  if (params.subjectId) query = query.eq("subject_id", params.subjectId);
  if (params.teacherId) query = query.eq("teacher_id", params.teacherId);

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching assignments:", error);
    throw new Error(error.message);
  }

  // Map relations
  return data.map((item: any) => ({
    ...item,
    class_name: item.class?.name,
    subject_name: item.subject?.name,
    teacher_name: item.teacher?.full_name,
  }));
}

export async function createAssignmentAction(
  schoolId: string,
  params: CreateAssignmentParams,
) {
  const supabase = createClient();

  // In a real app, we should get the teacher_id from the current user session if they are a teacher
  // For now assuming the teacher_id is passed or handled differently, but the params dont have it?
  // Wait, the CreateAssignmentParams doesn't have teacher_id.
  // Usually the logged in user is the creator.
  // Let's get the current user.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // We need to resolve the user's profile ID to use as teacher_id
  // But wait, the admin is creating this right now? Or a teacher?
  // If admin is creating, maybe they assign a teacher?
  // For now, let's assume the current user is the "creator" but the teacher_id field on assignment
  // references a profile. If admin is creating, we might need a distinct creator_id or assign it to a teacher.
  // Let's check the schema if we could.

  // Simplified: Just insert what we have, add school_id.
  // Depending on schema constraint, teacher_id might be nullable or required.
  // Based on `Assignment` interface, it is required strings.

  // I will look up the profile id of the current user.
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!profile) throw new Error("Profile not found");

  const { error } = await supabase.from("assignments").insert({
    ...params,
    school_id: schoolId,
    teacher_id: profile.id, // Assigning to current user for now
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Error creating assignment:", error);
    throw new Error(error.message);
  }

  revalidatePath("/school-admin/assignments");
  return { success: true };
}

export async function deleteAssignmentAction(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("assignments").delete().eq("id", id);
  if (error) {
    console.error("Error deleting assignment:", error);
    throw new Error(error.message);
  }
  revalidatePath("/school-admin/assignments");
  return { success: true };
}
