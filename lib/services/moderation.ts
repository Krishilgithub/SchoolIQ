import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

type ModerationRequest = Database['public']['Tables']['moderation_requests']['Row'];
type ModerationRequestInsert = Database['public']['Tables']['moderation_requests']['Insert'];
type ModerationRequestUpdate = Database['public']['Tables']['moderation_requests']['Update'];

export interface ModerationWithDetails extends ModerationRequest {
  exam_paper?: any;
  submitted_by_user?: any;
  moderator?: any;
}

/**
 * Moderation Service
 * Handles approval workflow for submitted marks
 */
export class ModerationService {
  /**
   * Get all moderation requests for a school
   */
  static async getModerationRequests(
    schoolId: string,
    status?: string
  ): Promise<ModerationWithDetails[]> {
    const supabase = await createClient();
    
    let query = supabase
      .from('moderation_requests')
      .select(`
        *,
        exam_paper:exam_papers!inner(
          *,
          exam:exam_master!inner(school_id),
          subject:subjects(*),
          class:classes(*),
          section:sections(*)
        ),
        submitted_by_user:profiles!moderation_requests_submitted_by_fkey(*),
        moderator:profiles!moderation_requests_moderator_id_fkey(*)
      `)
      .eq('exam_paper.exam.school_id', schoolId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('submitted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get pending moderation requests
   */
  static async getPendingRequests(schoolId: string): Promise<ModerationWithDetails[]> {
    return this.getModerationRequests(schoolId, 'pending');
  }

  /**
   * Get moderation request by ID
   */
  static async getModerationById(id: string): Promise<ModerationWithDetails | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('moderation_requests')
      .select(`
        *,
        exam_paper:exam_papers(
          *,
          exam:exam_master(*),
          subject:subjects(*),
          class:classes(*),
          section:sections(*)
        ),
        submitted_by_user:profiles!moderation_requests_submitted_by_fkey(*),
        moderator:profiles!moderation_requests_moderator_id_fkey(*)
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Assign moderator to request
   */
  static async assignModerator(requestId: string, moderatorId: string): Promise<ModerationRequest> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('moderation_requests')
      .update({
        moderator_id: moderatorId,
        status: 'in_review'
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Approve marks after moderation
   */
  static async approveMarks(
    requestId: string,
    moderatorId: string,
    comments?: string
  ): Promise<ModerationRequest> {
    const supabase = await createClient();

    // Get request details
    const { data: request } = await supabase
      .from('moderation_requests')
      .select('exam_paper_id')
      .eq('id', requestId)
      .single();

    if (!request) throw new Error('Moderation request not found');

    // Update all submitted marks to moderated status
    const { error: marksError } = await supabase
      .from('student_marks')
      .update({
        status: 'moderated',
        moderated_by: moderatorId,
        moderated_at: new Date().toISOString()
      })
      .eq('exam_paper_id', request.exam_paper_id)
      .eq('status', 'submitted');

    if (marksError) throw marksError;

    // Update moderation request
    const { data, error } = await supabase
      .from('moderation_requests')
      .update({
        status: 'approved',
        moderator_id: moderatorId,
        moderator_comments: comments,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Reject marks with feedback
   */
  static async rejectMarks(
    requestId: string,
    moderatorId: string,
    comments: string
  ): Promise<ModerationRequest> {
    const supabase = await createClient();

    // Get request details
    const { data: request } = await supabase
      .from('moderation_requests')
      .select('exam_paper_id, submitted_by')
      .eq('id', requestId)
      .single();

    if (!request) throw new Error('Moderation request not found');

    // Revert marks back to draft status
    const { error: marksError } = await supabase
      .from('student_marks')
      .update({ status: 'draft' })
      .eq('exam_paper_id', request.exam_paper_id)
      .eq('status', 'submitted');

    if (marksError) throw marksError;

    // Update moderation request
    const { data, error } = await supabase
      .from('moderation_requests')
      .update({
        status: 'rejected',
        moderator_id: moderatorId,
        moderator_comments: comments,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get moderation statistics for reporting
   */
  static async getModerationStats(schoolId: string, startDate?: string, endDate?: string) {
    const supabase = await createClient();

    let query = supabase
      .from('moderation_requests')
.select(`
        status,
        submitted_at,
        reviewed_at,
        exam_paper:exam_papers!inner(
          exam:exam_master!inner(school_id)
        )
      `)
      .eq('exam_paper.exam.school_id', schoolId);

    if (startDate) {
      query = query.gte('submitted_at', startDate);
    }

    if (endDate) {
      query = query.lte('submitted_at', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      pending: data?.filter(r => r.status === 'pending').length || 0,
      in_review: data?.filter(r => r.status === 'in_review').length || 0,
      approved: data?.filter(r => r.status === 'approved').length || 0,
      rejected: data?.filter(r => r.status === 'rejected').length || 0,
      avg_review_time_hours: this.calculateAvgReviewTime(data || [])
    };

    return stats;
  }

  private static calculateAvgReviewTime(requests: any[]): number {
    const reviewed = requests.filter(r => r.reviewed_at && r.submitted_at);
    
    if (reviewed.length === 0) return 0;

    const totalHours = reviewed.reduce((sum, r) => {
      const submitted = new Date(r.submitted_at);
      const reviewedDate = new Date(r.reviewed_at);
      const hours = (reviewedDate.getTime() - submitted.getTime()) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);

    return Math.round(totalHours / reviewed.length);
  }

  /**
   * Get moderator workload
   */
  static async getModeratorWorkload(moderatorId: string) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('moderation_requests')
      .select(`
        status,
        exam_paper:exam_papers(
          exam:exam_master(*),
          subject:subjects(*)
        )
      `)
      .eq('moderator_id', moderatorId)
      .in('status', ['pending', 'in_review']);

    if (error) throw error;

    return {
      pending: data?.filter(r => r.status === 'pending').length || 0,
      in_review: data?.filter(r => r.status === 'in_review').length || 0,
      total: data?.length || 0,
      requests: data || []
    };
  }

  /**
   * Auto-assign moderation based on workload
   */
  static async autoAssignModerator(requestId: string, schoolId: string): Promise<ModerationRequest> {
    const supabase = await createClient();

    // Get all moderators (teachers with specific permissions - simplified here)
    const { data: moderators } = await supabase
      .from('profiles')
      .select('id')
      .eq('school_id', schoolId)
      .in('role', ['teacher', 'school_admin'])
      .eq('is_suspended', false);

    if (!moderators || moderators.length === 0) {
      throw new Error('No moderators available');
    }

    // Get current workload for each moderator
    const workloads = await Promise.all(
      moderators.map(async (m) => {
        const { count } = await supabase
          .from('moderation_requests')
          .select('id', { count: 'exact', head: true })
          .eq('moderator_id', m.id)
          .in('status', ['pending', 'in_review']);

        return { moderator_id: m.id, workload: count || 0 };
      })
    );

    // Find moderator with lowest workload
    const assigned = workloads.sort((a, b) => a.workload - b.workload)[0];

    return this.assignModerator(requestId, assigned.moderator_id);
  }
}
