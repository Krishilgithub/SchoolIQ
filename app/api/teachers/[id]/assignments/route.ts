import { NextRequest, NextResponse } from "next/server";
import { getCurrentSchoolId } from "@/lib/auth/get-current-school";
import {
  getTeacherAssignments,
  assignSubjectToTeacher,
  removeAssignment,
} from "@/lib/services/teacher-management";

/**
 * GET /api/teachers/[id]/assignments
 * Get teacher's subject/class assignments
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const schoolId = await getCurrentSchoolId();
    if (!schoolId) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;

    const filters = {
      academicYearId: searchParams.get("academicYearId") || undefined,
      isActive: searchParams.get("isActive") === "true",
      assignmentType: (searchParams.get("assignmentType") as any) || undefined,
    };

    const assignments = await getTeacherAssignments(
      id,
      schoolId,
      filters,
    );

    return NextResponse.json(assignments);
  } catch (error: any) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch assignments" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/teachers/[id]/assignments
 * Assign subject/class to teacher
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const schoolId = await getCurrentSchoolId();
    if (!schoolId) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const assignmentData = await request.json();

    if (!assignmentData.subjectId || !assignmentData.classId) {
      return NextResponse.json(
        { error: "Missing required assignment fields" },
        { status: 400 },
      );
    }

    const assignment = await assignSubjectToTeacher(
      id,
      schoolId,
      assignmentData,
    );

    return NextResponse.json(assignment, { status: 201 });
  } catch (error: any) {
    console.error("Error creating assignment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create assignment" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/teachers/[id]/assignments
 * Remove assignment
 */
export async function DELETE(request: NextRequest) {
  try {
    const schoolId = await getCurrentSchoolId();
    if (!schoolId) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const assignmentId = searchParams.get("assignmentId");

    if (!assignmentId) {
      return NextResponse.json(
        { error: "Assignment ID required" },
        { status: 400 },
      );
    }

    await removeAssignment(assignmentId, schoolId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error removing assignment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove assignment" },
      { status: 500 },
    );
  }
}
