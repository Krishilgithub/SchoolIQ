import { createClient } from "@/lib/supabase/server";

export interface Teacher {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Service for managing teachers
 */
export class TeacherService {
  /**
   * Get all teachers for a school
   */
  static async getTeachers(
    schoolId: string,
    filters: {
      search?: string;
    } = {},
  ): Promise<{ teachers: Teacher[]; total: number; error?: string }> {
    try {
      const supabase = await createClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from("profiles")
        .select("*", { count: "exact" })
        .eq("school_id", schoolId)
        .eq("role", "teacher")
        .order("full_name", { ascending: true });

      if (filters.search) {
        query = query.ilike("full_name", `%${filters.search}%`);
      }

      const { data, count, error } = await query;

      if (error) {
        console.error("Error fetching teachers:", error);
        return { teachers: [], total: 0, error: error.message };
      }

      return {
        teachers: (data || []).map((t: any) => ({
          ...t,
          created_at: new Date(t.created_at),
          updated_at: new Date(t.updated_at),
        })),
        total: count || 0,
      };
    } catch (error) {
      console.error("Error in getTeachers:", error);
      return {
        teachers: [],
        total: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get a single teacher by ID
   */
  static async getTeacher(
    teacherId: string,
  ): Promise<{ teacher: Teacher | null; error?: string }> {
    try {
      const supabase = await createClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("profiles")
        .select("*")
        .eq("id", teacherId)
        .eq("role", "teacher")
        .single();

      if (error) {
        console.error("Error fetching teacher:", error);
        return { teacher: null, error: error.message };
      }

      return {
        teacher: data
          ? {
              ...data,
              created_at: new Date(data.created_at),
              updated_at: new Date(data.updated_at),
            }
          : null,
      };
    } catch (error) {
      console.error("Error in getTeacher:", error);
      return {
        teacher: null,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
