import { NextRequest, NextResponse } from "next/server";
import { getCurrentSchoolId } from "@/lib/auth/get-current-school";
import {
  getTeacherById,
  updateTeacher,
  deleteTeacher,
} from "@/lib/services/teacher-management";

/**
 * GET /api/teachers/[id]
 * Get detailed teacher profile with 360° view
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

    const teacher = await getTeacherById(id, schoolId);

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    return NextResponse.json(teacher);
  } catch (error: any) {
    console.error("Error fetching teacher:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch teacher" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/teachers/[id]
 * Update teacher profile
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const schoolId = await getCurrentSchoolId();
    if (!schoolId) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const updates = await request.json();

    const updatedTeacher = await updateTeacher(id, schoolId, updates);

    return NextResponse.json(updatedTeacher);
  } catch (error: any) {
    console.error("Error updating teacher:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update teacher" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/teachers/[id]
 * Soft delete teacher
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const schoolId = await getCurrentSchoolId();
    if (!schoolId) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    await deleteTeacher(id, schoolId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting teacher:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete teacher" },
      { status: 500 },
    );
  }
}
