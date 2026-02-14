/**
 * ATTENDANCE ANALYTICS SERVICE
 *
 * Provides attendance analytics, heatmaps, trends, and dashboard metrics
 * Features: Cached queries, heatmap generation, risk alerts
 * Performance: Uses summary cache tables and views
 */

import { createClient } from "@/lib/supabase/server";

// =====================================================
// TYPES & INTERFACES
// =====================================================

export interface DashboardStats {
  total_students: number;
  total_sessions: number;
  avg_attendance_percentage: number;
  at_risk_count: number;
  present_today: number;
  absent_today: number;
  late_today: number;
}

export interface MonthlyHeatmapData {
  date: string;
  attendance_percentage: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  total_students: number;
}

export interface ClassAverageData {
  class_id: string;
  class_name: string;
  section_name: string | null;
  avg_attendance_percentage: number;
  total_students: number;
  total_sessions: number;
}

export interface TrendData {
  period: string; // YYYY-MM-DD or YYYY-MM
  attendance_percentage: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  total_sessions: number;
}

export interface AbsenteeData {
  student_id: string;
  student_name: string;
  admission_number: string;
  class_name: string;
  section_name: string | null;
  contact_number: string | null;
  parent_email: string | null;
  consecutive_absences: number;
}

export interface RiskAlert {
  student_id: string;
  student_name: string;
  admission_number: string;
  class_name: string;
  attendance_percentage: number;
  absent_days: number;
  consecutive_absences: number;
  risk_level: "critical" | "high" | "medium";
}

// =====================================================
// DASHBOARD STATISTICS
// =====================================================

/**
 * Get dashboard statistics for school
 */
export async function getDashboardStats(
  schoolId: string,
  academicYearId: string,
  dateFrom?: string,
  dateTo?: string,
): Promise<DashboardStats> {
  const supabase = await createClient();

  const from =
    dateFrom ||
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0];
  const to = dateTo || new Date().toISOString().split("T")[0];

  // Get total students
  const { count: totalStudents } = await supabase
    .from("students")
    .select("id", { count: "exact", head: true })
    .eq("school_id", schoolId)
    .eq("is_deleted", false);

  // Get sessions in date range
  const { data: sessions, error: sessionsError } = await supabase
    .from("attendance_sessions")
    .select(
      "total_students, present_count, absent_count, late_count, session_date",
    )
    .eq("school_id", schoolId)
    .gte("session_date", from)
    .lte("session_date", to);

  if (sessionsError) {
    throw new Error(`Failed to get sessions: ${sessionsError.message}`);
  }

  const sessionsList = sessions || [];
  const total_sessions = sessionsList.length;

  // Calculate overall attendance
  const totalStudentsMarked = sessionsList.reduce(
    (sum, s) => sum + (s.total_students || 0),
    0,
  );
  const totalPresent = sessionsList.reduce(
    (sum, s) => sum + (s.present_count || 0) + (s.late_count || 0),
    0,
  );
  const avg_attendance_percentage =
    totalStudentsMarked > 0
      ? Math.round((totalPresent / totalStudentsMarked) * 10000) / 100
      : 0;

  // Today's stats
  const today = new Date().toISOString().split("T")[0];
  const todaySessions = sessionsList.filter((s) => s.session_date === today);
  const present_today = todaySessions.reduce(
    (sum, s) => sum + (s.present_count || 0),
    0,
  );
  const absent_today = todaySessions.reduce(
    (sum, s) => sum + (s.absent_count || 0),
    0,
  );
  const late_today = todaySessions.reduce(
    (sum, s) => sum + (s.late_count || 0),
    0,
  );

  // At-risk students (using view)
  const { count: atRiskCount } = await supabase
    .from("student_attendance_overview")
    .select("student_id", { count: "exact", head: true })
    .eq("at_risk", true);

  return {
    total_students: totalStudents || 0,
    total_sessions,
    avg_attendance_percentage,
    at_risk_count: atRiskCount || 0,
    present_today,
    absent_today,
    late_today,
  };
}

// =====================================================
// HEATMAP GENERATION
// =====================================================

/**
 * Get monthly heatmap data for calendar visualization
 */
