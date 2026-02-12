/**
 * ASSIGNMENT MANAGEMENT SERVICE
 * 
 * Manages assignment lifecycle: draft, scheduled publish, published, closed, archived
 * Features: Draft mode, scheduled publishing, duplication, soft delete
 * Performance: Indexed queries, pagination-ready
 */

import { createClient } from '@/lib/supabase/server';

// =====================================================
// TYPES & INTERFACES
// =====================================================

export interface Assignment {
  id: string;
  school_id: string;
  academic_year_id: string;
  class_id: string;
  section_id: string | null;
  subject_id: string;
  teacher_id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  assigned_date: string;
  due_date: string;
  allow_late_submission: boolean;
  late_submission_deadline: string | null;
  status: 'draft' | 'scheduled' | 'published' | 'closed' | 'archived';
  scheduled_publish_at: string | null;
  published_at: string | null;
  total_marks: number;
  passing_marks: number | null;
  grading_rubric: any | null;
  submission_type: 'file' | 'text' | 'link' | 'file_and_text';
  max_file_size_mb: number;
  allowed_file_types: string[] | null;
  max_files_per_submission: number;
  enable_peer_review: boolean;
  enable_plagiarism_check: boolean;
  send_notification: boolean;
  total_students: number;
  submitted_count: number;
  graded_count: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface CreateAssignmentData {
  school_id: string;
  academic_year_id: string;
  class_id: string;
  section_id?: string | null;
  subject_id: string;
  teacher_id: string;
  title: string;
  description?: string;
  instructions?: string;
  assigned_date?: string;
  due_date: string;
  allow_late_submission?: boolean;
  late_submission_deadline?: string;
  status?: 'draft' | 'scheduled' | 'published';
  scheduled_publish_at?: string;
  total_marks?: number;
  passing_marks?: number;
  grading_rubric?: any;
  submission_type?: 'file' | 'text' | 'link' | 'file_and_text';
  max_file_size_mb?: number;
  allowed_file_types?: string[];
  max_files_per_submission?: number;
  enable_peer_review?: boolean;
  enable_plagiarism_check?: boolean;
  send_notification?: boolean;
  created_by: string;
}

export interface UpdateAssignmentData {
  title?: string;
  description?: string;
  instructions?: string;
  due_date?: string;
  allow_late_submission?: boolean;
  late_submission_deadline?: string;
  total_marks?: number;
  passing_marks?: number;
  grading_rubric?: any;
  submission_type?: 'file' | 'text' | 'link' | 'file_and_text';
  max_file_size_mb?: number;
  allowed_file_types?: string[];
  max_files_per_submission?: number;
  enable_peer_review?: boolean;
  enable_plagiarism_check?: boolean;
  send_notification?: boolean;
  updated_by: string;
}

export interface AssignmentFilters {
  school_id: string;
  teacher_id?: string;
  class_id?: string;
  section_id?: string;
  subject_id?: string;
  status?: string;
  academic_year_id?: string;
  is_overdue?: boolean;
  search?: string;
}

// =====================================================
// ASSIGNMENT CRUD OPERATIONS
// =====================================================

/**
 * Create assignment (draft by default)
 */
export async function createAssignment(data: CreateAssignmentData): Promise<Assignment> {
  const supabase = await createClient();
  
  const assignmentData: any = {
    school_id: data.school_id,
    academic_year_id: data.academic_year_id,
    class_id: data.class_id,
    section_id: data.section_id || null,
    subject_id: data.subject_id,
    teacher_id: data.teacher_id,
    title: data.title,
    description: data.description || null,
    instructions: data.instructions || null,
    assigned_date: data.assigned_date || new Date().toISOString().split('T')[0],
    due_date: data.due_date,
    allow_late_submission: data.allow_late_submission || false,
    late_submission_deadline: data.late_submission_deadline || null,
    status: data.status || 'draft',
    scheduled_publish_at: data.scheduled_publish_at || null,
    total_marks: data.total_marks || 100,
    passing_marks: data.passing_marks || null,
    grading_rubric: data.grading_rubric || null,
    submission_type: data.submission_type || 'file',
    max_file_size_mb: data.max_file_size_mb || 10,
    allowed_file_types: data.allowed_file_types || null,
    max_files_per_submission: data.max_files_per_submission || 5,
    enable_peer_review: data.enable_peer_review || false,
    enable_plagiarism_check: data.enable_plagiarism_check || false,
    send_notification: data.send_notification !== false,
    created_by: data.created_by,
  };
  
  // If status is 'published', set published_at
  if (assignmentData.status === 'published') {
    assignmentData.published_at = new Date().toISOString();
  }
  
  const { data: assignment, error } = await supabase
    .from('assignments')
    .insert(assignmentData)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create assignment: ${error.message}`);
  }
  
  return assignment as Assignment;
}

/**
 * Get assignment by ID
 */
export async function getAssignmentById(assignmentId: string): Promise<Assignment | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('id', assignmentId)
    .eq('is_deleted', false)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to get assignment: ${error.message}`);
  }
  
  return data as Assignment;
}

