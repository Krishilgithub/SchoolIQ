/**
 * ASSIGNMENT SUBMISSIONS API
 * GET /api/assignments/[id]/submissions - List submissions for assignment
 * POST /api/assignments/[id]/submissions - Submit assignment
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getSubmissions,
  createOrGetSubmission,
  submitSubmission,
  getSubmissionStats,
  getPendingSubmissions,
} from '@/lib/services/assignment-submission';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'stats') {
      const stats = await getSubmissionStats(id);
      return NextResponse.json(stats);
    }
    
    if (action === 'pending') {
      const submissions = await getPendingSubmissions(id);
      return NextResponse.json(submissions);
    }
    
    const school_id = searchParams.get('school_id');
    if (!school_id) {
      return NextResponse.json(
        { error: 'school_id is required' },
        { status: 400 }
      );
    }
    
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const result = await getSubmissions(
      {
        school_id,
        assignment_id: id,
        student_id: searchParams.get('student_id') || undefined,
        status: searchParams.get('status') || undefined,
        is_late: searchParams.get('is_late') === 'true' ? true : undefined,
        graded: searchParams.get('graded') === 'true' ? true : searchParams.get('graded') === 'false' ? false : undefined,
      },
      limit,
      offset
    );
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const { school_id, student_id } = body;
    
    if (!school_id || !student_id) {
      return NextResponse.json(
        { error: 'school_id and student_id are required' },
        { status: 400 }
      );
    }
    
    // Create or get existing submission
    const submission = await createOrGetSubmission({
      school_id,
      assignment_id: id,
      student_id,
      submission_text: body.submission_text,
      submission_link: body.submission_link,
      status: body.status,
    });
    
    // If final submit action
    if (body.action === 'submit') {
      const submitted = await submitSubmission(submission.id, true);
      return NextResponse.json(submitted);
    }
    
    return NextResponse.json(submission, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting assignment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit assignment' },
      { status: 500 }
    );
  }
}
