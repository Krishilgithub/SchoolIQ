import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getTodayAbsenteeList,
  getRiskAlerts,
} from '@/lib/services/attendance-analytics';

/**
 * GET /api/attendance/alerts
 * Get attendance alerts (absentee list, risk students)
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
    const type = searchParams.get('type'); // 'absentees' or 'risk'
    
    if (!schoolId) {
      return NextResponse.json({ error: 'school_id is required' }, { status: 400 });
    }
    
    let result;
    
    if (type === 'absentees') {
      const date = searchParams.get('date') || undefined;
      result = await getTodayAbsenteeList(schoolId, date);
    } else if (type === 'risk') {
      const academicYearId = searchParams.get('academic_year_id') || '';
      const criticalThreshold = parseInt(searchParams.get('critical_threshold') || '80');
      const highThreshold = parseInt(searchParams.get('high_threshold') || '85');
      const mediumThreshold = parseInt(searchParams.get('medium_threshold') || '90');
      
      result = await getRiskAlerts(
        schoolId,
        academicYearId,
        criticalThreshold,
        highThreshold,
        mediumThreshold
      );
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
    
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
