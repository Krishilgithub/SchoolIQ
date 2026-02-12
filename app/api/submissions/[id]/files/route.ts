/**
 * SUBMISSION FILES API
 * POST /api/submissions/[id]/files - Upload file
 * DELETE /api/submissions/[id]/files - Delete file
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  uploadSubmissionFile,
  deleteSubmissionFile,
} from '@/lib/services/assignment-submission';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const { file_name, file_url, uploaded_by } = body;
    
    if (!file_name || !file_url || !uploaded_by) {
      return NextResponse.json(
        { error: 'file_name, file_url, and uploaded_by are required' },
        { status: 400 }
      );
    }
    
    const file = await uploadSubmissionFile(id, {
      file_name,
      file_url,
      file_size_bytes: body.file_size_bytes,
      file_type: body.file_type,
      mime_type: body.mime_type,
      uploaded_by,
    });
    
    return NextResponse.json(file, { status: 201 });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const file_id = searchParams.get('file_id');
    
    if (!file_id) {
      return NextResponse.json(
        { error: 'file_id is required' },
        { status: 400 }
      );
    }
    
    await deleteSubmissionFile(file_id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete file' },
      { status: 500 }
    );
  }
}
