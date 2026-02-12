import { NextRequest, NextResponse } from "next/server";
import { SubstitutionService } from "@/lib/services/substitution";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolId = searchParams.get("schoolId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");

    if (!schoolId) {
      return NextResponse.json(
        { error: "schoolId is required" },
        { status: 400 },
      );
    }

    const substitutions = await SubstitutionService.getSubstitutions(
      schoolId,
      startDate || undefined,
      endDate || undefined,
      status || undefined,
    );
    return NextResponse.json(substitutions);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch substitutions" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const substitution = await SubstitutionService.createSubstitution(body);
    return NextResponse.json(substitution);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create substitution" },
      { status: 500 },
    );
  }
}
