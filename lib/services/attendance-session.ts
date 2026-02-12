/**
 * ATTENDANCE SESSION SERVICE
 * 
 * Manages attendance marking sessions (one per class per day)
 * Features: Session creation, bulk marking, locking mechanism
 * Performance: Idempotent operations, indexed queries
 */

import { createClient } from '@/lib/supabase/server';

// =====================================================
// TYPES & INTERFACES
// =====================================================

export interface AttendanceSession {
  id: string;
  school_id: string;
  academic_year_id: string;
  class_id: string;
  section_id: string | null;
  session_date: string;
  session_type: 'daily' | 'half_day_morning' | 'half_day_afternoon' | 'event';
  marked_by: string | null;
  marked_at: string | null;
  is_locked: boolean;
  locked_at: string | null;
  locked_by: string | null;
  total_students: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  excused_count: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSessionData {
  school_id: string;
  academic_year_id: string;
  class_id: string;
  section_id?: string | null;
  session_date: string;
  session_type?: 'daily' | 'half_day_morning' | 'half_day_afternoon' | 'event';
  marked_by: string;
  notes?: string;
}

export interface SessionFilters {
  school_id: string;
  class_id?: string;
  section_id?: string;
  date_from?: string;
  date_to?: string;
  is_locked?: boolean;
  marked_by?: string;
}

export interface SessionStats {
  total_sessions: number;
  locked_sessions: number;
  unlocked_sessions: number;
  avg_attendance_percentage: number;
  total_students_marked: number;
}

// =====================================================
// SESSION CRUD OPERATIONS
// =====================================================

/**
 * Create or get existing attendance session (idempotent)
 * Returns existing session if already created for same class/date
 */
export async function createOrGetSession(data: CreateSessionData): Promise<AttendanceSession> {
  const supabase = await createClient();
  
  // Check if session already exists
  const { data: existing, error: checkError } = await supabase
    .from('attendance_sessions')
    .select('*')
    .eq('school_id', data.school_id)
    .eq('class_id', data.class_id)
    .eq('session_date', data.session_date)
    .eq('session_type', data.session_type || 'daily')
    .maybeSingle();
  
  if (checkError && checkError.code !== 'PGRST116') {
    throw new Error(`Failed to check existing session: ${checkError.message}`);
  }
  
  // Return existing session if found
  if (existing) {
    return existing as AttendanceSession;
  }
  
  // Create new session
  const { data: session, error } = await supabase
    .from('attendance_sessions')
    .insert({
      school_id: data.school_id,
      academic_year_id: data.academic_year_id,
      class_id: data.class_id,
      section_id: data.section_id || null,
      session_date: data.session_date,
      session_type: data.session_type || 'daily',
      marked_by: data.marked_by,
      marked_at: new Date().toISOString(),
      notes: data.notes || null,
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create session: ${error.message}`);
  }
  
  return session as AttendanceSession;
}

/**
 * Get session by ID
 */
export async function getSessionById(sessionId: string): Promise<AttendanceSession | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('attendance_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to get session: ${error.message}`);
  }
  
  return data as AttendanceSession;
}

/**
 * Get sessions with filters (paginated)
 */
export async function getSessions(
  filters: SessionFilters,
  limit: number = 50,
  offset: number = 0
): Promise<{ sessions: AttendanceSession[]; total: number }> {
  const supabase = await createClient();
  
  let query = supabase
    .from('attendance_sessions')
    .select('*', { count: 'exact' })
    .eq('school_id', filters.school_id);
  
  // Apply filters
  if (filters.class_id) {
    query = query.eq('class_id', filters.class_id);
  }
  
  if (filters.section_id !== undefined) {
    query = query.eq('section_id', filters.section_id);
  }
  
  if (filters.date_from) {
    query = query.gte('session_date', filters.date_from);
  }
  
  if (filters.date_to) {
    query = query.lte('session_date', filters.date_to);
  }
  
  if (filters.is_locked !== undefined) {
    query = query.eq('is_locked', filters.is_locked);
  }
  
  if (filters.marked_by) {
    query = query.eq('marked_by', filters.marked_by);
  }
  
  // Pagination and ordering
  query = query
    .order('session_date', { ascending: false })
    .range(offset, offset + limit - 1);
  
  const { data, error, count } = await query;
  
  if (error) {
    throw new Error(`Failed to get sessions: ${error.message}`);
  }
  
  return {
    sessions: (data as AttendanceSession[]) || [],
    total: count || 0,
  };
}

/**
 * Get session for specific class and date
 */
export async function getSessionByClassAndDate(
  schoolId: string,
  classId: string,
  sectionId: string | null,
  date: string,
  sessionType: string = 'daily'
): Promise<AttendanceSession | null> {
  const supabase = await createClient();
  
  let query = supabase
    .from('attendance_sessions')
    .select('*')
    .eq('school_id', schoolId)
    .eq('class_id', classId)
    .eq('session_date', date)
    .eq('session_type', sessionType);
  
  if (sectionId) {
    query = query.eq('section_id', sectionId);
  } else {
    query = query.is('section_id', null);
  }
  
  const { data, error } = await query.maybeSingle();
  
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get session: ${error.message}`);
  }
  
  return data as AttendanceSession | null;
}

/**
 * Update session notes
 */
export async function updateSessionNotes(
  sessionId: string,
  notes: string
): Promise<AttendanceSession> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('attendance_sessions')
    .update({ notes })
    .eq('id', sessionId)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to update session notes: ${error.message}`);
  }
  
  return data as AttendanceSession;
}

