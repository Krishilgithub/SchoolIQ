import { NextRequest, NextResponse } from "next/server";
import { getCurrentSchoolId } from "@/lib/auth/get-current-school";
import { getCurrentUserId } from "@/lib/auth/get-current-user";
import {
  getLeaves,
  getPendingLeaves,
  reviewLeave,
  assignSubstitute,
  cancelLeave,
  getLeaveStats,
} from "@/lib/services/teacher-leave";

/**
 * GET /api/leaves
 * Get all leaves for admin view
 */
export async function GET(request: NextRequest) {
  try {
    const schoolId = await getCurrentSchoolId();
    if (!schoolId) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action");

    // Get pending leaves for approval queue
    if (action === "pending") {
      const pendingLeaves = await getPendingLeaves(schoolId);
      return NextResponse.json(pendingLeaves);
    }

    // Get leave statistics
    if (action === "stats") {
      const stats = await getLeaveStats(schoolId, {
        startDate: searchParams.get("startDate") || undefined,
        endDate: searchParams.get("endDate") || undefined,
        department: searchParams.get("department") || undefined,
      });
      return NextResponse.json(stats);
    }

    // Get all leaves with filters
    const filters = {
      teacherId: searchParams.get("teacherId") || undefined,
      status: (searchParams.get("status") as any) || undefined,
      leaveType: searchParams.get("leaveType") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      hasConflicts:
        searchParams.get("hasConflicts") === "true" ? true : undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 50,
    };

    const result = await getLeaves(schoolId, filters);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching leaves:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch leaves" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/leaves
 * Approve/reject leave or assign substitute
 */
export async function POST(request: NextRequest) {
  try {
    const schoolId = await getCurrentSchoolId();
    if (!schoolId) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { action, leaveId, ...data } = body;

    if (!action || !leaveId) {
      return NextResponse.json(
        { error: "Missing required fields: action and leaveId" },
        { status: 400 },
      );
    }

    let result;

    switch (action) {
      case "approve":
      case "reject":
        result = await reviewLeave(schoolId, {
          leaveId,
          reviewerId: userId,
          status: action === "approve" ? "approved" : "rejected",
          approvalNotes: data.notes,
          substituteTeacherId: data.substituteTeacherId,
          substituteNotes: data.substituteNotes,
        });
        break;

      case "assign_substitute":
        if (!data.substituteTeacherId) {
          return NextResponse.json(
            { error: "Substitute teacher ID required" },
            { status: 400 },
          );
        }
        result = await assignSubstitute(
          leaveId,
          schoolId,
          data.substituteTeacherId,
          userId,
          data.notes,
        );
        break;

      case "cancel":
        result = await cancelLeave(leaveId, schoolId);
        break;

      default:
        return NextResponse.json(
          { error: `Invalid action: ${action}` },
          { status: 400 },
        );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error processing leave action:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process leave action" },
      { status: 500 },
    );
  }
}
