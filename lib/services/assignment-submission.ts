/**
 * SUBMISSION MANAGEMENT SERVICE
 * 
 * Manages student submissions with auto-save, file uploads, and lock mechanism
 * Features: Draft mode, late submission detection, file versioning
 * Performance: Indexed queries, optimistic locking
 */

import { createClient } from '@/lib/supabase/server';

// =====================================================
// TYPES & INTERFACES
// =====================================================

export interface Submission {
  id: string;
  school_id: string;
  assignment_id: string;
  student_id: string;
  submission_text: string | null;
  submission_link: string | null;
  status: 'not_started' | 'in_progress' | 'submitted' | 'resubmitted' | 'graded' | 'returned';
  submitted_at: string | null;
  is_late: boolean;
  minutes_late: number | null;
  is_locked: boolean;
  locked_at: string | null;
  resubmission_count: number;
  allow_resubmission: boolean;
  resubmitted_at: string | null;
  score: number | null;
  grade: string | null;
  graded_at: string | null;
  graded_by: string | null;
  feedback: string | null;
  feedback_attachments: any | null;
  plagiarism_score: number | null;
  plagiarism_report_url: string | null;
  peer_review_enabled: boolean;
  peer_reviewers: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface SubmissionFile {
  id: string;
  school_id: string;
  submission_id: string;
  file_name: string;
  file_url: string;
  file_size_bytes: number | null;
  file_type: string | null;
  mime_type: string | null;
  version: number;
  is_current: boolean;
  uploaded_at: string;
  uploaded_by: string | null;
}

export interface CreateSubmissionData {
  school_id: string;
  assignment_id: string;
  student_id: string;
  submission_text?: string;
  submission_link?: string;
  status?: 'in_progress' | 'submitted';
}

export interface UpdateSubmissionData {
  submission_text?: string;
  submission_link?: string;
  status?: 'in_progress' | 'submitted' | 'resubmitted';
  allow_resubmission?: boolean;
}

export interface SubmissionFilters {
  school_id: string;
  assignment_id?: string;
  student_id?: string;
  status?: string;
  is_late?: boolean;
  graded?: boolean;
}

// =====================================================
// SUBMISSION CRUD OPERATIONS
// =====================================================

/**
 * Create or get submission (idempotent - one per student per assignment)
 */
export async function createOrGetSubmission(data: CreateSubmissionData): Promise<Submission> {
  const supabase = await createClient();
  
  // Check if submission exists
  const { data: existing, error: checkError } = await supabase
    .from('submissions')
    .select('*')
    .eq('assignment_id', data.assignment_id)
    .eq('student_id', data.student_id)
    .maybeSingle();
  
  if (checkError && checkError.code !== 'PGRST116') {
    throw new Error(`Failed to check existing submission: ${checkError.message}`);
  }
  
  if (existing) {
    return existing as Submission;
  }
  
  // Create new submission
  const { data: submission, error } = await supabase
    .from('submissions')
    .insert({
      school_id: data.school_id,
      assignment_id: data.assignment_id,
      student_id: data.student_id,
      submission_text: data.submission_text || null,
      submission_link: data.submission_link || null,
      status: data.status || 'in_progress',
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create submission: ${error.message}`);
  }
  
  return submission as Submission;
}

/**
 * Get submission by ID
 */
export async function getSubmissionById(submissionId: string): Promise<Submission | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', submissionId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to get submission: ${error.message}`);
  }
  
  return data as Submission;
}

/**
 * Get submissions with filters (paginated)
 */
export async function getSubmissions(
  filters: SubmissionFilters,
  limit: number = 50,
  offset: number = 0
): Promise<{ submissions: Submission[]; total: number }> {
  const supabase = await createClient();
  
  let query = supabase
    .from('submissions')
    .select('*', { count: 'exact' })
    .eq('school_id', filters.school_id);
  
  if (filters.assignment_id) {
    query = query.eq('assignment_id', filters.assignment_id);
  }
  
  if (filters.student_id) {
    query = query.eq('student_id', filters.student_id);
  }
  
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters.is_late !== undefined) {
    query = query.eq('is_late', filters.is_late);
  }
  
  if (filters.graded !== undefined) {
    if (filters.graded) {
      query = query.eq('status', 'graded');
    } else {
      query = query.in('status', ['submitted', 'resubmitted']);
    }
  }
  
  query = query
    .order('submitted_at', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);
  
  const { data, error, count } = await query;
  
  if (error) {
    throw new Error(`Failed to get submissions: ${error.message}`);
  }
  
