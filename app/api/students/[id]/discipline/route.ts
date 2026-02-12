import { NextRequest, NextResponse } from "next/server";
import { StudentRecordsService } from "@/lib/services/student-records";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/students/[id]/discipline
 * Get discipline records for a student
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
    const status = searchParams.get("status") || undefined;

    if (!schoolId) {
      return NextResponse.json(
        { error: "School ID is required" },
        { status: 400 },
      );
    }

    const records = await StudentRecordsService.getDisciplineRecords(
      studentId,
      schoolId,
      status,
    );

    return NextResponse.json(records);
  } catch (error: any) {
    console.error("Error fetching discipline records:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch discipline records" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/students/[id]/discipline
 * Create or update discipline record
 */
export async function POST(
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
    const body = await request.json();
    const { action, data } = body;

    let result;

    if (!action || action === "create") {
      // Create new discipline record
      data.studentId = studentId;
      data.reportedBy = user.id;
      data.createdBy = user.id;

      result = await StudentRecordsService.createDisciplineRecord(data);
    } else if (action === "update") {
      // Update discipline record
      result = await StudentRecordsService.updateDisciplineRecord(
        data.recordId,
        data.schoolId,
        data.updateData,
        user.id,
      );
    } else if (action === "resolve") {
      // Resolve discipline record
      result = await StudentRecordsService.resolveDisciplineRecord(
        data.recordId,
        data.schoolId,
        data.resolutionNotes,
        user.id,
      );
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error processing discipline record:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process discipline record" },
      { status: 500 },
    );
  }
}
