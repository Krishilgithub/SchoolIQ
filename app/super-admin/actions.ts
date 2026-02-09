"use server";

import { superAdminService } from "@/lib/services/super-admin";
import { revalidatePath } from "next/cache";

export async function impersonateUserAction(userId: string) {
  try {
    const result = await superAdminService.impersonateUser(userId);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateSchoolAction(
  schoolId: string,
  data: { name?: string; slug?: string; contact_email?: string },
) {
  try {
    const result = await superAdminService.updateSchool(schoolId, data);
    revalidatePath(`/super-admin/schools/${schoolId}`);
    revalidatePath("/super-admin/schools");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
