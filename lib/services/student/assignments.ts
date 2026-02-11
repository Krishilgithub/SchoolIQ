// Student Assignment Service
// Handles assignment viewing, submission, and tracking

import { createClient } from "@/lib/supabase/server";

export interface Assignment {
  id: string;
  class_id: string;
  teacher_id: string;
  title: string;
  description?: string;
  assignment_type: string;
  total_points: number;
  due_date: string;
  assigned_date: string;
  instructions?: string;
  attachments?: any[];
  status: string;
  submission?: AssignmentSubmission;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  submission_date: string;
  status: "draft" | "submitted" | "late" | "graded" | "returned";
  content?: string;
  attachments?: any[];
  score?: number;
  feedback?: string;
  graded_at?: string;
}

export const studentAssignmentService = {
  /**
   * Get all assignments for a student across all enrolled classes
   */
  async getStudentAssignments(studentId: string): Promise<Assignment[]> {
    const supabase = await createClient();

    // Get student's class IDs
    const { data: enrollments } = await supabase
      .from("class_enrollments")
      .select("class_id")
      .eq("student_id", studentId)
      .eq("status", "active");

    if (!enrollments || enrollments.length === 0) {
      return [];
    }

    const classIds = enrollments.map((e: any) => e.class_id);

    // Get assignments
    const { data: assignments, error } = await supabase
      .from("student_assignments")
      .select(
        `
        *,
        class:classes (
          class_name,
          subject
        ),
        teacher:profiles!student_assignments_teacher_id_fkey (
          first_name,
          last_name
        ),
        submission:assignment_submissions!assignment_submissions_assignment_id_fkey (
          id,
          status,
          submission_date,
          score,
          feedback,
          content,
          attachments,
          graded_at
        )
      `,
      )
      .in("class_id", classIds)
      .in("status", ["active", "closed"])
      .order("due_date", { ascending: true });

    if (error) {
      console.error("Error fetching assignments:", error);
      return [];
    }

    return assignments || [];
  },

  /**
   * Get pending assignments (not submitted or in draft)
   */
  async getPendingAssignments(studentId: string): Promise<Assignment[]> {
    const assignments = await this.getStudentAssignments(studentId);
    const now = new Date();

    return assignments.filter((assignment: any) => {
      const dueDate = new Date(assignment.due_date);
      const submission = assignment.submission?.[0];

      // Include if no submission or submission is in draft
      const isPending =
        !submission ||
        submission.status === "draft" ||
        submission.status === "pending";

      // And due date hasn't passed (or allow_late_submission is true)
      const isNotOverdue = dueDate > now || assignment.allow_late_submission;

      return isPending && isNotOverdue;
    });
  },

  /**
   * Get assignment details by ID
   */
  async getAssignmentById(assignmentId: string): Promise<Assignment | null> {
    const supabase = await createClient();

    const { data: assignment, error } = await supabase
      .from("student_assignments")
      .select(
        `
        *,
        class:classes (
          class_name,
          subject
        ),
        teacher:profiles!student_assignments_teacher_id_fkey (
          first_name,
          last_name,
          email
        )
      `,
      )
      .eq("id", assignmentId)
      .single();

    if (error) {
      console.error("Error fetching assignment:", error);
      return null;
    }

    return assignment;
  },

  /**
   * Submit an assignment
   */
  async submitAssignment(
    assignmentId: string,
    studentId: string,
    content: string,
    attachments: any[] = [],
  ): Promise<boolean> {
    const supabase = await createClient();

    // Check if submission already exists
    const { data: existing } = await supabase
      .from("assignment_submissions")
      .select("id, resubmission_count")
      .eq("assignment_id", assignmentId)
      .eq("student_id", studentId)
      .single();

    if (existing) {
      // Update existing submission
      const { error } = await supabase
        .from("assignment_submissions")
        .update({
          content,
          attachments,
          status: "submitted",
          submission_date: new Date().toISOString(),
          resubmission_count: (existing.resubmission_count || 0) + 1,
        })
        .eq("id", existing.id);

      if (error) {
        console.error("Error updating submission:", error);
        return false;
      }
    } else {
      // Create new submission
      const { error } = await supabase.from("assignment_submissions").insert({
        assignment_id: assignmentId,
        student_id: studentId,
        content,
        attachments,
        status: "submitted",
        submission_date: new Date().toISOString(),
      });

      if (error) {
        console.error("Error creating submission:", error);
        return false;
      }
    }

    return true;
  },

  /**
   * Save assignment as draft
   */
  async saveDraft(
    assignmentId: string,
    studentId: string,
    content: string,
    attachments: any[] = [],
  ): Promise<boolean> {
    const supabase = await createClient();

    const { data: existing } = await supabase
      .from("assignment_submissions")
      .select("id")
      .eq("assignment_id", assignmentId)
      .eq("student_id", studentId)
      .single();

    if (existing) {
      // Update existing draft
      const { error } = await supabase
        .from("assignment_submissions")
        .update({
          content,
          attachments,
          status: "draft",
        })
        .eq("id", existing.id);

      return !error;
    } else {
      // Create new draft
      const { error } = await supabase.from("assignment_submissions").insert({
        assignment_id: assignmentId,
        student_id: studentId,
        content,
        attachments,
        status: "draft",
      });

      return !error;
    }
  },

  /**
   * Get submission status for an assignment
   */
  async getSubmissionStatus(
    assignmentId: string,
    studentId: string,
  ): Promise<AssignmentSubmission | null> {
    const supabase = await createClient();

    const { data: submission, error } = await supabase
      .from("assignment_submissions")
      .select("*")
      .eq("assignment_id", assignmentId)
      .eq("student_id", studentId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found" error
      console.error("Error fetching submission:", error);
    }

    return submission || null;
  },

  /**
   * Get graded assignments
   */
  async getGradedAssignments(studentId: string): Promise<Assignment[]> {
    const assignments = await this.getStudentAssignments(studentId);

    return assignments.filter(
      (assignment: any) =>
        assignment.submission?.[0]?.status === "graded" ||
        assignment.submission?.[0]?.status === "returned",
    );
  },

  /**
   * Calculate assignment statistics for student
   */
  async getAssignmentStats(studentId: string): Promise<any> {
    const assignments = await this.getStudentAssignments(studentId);

    const stats = {
      total: assignments.length,
      pending: 0,
      submitted: 0,
      graded: 0,
      late: 0,
      averageScore: 0,
      completionRate: 0,
    };

    let totalScore = 0;
    let gradedCount = 0;

    assignments.forEach((assignment: any) => {
      const submission = assignment.submission?.[0];

      if (!submission || submission.status === "draft") {
        stats.pending++;
      } else if (submission.status === "submitted") {
        stats.submitted++;
      } else if (
        submission.status === "graded" ||
        submission.status === "returned"
      ) {
        stats.graded++;
        if (submission.score !== null) {
          totalScore += (submission.score / assignment.total_points) * 100;
          gradedCount++;
        }
      } else if (submission.status === "late") {
        stats.late++;
      }
    });

    stats.averageScore = gradedCount > 0 ? totalScore / gradedCount : 0;
    stats.completionRate =
      stats.total > 0
        ? ((stats.submitted + stats.graded) / stats.total) * 100
        : 0;

    return stats;
  },
};
