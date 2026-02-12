/**
 * ATTENDANCE RECORD SERVICE
 * 
 * Manages individual student attendance records
 * Features: Idempotent saves, bulk operations, status tracking
 * Performance: Unique constraint prevents duplicates, indexed queries
 */

import { createClient } from '@/lib/supabase/server';

// =====================================================
// TYPES & INTERFACES
// =====================================================

export interface AttendanceRecord {
  id: string;
  school_id: string;
  session_id: string;
  student_id: string;
  status: 'present' | 'absent' | 'late' | 'excused' | 'half_day';
  arrival_time: string | null;
  minutes_late: number | null;
  is_excused: boolean;
  excuse_reason: string | null;
  excuse_document_url: string | null;
  marked_by: string | null;
  marked_at: string;
  previous_status: string | null;
  modified_by: string | null;
  modified_at: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateRecordData {
  school_id: string;
  session_id: string;
  student_id: string;
  status: 'present' | 'absent' | 'late' | 'excused' | 'half_day';
  arrival_time?: string;
  minutes_late?: number;
  is_excused?: boolean;
  excuse_reason?: string;
  excuse_document_url?: string;
  marked_by: string;
  remarks?: string;
}

export interface UpdateRecordData {
  status?: 'present' | 'absent' | 'late' | 'excused' | 'half_day';
  arrival_time?: string | null;
  minutes_late?: number | null;
  is_excused?: boolean;
  excuse_reason?: string | null;
  excuse_document_url?: string | null;
  remarks?: string | null;
  modified_by: string;
}

export interface BulkRecordData {
  session_id: string;
  student_ids: string[];
  status: 'present' | 'absent' | 'late' | 'excused';
  marked_by: string;
  remarks?: string;
}

export interface RecordFilters {
  school_id: string;
  session_id?: string;
  student_id?: string;
  class_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}

export interface StudentAttendanceSummary {
  student_id: string;
  student_name: string;
  admission_number: string;
  total_days: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  excused_days: number;
  attendance_percentage: number;
}

// =====================================================
// RECORD CRUD OPERATIONS
// =====================================================

/**
 * Create or update attendance record (idempotent)
 * Uses unique constraint (student_id, session_id) to prevent duplicates
 */
export async function createOrUpdateRecord(data: CreateRecordData): Promise<AttendanceRecord> {
  const supabase = await createClient();
  
  // Upsert record (creates if not exists, updates if exists)
  const { data: record, error } = await supabase
    .from('attendance_records')
    .upsert({
      school_id: data.school_id,
      session_id: data.session_id,
      student_id: data.student_id,
      status: data.status,
      arrival_time: data.arrival_time || null,
      minutes_late: data.minutes_late || null,
      is_excused: data.is_excused || false,
      excuse_reason: data.excuse_reason || null,
      excuse_document_url: data.excuse_document_url || null,
      marked_by: data.marked_by,
      marked_at: new Date().toISOString(),
      remarks: data.remarks || null,
    }, {
      onConflict: 'student_id,session_id',
      ignoreDuplicates: false,
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create/update record: ${error.message}`);
  }
  
  return record as AttendanceRecord;
}

/**
 * Get record by ID
 */
export async function getRecordById(recordId: string): Promise<AttendanceRecord | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('id', recordId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to get record: ${error.message}`);
  }
  
  return data as AttendanceRecord;
}

/**
 * Get records with filters (paginated)
 */
export async function getRecords(
  filters: RecordFilters,
  limit: number = 100,
  offset: number = 0
): Promise<{ records: AttendanceRecord[]; total: number }> {
  const supabase = await createClient();
  
  let query = supabase
    .from('attendance_records')
    .select('*, attendance_sessions!inner(session_date, class_id)', { count: 'exact' })
    .eq('school_id', filters.school_id);
  
  // Apply filters
  if (filters.session_id) {
    query = query.eq('session_id', filters.session_id);
  }
  
  if (filters.student_id) {
    query = query.eq('student_id', filters.student_id);
  }
  
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters.class_id) {
    query = query.eq('attendance_sessions.class_id', filters.class_id);
  }
  
  if (filters.date_from) {
    query = query.gte('attendance_sessions.session_date', filters.date_from);
  }
  
  if (filters.date_to) {
    query = query.lte('attendance_sessions.session_date', filters.date_to);
  }
  
  // Pagination and ordering
  query = query
    .order('marked_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  const { data, error, count } = await query;
  
  if (error) {
    throw new Error(`Failed to get records: ${error.message}`);
  }
  
  return {
    records: (data as AttendanceRecord[]) || [],
    total: count || 0,
  };
}

/**
 * Get all records for a session
 */
export async function getRecordsBySession(sessionId: string): Promise<AttendanceRecord[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });
  
  if (error) {
    throw new Error(`Failed to get session records: ${error.message}`);
  }
  
  return (data as AttendanceRecord[]) || [];
}

/**
 * Update attendance record
 */
