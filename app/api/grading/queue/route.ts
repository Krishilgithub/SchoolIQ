/**
 * GRADING QUEUE API
 * GET /api/grading/queue - Get pending submissions for teacher
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getGradingQueue,
  getGradingProgress,
  getTeacherGradingStats,
} from '@/lib/services/assignment-grading';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const teacher_id = searchParams.get('teacher_id');
    const school_id = searchParams.get('school_id');
    
    if (!teacher_id || !school_id) {
      return NextResponse.json(
        { error: 'teacher_id and school_id are required' },
        { status: 400 }
      );
    }
    
    const action = searchParams.get('action');
    
    if (action === 'stats') {
      const stats = await getTeacherGradingStats(
        teacher_id,
        school_id,
        searchParams.get('date_from') || undefined,
        searchParams.get('date_to') || undefined
      );
      return NextResponse.json(stats);
    }
    
    if (action === 'progress') {
      const assignment_id = searchParams.get('assignment_id');
      if (!assignment_id) {
        return NextResponse.json(
          { error: 'assignment_id is required for progress' },
          { status: 400 }
        );
      }
      
      const progress = await getGradingProgress(assignment_id);
      return NextResponse.json(progress);
    }
    
    const queue = await getGradingQueue(teacher_id, school_id);
    return NextResponse.json(queue);
  } catch (error: any) {
    console.error('Error fetching grading queue:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch grading queue' },
      { status: 500 }
    );
  }
}
