import { NextRequest, NextResponse } from "next/server";
import { ExamService } from "@/lib/services/exam";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolId = searchParams.get("schoolId");
    const academicYearId = searchParams.get("academicYearId");

    if (!schoolId) {
      return NextResponse.json(
        { error: "schoolId is required" },
        { status: 400 },
      );
    }

    const exams = await ExamService.getExams(
      schoolId,
      academicYearId || undefined,
    );
    return NextResponse.json(exams);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch exams" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const exam = await ExamService.createExam(body);
    return NextResponse.json(exam);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create exam" },
      { status: 500 },
    );
  }
}
