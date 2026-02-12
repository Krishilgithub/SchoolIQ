import { NextRequest, NextResponse } from "next/server";
import { ResultService } from "@/lib/services/result";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, examId, studentId } = body;

    if (action === "calculate_exam") {
      await ResultService.calculateExamResults(examId);
      return NextResponse.json({ success: true });
    } else if (action === "calculate_student") {
      const result = await ResultService.calculateStudentResult(
        studentId,
        examId,
      );
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process results" },
      { status: 500 },
    );
  }
}
