import { createClient } from "@/lib/supabase/server";
import { getCurrentSchoolId } from "@/lib/services/auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user and verify admin role
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const schoolId = await getCurrentSchoolId();
    if (!schoolId) {
      return NextResponse.json({ error: "No school found" }, { status: 400 });
    }

    const body = await request.json();
    const { settings } = body;

    // Update school settings with preferences
    const { data, error } = await supabase
      .from("schools")
      .update({
        settings,
        updated_at: new Date().toISOString(),
      })
      .eq("id", schoolId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
