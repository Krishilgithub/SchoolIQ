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

    // Fetch periods
    const { data: periods, error } = await supabase
      .from("periods")
      .select("id, name, period_number, start_time, end_time, is_break, is_active")
      .eq("school_id", profile.school_id)
      .eq("is_active", true)
      .order("period_number", { ascending: true });

    if (error) {
      console.error("Error fetching periods:", error);
      return NextResponse.json(
        { error: "Failed to fetch periods" },
        { status: 500 }
      );
    }

    return NextResponse.json(periods || []);
  } catch (error) {
    console.error("Error in periods API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
