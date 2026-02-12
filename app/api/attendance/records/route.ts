import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  createOrUpdateRecord,
  getRecords,
  RecordFilters,
} from '@/lib/services/attendance-record';

/**
 * GET /api/attendance/records
 * Get attendance records with filters
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const schoolId = searchParams.get('school_id');
    const sessionId = searchParams.get('session_id') || undefined;
    const studentId = searchParams.get('student_id') || undefined;
    const classId = searchParams.get('class_id') || undefined;
    const status = searchParams.get('status') || undefined;
    const dateFrom = searchParams.get('date_from') || undefined;
    const dateTo = searchParams.get('date_to') || undefined;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    if (!schoolId) {
      return NextResponse.json({ error: 'school_id is required' }, { status: 400 });
    }
    
    const filters: RecordFilters = {
      school_id: schoolId,
      session_id: sessionId,
      student_id: studentId,
      class_id: classId,
      status: status,
      date_from: dateFrom,
      date_to: dateTo,
    };
    
    const result = await getRecords(filters, limit, offset);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/attendance/records
 * Create or update attendance record (idempotent)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    if (!body.school_id || !body.session_id || !body.student_id || !body.status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const record = await createOrUpdateRecord({
      school_id: body.school_id,
      session_id: body.session_id,
      student_id: body.student_id,
      status: body.status,
      arrival_time: body.arrival_time,
      minutes_late: body.minutes_late,
      is_excused: body.is_excused,
      excuse_reason: body.excuse_reason,
      excuse_document_url: body.excuse_document_url,
      marked_by: user.id,
      remarks: body.remarks,
    });
    
    return NextResponse.json(record, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
