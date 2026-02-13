import { NextRequest, NextResponse } from "next/server";
import { StudentManagementService } from "@/lib/services/student-management";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/students/[id]
 * Get a single student by ID
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

    if (!schoolId) {
      return NextResponse.json(
        { error: "School ID is required" },
        { status: 400 },
      );
    }

    const student = await StudentManagementService.getStudentById(
      studentId,
      schoolId,
    );

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error: any) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch student" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/students/[id]
 * Update a student
 */
export async function PUT(
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
    const { schoolId, studentData, profileData } = body;

    if (!schoolId) {
      return NextResponse.json(
        { error: "School ID is required" },
        { status: 400 },
      );
    }

    // Add updated_by
    if (studentData) studentData.updated_by = user.id;

    const student = await StudentManagementService.updateStudent(
      studentId,
      schoolId,
      studentData,
    );

    return NextResponse.json(student);
  } catch (error: any) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update student" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/students/[id]
 * Soft delete a student
 */
export async function DELETE(
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

    if (!schoolId) {
      return NextResponse.json(
        { error: "School ID is required" },
        { status: 400 },
      );
    }

    await StudentManagementService.deleteStudent(studentId, schoolId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete student" },
      { status: 500 },
    );
  }
}
