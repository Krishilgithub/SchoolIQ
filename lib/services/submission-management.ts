/**
 * SUBMISSION MANAGEMENT SERVICE
 * 
 * Manages student submissions with auto-save, late detection, and file uploads
 * Features: Draft mode, auto-save, lock after submission, resubmission handling
 * Performance: Unique constraint prevents duplicates, indexed queries
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

export interface CreateSubmissionData {
  school_id: string;
  assignment_id: string;
  student_id: string;
  submission_text?: string;
  submission_link?: string;
  status?: 'not_started' | 'in_progress' | 'submitted';
}

export interface UpdateSubmissionData {
  submission_text?: string;
  submission_link?: string;
  status?: 'not_started' | 'in_progress' | 'submitted' | 'resubmitted';
  allow_resubmission?: boolean;
}

export interface SubmissionFilters {
  school_id: string;
  assignment_id?: string;
  student_id?: string;
  status?: string;
  is_late?: boolean;
}

export interface SubmissionStats {
  total_submissions: number;
  submitted_count: number;
  graded_count: number;
  pending_count: number;
  late_count: number;
  avg_score: number;
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

// =====================================================
// SUBMISSION CRUD OPERATIONS
// =====================================================

/**
 * Create or get existing submission (idempotent)
 */
export async function createOrGetSubmission(data: CreateSubmissionData): Promise<Submission> {
  const supabase = await createClient();
  
  // Check if submission already exists
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
      status: data.status || 'not_started',
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
  limit: number = 100,
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
 * Submit submission (lock it)
 */
export async function submitSubmission(
  submissionId: string,
  finalText?: string,
  finalLink?: string
): Promise<Submission> {
  const supabase = await createClient();
  
  const updateData: any = {
    status: 'submitted',
    submitted_at: new Date().toISOString(),
  };
  
  if (finalText !== undefined) updateData.submission_text = finalText;
  if (finalLink !== undefined) updateData.submission_link = finalLink;
  
  const { data, error } = await supabase
    .from('submissions')
    .update(updateData)
    .eq('id', submissionId)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to submit submission: ${error.message}`);
  }
  
  return data as Submission;
}

/**
 * Resubmit submission (increment count)
 */
export async function resubmitSubmission(
  submissionId: string,
  newText?: string,
  newLink?: string
): Promise<Submission> {
  const supabase = await createClient();
  
  // Get current submission
  const current = await getSubmissionById(submissionId);
  if (!current) {
    throw new Error('Submission not found');
  }
  
  if (!current.allow_resubmission) {
    throw new Error('Resubmission not allowed');
  }
  
  const updateData: any = {
    status: 'resubmitted',
    resubmission_count: current.resubmission_count + 1,
    resubmitted_at: new Date().toISOString(),
  };
  
  if (newText !== undefined) updateData.submission_text = newText;
  if (newLink !== undefined) updateData.submission_link = newLink;
  
  const { data, error } = await supabase
    .from('submissions')
    .update(updateData)
    .eq('id', submissionId)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to resubmit: ${error.message}`);
  }
  
  return data as Submission;
}

// =====================================================
// FILE MANAGEMENT
// =====================================================

/**
 * Upload submission file
 */
export async function uploadSubmissionFile(
  submissionId: string,
  fileName: string,
  fileUrl: string,
  fileSize: number,
  fileType: string,
  mimeType: string,
  uploadedBy: string
): Promise<SubmissionFile> {
  const supabase = await createClient();
  
  // Get submission to get school_id
  const submission = await getSubmissionById(submissionId);
  if (!submission) {
    throw new Error('Submission not found');
  }
  
  // Get current version
  const { data: existingFiles } = await supabase
    .from('submission_files')
    .select('version')
    .eq('submission_id', submissionId)
    .order('version', { ascending: false })
    .limit(1);
  
  const nextVersion = existingFiles && existingFiles.length > 0
    ? (existingFiles[0].version || 1) + 1
    : 1;
  
  // Mark all existing files as not current
  await supabase
    .from('submission_files')
    .update({ is_current: false })
    .eq('submission_id', submissionId);
  
  // Insert new file
  const { data, error } = await supabase
    .from('submission_files')
    .insert({
      school_id: submission.school_id,
      submission_id: submissionId,
      file_name: fileName,
      file_url: fileUrl,
      file_size_bytes: fileSize,
      file_type: fileType,
      mime_type: mimeType,
      version: nextVersion,
      is_current: true,
      uploaded_by: uploadedBy,
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }
  
  return data as SubmissionFile;
}

/**
 * Get submission files
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
// STUDENT QUERIES
// =====================================================

/**
 * Get student submissions for all assignments
 */
export async function getStudentSubmissions(
  studentId: string,
  schoolId: string,
  status?: string
): Promise<Submission[]> {
  const supabase = await createClient();
  
  let query = supabase
    .from('submissions')
    .select('*, assignments!inner(title, due_date, total_marks, subject_id)')
    .eq('student_id', studentId)
    .eq('school_id', schoolId);
  
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get student submissions: ${error.message}`);
  }
  
  return (data as any[]) || [];
}

/**
 * Get submission with full details (assignment, student, files)
 */
export async function getSubmissionWithDetails(submissionId: string): Promise<any> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      *,
      assignments!inner(
        title,
        description,
        instructions,
        due_date,
        total_marks,
        allow_late_submission,
        subjects(name)
      ),
      students!inner(
        admission_number,
        first_name,
        last_name,
        email,
        classes(name),
        sections(name)
      )
    `)
    .eq('id', submissionId)
    .single();
  
  if (error) {
    throw new Error(`Failed to get submission details: ${error.message}`);
  }
  
  // Get files
  const files = await getSubmissionFiles(submissionId, true);
  
  return {
    ...data,
    files,
  };
}

