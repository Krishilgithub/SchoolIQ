"use server";

import { SubjectService } from "@/lib/services/subject";
import { CreateSubjectParams, UpdateSubjectParams } from "@/lib/types/academic";
import { revalidatePath } from "next/cache";

export async function getSubjectsAction(schoolId: string, search?: string) {
  const { subjects, error } = await SubjectService.getSubjects(schoolId, {
    search,
  });
  if (error) {
    throw new Error(error);
  }
  // Serialize dates
  return subjects.map((s) => ({
    ...s,
    created_at: s.created_at.toISOString(),
    updated_at: s.updated_at.toISOString(),
  }));
}

export async function createSubjectAction(
  schoolId: string,
  data: CreateSubjectParams,
) {
  const result = await SubjectService.createSubject(schoolId, data);
  if (result.success) {
    revalidatePath("/school-admin/academics/subjects");
  }
  return result;
}

export async function deleteSubjectAction(id: string) {
  const result = await SubjectService.deleteSubject(id);
  if (result.success) {
    revalidatePath("/school-admin/academics/subjects");
  }
  return result;
}

export async function updateSubjectAction(
  id: string,
  data: UpdateSubjectParams,
) {
  const result = await SubjectService.updateSubject(id, data);
  if (result.success) {
    revalidatePath("/school-admin/academics/subjects");
  }
  return result;
}
