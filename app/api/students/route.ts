import { NextRequest, NextResponse } from "next/server";
import { StudentManagementService } from "@/lib/services/student-management";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/students
 * Get all students with filters and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get school_id from query params
    const searchParams = request.nextUrl.searchParams;
    const schoolId = searchParams.get("schoolId");

    if (!schoolId) {
      return NextResponse.json(
        { error: "School ID is required" },
        { status: 400 },
      );
    }

    // Get filters from query params
    const filters = {
      searchQuery: searchParams.get("search") || undefined,
      classId: searchParams.get("classId") || undefined,
      sectionId: searchParams.get("sectionId") || undefined,
      status: searchParams.get("status") || undefined,
      gender: searchParams.get("gender") || undefined,
      admissionYear: searchParams.get("admissionYear")
        ? parseInt(searchParams.get("admissionYear")!)
        : undefined,
      transportRequired:
        searchParams.get("transportRequired") === "true"
          ? true
          : searchParams.get("transportRequired") === "false"
            ? false
            : undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      pageSize: searchParams.get("pageSize")
        ? parseInt(searchParams.get("pageSize")!)
        : 50,
    };

    const result = await StudentManagementService.getStudents(
      schoolId,
      filters,
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch students" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/students
 * Create a new student with profile and parent data
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { studentData, profileData, parentData } = body;

    if (!studentData || !studentData.school_id) {
      return NextResponse.json(
        { error: "Student data with school_id is required" },
        { status: 400 },
      );
    }

    // Add created_by
    studentData.created_by = user.id;
    if (parentData && Array.isArray(parentData)) {
      parentData.forEach((parent: any) => {
        parent.created_by = user.id;
      });
    }

    const student = await StudentManagementService.createStudent(
      studentData,
      parentData,
    );

    return NextResponse.json(student, { status: 201 });
  } catch (error: any) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create student" },
      { status: 500 },
    );
  }
}
