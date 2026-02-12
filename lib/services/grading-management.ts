/**
 * GRADING MANAGEMENT SERVICE
 * 
 * Manages grading workflow with auto-save, versioning, and history
 * Features: Draft grades, grade history, bulk grading, rubric support
 * Performance: Indexed queries, efficient updates
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
  new_score: number | null;
  previous_grade_letter: string | null;
  new_grade_letter: string | null;
  previous_comments: string | null;
  new_comments: string | null;
  change_type: string;
  changed_by: string | null;
  changed_at: string;
  change_reason: string | null;
  grade_snapshot: any | null;
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
  comments?: string;
  strengths?: string;
  areas_for_improvement?: string;
  status?: 'draft' | 'published';
  graded_by: string;
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
  graded_by: string;
  is_auto_saved?: boolean;
}

export interface BulkGradeData {
  submission_id: string;
  score: number;
  grade_letter?: string;
  comments?: string;
}

export interface GradingQueueItem {
  submission_id: string;
  assignment_id: string;
  assignment_title: string;
  student_id: string;
  student_name: string;
  admission_number: string;
  submitted_at: string;
  is_late: boolean;
  days_since_submission: number;
}

// =====================================================
// GRADE CRUD OPERATIONS
// =====================================================

/**
 * Create grade
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
    comments: data.comments || null,
    strengths: data.strengths || null,
    areas_for_improvement: data.areas_for_improvement || null,
    status: data.status || 'draft',
    is_auto_saved: data.is_auto_saved || false,
    last_saved_at: new Date().toISOString(),
  };
  
  if (gradeData.status === 'published') {
    gradeData.published_at = new Date().toISOString();
    gradeData.graded_at = new Date().toISOString();
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
export async function getGradeBySubmission(submissionId: string): Promise<Grade | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('grades')
    .select('*')
    .eq('submission_id', submissionId)
    .maybeSingle();
  
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get grade: ${error.message}`);
  }
  
  return data as Grade | null;
}

/**
 * Update grade (creates history entry automatically via trigger)
 */
