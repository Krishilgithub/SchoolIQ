import { NextRequest, NextResponse } from "next/server";
import { EnrollmentService } from "@/lib/services/enrollment";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/enrollments
 * Get all enrollments with filters
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

    const searchParams = request.nextUrl.searchParams;
    const schoolId = searchParams.get("schoolId");

    if (!schoolId) {
      return NextResponse.json(
        { error: "School ID is required" },
        { status: 400 },
      );
    }

    const academicYearId = searchParams.get("academicYearId") || undefined;
    const status = searchParams.get("status") || undefined;

    const enrollments = await EnrollmentService.getEnrollments(
      schoolId,
      academicYearId,
      status,
    );

    return NextResponse.json(enrollments);
  } catch (error: any) {
    console.error("Error fetching enrollments:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch enrollments" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/enrollments
 * Handle enrollment operations: admit, promote, transfer, withdraw
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
      case "admit":
        // Admit a new student
        data.createdBy = user.id;
        result = await EnrollmentService.admitStudent(data);
        break;

      case "promote":
        // Promote student to next class
        result = await EnrollmentService.promoteStudent(
          data.studentId,
          data.schoolId,
          data.targetClassId,
          data.targetSectionId,
          data.targetAcademicYearId,
          data.rollNumber,
          user.id,
        );
        break;

      case "transfer":
        // Transfer student within school
        data.transferredBy = user.id;
        result = await EnrollmentService.transferStudent(data);
        break;

      case "withdraw":
        // Withdraw a student
        await EnrollmentService.withdrawStudent(
          data.studentId,
          data.schoolId,
          data.withdrawalReason,
          data.transferToSchool || null,
          data.leavingCertificateNumber || null,
          user.id,
        );
        result = { success: true };
        break;

      case "history":
        // Get enrollment history for a student
        result = await EnrollmentService.getEnrollmentHistory(
          data.studentId,
          data.schoolId,
        );
        break;

      case "stats":
        // Get enrollment statistics
        result = await EnrollmentService.getEnrollmentStats(
          data.schoolId,
          data.academicYearId,
        );
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error processing enrollment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process enrollment" },
      { status: 500 },
    );
  }
}