export async function getMonthlyHeatmap(
  schoolId: string,
  year: number,
  month: number,
  classId?: string,
  sectionId?: string,
): Promise<MonthlyHeatmapData[]> {
  const supabase = await createClient();

  // Calculate date range for month
  const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
  const endDate = new Date(year, month, 0).toISOString().split("T")[0];

  let query = supabase
    .from("attendance_sessions")
    .select(
      "session_date, total_students, present_count, absent_count, late_count",
    )
    .eq("school_id", schoolId)
    .gte("session_date", startDate)
    .lte("session_date", endDate);

  if (classId) {
    query = query.eq("class_id", classId);
  }

  if (sectionId) {
    query = query.eq("section_id", sectionId);
  }

  const { data, error } = await query.order("session_date", {
    ascending: true,
  });

  if (error) {
    throw new Error(`Failed to get heatmap data: ${error.message}`);
  }

  // Group by date and calculate percentages
  const heatmapData: MonthlyHeatmapData[] = [];
  const sessionsByDate = new Map<string, typeof data>();

  (data || []).forEach((session) => {
    const date = session.session_date;
    if (!sessionsByDate.has(date)) {
      sessionsByDate.set(date, []);
    }
    sessionsByDate.get(date)!.push(session);
  });

  sessionsByDate.forEach((sessions, date) => {
    const total_students = sessions.reduce(
      (sum, s) => sum + (s.total_students || 0),
      0,
    );
    const present_count = sessions.reduce(
      (sum, s) => sum + (s.present_count || 0) + (s.late_count || 0),
      0,
    );
    const absent_count = sessions.reduce(
      (sum, s) => sum + (s.absent_count || 0),
      0,
    );
    const late_count = sessions.reduce(
      (sum, s) => sum + (s.late_count || 0),
      0,
    );

    const attendance_percentage =
      total_students > 0
        ? Math.round((present_count / total_students) * 10000) / 100
        : 0;

    heatmapData.push({
      date,
      attendance_percentage,
      present_count,
      absent_count,
      late_count,
      total_students,
    });
  });

  return heatmapData;
}

// =====================================================
// CLASS & SECTION ANALYTICS
// =====================================================

/**
 * Get attendance averages by class
 */
export async function getClassAverages(
  schoolId: string,
  dateFrom: string,
  dateTo: string,
): Promise<ClassAverageData[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("class_attendance_summary")
    .select(
      "class_id, class_name, section_name, attendance_percentage, total_students, session_date",
    )
    .eq("school_id", schoolId)
    .gte("session_date", dateFrom)
    .lte("session_date", dateTo);

  if (error) {
    throw new Error(`Failed to get class averages: ${error.message}`);
  }

  // Group by class and calculate averages
  const classMap = new Map<
    string,
    {
      class_id: string;
      class_name: string;
      section_name: string | null;
      percentages: number[];
      students: number[];
      sessions: number;
    }
  >();

  (data || []).forEach((row) => {
    const key = `${row.class_id}_${row.section_name || "null"}`;
    if (!classMap.has(key)) {
      classMap.set(key, {
        class_id: row.class_id,
        class_name: row.class_name,
        section_name: row.section_name,
        percentages: [],
        students: [],
        sessions: 0,
      });
    }

    const classData = classMap.get(key)!;
    classData.percentages.push(row.attendance_percentage || 0);
    classData.students.push(row.total_students || 0);
    classData.sessions++;
  });

  return Array.from(classMap.values()).map((item) => ({
    class_id: item.class_id,
    class_name: item.class_name,
    section_name: item.section_name,
    avg_attendance_percentage:
      item.percentages.length > 0
        ? Math.round(
            (item.percentages.reduce((a, b) => a + b, 0) /
              item.percentages.length) *
              100,
          ) / 100
        : 0,
    total_students: Math.max(...item.students, 0),
    total_sessions: item.sessions,
  }));
}

// =====================================================
// TREND ANALYSIS
// =====================================================

/**
 * Get attendance trends over time (daily or monthly)
 */
