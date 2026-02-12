import { NextRequest, NextResponse } from "next/server";
import { MarksService } from "@/lib/services/marks";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (action === "bulk") {
      await MarksService.bulkEnterMarks(data);
      return NextResponse.json({ success: true });
    } else if (action === "submit_moderation") {
      await MarksService.submitForModeration(
        data.examPaperId,
        data.submittedBy,
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process marks" },
      { status: 500 },
    );
  }
}
