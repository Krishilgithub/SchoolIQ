/**
 * SUBMISSION BY ID API
 * GET /api/submissions/[id] - Get specific submission
 * PUT /api/submissions/[id] - Update submission (auto-save)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getSubmissionById,
  updateSubmission,
  submitSubmission,
  getSubmissionFiles,
  checkLateSubmission,
} from '@/lib/services/assignment-submission';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'files') {
      const currentOnly = searchParams.get('current_only') !== 'false';
      const files = await getSubmissionFiles(id, currentOnly);
      return NextResponse.json(files);
    }
    
    if (action === 'check_late') {
      const lateInfo = await checkLateSubmission(id);
      return NextResponse.json(lateInfo);
    }
    
    const submission = await getSubmissionById(id);
    
    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(submission);
  } catch (error: any) {
    console.error('Error fetching submission:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch submission' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;
    
    if (action === 'submit') {
      const submission = await submitSubmission(id, true);
      return NextResponse.json(submission);
    }
    
    // Auto-save update
    const submission = await updateSubmission(id, body);
    return NextResponse.json(submission);
  } catch (error: any) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update submission' },
      { status: 500 }
    );
  }
}