export async function updateGrade(
  gradeId: string,
  data: UpdateGradeData
): Promise<Grade> {
  const supabase = await createClient();
  
  const updateData: any = {
    graded_by: data.graded_by,
    last_saved_at: new Date().toISOString(),
    is_auto_saved: data.is_auto_saved || false,
  };
  
  if (data.score !== undefined) updateData.score = data.score;
  if (data.grade_letter !== undefined) updateData.grade_letter = data.grade_letter;
  if (data.rubric_scores !== undefined) updateData.rubric_scores = data.rubric_scores;
  if (data.comments !== undefined) updateData.comments = data.comments;
  if (data.strengths !== undefined) updateData.strengths = data.strengths;
  if (data.areas_for_improvement !== undefined) updateData.areas_for_improvement = data.areas_for_improvement;
  
  if (data.status !== undefined) {
    updateData.status = data.status;
    if (data.status === 'published') {
      updateData.published_at = new Date().toISOString();
      updateData.graded_at = new Date().toISOString();
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
 * Publish grade (make it visible to student)
 */
export async function publishGrade(
  gradeId: string,
  publishedBy: string
): Promise<Grade> {
  return updateGrade(gradeId, {
    status: 'published',
    graded_by: publishedBy,
  });
}

/**
 * Finalize grade (auto-publish if meets criteria)
 */
export async function finalizeGrade(
  submissionId: string,
  score: number,
  totalMarks: number,
  gradeLetter: string,
  comments: string,
  gradedBy: string
): Promise<Grade> {
  const supabase = await createClient();
  
  // Check if grade exists
  const existingGrade = await getGradeBySubmission(submissionId);
  
  if (existingGrade) {
    // Update existing grade
    return updateGrade(existingGrade.id, {
      score,
      grade_letter: gradeLetter,
      comments,
      status: 'published',
      graded_by: gradedBy,
    });
  } else {
    // Get submission details
    const { data: submission, error: subError } = await supabase
      .from('submissions')
      .select('school_id, assignment_id, student_id')
      .eq('id', submissionId)
      .single();
    
    if (subError || !submission) {
      throw new Error('Submission not found');
    }
    
    // Create new grade
    return createGrade({
      school_id: submission.school_id,
      assignment_id: submission.assignment_id,
      submission_id: submissionId,
      student_id: submission.student_id,
      score,
      total_marks: totalMarks,
      grade_letter: gradeLetter,
      comments,
      status: 'published',
      graded_by: gradedBy,
    });
  }
}

// =====================================================
// GRADE HISTORY
// =====================================================

/**
 * Get grade history
 */
export async function getGradeHistory(gradeId: string): Promise<GradeHistory[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('grade_history')
    .select('*')
    .eq('grade_id', gradeId)
    .order('changed_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get grade history: ${error.message}`);
  }
  
  return (data as GradeHistory[]) || [];
}

/**
 * Get submission grade history
 */
export async function getSubmissionGradeHistory(submissionId: string): Promise<GradeHistory[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('grade_history')
    .select('*')
    .eq('submission_id', submissionId)
    .order('changed_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get submission history: ${error.message}`);
  }
  
  return (data as GradeHistory[]) || [];
}

// =====================================================
// BULK OPERATIONS
// =====================================================

/**
 * Bulk grade submissions
 */
export async function bulkGrade(
  assignmentId: string,
  schoolId: string,
  totalMarks: number,
  grades: BulkGradeData[],
  gradedBy: string
): Promise<number> {
  const supabase = await createClient();
  
  let successCount = 0;
  
  for (const gradeData of grades) {
    try {
      // Get submission details
      const { data: submission } = await supabase
        .from('submissions')
        .select('student_id')
        .eq('id', gradeData.submission_id)
        .single();
      
      if (!submission) continue;
      
      // Check if grade exists
      const existingGrade = await getGradeBySubmission(gradeData.submission_id);
      
      if (existingGrade) {
        await updateGrade(existingGrade.id, {
          score: gradeData.score,
          grade_letter: gradeData.grade_letter,
          comments: gradeData.comments,
          status: 'published',
          graded_by: gradedBy,
        });
      } else {
        await createGrade({
          school_id: schoolId,
          assignment_id: assignmentId,
          submission_id: gradeData.submission_id,
          student_id: submission.student_id,
          score: gradeData.score,
          total_marks: totalMarks,
          grade_letter: gradeData.grade_letter,
          comments: gradeData.comments,
          status: 'published',
          graded_by: gradedBy,
        });
      }
      
      successCount++;
    } catch (error) {
      console.error(`Failed to grade submission ${gradeData.submission_id}:`, error);
    }
  }
  
  return successCount;
}

// =====================================================
// GRADING QUEUE & WORKFLOW
// =====================================================

/**
 * Get grading queue for teacher (pending submissions)
 */
export async function getGradingQueue(
  schoolId: string,
  teacherId: string,
  limit: number = 50
): Promise<GradingQueueItem[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      id,
      assignment_id,
      student_id,
      submitted_at,
      is_late,
      assignments!inner(
        title,
        teacher_id,
        due_date
      ),
      students!inner(
        admission_number,
        first_name,
        last_name
      )
    `)
    .eq('school_id', schoolId)
    .eq('assignments.teacher_id', teacherId)
    .in('status', ['submitted', 'resubmitted'])
    .order('submitted_at', { ascending: true })
    .limit(limit);
  
  if (error) {
    throw new Error(`Failed to get grading queue: ${error.message}`);
  }
  
  const queue: GradingQueueItem[] = (data || []).map((item: any) => {
    const daysSince = Math.floor(
      (new Date().getTime() - new Date(item.submitted_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return {
      submission_id: item.id,
      assignment_id: item.assignment_id,
      assignment_title: item.assignments.title,
      student_id: item.student_id,
      student_name: `${item.students.first_name} ${item.students.last_name}`,
      admission_number: item.students.admission_number,
      submitted_at: item.submitted_at,
      is_late: item.is_late,
      days_since_submission: daysSince,
    };
  });
  
  return queue;
}

/**
 * Get grading statistics for teacher
 */
export async function getGradingStats(
  schoolId: string,
  teacherId: string
): Promise<{
  pending_count: number;
  graded_today: number;
  graded_this_week: number;
  avg_grading_time_hours: number;
}> {
  const supabase = await createClient();
  
  // Pending count
  const { count: pendingCount } = await supabase
    .from('submissions')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .in('status', ['submitted', 'resubmitted'])
    .eq('assignments.teacher_id', teacherId);
  
  // Graded today
  const today = new Date().toISOString().split('T')[0];
  const { count: gradedToday } = await supabase
    .from('grades')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .eq('graded_by', teacherId)
    .gte('graded_at', today);
  
  // Graded this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { count: gradedWeek } = await supabase
    .from('grades')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .eq('graded_by', teacherId)
    .gte('graded_at', weekAgo.toISOString());
  
  return {
    pending_count: pendingCount || 0,
    graded_today: gradedToday || 0,
    graded_this_week: gradedWeek || 0,
    avg_grading_time_hours: 0, // Would need more complex query
  };
}

// =====================================================
// ANALYTICS & REPORTS
// =====================================================

/**
 * Get grades for assignment
 */
export async function getGradesByAssignment(
  assignmentId: string,
  status?: 'draft' | 'published' | 'revised'
): Promise<Grade[]> {
  const supabase = await createClient();
  
  let query = supabase
    .from('grades')
    .select('*')
    .eq('assignment_id', assignmentId);
  
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query.order('graded_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get grades: ${error.message}`);
  }
  
  return (data as Grade[]) || [];
}

/**
 * Calculate class average for assignment
 */
export async function calculateClassAverage(assignmentId: string): Promise<{
  avg_score: number;
  avg_percentage: number;
  highest_score: number;
  lowest_score: number;
  total_graded: number;
}> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('grades')
    .select('score, percentage')
    .eq('assignment_id', assignmentId)
    .eq('status', 'published');
  
  if (error) {
    throw new Error(`Failed to calculate average: ${error.message}`);
  }
  
  const grades = data || [];
  
  if (grades.length === 0) {
    return {
      avg_score: 0,
      avg_percentage: 0,
      highest_score: 0,
      lowest_score: 0,
      total_graded: 0,
    };
  }
  
  const scores = grades.map(g => g.score);
  const percentages = grades.map(g => g.percentage);
  
  return {
    avg_score: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100,
    avg_percentage: Math.round((percentages.reduce((a, b) => a + b, 0) / percentages.length) * 100) / 100,
    highest_score: Math.max(...scores),
    lowest_score: Math.min(...scores),
    total_graded: grades.length,
  };
}