export async function getAttendanceTrends(
  schoolId: string,
  dateFrom: string,
  dateTo: string,
  groupBy: "day" | "week" | "month" = "day",
  classId?: string,
): Promise<TrendData[]> {
  const supabase = await createClient();

  let query = supabase
    .from("attendance_sessions")
    .select(
      "session_date, total_students, present_count, absent_count, late_count",
    )
    .eq("school_id", schoolId)
    .gte("session_date", dateFrom)
    .lte("session_date", dateTo);

  if (classId) {
    query = query.eq("class_id", classId);
  }

  const { data, error } = await query.order("session_date", {
    ascending: true,
  });

  if (error) {
    throw new Error(`Failed to get trend data: ${error.message}`);
  }

  // Group data by period
  const trendMap = new Map<
    string,
    {
      present: number;
      absent: number;
      late: number;
      total: number;
      sessions: number;
    }
  >();

  (data || []).forEach((session) => {
    let period: string;
    const date = new Date(session.session_date);

    if (groupBy === "day") {
      period = session.session_date;
    } else if (groupBy === "week") {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      period = weekStart.toISOString().split("T")[0];
    } else {
      period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }

    if (!trendMap.has(period)) {
      trendMap.set(period, {
        present: 0,
        absent: 0,
        late: 0,
        total: 0,
        sessions: 0,
      });
    }

    const trend = trendMap.get(period)!;
    trend.present += session.present_count || 0;
    trend.absent += session.absent_count || 0;
    trend.late += session.late_count || 0;
    trend.total += session.total_students || 0;
    trend.sessions++;
  });

  return Array.from(trendMap.entries()).map(([period, data]) => ({
    period,
    attendance_percentage:
      data.total > 0
        ? Math.round(((data.present + data.late) / data.total) * 10000) / 100
        : 0,
    present_count: data.present,
    absent_count: data.absent,
    late_count: data.late,
    total_sessions: data.sessions,
  }));
}

// =====================================================
// ABSENTEE TRACKING & ALERTS
// =====================================================

/**
 * Get today's absentee list with contact information
 */
export async function getTodayAbsenteeList(
  schoolId: string,
  date?: string,
): Promise<AbsenteeData[]> {
  const supabase = await createClient();

  const targetDate = date || new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("attendance_records")
    .select(
      `
      student_id,
      students!inner(
        admission_number,
        first_name,
        last_name,
        contact_number,
        parent_email,
        class_id,
        section_id,
        classes!inner(name),
        sections(name)
      ),
      attendance_sessions!inner(session_date)
    `,
    )
    .eq("school_id", schoolId)
    .eq("status", "absent")
    .eq("attendance_sessions.session_date", targetDate);

  if (error) {
    throw new Error(`Failed to get absentee list: ${error.message}`);
  }

  const absentees: AbsenteeData[] = [];

  for (const record of data || []) {
    const student = (record as any).students;

    // Get consecutive absences
    const { data: consecutiveData } = await supabase.rpc(
      "get_consecutive_absences",
      {
        p_student_id: record.student_id,
      },
    );

    absentees.push({
      student_id: record.student_id,
      student_name: `${student.first_name} ${student.last_name}`,
      admission_number: student.admission_number,
      class_name: student.classes?.name || "",
      section_name: student.sections?.name || null,
      contact_number: student.contact_number || null,
      parent_email: student.parent_email || null,
      consecutive_absences: consecutiveData || 0,
    });
  }

  return absentees;
}

/**
 * Get risk alerts (students with low attendance)
 */
export async function getRiskAlerts(
  schoolId: string,
  academicYearId: string,
  criticalThreshold: number = 80,
  highThreshold: number = 85,
  mediumThreshold: number = 90,
): Promise<RiskAlert[]> {
  const supabase = await createClient();

  // Use chronic absenteeism detection function
  const { data, error } = await supabase.rpc("detect_chronic_absenteeism");

  if (error) {
    throw new Error(`Failed to get risk alerts: ${error.message}`);
  }

  const alerts: RiskAlert[] = (data || []).map((row: any) => {
    let risk_level: "critical" | "high" | "medium" = "medium";

    if (row.attendance_percentage < criticalThreshold) {
      risk_level = "critical";
    } else if (row.attendance_percentage < highThreshold) {
      risk_level = "high";
    }

    return {
      student_id: row.student_id,
      student_name: row.student_name,
      admission_number: "", // Would need additional join
      class_name: "", // Would need additional join
      attendance_percentage: row.attendance_percentage,
      absent_days: row.absent_days,
      consecutive_absences: row.consecutive_absences,
      risk_level,
    };
  });

  return alerts.filter(
    (alert) => alert.attendance_percentage < mediumThreshold,
  );
}

// =====================================================
// REPORTS & EXPORTS
// =====================================================

/**
 * Generate attendance report for date range
 */