export async function updateRecord(
  recordId: string,
  data: UpdateRecordData
): Promise<AttendanceRecord> {
  const supabase = await createClient();
  
  const updateData: any = {
    modified_by: data.modified_by,
    modified_at: new Date().toISOString(),
  };
  
  if (data.status !== undefined) updateData.status = data.status;
  if (data.arrival_time !== undefined) updateData.arrival_time = data.arrival_time;
  if (data.minutes_late !== undefined) updateData.minutes_late = data.minutes_late;
  if (data.is_excused !== undefined) updateData.is_excused = data.is_excused;
  if (data.excuse_reason !== undefined) updateData.excuse_reason = data.excuse_reason;
  if (data.excuse_document_url !== undefined) updateData.excuse_document_url = data.excuse_document_url;
  if (data.remarks !== undefined) updateData.remarks = data.remarks;
  
  const { data: record, error } = await supabase
    .from('attendance_records')
    .update(updateData)
    .eq('id', recordId)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to update record: ${error.message}`);
  }
  
  return record as AttendanceRecord;
}

// =====================================================
// BULK OPERATIONS (PERFORMANCE OPTIMIZED)
// =====================================================

/**
 * Bulk create/update records (mark all present/absent)
 * High-performance operation for daily attendance marking
 */
export async function bulkCreateOrUpdateRecords(data: BulkRecordData): Promise<number> {
  const supabase = await createClient();
  
  // Get school_id from session
  const { data: session, error: sessionError } = await supabase
    .from('attendance_sessions')
    .select('school_id')
    .eq('id', data.session_id)
    .single();
  
  if (sessionError || !session) {
    throw new Error('Session not found');
  }
  
  // Prepare bulk records
  const records = data.student_ids.map(student_id => ({
    school_id: session.school_id,
    session_id: data.session_id,
    student_id,
    status: data.status,
    marked_by: data.marked_by,
    marked_at: new Date().toISOString(),
    remarks: data.remarks || null,
    is_excused: data.status === 'excused',
  }));
  
  // Bulk upsert
  const { data: result, error } = await supabase
    .from('attendance_records')
    .upsert(records, {
      onConflict: 'student_id,session_id',
      ignoreDuplicates: false,
    });
  
  if (error) {
    throw new Error(`Failed to bulk create records: ${error.message}`);
  }
  
  return records.length;
}

/**
 * Mark all students as present (bulk operation)
 */
export async function markAllPresent(
  sessionId: string,
  studentIds: string[],
  markedBy: string
): Promise<number> {
  return bulkCreateOrUpdateRecords({
    session_id: sessionId,
    student_ids: studentIds,
    status: 'present',
    marked_by: markedBy,
  });
}

/**
 * Mark all students as absent (bulk operation)
 */
export async function markAllAbsent(
  sessionId: string,
  studentIds: string[],
  markedBy: string
): Promise<number> {
  return bulkCreateOrUpdateRecords({
    session_id: sessionId,
    student_ids: studentIds,
    status: 'absent',
    marked_by: markedBy,
  });
}

/**
 * Toggle attendance status (for UI toggles)
 */
export async function toggleAttendanceStatus(
  recordId: string,
  newStatus: 'present' | 'absent' | 'late',
  modifiedBy: string
): Promise<AttendanceRecord> {
  return updateRecord(recordId, {
    status: newStatus,
    modified_by: modifiedBy,
  });
}

// =====================================================
// STUDENT ATTENDANCE QUERIES
// =====================================================

/**
 * Get student attendance for date range
 */
export async function getStudentAttendance(
  studentId: string,
  dateFrom: string,
  dateTo: string
): Promise<AttendanceRecord[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*, attendance_sessions!inner(session_date, session_type, class_id)')
    .eq('student_id', studentId)
    .gte('attendance_sessions.session_date', dateFrom)
    .lte('attendance_sessions.session_date', dateTo)
    .order('attendance_sessions.session_date', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get student attendance: ${error.message}`);
  }
  
  return (data as any[]) || [];
}

/**
 * Get student attendance summary for date range
 */
export async function getStudentAttendanceSummary(
  studentId: string,
  dateFrom: string,
  dateTo: string
): Promise<StudentAttendanceSummary> {
  const supabase = await createClient();
  
  // Get student info
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('first_name, last_name, admission_number')
    .eq('id', studentId)
    .single();
  
  if (studentError || !student) {
    throw new Error('Student not found');
  }
  
  // Get attendance records
  const { data: records, error } = await supabase
    .from('attendance_records')
    .select('status, attendance_sessions!inner(session_date)')
    .eq('student_id', studentId)
    .gte('attendance_sessions.session_date', dateFrom)
    .lte('attendance_sessions.session_date', dateTo);
  
  if (error) {
    throw new Error(`Failed to get attendance summary: ${error.message}`);
  }
  
  const recordList = records || [];
  
  const total_days = recordList.length;
  const present_days = recordList.filter(r => r.status === 'present').length;
  const absent_days = recordList.filter(r => r.status === 'absent').length;
  const late_days = recordList.filter(r => r.status === 'late').length;
  const excused_days = recordList.filter(r => r.status === 'excused').length;
  
  const attendance_percentage = total_days > 0
    ? Math.round(((present_days + late_days) / total_days) * 10000) / 100
    : 0;
  
  return {
    student_id: studentId,
    student_name: `${student.first_name} ${student.last_name}`,
    admission_number: student.admission_number,
    total_days,
    present_days,
    absent_days,
    late_days,
    excused_days,
    attendance_percentage,
  };
}

