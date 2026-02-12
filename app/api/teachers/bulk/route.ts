import { NextRequest, NextResponse } from "next/server";
import { getCurrentSchoolId } from "@/lib/auth/get-current-school";
import {
  getTeacherStats,
  searchTeachers,
  bulkUpdateTeacherStatus,
  getAvailableTeachers,
} from "@/lib/services/teacher-management";
import { getSubstituteSuggestions } from "@/lib/services/teacher-leave";

/**
 * POST /api/teachers/bulk
 * Bulk operations: stats, search, status update, find substitutes
 */
export async function POST(request: NextRequest) {
  try {
    const schoolId = await getCurrentSchoolId();
    if (!schoolId) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const body = await request.json();
    const { action, ...data } = body;

    if (!action) {
      return NextResponse.json({ error: "Action required" }, { status: 400 });
    }

    let result;

    switch (action) {
      case "stats":
        result = await getTeacherStats(schoolId);
        break;

      case "search":
        if (!data.searchTerm) {
          return NextResponse.json(
            { error: "Search term required" },
            { status: 400 },
          );
        }
        result = await searchTeachers(schoolId, data.searchTerm);
        break;

      case "update_status":
        if (
          !data.teacherIds ||
          !Array.isArray(data.teacherIds) ||
          !data.status
        ) {
          return NextResponse.json(
            { error: "Teacher IDs array and status required" },
            { status: 400 },
          );
        }
        result = await bulkUpdateTeacherStatus(
          data.teacherIds,
          schoolId,
          data.status,
        );
        break;

      case "find_available":
        result = await getAvailableTeachers(schoolId, data.subjectId);
        break;

      case "find_substitutes":
        if (!data.leaveId) {
          return NextResponse.json(
            { error: "Leave ID required" },
            { status: 400 },
          );
        }
        result = await getSubstituteSuggestions(data.leaveId, schoolId);
        break;

      case "export_csv":
        // TODO: Implement CSV export functionality
        return NextResponse.json(
          { error: "CSV export not yet implemented" },
          { status: 501 },
        );

      default:
        return NextResponse.json(
          { error: `Invalid action: ${action}` },
          { status: 400 },
        );
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
