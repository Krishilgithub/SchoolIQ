import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  createOrGetSession,
  getSessions,
  SessionFilters,
} from '@/lib/services/attendance-session';

/**
 * GET /api/attendance/sessions
 * Get attendance sessions with filters (paginated)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const schoolId = searchParams.get('school_id');
    const classId = searchParams.get('class_id') || undefined;
    const sectionId = searchParams.get('section_id') || undefined;
    const dateFrom = searchParams.get('date_from') || undefined;
    const dateTo = searchParams.get('date_to') || undefined;
    const isLocked = searchParams.get('is_locked');
    const markedBy = searchParams.get('marked_by') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    if (!schoolId) {
      return NextResponse.json({ error: 'school_id is required' }, { status: 400 });
    }
    
    const filters: SessionFilters = {
      school_id: schoolId,
      class_id: classId,
      section_id: sectionId,
      date_from: dateFrom,
      date_to: dateTo,
      is_locked: isLocked ? isLocked === 'true' : undefined,
      marked_by: markedBy,
    };
    
    const result = await getSessions(filters, limit, offset);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get sessions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/attendance/sessions
 * Create new attendance session
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.school_id || !body.academic_year_id || !body.class_id || !body.session_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const session = await createOrGetSession({
      school_id: body.school_id,
      academic_year_id: body.academic_year_id,
      class_id: body.class_id,
      section_id: body.section_id,
      session_date: body.session_date,
      session_type: body.session_type,
      marked_by: user.id,
      notes: body.notes,
    });
    
    return NextResponse.json(session, { status: 201 });
  } catch (error: any) {
    console.error('Create session error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create session' },
      { status: 500 }
    );
  }
}
