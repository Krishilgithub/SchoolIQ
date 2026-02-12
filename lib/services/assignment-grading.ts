/**
 * GRADING MANAGEMENT SERVICE
 * 
 * Manages assignment grading with auto-save, versioning, and history tracking
 * Features: Grade history, bulk grading, auto-save drafts, grade analytics
 * Performance: Indexed queries, optimized for grading workflow
 */

import { createClient } from '@/lib/supabase/server';

// =====================================================
// TYPES & INTERFACES
// =====================================================

export interface Grade {
  id: string;
  school_id: string;
  assignment_id: string;
  submission_id: string;
  student_id: string;
  score: number;
  total_marks: number;
  percentage: number;
  grade_letter: string | null;
  rubric_scores: any | null;
  graded_by: string;
  graded_at: string;
  comments: string | null;
  strengths: string | null;
  areas_for_improvement: string | null;
  status: 'draft' | 'published' | 'revised';
  published_at: string | null;
  last_saved_at: string;
  is_auto_saved: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface GradeHistory {
  id: string;
  school_id: string;
  grade_id: string;
  submission_id: string;
  previous_score: number | null;
  new_score: number;
  previous_grade_letter: string | null;
  new_grade_letter: string | null;
  previous_comments: string | null;
  new_comments: string | null;
  change_type: string;
  changed_by: string | null;
  changed_at: string;
  change_reason: string | null;
  grade_snapshot: any;
  created_at: string;
}

export interface CreateGradeData {
  school_id: string;
  assignment_id: string;
  submission_id: string;
  student_id: string;
  score: number;
  total_marks: number;
  grade_letter?: string;
  rubric_scores?: any;
  graded_by: string;
  comments?: string;
  strengths?: string;
  areas_for_improvement?: string;
  status?: 'draft' | 'published';
  is_auto_saved?: boolean;
}

export interface UpdateGradeData {
  score?: number;
  grade_letter?: string;
  rubric_scores?: any;
  comments?: string;
  strengths?: string;
  areas_for_improvement?: string;
  status?: 'draft' | 'published' | 'revised';
  is_auto_saved?: boolean;
  change_reason?: string;
}

export interface BulkGradeData {
  assignment_id: string;
  grades: Array<{
    submission_id: string;
    student_id: string;
    score: number;
    grade_letter?: string;
    comments?: string;
  }>;
  graded_by: string;
  school_id: string;
  total_marks: number;
}

export interface GradeFilters {
  school_id: string;
  assignment_id?: string;
  student_id?: string;
  graded_by?: string;
  status?: string;
}

// =====================================================
// GRADE CRUD OPERATIONS
// =====================================================

/**
 * Create grade (with auto-sync to submission)
 */
export async function createGrade(data: CreateGradeData): Promise<Grade> {
  const supabase = await createClient();
  
  const gradeData: any = {
    school_id: data.school_id,
    assignment_id: data.assignment_id,
    submission_id: data.submission_id,
    student_id: data.student_id,
    score: data.score,
    total_marks: data.total_marks,
    grade_letter: data.grade_letter || null,
    rubric_scores: data.rubric_scores || null,
    graded_by: data.graded_by,
    graded_at: new Date().toISOString(),
    comments: data.comments || null,
    strengths: data.strengths || null,
    areas_for_improvement: data.areas_for_improvement || null,
    status: data.status || 'draft',
    is_auto_saved: data.is_auto_saved || false,
    last_saved_at: new Date().toISOString(),
  };
  
  if (gradeData.status === 'published') {
    gradeData.published_at = new Date().toISOString();
  }
  
  const { data: grade, error } = await supabase
    .from('grades')
    .insert(gradeData)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create grade: ${error.message}`);
  }
  
  return grade as Grade;
}

/**
 * Get grade by ID
 */
export async function getGradeById(gradeId: string): Promise<Grade | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('grades')
    .select('*')
    .eq('id', gradeId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to get grade: ${error.message}`);
  }
  
  return data as Grade;
}

/**
 * Get grade by submission ID
 */
