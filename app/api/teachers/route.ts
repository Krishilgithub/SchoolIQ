import { NextRequest, NextResponse } from "next/server";
import { getCurrentSchoolId } from "@/lib/auth/get-current-school";
import {
  getTeachers,
  createTeacher,
  type TeacherFilters,
} from "@/lib/services/teacher-management";

/**
 * GET /api/teachers
 * List teachers with advanced filtering
 */
export async function GET(request: NextRequest) {
  try {
    const schoolId = await getCurrentSchoolId();
    if (!schoolId) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;

    const filters: TeacherFilters = {
      search: searchParams.get("search") || undefined,
      department: searchParams.get("department") || undefined,
      status: (searchParams.get("status") as any) || undefined,
      employmentType: (searchParams.get("employmentType") as any) || undefined,
      workloadStatus: (searchParams.get("workloadStatus") as any) || undefined,
      subjectId: searchParams.get("subjectId") || undefined,
      classId: searchParams.get("classId") || undefined,
      minExperience: searchParams.get("minExperience")
        ? parseInt(searchParams.get("minExperience")!)
        : undefined,
      maxExperience: searchParams.get("maxExperience")
        ? parseInt(searchParams.get("maxExperience")!)
        : undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 50,
      sortBy: (searchParams.get("sortBy") as any) || "created_at",
      sortOrder: (searchParams.get("sortOrder") as any) || "desc",
    };

    const result = await getTeachers(schoolId, filters);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch teachers" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/teachers
 * Create a new teacher
 */
export async function POST(request: NextRequest) {
  try {
    const schoolId = await getCurrentSchoolId();
    if (!schoolId) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const body = await request.json();
    const { teacher, assignments } = body;

    if (!teacher || !teacher.email || !teacher.firstName || !teacher.lastName) {
      return NextResponse.json(
        { error: "Missing required teacher fields" },
        { status: 400 },
      );
    }

    // Add schoolId to teacher data
    const teacherData = {
      ...teacher,
      school_id: schoolId,
    };

    const newTeacher = await createTeacher(teacherData, assignments);

    return NextResponse.json(newTeacher, { status: 201 });
  } catch (error: any) {
    console.error("Error creating teacher:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create teacher" },
      { status: 500 },
    );
  }
}
