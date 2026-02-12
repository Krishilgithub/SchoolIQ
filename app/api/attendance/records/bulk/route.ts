import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  bulkCreateOrUpdateRecords,
  markAllPresent,
  markAllAbsent,
} from '@/lib/services/attendance-record';

/**
 * POST /api/attendance/records/bulk
 * Bulk mark attendance (all present/absent or custom)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const action = body.action; // 'mark_all_present', 'mark_all_absent', or 'bulk_update'
    
    if (!body.session_id || !body.student_ids || !Array.isArray(body.student_ids)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    
    let count: number;
    
    if (action === 'mark_all_present') {
      count = await markAllPresent(body.session_id, body.student_ids, user.id);
    } else if (action === 'mark_all_absent') {
      count = await markAllAbsent(body.session_id, body.student_ids, user.id);
    } else if (action === 'bulk_update' && body.status) {
      count = await bulkCreateOrUpdateRecords({
        session_id: body.session_id,
        student_ids: body.student_ids,
        status: body.status,
        marked_by: user.id,
        remarks: body.remarks,
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, count }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
