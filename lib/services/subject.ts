import { createClient } from "@/lib/supabase/server";
import {
  Subject,
  CreateSubjectParams,
  UpdateSubjectParams,
} from "@/lib/types/academic";

/**
 * Service for managing subjects
 */
export class SubjectService {
  /**
   * Get all subjects for a school
   */
  static async getSubjects(
    schoolId: string,
    filters: {
      department?: string;
      gradeLevel?: number;
      isCore?: boolean;
      search?: string;
    } = {},
  ): Promise<{ subjects: Subject[]; total: number; error?: string }> {
    try {
      const supabase = await createClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from("subjects")
        .select("*", { count: "exact" })
        .eq("school_id", schoolId)
        .order("name", { ascending: true });

      if (filters.department) {
        query = query.eq("department", filters.department);
      }

      if (filters.isCore !== undefined) {
        query = query.eq("is_core", filters.isCore);
      }

      if (filters.gradeLevel !== undefined) {
        query = query.contains("grade_levels", [filters.gradeLevel]);
      }

      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`,
        );
      }

      const { data, count, error } = await query;

      if (error) {
        console.error("Error fetching subjects:", error);
        return { subjects: [], total: 0, error: error.message };
      }

      return {
        subjects: (data || []).map((s: any) => ({
          ...s,
          created_at: new Date(s.created_at),
          updated_at: new Date(s.updated_at),
        })),
        total: count || 0,
      };
    } catch (error) {
      console.error("Error in getSubjects:", error);
      return {
        subjects: [],
        total: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get a single subject by ID
   */
  static async getSubject(
    subjectId: string,
  ): Promise<{ subject: Subject | null; error?: string }> {
    try {
      const supabase = await createClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("subjects")
        .select("*")
        .eq("id", subjectId)
        .single();

      if (error) {
        console.error("Error fetching subject:", error);
        return { subject: null, error: error.message };
      }

      return {
        subject: data
          ? {
              ...data,
              created_at: new Date(data.created_at),
              updated_at: new Date(data.updated_at),
            }
          : null,
      };
    } catch (error) {
      console.error("Error in getSubject:", error);
      return {
        subject: null,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Create a new subject
   */
  static async createSubject(
    schoolId: string,
    params: CreateSubjectParams,
  ): Promise<{ success: boolean; subjectId?: string; error?: string }> {
    try {
      const supabase = await createClient();

      const subjectData = {
        school_id: schoolId,
        ...params,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("subjects")
        .insert(subjectData)
        .select("id")
        .single();

      if (error) {
        console.error("Error creating subject:", error);
        return { success: false, error: error.message };
      }

      return { success: true, subjectId: data.id };
    } catch (error) {
      console.error("Error in createSubject:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update a subject
   */
  static async updateSubject(
    subjectId: string,
    params: UpdateSubjectParams,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = await createClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("subjects")
        .update({ ...params, updated_at: new Date().toISOString() })
        .eq("id", subjectId);

      if (error) {
        console.error("Error updating subject:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in updateSubject:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Delete a subject
   */
  static async deleteSubject(
    subjectId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = await createClient();

      // First check if subject is assigned to any classes
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: assignments } = await (supabase as any)
        .from("class_subjects")
        .select("id")
        .eq("subject_id", subjectId)
        .limit(1);

      if (assignments && assignments.length > 0) {
        return {
          success: false,
          error:
            "Cannot delete subject that is assigned to one or more classes",
        };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("subjects")
        .delete()
        .eq("id", subjectId);

      if (error) {
        console.error("Error deleting subject:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in deleteSubject:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get subjects by department
   */
  static async getSubjectsByDepartment(schoolId: string): Promise<{
    departments: {
      name: string;
      subjects: Subject[];
      coreCount: number;
      electiveCount: number;
    }[];
    error?: string;
  }> {
    try {
      const supabase = await createClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("subjects")
        .select("*")
        .eq("school_id", schoolId)
        .order("department")
        .order("name");

      if (error) {
        console.error("Error fetching subjects by department:", error);
        return { departments: [], error: error.message };
      }

      // Group by department
      const grouped = (data || []).reduce((acc: any, subject: any) => {
        const dept = subject.department || "Unassigned";
        if (!acc[dept]) {
          acc[dept] = {
            name: dept,
            subjects: [],
            coreCount: 0,
            electiveCount: 0,
          };
        }
        acc[dept].subjects.push({
          ...subject,
          created_at: new Date(subject.created_at),
          updated_at: new Date(subject.updated_at),
        });
        if (subject.is_core) {
          acc[dept].coreCount += 1;
        } else {
          acc[dept].electiveCount += 1;
        }
        return acc;
      }, {});

      return { departments: Object.values(grouped) };
    } catch (error) {
      console.error("Error in getSubjectsByDepartment:", error);
      return {
        departments: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get subjects available for a specific grade level
   */
  static async getSubjectsForGrade(
    schoolId: string,
    gradeLevel: number,
  ): Promise<{ subjects: Subject[]; error?: string }> {
    try {
      const supabase = await createClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("subjects")
        .select("*")
        .eq("school_id", schoolId)
        .contains("grade_levels", [gradeLevel])
        .order("is_core", { ascending: false }) // Core subjects first
        .order("name");

      if (error) {
        console.error("Error fetching subjects for grade:", error);
        return { subjects: [], error: error.message };
      }

      return {
        subjects: (data || []).map((s: any) => ({
          ...s,
          created_at: new Date(s.created_at),
          updated_at: new Date(s.updated_at),
        })),
      };
    } catch (error) {
      console.error("Error in getSubjectsForGrade:", error);
      return {
        subjects: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