export async function generateAttendanceReport(
  schoolId: string,
  academicYearId: string,
  dateFrom?: string,
  dateTo?: string,
  classId?: string,
  sectionId?: string,
  studentId?: string,
): Promise<{
  summary: {
    total_days: number;
    total_students: number;
    avg_attendance_percentage: number;
    total_present: number;
    total_absent: number;
    total_late: number;
  };
  class_averages: ClassAverageData[];
  trends: TrendData[];
  risk_students: RiskAlert[];
}> {
  const supabase = await createClient();

  // Get sessions
  let query = supabase
    .from("attendance_sessions")
    .select(
      "session_date, total_students, present_count, absent_count, late_count",
    )
    .eq("school_id", schoolId)
    .eq("academic_year_id", academicYearId);

  if (dateFrom) {
    query = query.gte("session_date", dateFrom);
  }

  if (dateTo) {
    query = query.lte("session_date", dateTo);
  }

  if (classId) {
    query = query.eq("class_id", classId);
  }

  if (sectionId) {
    query = query.eq("section_id", sectionId);
  }

  const { data: sessions, error } = await query;

  if (error) {
    throw new Error(`Failed to generate report: ${error.message}`);
  }

  const sessionsList = sessions || [];

  // Set default date range if not provided
  const defaultFrom =
    dateFrom ||
    new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0];
  const defaultTo = dateTo || new Date().toISOString().split("T")[0];

  // Calculate summary
  const uniqueDates = new Set(sessionsList.map((s) => s.session_date)).size;
  const totalStudentsMarked = sessionsList.reduce(
    (sum, s) => sum + (s.total_students || 0),
    0,
  );
  const totalPresent = sessionsList.reduce(
    (sum, s) => sum + (s.present_count || 0),
    0,
  );
  const totalAbsent = sessionsList.reduce(
    (sum, s) => sum + (s.absent_count || 0),
    0,
  );
  const totalLate = sessionsList.reduce(
    (sum, s) => sum + (s.late_count || 0),
    0,
  );

  const avgAttendancePercentage =
    totalStudentsMarked > 0
      ? Math.round(((totalPresent + totalLate) / totalStudentsMarked) * 10000) /
        100
      : 0;

  // Get class averages
  const classAverages = await getClassAverages(
    schoolId,
    defaultFrom,
    defaultTo,
  );

  // Get trends
  const trends = await getAttendanceTrends(
    schoolId,
    defaultFrom,
    defaultTo,
    "day",
    classId,
  );

  // Get risk students
  const riskStudents = await getRiskAlerts(schoolId, "", 80, 85, 90);

  return {
    summary: {
      total_days: uniqueDates,
      total_students: totalStudentsMarked,
      avg_attendance_percentage: avgAttendancePercentage,
      total_present: totalPresent,
      total_absent: totalAbsent,
      total_late: totalLate,
    },
    class_averages: classAverages,
    trends,
    risk_students: riskStudents,
  };
}

/**
 * Get attendance report for parent view (simplified)
 */
export async function getParentAttendanceReport(
  studentId: string,
  dateFrom: string,
  dateTo: string,
): Promise<{
  student_info: any;
  summary: {
    total_days: number;
    present_days: number;
    absent_days: number;
    late_days: number;
    attendance_percentage: number;
  };
  recent_records: any[];
}> {
  const supabase = await createClient();

  // Get student info
  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("*, classes(name), sections(name)")
    .eq("id", studentId)
    .single();

  if (studentError) {
    throw new Error(`Failed to get student: ${studentError.message}`);
  }

  // Get attendance records
  const { data: records, error: recordsError } = await supabase
    .from("attendance_records")
    .select("*, attendance_sessions!inner(session_date, session_type)")
    .eq("student_id", studentId)
    .gte("attendance_sessions.session_date", dateFrom)
    .lte("attendance_sessions.session_date", dateTo)
    .order("attendance_sessions.session_date", { ascending: false });

  if (recordsError) {
    throw new Error(`Failed to get records: ${recordsError.message}`);
  }

  const recordsList = records || [];

  const total_days = recordsList.length;
  const present_days = recordsList.filter((r) => r.status === "present").length;
  const absent_days = recordsList.filter((r) => r.status === "absent").length;
  const late_days = recordsList.filter((r) => r.status === "late").length;

  const attendance_percentage =
    total_days > 0
      ? Math.round(((present_days + late_days) / total_days) * 10000) / 100
      : 0;

  return {
    student_info: student,
    summary: {
      total_days,
      present_days,
      absent_days,
      late_days,
      attendance_percentage,
    },
    recent_records: recordsList.slice(0, 30), // Last 30 days
  };
}
