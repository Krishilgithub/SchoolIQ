import { NextRequest, NextResponse } from "next/server";
import { ReportCardService } from "@/lib/services/report-card";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, examId, templateId, classId, reportCardId } = body;

    if (action === "bulk_generate") {
      await ReportCardService.bulkGenerateReportCards(
        examId,
        templateId,
        classId,
      );
      return NextResponse.json({ success: true });
    } else if (action === "track_download") {
      await ReportCardService.trackDownload(reportCardId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process report cards" },
      { status: 500 },
    );
  }
}
