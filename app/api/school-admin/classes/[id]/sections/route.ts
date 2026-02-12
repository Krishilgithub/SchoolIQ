import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const resolvedParams = await params;
    const classId = resolvedParams.id;

    // Fetch sections for the class
    const { data: sections, error } = await supabase
      .from("sections")
      .select("id, name, class_id")
      .eq("class_id", classId)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching sections:", error);
      return NextResponse.json(
        { error: "Failed to fetch sections" },
        { status: 500 },
      );
    }

    return NextResponse.json(sections || []);
  } catch (error) {
    console.error("Error in sections API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