/**
 * Get assignments with filters (paginated)
 */
export async function getAssignments(
  filters: AssignmentFilters,
  limit: number = 50,
  offset: number = 0
): Promise<{ assignments: Assignment[]; total: number }> {
  const supabase = await createClient();
  
  let query = supabase
    .from('assignments')
    .select('*', { count: 'exact' })
    .eq('school_id', filters.school_id)
    .eq('is_deleted', false);
  
  // Apply filters
  if (filters.teacher_id) {
    query = query.eq('teacher_id', filters.teacher_id);
  }
  
  if (filters.class_id) {
    query = query.eq('class_id', filters.class_id);
  }
  
  if (filters.section_id !== undefined) {
    query = query.eq('section_id', filters.section_id);
  }
  
  if (filters.subject_id) {
    query = query.eq('subject_id', filters.subject_id);
  }
  
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters.academic_year_id) {
    query = query.eq('academic_year_id', filters.academic_year_id);
  }
  
  if (filters.is_overdue) {
    query = query.lt('due_date', new Date().toISOString());
  }
  
  if (filters.search) {
    query = query.ilike('title', `%${filters.search}%`);
  }
  
  // Pagination and ordering
  query = query
    .order('due_date', { ascending: false })
    .range(offset, offset + limit - 1);
  
  const { data, error, count } = await query;
  
  if (error) {
    throw new Error(`Failed to get assignments: ${error.message}`);
  }
  
  return {
    assignments: (data as Assignment[]) || [],
    total: count || 0,
  };
}

/**
 * Update assignment
 */
export async function updateAssignment(
  assignmentId: string,
  data: UpdateAssignmentData
): Promise<Assignment> {
  const supabase = await createClient();
  
  const updateData: any = {
    updated_by: data.updated_by,
  };
  
  // Only update provided fields
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.instructions !== undefined) updateData.instructions = data.instructions;
  if (data.due_date !== undefined) updateData.due_date = data.due_date;
  if (data.allow_late_submission !== undefined) updateData.allow_late_submission = data.allow_late_submission;
  if (data.late_submission_deadline !== undefined) updateData.late_submission_deadline = data.late_submission_deadline;
  if (data.total_marks !== undefined) updateData.total_marks = data.total_marks;
  if (data.passing_marks !== undefined) updateData.passing_marks = data.passing_marks;
  if (data.grading_rubric !== undefined) updateData.grading_rubric = data.grading_rubric;
  if (data.submission_type !== undefined) updateData.submission_type = data.submission_type;
  if (data.max_file_size_mb !== undefined) updateData.max_file_size_mb = data.max_file_size_mb;
  if (data.allowed_file_types !== undefined) updateData.allowed_file_types = data.allowed_file_types;
  if (data.max_files_per_submission !== undefined) updateData.max_files_per_submission = data.max_files_per_submission;
  if (data.enable_peer_review !== undefined) updateData.enable_peer_review = data.enable_peer_review;
  if (data.enable_plagiarism_check !== undefined) updateData.enable_plagiarism_check = data.enable_plagiarism_check;
  if (data.send_notification !== undefined) updateData.send_notification = data.send_notification;
  
  const { data: assignment, error } = await supabase
    .from('assignments')
    .update(updateData)
    .eq('id', assignmentId)
    .eq('is_deleted', false)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to update assignment: ${error.message}`);
  }
  
  return assignment as Assignment;
}

// =====================================================
// PUBLISHING WORKFLOW
// =====================================================

/**
 * Publish assignment (immediately or schedule)
 */
export async function publishAssignment(
  assignmentId: string,
  publishedBy: string,
  scheduledAt?: string
): Promise<Assignment> {
  const supabase = await createClient();
  
  const now = new Date().toISOString();
  
  const updateData: any = {
    updated_by: publishedBy,
  };
  
  if (scheduledAt && new Date(scheduledAt) > new Date()) {
    // Schedule for future
    updateData.status = 'scheduled';
    updateData.scheduled_publish_at = scheduledAt;
  } else {
    // Publish immediately
    updateData.status = 'published';
    updateData.published_at = now;
  }
  
  const { data, error } = await supabase
    .from('assignments')
    .update(updateData)
    .eq('id', assignmentId)
    .eq('is_deleted', false)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to publish assignment: ${error.message}`);
  }
  
  return data as Assignment;
}

/**
 * Auto-publish scheduled assignments (background job)
 */
