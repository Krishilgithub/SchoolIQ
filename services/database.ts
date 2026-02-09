// import { createClient } from "@/lib/supabase/server"; // Removed to avoid client bundle inclusion
import { Database } from "@/types/database.types";
import { SupabaseClient } from "@supabase/supabase-js";

export type School = Database["public"]["Tables"]["schools"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Student = Database["public"]["Tables"]["students"]["Row"];

export class DatabaseService {
  private supabase: SupabaseClient<Database>;

  constructor(client: SupabaseClient<Database>) {
    this.supabase = client;
  }

  // --- Schools ---

  async getSchoolBySlug(slug: string): Promise<School | null> {
    const { data, error } = await this.supabase
      .from("schools")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error(`Error fetching school by slug ${slug}:`, error);
      return null;
    }
    return data;
  }

  async createSchool(
    school: Database["public"]["Tables"]["schools"]["Insert"],
  ): Promise<School | null> {
    const { data, error } = await this.supabase
      .from("schools")
      .insert(school)
      .select()
      .single();

    if (error) {
      console.error("Error creating school:", error);
      throw error;
    }
    return data;
  }

  // --- Profiles ---

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error(`Error fetching profile for ${userId}:`, error);
      return null;
    }
    return data;
  }

  // --- Students ---

  async getStudentsBySchool(schoolId: string): Promise<Student[]> {
    const { data, error } = await this.supabase
      .from("students")
      .select("*")
      .eq("school_id", schoolId)
      .order("last_name", { ascending: true });

    if (error) {
      console.error(`Error fetching students for school ${schoolId}:`, error);
      return [];
    }
    return data;
  }

  async getStudentById(id: string): Promise<Student | null> {
    const { data, error } = await this.supabase
      .from("students")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching student ${id}:`, error);
      return null;
    }
    return data;
  }
}

// Factory function removed to separate file services/database-server.ts to avoid leaking server code to client