  return {
    submissions: (data as Submission[]) || [],
    total: count || 0,
  };
}

/**
 * Get student submissions for assignment
 */
export async function getStudentSubmissions(
  studentId: string,
  academicYearId?: string
): Promise<Submission[]> {
  const supabase = await createClient();
  
  let query = supabase
    .from('submissions')
    .select('*, assignments!inner(title, due_date, total_marks, status)')
    .eq('student_id', studentId);
  
  if (academicYearId) {
    query = query.eq('assignments.academic_year_id', academicYearId);
  }
  
  const { data, error } = await query
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get student submissions: ${error.message}`);
  }
  
  return (data as any[]) || [];
}

/**
 * Update submission (auto-save support)
 */
export async function updateSubmission(
  submissionId: string,
  data: UpdateSubmissionData
): Promise<Submission> {
  const supabase = await createClient();
  
  const updateData: any = {};
  
  if (data.submission_text !== undefined) updateData.submission_text = data.submission_text;
  if (data.submission_link !== undefined) updateData.submission_link = data.submission_link;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.allow_resubmission !== undefined) updateData.allow_resubmission = data.allow_resubmission;
  
  // If submitting, increment resubmission count if already submitted
  if (data.status === 'submitted' || data.status === 'resubmitted') {
    const existing = await getSubmissionById(submissionId);
    if (existing && ['submitted', 'resubmitted', 'graded'].includes(existing.status)) {
      updateData.resubmission_count = (existing.resubmission_count || 0) + 1;
      updateData.resubmitted_at = new Date().toISOString();
      updateData.status = 'resubmitted';
    }
  }
  
  const { data: submission, error } = await supabase
    .from('submissions')
    .update(updateData)
    .eq('id', submissionId)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to update submission: ${error.message}`);
  }
  
  return submission as Submission;
}

/**
 * Submit submission (final submit with lock check)
 */
export async function submitSubmission(
  submissionId: string,
  finalSubmit: boolean = true
): Promise<Submission> {
  const supabase = await createClient();
  
  // Check if locked
  const existing = await getSubmissionById(submissionId);
  if (!existing) {
    throw new Error('Submission not found');
  }
  
  if (existing.is_locked && !existing.allow_resubmission) {
    throw new Error('Submission is locked. Cannot modify.');
  }
  
  const updateData: any = {
    status: 'submitted',
  };
  
  if (finalSubmit && !existing.submitted_at) {
    updateData.submitted_at = new Date().toISOString();
  }
  
  return updateSubmission(submissionId, updateData);
}

// =====================================================
// FILE MANAGEMENT
// =====================================================

/**
 * Upload submission file
 */
