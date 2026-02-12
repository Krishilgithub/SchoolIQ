import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/database.types";

type StudentMark = Database["public"]["Tables"]["student_marks"]["Row"];
type StudentMarkInsert =
  Database["public"]["Tables"]["student_marks"]["Insert"];
type StudentMarkUpdate =
  Database["public"]["Tables"]["student_marks"]["Update"];
type MarksHistory = Database["public"]["Tables"]["marks_history"]["Row"];

export interface MarksWithDetails extends StudentMark {
  student?: any;
  exam_paper?: any;
  entered_by_user?: any;
}

export interface ClassStatistics {
  total_students: number;
  appeared: number;
  absent: number;
  passed: number;
  failed: number;
  highest_marks: number;
  lowest_marks: number;
  average_marks: number;
  pass_percentage: number;
}

/**
 * Marks Service
 * Handles marks entry, validation, and management
 */
export class MarksService {
  /**
   * Get marks for an exam paper
   */
  static async getMarksForPaper(
    examPaperId: string,
  ): Promise<MarksWithDetails[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("student_marks")
      .select(
        `
        *,
        student:students(*),
        exam_paper:exam_papers(
          *,
          subject:subjects(*),
          class:classes(*),
          section:sections(*)
        ),
        entered_by_user:profiles!student_marks_entered_by_fkey(*)
      `,
      )
      .eq("exam_paper_id", examPaperId)
      .order("student.admission_number");

    if (error) throw error;
    return data || [];
  }

  /**
   * Get marks for a student in an exam
   */
  static async getStudentMarks(
    studentId: string,
    examId: string,
  ): Promise<MarksWithDetails[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("student_marks")
      .select(
        `
        *,
        exam_paper:exam_papers!inner(
          *,
          subject:subjects(*)
        )
      `,
      )
      .eq("student_id", studentId)
      .eq("exam_paper.exam_id", examId);

    if (error) throw error;
    return data || [];
  }

