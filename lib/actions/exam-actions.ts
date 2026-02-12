"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Database } from "@/types/database.types";

type ExamMasterInsert = Database["public"]["Tables"]["exam_master"]["Insert"];
type ExamMasterUpdate = Database["public"]["Tables"]["exam_master"]["Update"];

export async function createExamAction(examData: ExamMasterInsert) {
  const supabase = await createClient();

  // Get current user for created_by field
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("exam_master")
    .insert({
      ...examData,
      created_by: user.id,
      status: "draft",
      is_published: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating exam:", error);
    throw new Error(error.message);
  }

  revalidatePath("/school-admin/academics/exams");
  return data;
}

export async function updateExamAction(
  examId: string,
  updates: ExamMasterUpdate,
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exam_master")
    .update(updates)
    .eq("id", examId)
    .select()
    .single();

  if (error) {
    console.error("Error updating exam:", error);
    throw new Error(error.message);
  }

  revalidatePath("/school-admin/academics/exams");
  revalidatePath(`/school-admin/academics/exams/${examId}`);
  return data;
}

export async function deleteExamAction(examId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("exam_master")
    .delete()
    .eq("id", examId);

  if (error) {
    console.error("Error deleting exam:", error);
    throw new Error(error.message);
  }

  revalidatePath("/school-admin/academics/exams");
  return { success: true };
}

export async function publishExamAction(examId: string) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Check if exam has at least one paper
  const { count } = await supabase
    .from("exam_papers")
    .select("id", { count: "exact", head: true })
    .eq("exam_id", examId);

  if (!count || count === 0) {
    throw new Error("Cannot publish exam without papers");
  }

  const { data, error } = await supabase
    .from("exam_master")
    .update({
      is_published: true,
      published_at: new Date().toISOString(),
      published_by: user.id,
      status: "published",
    })
    .eq("id", examId)
    .select()
    .single();

  if (error) {
    console.error("Error publishing exam:", error);
    throw new Error(error.message);
  }

  revalidatePath("/school-admin/academics/exams");
  revalidatePath(`/school-admin/academics/exams/${examId}`);
  return data;
}
