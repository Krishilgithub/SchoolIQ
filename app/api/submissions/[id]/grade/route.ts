/**
 * SUBMISSION GRADE API
 * POST /api/submissions/[id]/grade - Create or update grade
 * GET /api/submissions/[id]/grade - Get grade and history
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createGrade,
  updateGrade,
  getGradeBySubmissionId,
  publishGrade,
  getGradeHistory,
} from '@/lib/services/assignment-grading';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'history') {
      const history = await getGradeHistory(id);
      return NextResponse.json(history);
    }
    
    const grade = await getGradeBySubmissionId(id);
    
    if (!grade) {
      return NextResponse.json(
        { error: 'Grade not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(grade);
  } catch (error: any) {
    console.error('Error fetching grade:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch grade' },
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
    
    const { action } = body;
    
    // Check if grade exists
    const existingGrade = await getGradeBySubmissionId(id);
    
    if (action === 'publish' && existingGrade) {
      const grade = await publishGrade(existingGrade.id, body.graded_by);
      return NextResponse.json(grade);
    }
    
    if (existingGrade) {
      // Update existing grade
      const grade = await updateGrade(existingGrade.id, {
        score: body.score,
        grade_letter: body.grade_letter,
        rubric_scores: body.rubric_scores,
        comments: body.comments,
        strengths: body.strengths,
        areas_for_improvement: body.areas_for_improvement,
        status: body.status,
        is_auto_saved: body.is_auto_saved,
        change_reason: body.change_reason,
      });
      return NextResponse.json(grade);
    }
    
    // Create new grade
    const required = ['school_id', 'assignment_id', 'student_id', 'score', 'total_marks', 'graded_by'];
    for (const field of required) {
      if (body[field] === undefined) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    const grade = await createGrade({
      ...body,
      submission_id: id,
    });
    
    return NextResponse.json(grade, { status: 201 });
  } catch (error: any) {
    console.error('Error creating/updating grade:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create/update grade' },
      { status: 500 }
    );
  }
}
