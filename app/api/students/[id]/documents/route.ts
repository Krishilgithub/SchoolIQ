import { NextRequest, NextResponse } from "next/server";
import { StudentRecordsService } from "@/lib/services/student-records";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/students/[id]/documents
 * Get all documents for a student
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentId = id;
    const searchParams = request.nextUrl.searchParams;
    const schoolId = searchParams.get("schoolId");
    const documentType = searchParams.get("documentType") || undefined;

    if (!schoolId) {
      return NextResponse.json(
        { error: "School ID is required" },
        { status: 400 },
      );
    }

    const documents = await StudentRecordsService.getStudentDocuments(
      studentId,
      schoolId,
      documentType,
    );

    return NextResponse.json(documents);
  } catch (error: any) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch documents" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/students/[id]/documents
 * Upload a document or verify existing document
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentId = id;
    const body = await request.json();
    const { action, data } = body;

    let result;

    if (!action || action === "upload") {
      // Upload new document
      data.studentId = studentId;
      data.createdBy = user.id;

      result = await StudentRecordsService.uploadDocument(data);
    } else if (action === "verify") {
      // Verify document
      result = await StudentRecordsService.verifyDocument(
        data.documentId,
        data.schoolId,
        user.id,
        data.verificationNotes,
      );
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error processing document:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process document" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/students/[id]/documents
 * Delete a document
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const documentId = searchParams.get("documentId");
    const schoolId = searchParams.get("schoolId");

    if (!documentId || !schoolId) {
      return NextResponse.json(
        { error: "Document ID and School ID are required" },
        { status: 400 },
      );
    }

    await StudentRecordsService.deleteDocument(documentId, schoolId, user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete document" },
      { status: 500 },
    );
  }
}