// =====================================================
// STATISTICS & ANALYTICS
// =====================================================

/**
 * Get submission statistics for assignment
 */
export async function getSubmissionStats(assignmentId: string): Promise<SubmissionStats> {
  const supabase = await createClient();
  
  const { data, error } = await supabase.rpc('calculate_submission_stats', {
    p_assignment_id: assignmentId,
  });
  
  if (error) {
    throw new Error(`Failed to get stats: ${error.message}`);
  }
  
  return data || {
    total_submissions: 0,
    submitted_count: 0,
    graded_count: 0,
    pending_count: 0,
    late_count: 0,
    avg_score: 0,
  };
}

/**
 * Detect late submissions
 */
export async function detectLateSubmissions(assignmentId: string): Promise<any[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase.rpc('detect_late_submissions', {
    p_assignment_id: assignmentId,
  });
  
  if (error) {
    throw new Error(`Failed to detect late submissions: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Check if submission is late
 */
export async function checkLateSubmission(
  assignmentId: string,
  submittedAt: string
): Promise<{ is_late: boolean; minutes_late: number }> {
  const supabase = await createClient();
  
  // Get assignment due date
  const { data: assignment, error } = await supabase
    .from('assignments')
    .select('due_date')
    .eq('id', assignmentId)
    .single();
  
  if (error || !assignment) {
    throw new Error('Assignment not found');
  }
  
  const dueDate = new Date(assignment.due_date);
  const submitDate = new Date(submittedAt);
  
  const is_late = submitDate > dueDate;
  const minutes_late = is_late
    ? Math.floor((submitDate.getTime() - dueDate.getTime()) / (1000 * 60))
    : 0;
  
  return { is_late, minutes_late };
}

/**
 * Get pending submissions (not started or in progress)
 */
export async function getPendingSubmissions(
  assignmentId: string
): Promise<Submission[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('submissions')
    .select('*, students!inner(admission_number, first_name, last_name)')
    .eq('assignment_id', assignmentId)
    .in('status', ['not_started', 'in_progress'])
    .order('created_at', { ascending: true });
  
  if (error) {
    throw new Error(`Failed to get pending submissions: ${error.message}`);
  }
  
  return (data as any[]) || [];
}

/**
 * Get submitted but ungraded submissions
 */
export async function getUngradedSubmissions(
  assignmentId: string
): Promise<Submission[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('submissions')
    .select('*, students!inner(admission_number, first_name, last_name)')
    .eq('assignment_id', assignmentId)
    .in('status', ['submitted', 'resubmitted'])
    .order('submitted_at', { ascending: true });
  
  if (error) {
    throw new Error(`Failed to get ungraded submissions: ${error.message}`);
  }
  
  return (data as any[]) || [];
}

/**
 * Allow resubmission for specific submission
 */
export async function allowResubmission(
  submissionId: string,
  allow: boolean = true
): Promise<Submission> {
  const supabase = await createClient();
  
  const updateData: any = {
    allow_resubmission: allow,
  };
  
  if (allow) {
    updateData.is_locked = false;
    updateData.status = 'in_progress';
  }
  
  const { data, error } = await supabase
    .from('submissions')
    .update(updateData)
    .eq('id', submissionId)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to allow resubmission: ${error.message}`);
  }
  
  return data as Submission;
}

/**
 * Bulk allow resubmission
 */
export async function bulkAllowResubmission(
  submissionIds: string[]
): Promise<number> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('submissions')
    .update({
      allow_resubmission: true,
      is_locked: false,
      status: 'in_progress',
    })
    .in('id', submissionIds)
    .select('id');
  
  if (error) {
    throw new Error(`Failed to bulk allow resubmission: ${error.message}`);
  }
  
  return data?.length || 0;
}
