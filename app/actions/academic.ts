"use server";

import { ClassService } from "@/lib/services/class";
import { revalidatePath } from "next/cache";

export async function assignTeacherAction(params: {
  class_id: string;
  subject_id: string;
  teacher_id?: string;
  periods_per_week: number;
}) {
  const result = await ClassService.assignTeacher(params);

  if (result.success) {
    revalidatePath(`/school-admin/academics/classes/${params.class_id}`);
  }

  return result;
}

export async function deleteClassAction(id: string) {
  const result = await ClassService.deleteClass(id);
  if (result.success) {
    revalidatePath("/school-admin/academics/classes");
  }
  return result;
}
