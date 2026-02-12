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

    // Fetch academic years
    const { data: academicYears, error } = await supabase
      .from("academic_years")
      .select("id, name, start_date, end_date, is_current")
      .eq("school_id", profile.school_id)
      .order("start_date", { ascending: false });

    if (error) {
      console.error("Error fetching academic years:", error);
      return NextResponse.json(
        { error: "Failed to fetch academic years" },
        { status: 500 }
      );
    }

    return NextResponse.json(academicYears || []);
  } catch (error) {
    console.error("Error in academic years API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
