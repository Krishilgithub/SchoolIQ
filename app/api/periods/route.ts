import { NextRequest, NextResponse } from "next/server";
import { PeriodService } from "@/lib/services/period";

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

    const periods = await PeriodService.getPeriods(schoolId);
    return NextResponse.json(periods);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch periods" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const period = await PeriodService.createPeriod(body);
    return NextResponse.json(period);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create period" },
      { status: 500 },
    );
  }
}
