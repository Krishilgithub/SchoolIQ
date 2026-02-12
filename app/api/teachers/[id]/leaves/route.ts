import { NextRequest, NextResponse } from "next/server";
import { getCurrentSchoolId } from "@/lib/auth/get-current-school";
import {
  getLeaves,
  requestLeave,
  getLeaveBalance,
} from "@/lib/services/teacher-leave";

/**
 * GET /api/teachers/[id]/leaves
 * Get teacher's leave history and balance
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
    const includeBalance = searchParams.get("includeBalance") === "true";

    const filters = {
      teacherId: id,
      status: (searchParams.get("status") as any) || undefined,
      leaveType: searchParams.get("leaveType") || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 20,
    };

    const leaves = await getLeaves(schoolId, filters);

    let balance = null;
    if (includeBalance) {
      balance = await getLeaveBalance(id, schoolId);
    }

    return NextResponse.json({
      ...leaves,
      balance,
    });
  } catch (error: any) {
    console.error("Error fetching leaves:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch leaves" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/teachers/[id]/leaves
 * Request leave for teacher
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

    const leaveData = await request.json();

    if (!leaveData.leaveType || !leaveData.startDate || !leaveData.endDate) {
      return NextResponse.json(
        { error: "Missing required leave fields" },
        { status: 400 },
      );
    }

    const requestData = {
      ...leaveData,
      teacherId: id,
    };

    const leave = await requestLeave(schoolId, requestData);

    return NextResponse.json(leave, { status: 201 });
  } catch (error: any) {
    console.error("Error requesting leave:", error);
    return NextResponse.json(
      { error: error.message || "Failed to request leave" },
      { status: 500 },
    );
  }
}
