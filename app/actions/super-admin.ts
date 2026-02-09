"use server";

import { superAdminService } from "@/lib/services/super-admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createSchoolSchema = z.object({
  schoolName: z.string().min(3, "School name must be at least 3 characters"),
  slug: z.string().optional(),
  schoolType: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  adminEmail: z.string().email("Invalid email address"),
  adminName: z.string().min(2, "Admin name must be at least 2 characters"),
});

export type CreateSchoolState = {
  success?: boolean;
  error?: string;
  fieldErrors?: {
    schoolName?: string[];
    slug?: string[];
    schoolType?: string[];
    phone?: string[];
    address?: string[];
    adminEmail?: string[];
    adminName?: string[];
  };
};

export async function createSchoolAction(
  prevState: CreateSchoolState,
  formData: FormData,
): Promise<CreateSchoolState> {
  const validatedFields = createSchoolSchema.safeParse({
    schoolName: formData.get("schoolName"),
    slug: formData.get("slug"),
    schoolType: formData.get("schoolType"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    adminEmail: formData.get("adminEmail"),
    adminName: formData.get("adminName"),
  });

  if (!validatedFields.success) {
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await superAdminService.createSchoolWithAdmin(validatedFields.data);
    revalidatePath("/super-admin/schools");
    revalidatePath("/super-admin"); // Update overview stats
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create school:", error);
    return {
      error: error.message || "Failed to create school. Please try again.",
    };
  }
}
