"use server";

import { ClassService } from "@/lib/services/class";
import {
  CreateClassParams,
  UpdateClassParams,
  AssignTeacherParams,
} from "@/lib/types/academic";
import { revalidatePath } from "next/cache";

export async function getClassesAction(
  schoolId: string,
  filters: { academicYear?: string; gradeLevel?: number; search?: string } = {},
) {
  const { classes, error } = await ClassService.getClasses(schoolId, filters);
  if (error) {
    throw new Error(error);
  }
  return classes.map((c) => ({
    ...c,
    created_at: c.created_at.toISOString(),
    updated_at: c.updated_at.toISOString(),
  }));
}

export async function createClassAction(
  schoolId: string,
  data: CreateClassParams,
) {
  const result = await ClassService.createClass(schoolId, data);
  if (result.success) {
    revalidatePath("/school-admin/academics/classes");
  }
  return result;
}

export async function updateClassAction(id: string, data: UpdateClassParams) {
  const result = await ClassService.updateClass(id, data);
  if (result.success) {
    revalidatePath("/school-admin/academics/classes");
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

export async function assignTeacherAction(params: AssignTeacherParams) {
  const result = await ClassService.assignTeacher({
    ...params,
    teacher_id: params.teacher_id,
  });
  if (result.success) {
    revalidatePath(`/school-admin/academics/classes/${params.class_id}`);
  }
  return result;
}

export async function getClassSubjectsAction(classId: string) {
  const { subjects, error } = await ClassService.getClassSubjects(classId);
  if (error) throw new Error(error);
  return subjects.map((s) => ({
    ...s,
    created_at: s.created_at.toISOString(),
  }));
}
