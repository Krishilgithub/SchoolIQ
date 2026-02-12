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
      return NextResponse.json({ error: "School not found" }, { status: 400 });
    }

    // Fetch classes
    const { data: classes, error } = await supabase
      .from("classes")
      .select("id, name, grade_level, section, academic_year")
      .eq("school_id", profile.school_id)
      .order("grade_level", { ascending: true })
      .order("section", { ascending: true });

    if (error) {
      console.error("Error fetching classes:", error);
      return NextResponse.json(
        { error: "Failed to fetch classes" },
        { status: 500 },
      );
    }

    return NextResponse.json(classes || []);
  } catch (error) {
    console.error("Error in classes API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
