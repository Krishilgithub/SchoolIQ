import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getDashboardStats,
  getMonthlyHeatmap,
  getClassAverages,
  getAttendanceTrends,
} from '@/lib/services/attendance-analytics';

/**
 * GET /api/attendance/analytics
 * Get attendance analytics (dashboard stats, heatmap, trends, class averages)
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
    const academicYearId = searchParams.get('academic_year_id');
    const type = searchParams.get('type'); // 'dashboard', 'heatmap', 'trends', 'class_averages'
    
    if (!schoolId) {
      return NextResponse.json({ error: 'school_id is required' }, { status: 400 });
    }
    
    let result;
    
    if (type === 'dashboard') {
      const dateFrom = searchParams.get('date_from');
      const dateTo = searchParams.get('date_to');
      result = await getDashboardStats(
        schoolId,
        academicYearId || '',
        dateFrom || undefined,
        dateTo || undefined
      );
    } else if (type === 'heatmap') {
      const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
      const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());
      const classId = searchParams.get('class_id') || undefined;
      const sectionId = searchParams.get('section_id') || undefined;
      result = await getMonthlyHeatmap(schoolId, year, month, classId, sectionId);
    } else if (type === 'trends') {
      const dateFrom = searchParams.get('date_from');
      const dateTo = searchParams.get('date_to');
      const groupBy = searchParams.get('group_by') as 'day' | 'week' | 'month' || 'day';
      const classId = searchParams.get('class_id') || undefined;
      
      if (!dateFrom || !dateTo) {
        return NextResponse.json({ error: 'date_from and date_to required' }, { status: 400 });
      }
      
      result = await getAttendanceTrends(schoolId, dateFrom, dateTo, groupBy, classId);
    } else if (type === 'class_averages') {
      const dateFrom = searchParams.get('date_from');
      const dateTo = searchParams.get('date_to');
      
      if (!dateFrom || !dateTo) {
        return NextResponse.json({ error: 'date_from and date_to required' }, { status: 400 });
      }
      
      result = await getClassAverages(schoolId, dateFrom, dateTo);
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
    
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
