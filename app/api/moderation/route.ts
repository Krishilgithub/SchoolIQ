import { NextRequest, NextResponse } from "next/server";
import { ModerationService } from "@/lib/services/moderation";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolId = searchParams.get("schoolId");
    const status = searchParams.get("status");

    if (!schoolId) {
      return NextResponse.json(
        { error: "schoolId is required" },
        { status: 400 },
      );
    }

    const requests = await ModerationService.getModerationRequests(
      schoolId,
      status || undefined,
    );
    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch moderation requests" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, requestId, remarks, moderatorId } = body;

    if (action === "approve") {
      await ModerationService.approveMarks(requestId, remarks);
      return NextResponse.json({ success: true });
    } else if (action === "reject") {
      await ModerationService.rejectMarks(requestId, moderatorId, remarks);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process moderation" },
      { status: 500 },
    );
  }
}