/**
 * Get daily attendance for class (all students with their status)
 */
export async function getDailyAttendanceForClass(
  schoolId: string,
  classId: string,
  sectionId: string | null,
  date: string
): Promise<{
  session: any;
  students: Array<{
    student: any;
    record: AttendanceRecord | null;
  }>;
}> {
  const supabase = await createClient();
  
  // Get session
  let sessionQuery = supabase
    .from('attendance_sessions')
    .select('*')
    .eq('school_id', schoolId)
    .eq('class_id', classId)
    .eq('session_date', date);
  
  if (sectionId) {
    sessionQuery = sessionQuery.eq('section_id', sectionId);
  } else {
    sessionQuery = sessionQuery.is('section_id', null);
  }
  
  const { data: session, error: sessionError } = await sessionQuery.maybeSingle();
  
  if (sessionError && sessionError.code !== 'PGRST116') {
    throw new Error(`Failed to get session: ${sessionError.message}`);
  }
  
  // Get all students in class
  let studentsQuery = supabase
    .from('students')
    .select('*')
    .eq('school_id', schoolId)
    .eq('class_id', classId)
    .eq('is_deleted', false);
  
  if (sectionId) {
    studentsQuery = studentsQuery.eq('section_id', sectionId);
  }
  
  const { data: students, error: studentsError } = await studentsQuery
    .order('admission_number', { ascending: true });
  
  if (studentsError) {
    throw new Error(`Failed to get students: ${studentsError.message}`);
  }
  
  // Get attendance records if session exists
  let records: AttendanceRecord[] = [];
  if (session) {
    records = await getRecordsBySession(session.id);
  }
  
  // Map students with their records
  const studentsWithRecords = (students || []).map(student => {
    const record = records.find(r => r.student_id === student.id) || null;
    return { student, record };
  });
  
  return {
    session,
    students: studentsWithRecords,
  };
}

// =====================================================
// RISK DETECTION & ALERTS
// =====================================================

/**
 * Detect students at risk (low attendance)
 */
export async function detectRiskStudents(
  schoolId: string,
  academicYearId: string,
  thresholdPercentage: number = 90
): Promise<StudentAttendanceSummary[]> {
  const supabase = await createClient();
  
  // Use view for performance
  const { data, error } = await supabase
    .from('student_attendance_overview')
    .select('*')
    .eq('at_risk', true)
    .lte('current_month_percentage', thresholdPercentage);
  
  if (error) {
    throw new Error(`Failed to detect risk students: ${error.message}`);
  }
  
  return (data || []).map(row => ({
    student_id: row.student_id,
    student_name: `${row.first_name} ${row.last_name}`,
    admission_number: row.admission_number,
    total_days: row.current_month_present + row.current_month_absent + row.current_month_late,
    present_days: row.current_month_present,
    absent_days: row.current_month_absent,
    late_days: row.current_month_late,
    excused_days: 0,
    attendance_percentage: row.current_month_percentage,
  }));
}

/**
 * Get consecutive absences for student
 */
export async function getConsecutiveAbsences(studentId: string): Promise<number> {
  const supabase = await createClient();
  
  const { data, error } = await supabase.rpc('get_consecutive_absences', {
    p_student_id: studentId,
  });
  
  if (error) {
    throw new Error(`Failed to get consecutive absences: ${error.message}`);
  }
  
  return data || 0;
}

// =====================================================
// EXPORT & REPORTING
// =====================================================

/**
 * Export attendance records to CSV format
 */
export async function exportAttendanceToCSV(
  filters: RecordFilters
): Promise<string> {
  const { records } = await getRecords(filters, 10000, 0); // Max 10k records
  
  // CSV headers
  const headers = [
    'Date',
    'Student ID',
    'Student Name',
    'Class',
    'Status',
    'Marked By',
    'Marked At',
    'Remarks',
  ];
  
  // CSV rows
  const rows = records.map(record => [
    (record as any).attendance_sessions?.session_date || '',
    record.student_id,
    '', // Student name - would need join
    '', // Class name - would need join
    record.status,
    record.marked_by || '',
    record.marked_at,
    record.remarks || '',
  ]);
  
  // Combine headers and rows
  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');
  
  return csv;
}

/**
 * Delete record (soft delete not implemented, hard delete)
 */
export async function deleteRecord(recordId: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('attendance_records')
    .delete()
    .eq('id', recordId);
  
  if (error) {
    throw new Error(`Failed to delete record: ${error.message}`);
  }
}
