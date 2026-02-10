"use server";

import { createClient } from "@/lib/supabase/server";
import {
  CreateAnnouncementParams,
  UpdateAnnouncementParams,
} from "@/lib/types/announcement";
import { revalidatePath } from "next/cache";

export async function getAnnouncementsAction(schoolId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("announcements")
    .select(
      `
      *,
      author:author_id(full_name)
    `,
    )
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching announcements:", error);
    throw new Error(error.message);
  }

  return data.map((item: any) => ({
    ...item,
    author_name: item.author?.full_name,
  }));
}

export async function createAnnouncementAction(
  schoolId: string,
  params: CreateAnnouncementParams,
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get profile id for author_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!profile) throw new Error("Profile not found");

  const { error } = await supabase.from("announcements").insert({
    ...params,
    school_id: schoolId,
    author_id: profile.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Error creating announcement:", error);
    throw new Error(error.message);
  }

  revalidatePath("/school-admin/communication");
  return { success: true };
}

export async function deleteAnnouncementAction(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("announcements").delete().eq("id", id);

  if (error) {
    console.error("Error deleting announcement:", error);
    throw new Error(error.message);
  }

  revalidatePath("/school-admin/communication");
  return { success: true };
}
