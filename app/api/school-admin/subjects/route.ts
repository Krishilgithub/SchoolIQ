import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile to verify school_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("school_id")
      .eq("id", user.id)
      .single();

    if (!profile?.school_id) {
      return NextResponse.json(
        { error: "School not found" },
        { status: 400 }
      );
    }

    // Fetch subjects
    const { data: subjects, error } = await supabase
      .from("subjects")
      .select("id, name, code, department, is_core, grade_levels")
      .eq("school_id", profile.school_id)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching subjects:", error);
      return NextResponse.json(
        { error: "Failed to fetch subjects" },
        { status: 500 }
      );
    }

    return NextResponse.json(subjects || []);
  } catch (error) {
    console.error("Error in subjects API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
