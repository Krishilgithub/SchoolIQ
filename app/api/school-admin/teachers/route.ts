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
      .select("school_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.school_id) {
      return NextResponse.json({ error: "School not found" }, { status: 400 });
    }

    // Fetch teachers (profiles with teacher role)
    const { data: teachers, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email, phone_number, avatar_url")
      .eq("school_id", profile.school_id)
      .eq("role", "teacher")
      .order("first_name", { ascending: true });

    if (error) {
      console.error("Error fetching teachers:", error);
      return NextResponse.json(
        { error: "Failed to fetch teachers" },
        { status: 500 },
      );
    }

    return NextResponse.json(teachers || []);
  } catch (error) {
    console.error("Error in teachers API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
