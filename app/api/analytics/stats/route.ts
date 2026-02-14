/**
 * ANALYTICS STATS API
 * GET /api/analytics/stats - Get class averages and statistics
 */

import { NextRequest, NextResponse } from "next/server";
import {
  calculateClassAverage,
  getStudentGradeReport,
} from "@/lib/services/assignment-grading";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const school_id = searchParams.get("school_id");
    const type = searchParams.get("type");

    if (!school_id || !type) {
      return NextResponse.json(
        { error: "school_id and type are required" },
        { status: 400 },
      );
    }

    if (type === "class_average") {
      const assignment_id = searchParams.get("assignment_id");

      if (!assignment_id) {
        return NextResponse.json(
          { error: "assignment_id is required" },
          { status: 400 },
        );
      }

      const stats = await calculateClassAverage(assignment_id);
      return NextResponse.json(stats);
    }

    if (type === "student_report") {
      const student_id = searchParams.get("student_id");
      const academic_year_id = searchParams.get("academic_year_id");

      if (!student_id) {
        return NextResponse.json(
          { error: "student_id is required" },
          { status: 400 },
        );
      }

      const report = await getStudentGradeReport(
        student_id,
        academic_year_id || undefined,
      );

      return NextResponse.json(report);
    }

    return NextResponse.json({ error: "Invalid stats type" }, { status: 400 });
  } catch (error: any) {
    console.error("Error fetching analytics stats:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch analytics stats" },
      { status: 500 },
    );
  }
}