export async function autoPublishScheduledAssignments(): Promise<number> {
  const supabase = await createClient();
  
  const { data, error } = await supabase.rpc('auto_publish_scheduled_assignments');
  
  if (error) {
    throw new Error(`Failed to auto-publish: ${error.message}`);
  }
  
  return data || 0;
}

/**
 * Close assignment (no more submissions)
 */
export async function closeAssignment(
  assignmentId: string,
  closedBy: string
): Promise<Assignment> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('assignments')
    .update({
      status: 'closed',
      updated_by: closedBy,
    })
    .eq('id', assignmentId)
    .eq('is_deleted', false)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to close assignment: ${error.message}`);
  }
  
  return data as Assignment;
}

/**
 * Archive assignment (soft hide)
 */
export async function archiveAssignment(
  assignmentId: string,
  archivedBy: string
): Promise<Assignment> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('assignments')
    .update({
      status: 'archived',
      updated_by: archivedBy,
    })
    .eq('id', assignmentId)
    .eq('is_deleted', false)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to archive assignment: ${error.message}`);
  }
  
  return data as Assignment;
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Duplicate assignment (create copy as draft)
 */
export async function duplicateAssignment(
  assignmentId: string,
  duplicatedBy: string,
  newTitle?: string
): Promise<Assignment> {
  const supabase = await createClient();
  
  // Get original assignment
  const original = await getAssignmentById(assignmentId);
  if (!original) {
    throw new Error('Assignment not found');
  }
  
  // Create copy
  const copyData: CreateAssignmentData = {
    school_id: original.school_id,
    academic_year_id: original.academic_year_id,
    class_id: original.class_id,
    section_id: original.section_id,
    subject_id: original.subject_id,
    teacher_id: original.teacher_id,
    title: newTitle || `${original.title} (Copy)`,
    description: original.description || undefined,
    instructions: original.instructions || undefined,
    due_date: original.due_date,
    allow_late_submission: original.allow_late_submission,
    total_marks: original.total_marks,
    passing_marks: original.passing_marks || undefined,
    grading_rubric: original.grading_rubric,
    submission_type: original.submission_type,
    max_file_size_mb: original.max_file_size_mb,
    allowed_file_types: original.allowed_file_types || undefined,
    max_files_per_submission: original.max_files_per_submission,
    enable_peer_review: original.enable_peer_review,
    enable_plagiarism_check: original.enable_plagiarism_check,
    send_notification: original.send_notification,
    status: 'draft',
    created_by: duplicatedBy,
  };
  
  return createAssignment(copyData);
}

/**
 * Delete assignment (soft delete)
 */
export async function deleteAssignment(
  assignmentId: string,
  deletedBy: string
): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('assignments')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      deleted_by: deletedBy,
    })
    .eq('id', assignmentId);
  
  if (error) {
    throw new Error(`Failed to delete assignment: ${error.message}`);
  }
}

/**
 * Get upcoming assignments (due in next 7 days)
 */
export async function getUpcomingAssignments(
  schoolId: string,
  teacherId?: string
): Promise<Assignment[]> {
  const supabase = await createClient();
  
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  let query = supabase
    .from('assignments')
    .select('*')
    .eq('school_id', schoolId)
    .eq('status', 'published')
    .eq('is_deleted', false)
    .gte('due_date', today.toISOString())
    .lte('due_date', nextWeek.toISOString());
  
  if (teacherId) {
    query = query.eq('teacher_id', teacherId);
  }
  
  const { data, error } = await query.order('due_date', { ascending: true });
  
  if (error) {
    throw new Error(`Failed to get upcoming assignments: ${error.message}`);
  }
  
  return (data as Assignment[]) || [];
}

/**
 * Get overdue assignments
 */
export async function getOverdueAssignments(
  schoolId: string,
  teacherId?: string
): Promise<Assignment[]> {
  const supabase = await createClient();
  
  const now = new Date().toISOString();
  
  let query = supabase
    .from('assignments')
    .select('*')
    .eq('school_id', schoolId)
    .eq('status', 'published')
    .eq('is_deleted', false)
    .lt('due_date', now);
  
  if (teacherId) {
    query = query.eq('teacher_id', teacherId);
  }
  
  const { data, error } = await query.order('due_date', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get overdue assignments: ${error.message}`);
  }
  
  return (data as Assignment[]) || [];
}

/**
 * Get draft assignments
 */
export async function getDraftAssignments(
  schoolId: string,
  teacherId: string
): Promise<Assignment[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('school_id', schoolId)
    .eq('teacher_id', teacherId)
    .eq('status', 'draft')
    .eq('is_deleted', false)
    .order('updated_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get draft assignments: ${error.message}`);
  }
  
  return (data as Assignment[]) || [];
}
