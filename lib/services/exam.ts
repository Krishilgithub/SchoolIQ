import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

type ExamMaster = Database['public']['Tables']['exam_master']['Row'];
type ExamMasterInsert = Database['public']['Tables']['exam_master']['Insert'];
type ExamMasterUpdate = Database['public']['Tables']['exam_master']['Update'];
type ExamPaper = Database['public']['Tables']['exam_papers']['Row'];
type ExamPaperInsert = Database['public']['Tables']['exam_papers']['Insert'];

export interface ExamWithPapers extends ExamMaster {
 papers?: ExamPaper[];
  exam_type?: any;
  grading_scheme?: any;
}

/**
 * Exam Service
 * Manages exam lifecycle from creation to result publication
 */
export class ExamService {
  /**
   * Get all exams for a school
   */
  static async getExams(schoolId: string, academicYearId?: string): Promise<ExamMaster[]> {
    const supabase = await createClient();
    
    let query = supabase
      .from('exam_master')
      .select(`
        *,
        exam_type:exam_types(*),
        grading_scheme:grading_schemes_new(*)
      `)
      .eq('school_id', schoolId)
      .order('start_date', { ascending: false });

    if (academicYearId) {
      query = query.eq('academic_year_id', academicYearId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  /**
   * Get exam by ID with full details
   */
  static async getExamById(id: string): Promise<ExamWithPapers | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('exam_master')
      .select(`
        *,
        exam_type:exam_types(*),
        grading_scheme:grading_schemes_new(*),
        papers:exam_papers(
          *,
          class:classes(*),
          section:sections(*),
          subject:subjects(*),
          invigilator:profiles(*),
          room:rooms(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Create new exam
   */
  static async createExam(exam: ExamMasterInsert): Promise<ExamMaster> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('exam_master')
      .insert(exam)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update exam (only allowed in draft status)
   */
  static async updateExam(id: string, updates: ExamMasterUpdate): Promise<ExamMaster> {
    const supabase = await createClient();

    // Check if exam is already published
    const { data: current } = await supabase
      .from('exam_master')
      .select('status, is_published')
      .eq('id', id)
      .single();

    if (current?.is_published) {
      throw new Error('Cannot modify published exam');
    }
    
    const { data, error } = await supabase
      .from('exam_master')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete exam (only drafts)
   */
  static async deleteExam(id: string): Promise<void> {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('exam_master')
      .delete()
      .eq('id', id)
      .eq('status', 'draft');

    if (error) throw error;
  }

  /**
   * Add paper to exam
   */
  static async addPaper(paper: ExamPaperInsert): Promise<ExamPaper> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('exam_papers')
      .insert(paper)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update exam paper
   */
  static async updatePaper(paperId: string, updates: Partial<ExamPaperInsert>): Promise<ExamPaper> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('exam_papers')
      .update(updates)
      .eq('id', paperId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete exam paper
   */
  static async deletePaper(paperId: string): Promise<void> {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('exam_papers')
      .delete()
      .eq('id', paperId);

    if (error) throw error;
  }

  /**
   * Get exam papers for a class/section
   */
  static async getPapersForClass(examId: string, classId: string, sectionId?: string): Promise<ExamPaper[]> {
    const supabase = await createClient();
    
    let query = supabase
      .from('exam_papers')
      .select(`
        *,
        subject:subjects(*),
        invigilator:profiles(*),
        room:rooms(*)
      `)
      .eq('exam_id', examId)
      .eq('class_id', classId);

    if (sectionId) {
      query = query.eq('section_id', sectionId);
    }

    const { data, error } = await query.order('exam_date').order('start_time');

    if (error) throw error;
    return data;
  }

  /**
   * Publish exam (make visible to students)
   */
  static async publishExam(examId: string, publishedBy: string): Promise<ExamMaster> {
    const supabase = await createClient();

    // Validate: must have at least one paper
    const { count } = await supabase
      .from('exam_papers')
      .select('id', { count: 'exact', head: true })
      .eq('exam_id', examId);

    if (!count || count === 0) {
      throw new Error('Cannot publish exam without papers');
    }
    
    const { data, error } = await supabase
      .from('exam_master')
      .update({
        is_published: true,
        published_at: new Date().toISOString(),
        published_by: publishedBy,
        status: 'scheduled'
      })
      .eq('id', examId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get exam timetable (all papers grouped by date)
   */
  static async getExamTimetable(examId: string) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('exam_papers')
      .select(`
        *,
        class:classes(*),
        section:sections(*),
        subject:subjects(*),
        invigilator:profiles(*),
        room:rooms(*)
      `)
      .eq('exam_id', examId)
      .order('exam_date')
      .order('start_time');

    if (error) throw error;

    // Group by date
    const groupedByDate: Record<string, ExamPaper[]> = {};
    data?.forEach(paper => {
      if (!groupedByDate[paper.exam_date]) {
        groupedByDate[paper.exam_date] = [];
      }
      groupedByDate[paper.exam_date].push(paper);
    });

    return groupedByDate;
  }

  /**
   * Check for scheduling conflicts
   */
  static async checkSchedulingConflicts(examId: string) {
    const supabase = await createClient();
    
    const { data: papers } = await supabase
      .from('exam_papers')
      .select('exam_date, start_time, end_time, room_id, invigilator_id, class_id, section_id')
      .eq('exam_id', examId);

    if (!papers) return [];

    const conflicts = [];

    for (let i = 0; i < papers.length; i++) {
      for (let j = i + 1; j < papers.length; j++) {
        const p1 = papers[i];
        const p2 = papers[j];

        // Same date check
        if (p1.exam_date === p2.exam_date) {
          // Time overlap check
          const p1Start = new Date(`${p1.exam_date}T${p1.start_time}`);
          const p1End = new Date(`${p1.exam_date}T${p1.end_time}`);
          const p2Start = new Date(`${p2.exam_date}T${p2.start_time}`);
          const p2End = new Date(`${p2.exam_date}T${p2.end_time}`);

          if (p1Start < p2End && p2Start < p1End) {
            // Room conflict
            if (p1.room_id === p2.room_id) {
              conflicts.push({
                type: 'room_clash',
                description: `Room double-booked on ${p1.exam_date} at ${p1.start_time}`
              });
            }

            // Invigilator conflict
            if (p1.invigilator_id === p2.invigilator_id) {
              conflicts.push({
                type: 'invigilator_clash',
                description: `Invigilator assigned to multiple papers on ${p1.exam_date} at ${p1.start_time}`
              });
            }

            // Student conflict (same class/section)
            if (p1.class_id === p2.class_id && p1.section_id === p2.section_id) {
              conflicts.push({
                type: 'student_clash',
                description: `Students have overlapping papers on ${p1.exam_date}`
              });
            }
          }
        }
      }
    }

    return conflicts;
  }

  /**
   * Get exam statistics
   */
  static async getExamStats(examId: string) {
    const supabase = await createClient();
    
    const [papersCount, marksCount, moderationCount] = await Promise.all([
      supabase.from('exam_papers').select('id', { count: 'exact', head: true }).eq('exam_id', examId),
      supabase.from('student_marks')
        .select('id, status', { count: 'exact' })
        .in('exam_paper_id', supabase.from('exam_papers').select('id').eq('exam_id', examId)),
      supabase.from('moderation_requests')
        .select('id, status', { count: 'exact' })
        .in('exam_paper_id', supabase.from('exam_papers').select('id').eq('exam_id', examId))
    ]);

    const marksData = marksCount.data || [];
    const moderationData = moderationCount.data || [];

    return {
      total_papers: papersCount.count || 0,
      marks_entered: marksData.filter((m: any) => m.status !== 'draft').length,
      marks_pending: marksData.filter((m: any) => m.status === 'draft').length,
      marks_moderated: marksData.filter((m: any) => m.status === 'approved').length,
      moderation_pending: moderationData.filter((m: any) => m.status === 'pending').length,
      moderation_approved: moderationData.filter((m: any) => m.status === 'approved').length
    };
  }
}
