import { NextRequest, NextResponse } from "next/server";
import { StudentRecordsService } from "@/lib/services/student-records";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/students/[id]/history
 * Get history for a student
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentId = id;
    const searchParams = request.nextUrl.searchParams;
    const schoolId = searchParams.get("schoolId");
    const changeType = searchParams.get("changeType") || undefined;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : 50;

    if (!schoolId) {
      return NextResponse.json(
        { error: "School ID is required" },
        { status: 400 },
      );
    }

    const history = await StudentRecordsService.getStudentHistory(
      studentId,
      schoolId,
      changeType,
      limit,
    );

    return NextResponse.json(history);
  } catch (error: any) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch history" },
      { status: 500 },
    );
  }
}