  /**
   * Enter/Update marks for a student
   */
  static async enterMarks(marks: StudentMarkInsert): Promise<StudentMark> {
    const supabase = await createClient();

    // Check if marks already exist
    const { data: existing } = await supabase
      .from("student_marks")
      .select("id, status")
      .eq("student_id", marks.student_id)
      .eq("exam_paper_id", marks.exam_paper_id)
      .single();

    if (existing) {
      // Update existing marks (only if not published)
      if (existing.status === "published") {
        throw new Error("Cannot modify published marks");
      }

      const { data, error } = await supabase
        .from("student_marks")
        .update({
          marks_obtained: marks.marks_obtained,
          grace_marks: marks.grace_marks,
          is_absent: marks.is_absent,
          is_grace_marks: marks.is_grace_marks,
          remarks: marks.remarks,
          status: marks.status || "draft",
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Insert new marks
      const { data, error } = await supabase
        .from("student_marks")
        .insert(marks)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  /**
   * Bulk marks entry (for spreadsheet-like entry)
   */
  static async bulkEnterMarks(
    marks: StudentMarkInsert[],
  ): Promise<StudentMark[]> {
    const supabase = await createClient();

    // Process in batches
    const batchSize = 50;
    const results: StudentMark[] = [];

    for (let i = 0; i < marks.length; i += batchSize) {
      const batch = marks.slice(i, i + batchSize);

      const { data, error } = await supabase
        .from("student_marks")
        .upsert(batch, {
          onConflict: "student_id,exam_paper_id",
        })
        .select();

      if (error) throw error;
      if (data) results.push(...data);
    }

    return results;
  }

  /**
   * Mark student as absent
   */
  static async markAbsent(
    studentId: string,
    examPaperId: string,
    enteredBy: string,
  ): Promise<StudentMark> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("student_marks")
      .upsert(
        {
          student_id: studentId,
          exam_paper_id: examPaperId,
          is_absent: true,
          marks_obtained: 0,
          max_marks: await this.getMaxMarks(examPaperId),
          entered_by: enteredBy,
          status: "draft",
        },
        {
          onConflict: "student_id,exam_paper_id",
        },
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get max marks for a paper
   */
  private static async getMaxMarks(examPaperId: string): Promise<number> {
    const supabase = await createClient();

    const { data } = await supabase
      .from("exam_papers")
      .select("max_marks")
      .eq("id", examPaperId)
      .single();

    return data?.max_marks || 100;
  }

  /**
   * Submit marks for moderation
   */
  static async submitForModeration(
    examPaperId: string,
    submittedBy: string,
  ): Promise<void> {
    const supabase = await createClient();

    // Change all draft marks to submitted
    const { error: marksError } = await supabase
      .from("student_marks")
      .update({ status: "submitted" })
      .eq("exam_paper_id", examPaperId)
      .eq("status", "draft");

    if (marksError) throw marksError;

    // Create moderation request
    const { count } = await supabase
      .from("student_marks")
      .select("id", { count: "exact", head: true })
      .eq("exam_paper_id", examPaperId)
      .eq("status", "submitted");

    const { error: modError } = await supabase
      .from("moderation_requests")
      .insert({
        exam_paper_id: examPaperId,
        submitted_by: submittedBy,
        status: "pending",
        submitted_at: new Date().toISOString(),
        marks_entered: count || 0,
        total_students: count || 0,
      });

    if (modError) throw modError;
  }

  /**
   * Get marks history for audit
   */
  static async getMarksHistory(studentMarkId: string): Promise<MarksHistory[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("marks_history")
      .select(
        `
        *,
        changed_by_user:profiles!marks_history_changed_by_fkey(*),
        approved_by_user:profiles!marks_history_approved_by_fkey(*)
      `,
      )
      .eq("student_mark_id", studentMarkId)
      .order("changed_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get class statistics using database function
   */
  static async getClassStatistics(
    examPaperId: string,
  ): Promise<ClassStatistics> {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("calculate_class_statistics", {
      p_exam_paper_id: examPaperId,
    });

    if (error) throw error;
    return (
      data?.[0] || {
        total_students: 0,
        appeared: 0,
        absent: 0,
        passed: 0,
        failed: 0,
        highest_marks: 0,
        lowest_marks: 0,
        average_marks: 0,
        pass_percentage: 0,
      }
    );
  }

  /**
   * Validate marks before submission
   */
  static async validateMarks(
    examPaperId: string,
  ): Promise<{ valid: boolean; errors: string[] }> {
    const supabase = await createClient();

    const errors: string[] = [];

    // Get exam paper details
    const { data: paper } = await supabase
      .from("exam_papers")
      .select("max_marks, passing_marks, class_id, section_id")
      .eq("id", examPaperId)
      .single();

    if (!paper) {
      return { valid: false, errors: ["Exam paper not found"] };
    }

    // Get all students in the class/section
    const { data: enrollments } = await supabase
      .from("class_enrollments")
      .select("student_id")
      .eq("class_id", paper.class_id)
      .eq("section_id", paper.section_id)
      .eq("status", "active");

    const totalStudents = enrollments?.length || 0;

    // Get entered marks
    const { data: marks } = await supabase
      .from("student_marks")
      .select("id, student_id, marks_obtained, is_absent")
      .eq("exam_paper_id", examPaperId);

    const marksEntered = marks?.length || 0;

    if (marksEntered < totalStudents) {
      errors.push(
        `Only ${marksEntered} out of ${totalStudents} students have marks entered`,
      );
    }

    // Check for invalid marks
    marks?.forEach((m) => {
      if (!m.is_absent && m.marks_obtained !== null) {
        if (m.marks_obtained < 0 || m.marks_obtained > paper.max_marks) {
          errors.push(
            `Invalid marks for student: ${m.marks_obtained} (must be 0-${paper.max_marks})`,
          );
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get marks entry progress
   */
  static async getEntryProgress(examPaperId: string) {
    const supabase = await createClient();

    const { data: paper } = await supabase
      .from("exam_papers")
      .select("class_id, section_id")
      .eq("id", examPaperId)
      .single();

    if (!paper) return { total: 0, entered: 0, percentage: 0 };

    const { count: total } = await supabase
      .from("class_enrollments")
      .select("id", { count: "exact", head: true })
      .eq("class_id", paper.class_id)
      .eq("section_id", paper.section_id)
      .eq("status", "active");

    const { count: entered } = await supabase
      .from("student_marks")
      .select("id", { count: "exact", head: true })
      .eq("exam_paper_id", examPaperId);

    const percentage =
      total && entered ? Math.round((entered / total) * 100) : 0;

    return {
      total: total || 0,
      entered: entered || 0,
      percentage,
    };
  }
}
