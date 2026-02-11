import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

type StudentResult = Database['public']['Tables']['student_results']['Row'];
type StudentResultInsert = Database['public']['Tables']['student_results']['Insert'];
type ResultItem = Database['public']['Tables']['result_items']['Row'];
type StudentRanking = Database['public']['Tables']['student_rankings']['Row'];
type ResultAnalytics = Database['public']['Tables']['result_analytics']['Row'];

export interface ResultWithItems extends StudentResult {
  result_items?: ResultItem[];
  rankings?: StudentRanking[];
  student?: any;
  class?: any;
  section?: any;
}

export interface SubjectPerformance {
  subject_id: string;
  subject_name: string;
  marks_obtained: number;
  max_marks: number;
  percentage: number;
  grade: string;
  is_passed: boolean;
}

/**
 * Result Service
 * Manages result calculation, rankings, and analytics
 */
export class ResultService {
  /**
   * Calculate result for a student (uses database function)
   */
  static async calculateStudentResult(studentId: string, examId: string): Promise<string> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .rpc('calculate_student_result', {
        p_student_id: studentId,
        p_exam_id: examId
      });

    if (error) throw error;
    return data; // Returns result ID
  }

  /**
   * Calculate results for all students in an exam
   */
  static async calculateExamResults(examId: string): Promise<string[]> {
    const supabase = await createClient();

    // Get all students who have marks in this exam
    const { data: students } = await supabase
      .from('student_marks')
      .select('student_id')
      .in('exam_paper_id', 
        supabase.from('exam_papers').select('id').eq('exam_id', examId)
      )
      .eq('status', 'approved');

    if (!students) return [];

    const uniqueStudents = [...new Set(students.map(s => s.student_id))];

    // Calculate results for each student
    const resultIds = await Promise.all(
      uniqueStudents.map(studentId => 
        this.calculateStudentResult(studentId, examId)
      )
    );

    return resultIds;
  }

  /**
   * Get result by ID
   */
  static async getResultById(resultId: string): Promise<ResultWithItems | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('student_results')
      .select(`
        *,
        student:students(*),
        class:classes(*),
        section:sections(*),
        exam:exam_master(*),
        result_items:result_items(
          *,
          subject:subjects(*)
        ),
        rankings:student_rankings(*)
      `)
      .eq('id', resultId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Get student result for an exam
   */
  static async getStudentResult(studentId: string, examId: string): Promise<ResultWithItems | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('student_results')
      .select(`
        *,
        student:students(*),
        class:classes(*),
        section:sections(*),
        exam:exam_master(*),
        result_items:result_items(
          *,
          subject:subjects(*)
        ),
        rankings:student_rankings(*)
      `)
      .eq('student_id', studentId)
      .eq('exam_id', examId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Get results for a class/section
   */
  static async getClassResults(
    examId: string,
    classId: string,
    sectionId?: string
  ): Promise<ResultWithItems[]> {
    const supabase = await createClient();
    
    let query = supabase
      .from('student_results')
      .select(`
        *,
        student:students(*),
        result_items:result_items(
          *,
          subject:subjects(*)
        ),
        rankings:student_rankings(*)
      `)
      .eq('exam_id', examId)
      .eq('class_id', classId);

    if (sectionId) {
      query = query.eq('section_id', sectionId);
    }

    const { data, error } = await query.order('section_rank');

    if (error) throw error;
    return data || [];
  }

  /**
   * Calculate rankings for an exam
   */
  static async calculateRankings(
    examId: string,
    classId?: string,
    sectionId?: string
  ): Promise<void> {
    const supabase = await createClient();
    
    const { error } = await supabase
      .rpc('calculate_rankings', {
        p_exam_id: examId,
        p_class_id: classId || null,
        p_section_id: sectionId || null
      });

    if (error) throw error;
  }

  /**
   * Publish results (make visible to students/parents)
   */
  static async publishResults(
    examId: string,
    classId?: string,
    sectionId?: string,
    publishedBy?: string
  ): Promise<void> {
    const supabase = await createClient();

    // Update result status to published
    let query = supabase
      .from('student_results')
      .update({
        status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('exam_id', examId);

    if (classId) {
      query = query.eq('class_id', classId);
    }

    if (sectionId) {
      query = query.eq('section_id', sectionId);
    }

    const { error } = await query;

    if (error) throw error;

    // Create publication record
    await supabase
      .from('result_publications')
      .insert({
        exam_id: examId,
        class_id: classId || null,
        section_id: sectionId || null,
        publication_date: new Date().toISOString(),
        published_by: publishedBy || null,
        is_published: true,
        published_at: new Date().toISOString(),
        notify_students: true,
        notify_parents: true
      });
  }

  /**
   * Generate result analytics
   */
  static async generateAnalytics(examId: string): Promise<void> {
    const supabase = await createClient();
    
    const { error } = await supabase
      .rpc('generate_result_analytics', { p_exam_id: examId });

    if (error) throw error;
  }

  /**
   * Get analytics for an exam
   */
  static async getAnalytics(
    examId: string,
    analyticsType?: string
  ): Promise<ResultAnalytics[]> {
    const supabase = await createClient();
    
    let query = supabase
      .from('result_analytics')
      .select('*')
      .eq('exam_id', examId);

    if (analyticsType) {
      query = query.eq('analytics_type', analyticsType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * Get top performers
   */
  static async getTopPerformers(
    examId: string,
    classId?: string,
    sectionId?: string,
    limit: number = 10
  ): Promise<ResultWithItems[]> {
    const supabase = await createClient();
    
    let query = supabase
      .from('student_results')
      .select(`
        *,
        student:students(*),
        result_items:result_items(
          *,
          subject:subjects(*)
        )
      `)
      .eq('exam_id', examId)
      .eq('is_passed', true);

    if (classId) {
      query = query.eq('class_id', classId);
    }

    if (sectionId) {
      query = query.eq('section_id', sectionId);
    }

    const { data, error } = await query
      .order('overall_percentage', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get subject-wise performance for a student
   */
  static async getSubjectPerformance(
    studentId: string,
    examId: string
  ): Promise<SubjectPerformance[]> {
    const supabase = await createClient();
    
    const { data: result } = await supabase
      .from('student_results')
      .select('id')
      .eq('student_id', studentId)
      .eq('exam_id', examId)
      .single();

    if (!result) return [];

    const { data, error } = await supabase
      .from('result_items')
      .select(`
        *,
        subject:subjects(*)
      `)
      .eq('student_result_id', result.id);

    if (error) throw error;

    return (data || []).map(item => ({
      subject_id: item.subject_id,
      subject_name: item.subject?.name || '',
      marks_obtained: item.marks_obtained || 0,
      max_marks: item.max_marks || 0,
      percentage: item.percentage || 0,
      grade: item.grade || '',
      is_passed: item.is_passed || false
    }));
  }

  /**
   * Get performance comparison (student vs class average)
   */
  static async getPerformanceComparison(studentId: string, examId: string) {
    const supabase = await createClient();
    
    const { data: result } = await supabase
      .from('student_results')
      .select('id')
      .eq('student_id', studentId)
      .eq('exam_id', examId)
      .single();

    if (!result) return null;

    const { data, error } = await supabase
      .from('result_comparisons')
      .select(`
        *,
        subject:subjects(*)
      `)
      .eq('student_result_id', result.id);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get performance trends for a student
   */
  static async getPerformanceTrends(
    studentId: string,
    subjectId?: string,
    academicYearId?: string
  ) {
    const supabase = await createClient();
    
    let query = supabase
      .from('performance_trends')
      .select(`
        *,
        subject:subjects(*)
      `)
      .eq('student_id', studentId);

    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }

    if (academicYearId) {
      query = query.eq('academic_year_id', academicYearId);
    }

    const { data, error } = await query.order('exam_sequence');

    if (error) throw error;
    return data || [];
  }

  /**
   * Get pass/fail distribution
   */
  static async getPassFailDistribution(examId: string, classId?: string) {
    const supabase = await createClient();
    
    let query = supabase
      .from('student_results')
      .select('is_passed, overall_percentage')
      .eq('exam_id', examId);

    if (classId) {
      query = query.eq('class_id', classId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const passed = data?.filter(r => r.is_passed).length || 0;
    const failed = data?.filter(r => !r.is_passed).length || 0;
    const total = data?.length || 0;

    // Grade distribution
    const gradeRanges = {
      '90-100': 0,
      '80-89': 0,
      '70-79': 0,
      '60-69': 0,
      '50-59': 0,
      '40-49': 0,
      'Below 40': 0
    };

    data?.forEach(r => {
      const pct = r.overall_percentage || 0;
      if (pct >= 90) gradeRanges['90-100']++;
      else if (pct >= 80) gradeRanges['80-89']++;
      else if (pct >= 70) gradeRanges['70-79']++;
      else if (pct >= 60) gradeRanges['60-69']++;
      else if (pct >= 50) gradeRanges['50-59']++;
      else if (pct >= 40) gradeRanges['40-49']++;
      else gradeRanges['Below 40']++;
    });

    return {
      total,
      passed,
      failed,
      pass_percentage: total > 0 ? Math.round((passed / total) * 100) : 0,
      grade_distribution: gradeRanges
    };
  }
}
