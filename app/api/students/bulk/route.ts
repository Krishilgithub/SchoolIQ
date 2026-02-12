import { NextRequest, NextResponse } from "next/server";
import { StudentManagementService } from "@/lib/services/student-management";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/students/bulk
 * Handle bulk operations: promote, export, import, delete
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
    const { action, data } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 },
      );
    }

    let result;

    switch (action) {
      case "promote":
        // Bulk promote students
        if (!data.studentIds || !Array.isArray(data.studentIds)) {
          return NextResponse.json(
            { error: "Student IDs array is required" },
            { status: 400 },
          );
        }

        result = await StudentManagementService.bulkPromote(
          data.studentIds,
          data.schoolId,
          data.targetClassId,
          data.targetSectionId || null,
          data.academicYearId,
          user.id,
        );
        break;

      case "export":
        // Export students to CSV
        const { schoolId, filters } = data;

        const exportResult = await StudentManagementService.getStudents(
          schoolId,
          {
            ...filters,
            pageSize: 10000, // Get all for export
          },
        );

        // Convert to CSV format
        const students = exportResult.students;
        const csv = convertToCSV(students);

        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="students_${new Date().toISOString()}.csv"`,
          },
        });

      case "stats":
        // Get student statistics
        result = await StudentManagementService.getStudentStats(data.schoolId);
        break;

      case "search":
        // Search students
        result = await StudentManagementService.searchStudents(
          data.schoolId,
          data.searchTerm,
        );
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error processing bulk operation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process bulk operation" },
      { status: 500 },
    );
  }
}

/**
 * Helper function to convert students to CSV
 */
function convertToCSV(students: any[]): string {
  if (students.length === 0) return "";

  // CSV Header
  const headers = [
    "Admission Number",
    "First Name",
    "Last Name",
    "Gender",
    "Date of Birth",
    "Class",
    "Section",
    "Roll Number",
    "Status",
    "Father Name",
    "Mother Name",
    "Contact Phone",
    "Enrollment Date",
  ];

  // CSV Rows
  const rows = students.map((student) => [
    student.admission_number,
    student.first_name,
    student.last_name,
    student.gender,
    student.date_of_birth,
    student.class_name || "",
    student.section_name || "",
    student.current_enrollment?.roll_number || "",
    student.status,
    student.student_profiles?.father_name || "",
    student.student_profiles?.mother_name || "",
    student.student_profiles?.father_phone ||
      student.student_profiles?.mother_phone ||
      "",
    student.enrollment_date,
  ]);

  // Combine header and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell || ""}"`).join(",")),
  ].join("\n");

  return csvContent;
}
