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

    // Fetch rooms
    const { data: rooms, error } = await supabase
      .from("rooms")
      .select("id, name, room_number, building, capacity, room_type, is_available")
      .eq("school_id", profile.school_id)
      .eq("is_available", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching rooms:", error);
      return NextResponse.json(
        { error: "Failed to fetch rooms" },
        { status: 500 }
      );
    }

    return NextResponse.json(rooms || []);
  } catch (error) {
    console.error("Error in rooms API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