// =====================================================
// LOCKING MECHANISM
// =====================================================

/**
 * Lock attendance session (prevent further edits)
 * Used after deadline or end of day
 */
export async function lockSession(
  sessionId: string,
  lockedBy: string
): Promise<AttendanceSession> {
  const supabase = await createClient();
  
  // Check if already locked
  const session = await getSessionById(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }
  
  if (session.is_locked) {
    throw new Error('Session is already locked');
  }
  
  // Lock the session using RPC for atomicity
  const { error: rpcError } = await supabase.rpc('lock_attendance_session', {
    p_session_id: sessionId,
    p_locked_by: lockedBy,
  });
  
  if (rpcError) {
    throw new Error(`Failed to lock session: ${rpcError.message}`);
  }
  
  // Fetch updated session
  const updatedSession = await getSessionById(sessionId);
  if (!updatedSession) {
    throw new Error('Failed to fetch updated session');
  }
  
  return updatedSession;
}

/**
 * Unlock attendance session (admin only)
 * Allows corrections after locking
 */
export async function unlockSession(
  sessionId: string,
  unlockedBy: string
): Promise<AttendanceSession> {
  const supabase = await createClient();
  
  // Check if locked
  const session = await getSessionById(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }
  
  if (!session.is_locked) {
    throw new Error('Session is not locked');
  }
  
  // Unlock (admin privilege required - should be checked in API layer)
  const { data, error } = await supabase
    .from('attendance_sessions')
    .update({
      is_locked: false,
      locked_at: null,
      locked_by: null,
    })
    .eq('id', sessionId)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to unlock session: ${error.message}`);
  }
  
  return data as AttendanceSession;
}

/**
 * Auto-lock sessions past deadline (background job)
 * Locks all sessions where session_date < current_date and is_locked = false
 */
export async function autoLockPastSessions(
  schoolId: string,
  systemUserId: string
): Promise<number> {
  const supabase = await createClient();
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const cutoffDate = yesterday.toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('attendance_sessions')
    .update({
      is_locked: true,
      locked_at: new Date().toISOString(),
      locked_by: systemUserId,
    })
    .eq('school_id', schoolId)
    .lte('session_date', cutoffDate)
    .eq('is_locked', false)
    .select('id');
  
  if (error) {
    throw new Error(`Failed to auto-lock sessions: ${error.message}`);
  }
  
  return data?.length || 0;
}

// =====================================================
// STATISTICS & ANALYTICS
// =====================================================

/**
 * Get session statistics for a date range
 */
export async function getSessionStats(
  schoolId: string,
  dateFrom: string,
  dateTo: string
): Promise<SessionStats> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('attendance_sessions')
    .select('is_locked, total_students, present_count, late_count')
    .eq('school_id', schoolId)
    .gte('session_date', dateFrom)
    .lte('session_date', dateTo);
  
  if (error) {
    throw new Error(`Failed to get session stats: ${error.message}`);
  }
  
  const sessions = data || [];
  
  const total_sessions = sessions.length;
  const locked_sessions = sessions.filter(s => s.is_locked).length;
  const unlocked_sessions = total_sessions - locked_sessions;
  
  const total_students_marked = sessions.reduce((sum, s) => sum + (s.total_students || 0), 0);
  const total_present = sessions.reduce((sum, s) => sum + (s.present_count || 0) + (s.late_count || 0), 0);
  
  const avg_attendance_percentage = total_students_marked > 0
    ? Math.round((total_present / total_students_marked) * 10000) / 100
    : 0;
  
  return {
    total_sessions,
    locked_sessions,
    unlocked_sessions,
    avg_attendance_percentage,
    total_students_marked,
  };
}

/**
 * Get recent sessions for a class (for quick access)
 */
export async function getRecentSessionsForClass(
  schoolId: string,
  classId: string,
  sectionId: string | null,
  limit: number = 10
): Promise<AttendanceSession[]> {
  const supabase = await createClient();
  
  let query = supabase
    .from('attendance_sessions')
    .select('*')
    .eq('school_id', schoolId)
    .eq('class_id', classId);
  
  if (sectionId) {
    query = query.eq('section_id', sectionId);
  } else {
    query = query.is('section_id', null);
  }
  
  const { data, error } = await query
    .order('session_date', { ascending: false })
    .limit(limit);
  
  if (error) {
    throw new Error(`Failed to get recent sessions: ${error.message}`);
  }
  
  return (data as AttendanceSession[]) || [];
}

/**
 * Delete session (if no records marked)
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const supabase = await createClient();
  
  // Check if any records exist
  const { count, error: countError } = await supabase
    .from('attendance_records')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', sessionId);
  
  if (countError) {
    throw new Error(`Failed to check records: ${countError.message}`);
  }
  
  if (count && count > 0) {
    throw new Error('Cannot delete session with existing attendance records');
  }
  
  // Delete session
  const { error } = await supabase
    .from('attendance_sessions')
    .delete()
    .eq('id', sessionId);
  
  if (error) {
    throw new Error(`Failed to delete session: ${error.message}`);
  }
}