export async function uploadSubmissionFile(
  submissionId: string,
  fileData: {
    file_name: string;
    file_url: string;
    file_size_bytes?: number;
    file_type?: string;
    mime_type?: string;
    uploaded_by: string;
  }
): Promise<SubmissionFile> {
  const supabase = await createClient();
  
  // Get submission to get school_id
  const submission = await getSubmissionById(submissionId);
  if (!submission) {
    throw new Error('Submission not found');
  }
  
  // Check if locked
  if (submission.is_locked && !submission.allow_resubmission) {
    throw new Error('Submission is locked. Cannot add files.');
  }
  
  // Get current version
  const { data: existingFiles } = await supabase
    .from('submission_files')
    .select('version')
    .eq('submission_id', submissionId)
    .order('version', { ascending: false })
    .limit(1);
  
  const nextVersion = existingFiles && existingFiles.length > 0 
    ? (existingFiles[0].version || 0) + 1 
    : 1;
  
  // Mark all existing files as not current if this is a new version
  if (nextVersion > 1) {
    await supabase
      .from('submission_files')
      .update({ is_current: false })
      .eq('submission_id', submissionId);
  }
  
  // Insert new file
  const { data: file, error } = await supabase
    .from('submission_files')
    .insert({
      school_id: submission.school_id,
      submission_id: submissionId,
      file_name: fileData.file_name,
      file_url: fileData.file_url,
      file_size_bytes: fileData.file_size_bytes || null,
      file_type: fileData.file_type || null,
      mime_type: fileData.mime_type || null,
      version: nextVersion,
      is_current: true,
      uploaded_by: fileData.uploaded_by,
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }
  
  return file as SubmissionFile;
}

/**
 * Get submission files (current versions only)
 */
export async function getSubmissionFiles(
  submissionId: string,
  currentOnly: boolean = true
): Promise<SubmissionFile[]> {
  const supabase = await createClient();
  
  let query = supabase
    .from('submission_files')
    .select('*')
    .eq('submission_id', submissionId);
  
  if (currentOnly) {
    query = query.eq('is_current', true);
  }
  
  const { data, error } = await query.order('uploaded_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get files: ${error.message}`);
  }
  
  return (data as SubmissionFile[]) || [];
}

/**
 * Delete submission file
 */
export async function deleteSubmissionFile(fileId: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('submission_files')
    .delete()
    .eq('id', fileId);
  
  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

// =====================================================
// LATE SUBMISSION DETECTION
// =====================================================

/**
 * Check if submission is late
 */
export async function checkLateSubmission(submissionId: string): Promise<{
  is_late: boolean;
  minutes_late: number;
  allowed: boolean;
}> {
  const supabase = await createClient();
  
  const { data: submission, error: submissionError } = await supabase
    .from('submissions')
    .select('submitted_at, assignments!inner(due_date, allow_late_submission, late_submission_deadline)')
    .eq('id', submissionId)
    .single();
  
  if (submissionError || !submission) {
    throw new Error('Submission not found');
  }
  
  const submittedAt = new Date(submission.submitted_at || new Date());
  const assignment = (submission as any).assignments;
  const dueDate = new Date(assignment.due_date);
  
  const is_late = submittedAt > dueDate;
  const minutes_late = is_late 
    ? Math.floor((submittedAt.getTime() - dueDate.getTime()) / (1000 * 60))
    : 0;
  
  let allowed = true;
  if (is_late) {
    if (!assignment.allow_late_submission) {
      allowed = false;
    } else if (assignment.late_submission_deadline) {
      const lateDeadline = new Date(assignment.late_submission_deadline);
      allowed = submittedAt <= lateDeadline;
    }
  }
  
  return { is_late, minutes_late, allowed };
}

// =====================================================
// STATISTICS & ANALYTICS
// =====================================================

/**
 * Get submission statistics for assignment
 */
export async function getSubmissionStats(assignmentId: string): Promise<{
  total_students: number;
  submitted_count: number;
  not_submitted_count: number;
  graded_count: number;
  pending_grading_count: number;
  late_count: number;
  avg_score: number | null;
  submission_rate: number;
}> {
  const supabase = await createClient();
  
  const { data: stats, error } = await supabase.rpc('calculate_submission_stats', {
    p_assignment_id: assignmentId,
  });
  
  if (error) {
    throw new Error(`Failed to get submission stats: ${error.message}`);
  }
  
  const result = stats && stats.length > 0 ? stats[0] : {
    total_students: 0,
    submitted_count: 0,
    graded_count: 0,
    pending_count: 0,
    late_count: 0,
    avg_score: null,
  };
  
  return {
    total_students: result.total_students || 0,
    submitted_count: result.submitted_count || 0,
    not_submitted_count: (result.total_students || 0) - (result.submitted_count || 0),
    graded_count: result.graded_count || 0,
    pending_grading_count: result.pending_count || 0,
    late_count: result.late_count || 0,
    avg_score: result.avg_score || null,
    submission_rate: result.total_students > 0 
      ? Math.round((result.submitted_count / result.total_students) * 10000) / 100
      : 0,
  };
}

/**
 * Get pending submissions (submitted but not graded)
 */
export async function getPendingSubmissions(
  assignmentId: string
): Promise<Submission[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('assignment_id', assignmentId)
    .in('status', ['submitted', 'resubmitted'])
    .order('submitted_at', { ascending: true });
  
  if (error) {
    throw new Error(`Failed to get pending submissions: ${error.message}`);
  }
  
  return (data as Submission[]) || [];
}

/**
 * Export submissions to CSV
 */
export async function exportSubmissions(assignmentId: string): Promise<string> {
  const { submissions } = await getSubmissions(
    { school_id: '', assignment_id: assignmentId },
    1000,
    0
  );
  
  const headers = [
    'Student ID',
    'Status',
    'Submitted At',
    'Is Late',
    'Minutes Late',
    'Score',
    'Grade',
    'Graded At',
  ];
  
  const rows = submissions.map(sub => [
    sub.student_id,
    sub.status,
    sub.submitted_at || '',
    sub.is_late ? 'Yes' : 'No',
    sub.minutes_late || 0,
    sub.score || '',
    sub.grade || '',
    sub.graded_at || '',
  ]);
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');
  
  return csv;
}