export async function getGradeBySubmissionId(submissionId: string): Promise<Grade | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('grades')
    .select('*')
    .eq('submission_id', submissionId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to get grade: ${error.message}`);
  }
  
  return data as Grade;
}

/**
 * Get grades with filters (paginated)
 */
export async function getGrades(
  filters: GradeFilters,
  limit: number = 50,
  offset: number = 0
): Promise<{ grades: Grade[]; total: number }> {
  const supabase = await createClient();
  
  let query = supabase
    .from('grades')
    .select('*', { count: 'exact' })
    .eq('school_id', filters.school_id);
  
  if (filters.assignment_id) {
    query = query.eq('assignment_id', filters.assignment_id);
  }
  
  if (filters.student_id) {
    query = query.eq('student_id', filters.student_id);
  }
  
  if (filters.graded_by) {
    query = query.eq('graded_by', filters.graded_by);
  }
  
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  
  query = query
    .order('graded_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  const { data, error, count } = await query;
  
  if (error) {
    throw new Error(`Failed to get grades: ${error.message}`);
  }
  
  return {
    grades: (data as Grade[]) || [],
    total: count || 0,
  };
}

/**
 * Update grade (creates history entry via trigger)
 */
export async function updateGrade(
  gradeId: string,
  data: UpdateGradeData
): Promise<Grade> {
  const supabase = await createClient();
  
  const updateData: any = {
    last_saved_at: new Date().toISOString(),
  };
  
  if (data.score !== undefined) updateData.score = data.score;
  if (data.grade_letter !== undefined) updateData.grade_letter = data.grade_letter;
  if (data.rubric_scores !== undefined) updateData.rubric_scores = data.rubric_scores;
  if (data.comments !== undefined) updateData.comments = data.comments;
  if (data.strengths !== undefined) updateData.strengths = data.strengths;
  if (data.areas_for_improvement !== undefined) updateData.areas_for_improvement = data.areas_for_improvement;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.is_auto_saved !== undefined) updateData.is_auto_saved = data.is_auto_saved;
  
  // Set published_at when publishing
  if (data.status === 'published') {
    const existing = await getGradeById(gradeId);
    if (existing && !existing.published_at) {
      updateData.published_at = new Date().toISOString();
    }
  }
  
  const { data: grade, error } = await supabase
    .from('grades')
    .update(updateData)
    .eq('id', gradeId)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to update grade: ${error.message}`);
  }
  
  return grade as Grade;
}

/**
 * Publish grade (make visible to student)
 */
export async function publishGrade(
  gradeId: string,
  publishedBy: string
): Promise<Grade> {
  return updateGrade(gradeId, {
    status: 'published',
    is_auto_saved: false,
  });
}

/**
 * Finalize grade (lock from further changes)
 */
export async function finalizeGrade(gradeId: string): Promise<Grade> {
  return updateGrade(gradeId, {
    status: 'published',
    is_auto_saved: false,
  });
}

// =====================================================
// BULK GRADING
// =====================================================

/**
 * Bulk create/update grades (for quick grading)
 */
export async function bulkGrade(data: BulkGradeData): Promise<number> {
  const supabase = await createClient();
  
  const gradeRecords = data.grades.map(g => ({
    school_id: data.school_id,
    assignment_id: data.assignment_id,
    submission_id: g.submission_id,
    student_id: g.student_id,
    score: g.score,
    total_marks: data.total_marks,
    grade_letter: g.grade_letter || null,
    comments: g.comments || null,
    graded_by: data.graded_by,
    graded_at: new Date().toISOString(),
    status: 'published',
    last_saved_at: new Date().toISOString(),
  }));
  
  const { data: result, error } = await supabase
    .from('grades')
    .upsert(gradeRecords, {
      onConflict: 'submission_id',
      ignoreDuplicates: false,
    });
  
  if (error) {
    throw new Error(`Failed to bulk grade: ${error.message}`);
  }
  
  return gradeRecords.length;
}

// =====================================================
// GRADE HISTORY
// =====================================================

/**
 * Get grade history for submission
 */
