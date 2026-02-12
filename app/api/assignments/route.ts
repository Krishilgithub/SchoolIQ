/**
 * ASSIGNMENTS API
 * GET /api/assignments - List assignments with filters
 * POST /api/assignments - Create new assignment
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createAssignment,
  getAssignments,
  AssignmentFilters,
  getUpcomingAssignments,
  getOverdueAssignments,
  getDraftAssignments,
} from '@/lib/services/assignment-management';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const school_id = searchParams.get('school_id');
    if (!school_id) {
      return NextResponse.json(
        { error: 'school_id is required' },
        { status: 400 }
      );
    }
    
    const action = searchParams.get('action');
    
    // Handle special actions
    if (action === 'upcoming') {
      const assignments = await getUpcomingAssignments(
        school_id,
        searchParams.get('teacher_id') || undefined
      );
      return NextResponse.json(assignments);
    }
    
    if (action === 'overdue') {
      const assignments = await getOverdueAssignments(
        school_id,
        searchParams.get('teacher_id') || undefined
      );
      return NextResponse.json(assignments);
    }
    
    if (action === 'drafts') {
      const teacher_id = searchParams.get('teacher_id');
      if (!teacher_id) {
        return NextResponse.json(
          { error: 'teacher_id is required for drafts' },
          { status: 400 }
        );
      }
      
      const assignments = await getDraftAssignments(school_id, teacher_id);
      return NextResponse.json(assignments);
    }
    
    // Standard list with filters
    const filters: AssignmentFilters = {
      school_id,
      teacher_id: searchParams.get('teacher_id') || undefined,
      class_id: searchParams.get('class_id') || undefined,
      section_id: searchParams.get('section_id') || undefined,
      subject_id: searchParams.get('subject_id') || undefined,
      status: searchParams.get('status') || undefined,
      academic_year_id: searchParams.get('academic_year_id') || undefined,
      is_overdue: searchParams.get('is_overdue') === 'true' ? true : undefined,
      search: searchParams.get('search') || undefined,
    };
    
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const result = await getAssignments(filters, limit, offset);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const required = ['school_id', 'academic_year_id', 'class_id', 'subject_id', 'teacher_id', 'title', 'due_date', 'created_by'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    const assignment = await createAssignment(body);
    
    return NextResponse.json(assignment, { status: 201 });
  } catch (error: any) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create assignment' },
      { status: 500 }
    );
  }
}
