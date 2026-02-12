import { NextRequest, NextResponse } from "next/server";
import { TimetableService } from "@/lib/services/timetable";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolId = searchParams.get("schoolId");

    if (!schoolId) {
      return NextResponse.json(
        { error: "schoolId is required" },
        { status: 400 },
      );
    }

    const timetables = await TimetableService.getTimetables(schoolId);
    return NextResponse.json(timetables);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch timetables" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const timetable = await TimetableService.createTimetable(body);
    return NextResponse.json(timetable);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create timetable" },
      { status: 500 },
    );
  }
}
