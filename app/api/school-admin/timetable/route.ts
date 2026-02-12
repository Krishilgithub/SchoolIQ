import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
      return NextResponse.json(
        { error: "School not found" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, academic_year_id, description, effective_from, effective_until, status, entries } = body;

    // Validation
    if (!name || !academic_year_id || !effective_from) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create timetable
    const { data: timetable, error: timetableError } = await supabase
      .from("timetables")
      .insert({
        school_id: profile.school_id,
        academic_year_id,
        name,
        description,
        status: status || "draft",
        effective_from,
        effective_until: effective_until || null,
        is_current: status === "published",
        created_by: user.id,
        published_at: status === "published" ? new Date().toISOString() : null,
        published_by: status === "published" ? user.id : null,
      })
      .select()
      .single();

    if (timetableError) {
      console.error("Error creating timetable:", timetableError);
      return NextResponse.json(
        { error: "Failed to create timetable" },
        { status: 500 }
      );
    }

    // If timetable is published, unset is_current for other timetables
    if (status === "published") {
      await supabase
        .from("timetables")
        .update({ is_current: false })
        .eq("school_id", profile.school_id)
        .neq("id", timetable.id);
    }

    // Create timetable entries if provided
    if (entries && Array.isArray(entries) && entries.length > 0) {
      const entriesData = entries.map((entry: any) => ({
        timetable_id: timetable.id,
        day_of_week: entry.day_of_week,
        period_id: entry.period_id,
        class_id: entry.class_id,
        section_id: entry.section_id || null,
        subject_id: entry.subject_id,
        teacher_id: entry.teacher_id,
        room_id: entry.room_id || null,
        notes: entry.notes || null,
      }));

      const { error: entriesError } = await supabase
        .from("timetable_entries")
        .insert(entriesData);

      if (entriesError) {
        console.error("Error creating timetable entries:", entriesError);
        // Rollback: delete the timetable
        await supabase.from("timetables").delete().eq("id", timetable.id);
        return NextResponse.json(
          { error: "Failed to create timetable entries" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: true, 
        timetable,
        message: status === "published" 
          ? "Timetable published successfully" 
          : "Timetable saved as draft"
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in timetable creation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
