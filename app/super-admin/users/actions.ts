"use server";

import { superAdminService } from "@/lib/services/super-admin";
import { revalidatePath } from "next/cache";

export async function suspendUserAction(
  userId: string,
  shouldSuspend: boolean,
) {
  try {
    await superAdminService.suspendUser(userId, shouldSuspend);
    revalidatePath("/super-admin/users");
    return { success: true };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return { success: false, error: errorMessage };
  }
}

export async function deleteUserAction(userId: string) {
  try {
    await superAdminService.deleteUser(userId);
    revalidatePath("/super-admin/users");
    return { success: true };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return { success: false, error: errorMessage };
  }
}