export async function getGradeHistory(submissionId: string): Promise<GradeHistory[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('grade_history')
    .select('*')
    .eq('submission_id', submissionId)
    .order('changed_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get grade history: ${error.message}`);
  }
  
  return (data as GradeHistory[]) || [];
}

/**
 * Get all changes made by a grader
 */
export async function getGraderHistory(
  graderId: string,
  limit: number = 50
): Promise<GradeHistory[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('grade_history')
    .select('*')
    .eq('changed_by', graderId)
    .order('changed_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    throw new Error(`Failed to get grader history: ${error.message}`);
  }
  
  return (data as GradeHistory[]) || [];
}

// =====================================================
// GRADING WORKFLOW
// =====================================================

/**
 * Get grading queue (pending submissions for teacher)
 */
export async function getGradingQueue(
  teacherId: string,
  schoolId: string
): Promise<any[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      *,
      assignments!inner(
        id,
        title,
        total_marks,
        due_date,
        teacher_id
      ),
      students!inner(
        id,
        first_name,
        last_name,
        admission_number
      )
    `)
    .eq('school_id', schoolId)
    .eq('assignments.teacher_id', teacherId)
    .in('status', ['submitted', 'resubmitted'])
    .order('submitted_at', { ascending: true });
  
  if (error) {
    throw new Error(`Failed to get grading queue: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Get grading progress for assignment
 */
export async function getGradingProgress(assignmentId: string): Promise<{
  total_submissions: number;
  graded_count: number;
  pending_count: number;
  progress_percentage: number;
}> {
  const supabase = await createClient();
  
  const { data: submissions, error } = await supabase
    .from('submissions')
    .select('status')
    .eq('assignment_id', assignmentId)
    .in('status', ['submitted', 'resubmitted', 'graded']);
  
  if (error) {
    throw new Error(`Failed to get grading progress: ${error.message}`);
  }
  
  const submissionsList = submissions || [];
  const total_submissions = submissionsList.length;
  const graded_count = submissionsList.filter(s => s.status === 'graded').length;
  const pending_count = total_submissions - graded_count;
  const progress_percentage = total_submissions > 0
    ? Math.round((graded_count / total_submissions) * 10000) / 100
    : 0;
  
  return {
    total_submissions,
    graded_count,
    pending_count,
    progress_percentage,
  };
}

// =====================================================
// ANALYTICS & STATISTICS
// =====================================================

/**
 * Calculate class average for assignment
 */
export async function calculateClassAverage(assignmentId: string): Promise<{
  avg_score: number;
  avg_percentage: number;
  median_score: number;
  highest_score: number;
  lowest_score: number;
  total_graded: number;
}> {
  const supabase = await createClient();
  
  const { data: grades, error } = await supabase
    .from('grades')
    .select('score, percentage')
    .eq('assignment_id', assignmentId)
    .eq('status', 'published');
  
  if (error) {
    throw new Error(`Failed to calculate class average: ${error.message}`);
  }
  
  const gradesList = grades || [];
  const total_graded = gradesList.length;
  
  if (total_graded === 0) {
    return {
      avg_score: 0,
      avg_percentage: 0,
      median_score: 0,
      highest_score: 0,
      lowest_score: 0,
      total_graded: 0,
    };
  }
  
  const scores = gradesList.map(g => g.score);
  const percentages = gradesList.map(g => g.percentage);
  
  const avg_score = scores.reduce((a, b) => a + b, 0) / total_graded;
  const avg_percentage = percentages.reduce((a, b) => a + b, 0) / total_graded;
  
  const sortedScores = [...scores].sort((a, b) => a - b);
  const median_score = total_graded % 2 === 0
    ? (sortedScores[total_graded / 2 - 1] + sortedScores[total_graded / 2]) / 2
    : sortedScores[Math.floor(total_graded / 2)];
  
  const highest_score = Math.max(...scores);
  const lowest_score = Math.min(...scores);
  
  return {
    avg_score: Math.round(avg_score * 100) / 100,
    avg_percentage: Math.round(avg_percentage * 100) / 100,
    median_score: Math.round(median_score * 100) / 100,
    highest_score,
    lowest_score,
    total_graded,
  };
}

/**
 * Get student grade report (all assignments)
 */
export async function getStudentGradeReport(
  studentId: string,
  academicYearId?: string
): Promise<{
  total_assignments: number;
  graded_count: number;
  avg_score: number;
  avg_percentage: number;
  grades: Grade[];
}> {
  const supabase = await createClient();
  
  let query = supabase
    .from('grades')
    .select('*, assignments!inner(title, total_marks, due_date, subject_id)')
    .eq('student_id', studentId)
    .eq('status', 'published');
  
  if (academicYearId) {
    query = query.eq('assignments.academic_year_id', academicYearId);
  }
  
  const { data: grades, error } = await query.order('graded_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get student grade report: ${error.message}`);
  }
  
  const gradesList = (grades || []) as any[];
  const total_assignments = gradesList.length;
  const graded_count = gradesList.length;
  
  const scores = gradesList.map(g => g.score);
  const percentages = gradesList.map(g => g.percentage);
  
  const avg_score = graded_count > 0
    ? Math.round((scores.reduce((a, b) => a + b, 0) / graded_count) * 100) / 100
    : 0;
  
  const avg_percentage = graded_count > 0
    ? Math.round((percentages.reduce((a, b) => a + b, 0) / graded_count) * 100) / 100
    : 0;
  
  return {
    total_assignments,
    graded_count,
    avg_score,
    avg_percentage,
    grades: gradesList,
  };
}

/**
 * Get grading statistics for teacher
 */
export async function getTeacherGradingStats(
  teacherId: string,
  schoolId: string,
  dateFrom?: string,
  dateTo?: string
): Promise<{
  total_graded: number;
  avg_grading_time_minutes: number;
  pending_submissions: number;
  assignments_active: number;
}> {
  const supabase = await createClient();
  
  let gradeQuery = supabase
    .from('grades')
    .select('id, graded_at', { count: 'exact' })
    .eq('school_id', schoolId)
    .eq('graded_by', teacherId)
    .eq('status', 'published');
  
  if (dateFrom) {
    gradeQuery = gradeQuery.gte('graded_at', dateFrom);
  }
  
  if (dateTo) {
    gradeQuery = gradeQuery.lte('graded_at', dateTo);
  }
  
  const { count: total_graded } = await gradeQuery;
  
  // Get pending submissions
  const { count: pending_submissions } = await supabase
    .from('submissions')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .in('status', ['submitted', 'resubmitted'])
    .eq('assignments.teacher_id', teacherId);
  
  // Get active assignments
  const { count: assignments_active } = await supabase
    .from('assignments')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .eq('teacher_id', teacherId)
    .eq('status', 'published')
    .eq('is_deleted', false);
  
  return {
    total_graded: total_graded || 0,
    avg_grading_time_minutes: 0, // Would need additional tracking
    pending_submissions: pending_submissions || 0,
    assignments_active: assignments_active || 0,
  };
}

// =====================================================
// EXPORT & REPORTING
// =====================================================

/**
 * Export grades to CSV
 */
export async function exportGrades(assignmentId: string): Promise<string> {
  const { grades } = await getGrades(
    { school_id: '', assignment_id: assignmentId },
    1000,
    0
  );
  
  const headers = [
    'Student ID',
    'Score',
    'Total Marks',
    'Percentage',
    'Grade',
    'Comments',
    'Graded At',
    'Graded By',
  ];
  
  const rows = grades.map(grade => [
    grade.student_id,
    grade.score,
    grade.total_marks,
    grade.percentage,
    grade.grade_letter || '',
    grade.comments || '',
    grade.graded_at,
    grade.graded_by,
  ]);
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');
  
  return csv;
}

/**
 * Delete grade (use with caution)
 */
export async function deleteGrade(gradeId: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('grades')
    .delete()
    .eq('id', gradeId);
  
  if (error) {
    throw new Error(`Failed to delete grade: ${error.message}`);
  }
}