/**
 * Get student grade report
 */
export async function getStudentGradeReport(
  studentId: string,
  schoolId: string,
  academicYearId?: string
): Promise<any[]> {
  const supabase = await createClient();
  
  let query = supabase
    .from('grades')
    .select(`
      *,
      assignments!inner(
        title,
        due_date,
        subject_id,
        subjects(name)
      )
    `)
    .eq('student_id', studentId)
    .eq('school_id', schoolId)
    .eq('status', 'published');
  
  if (academicYearId) {
    query = query.eq('assignments.academic_year_id', academicYearId);
  }
  
  const { data, error } = await query.order('graded_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get student report: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Export grades to CSV
 */
export async function exportGrades(assignmentId: string): Promise<string> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('grades')
    .select(`
      *,
      students!inner(admission_number, first_name, last_name)
    `)
    .eq('assignment_id', assignmentId)
    .eq('status', 'published')
    .order('students.admission_number', { ascending: true });
  
  if (error) {
    throw new Error(`Failed to export grades: ${error.message}`);
  }
  
  const headers = [
    'Admission Number',
    'Student Name',
    'Score',
    'Total Marks',
    'Percentage',
    'Grade',
    'Comments',
    'Graded At',
  ];
  
  const rows = (data || []).map((grade: any) => [
    grade.students.admission_number,
    `${grade.students.first_name} ${grade.students.last_name}`,
    grade.score,
    grade.total_marks,
    grade.percentage,
    grade.grade_letter || '',
    grade.comments || '',
    grade.graded_at,
  ]);
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');
  
  return csv;
}
