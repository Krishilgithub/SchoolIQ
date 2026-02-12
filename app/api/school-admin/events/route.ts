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

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    // Fetch events for the school
    let query = supabase
      .from("school_events")
      .select("*")
      .eq("school_id", profile.school_id)
      .order("start_date", { ascending: true });

    if (startDate) {
      query = query.gte("start_date", startDate);
    }

    if (endDate) {
      query = query.lte("start_date", endDate);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error("Error fetching events:", error);
      return NextResponse.json(
        { error: "Failed to fetch events" },
        { status: 500 },
      );
    }

    return NextResponse.json(events || []);
  } catch (error) {
    console.error("Error in events API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      title,
      description,
      start_date,
      end_date,
      event_type,
      location,
      is_all_day,
    } = body;

    // Validation
    if (!title || !start_date || !event_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Create event
    const { data: event, error } = await supabase
      .from("school_events")
      .insert({
        school_id: profile.school_id,
        title,
        description: description || null,
        start_date: new Date(start_date).toISOString(),
        end_date: end_date ? new Date(end_date).toISOString() : null,
        event_type,
        location: location || null,
        is_all_day: is_all_day ?? false,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating event:", error);
      return NextResponse.json(
        { error: "Failed to create event", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error in create event API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
