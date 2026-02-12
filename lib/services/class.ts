import { createClient } from "@/lib/supabase/server";
import {
  Class,
  CreateClassParams,
  UpdateClassParams,
  AssignTeacherParams,
  ClassSubject,
} from "@/lib/types/academic";

/**
 * Service for managing classes
 */
export class ClassService {
  /**
   * Get all classes for a school
   */
  static async getClasses(
    schoolId: string,
    filters: {
      academicYear?: string;
      gradeLevel?: number;
      search?: string;
    } = {},
  ): Promise<{ classes: Class[]; total: number; error?: string }> {
    try {
      const supabase = await createClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from("classes")
        .select("*, class_teacher:profiles(first_name, last_name, email)", {
          count: "exact",
        })
        .eq("school_id", schoolId)
        .order("grade_level", { ascending: true })
        .order("section", { ascending: true });

      if (filters.academicYear) {
        query = query.eq("academic_year", filters.academicYear);
      }

      if (filters.gradeLevel) {
        query = query.eq("grade_level", filters.gradeLevel);
      }

      if (filters.search) {
        query = query.ilike("name", `%${filters.search}%`);
      }

      const { data, count, error } = await query;

      if (error) {
        console.error("Error fetching classes:", error);
        return { classes: [], total: 0, error: error.message };
      }

      return {
        classes: (data || []).map((c: any) => ({
          ...c,
          created_at: new Date(c.created_at),
          updated_at: new Date(c.updated_at),
        })),
        total: count || 0,
      };
    } catch (error) {
      console.error("Error in getClasses:", error);
      return {
        classes: [],
        total: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get a single class by ID
   */
  static async getClass(
    classId: string,
  ): Promise<{ class: Class | null; error?: string }> {
    try {
      const supabase = await createClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("classes")
        .select(
          "*, class_teacher:profiles(first_name, last_name, email), subjects:class_subjects(*, subject:subjects(*), teacher:profiles(first_name, last_name, email))",
        )
        .eq("id", classId)
        .single();

      if (error) {
        console.error("Error fetching class:", error);
        return { class: null, error: error.message };
      }

      return {
        class: data
          ? {
              ...data,
              created_at: new Date(data.created_at),
              updated_at: new Date(data.updated_at),
            }
          : null,
      };
    } catch (error) {
      console.error("Error in getClass:", error);
      return {
        class: null,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Create a new class
   */
  static async createClass(
    schoolId: string,
    params: CreateClassParams,
  ): Promise<{ success: boolean; classId?: string; error?: string }> {
    try {
      const supabase = await createClient();

      const classData = {
        school_id: schoolId,
        ...params,
        total_students: 0, // Start with 0 students
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("classes")
        .insert(classData)
        .select("id")
        .single();

      if (error) {
        console.error("Error creating class:", error);
        return { success: false, error: error.message };
      }

      return { success: true, classId: data.id };
    } catch (error) {
      console.error("Error in createClass:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update a class
   */
  static async updateClass(
    classId: string,
    params: UpdateClassParams,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = await createClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("classes")
        .update({ ...params, updated_at: new Date().toISOString() })
        .eq("id", classId);

      if (error) {
        console.error("Error updating class:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in updateClass:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Delete a class
   */
  static async deleteClass(
    classId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = await createClient();

      // First, delete all class_subjects associations
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("class_subjects")
        .delete()
        .eq("class_id", classId);

      // Then delete the class
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("classes")
        .delete()
        .eq("id", classId);

      if (error) {
        console.error("Error deleting class:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in deleteClass:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Assign a teacher to teach a subject for a class
   */
  static async assignTeacher(
    params: AssignTeacherParams,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = await createClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from("class_subjects").upsert(
        {
          class_id: params.class_id,
          subject_id: params.subject_id,
          teacher_id: params.teacher_id,
          periods_per_week: params.periods_per_week,
        },
        {
          onConflict: "class_id,subject_id",
        },
      );

      if (error) {
        console.error("Error assigning teacher:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in assignTeacher:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get class subjects with teacher details
   */
  static async getClassSubjects(
    classId: string,
  ): Promise<{ subjects: ClassSubject[]; error?: string }> {
    try {
      const supabase = await createClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("class_subjects")
        .select(
          "*, subject:subjects(*), teacher:profiles(first_name, last_name, email)",
        )
        .eq("class_id", classId);

      if (error) {
        console.error("Error fetching class subjects:", error);
        return { subjects: [], error: error.message };
      }

      return {
        subjects: (data || []).map((cs: any) => ({
          ...cs,
          created_at: new Date(cs.created_at),
        })),
      };
    } catch (error) {
      console.error("Error in getClassSubjects:", error);
      return {
        subjects: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get grade analytics for a school
   */
  static async getGradeAnalytics(
    schoolId: string,
    academicYear: string,
  ): Promise<{
    analytics: {
      grade: number;
      totalClasses: number;
      totalStudents: number;
      averageClassSize: number;
    }[];
    error?: string;
  }> {
    try {
      const supabase = await createClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("classes")
        .select("grade_level, total_students")
        .eq("school_id", schoolId)
        .eq("academic_year", academicYear);

      if (error) {
        console.error("Error fetching grade analytics:", error);
        return { analytics: [], error: error.message };
      }

      // Group by grade level
      const grouped = (data || []).reduce((acc: any, curr: any) => {
        if (!acc[curr.grade_level]) {
          acc[curr.grade_level] = {
            grade: curr.grade_level,
            totalClasses: 0,
            totalStudents: 0,
          };
        }
        acc[curr.grade_level].totalClasses += 1;
        acc[curr.grade_level].totalStudents += curr.total_students || 0;
        return acc;
      }, {});

      const analytics = Object.values(grouped).map((g: any) => ({
        ...g,
        averageClassSize:
          g.totalClasses > 0 ? Math.round(g.totalStudents / g.totalClasses) : 0,
      }));

      return { analytics };
    } catch (error) {
      console.error("Error in getGradeAnalytics:", error);
      return {
        analytics: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
