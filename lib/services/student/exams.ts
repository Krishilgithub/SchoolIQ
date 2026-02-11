// Student Exam Service
// Handles exam scheduling, preparation, and results

import { createClient } from "@/lib/supabase/server";

export interface Exam {
  id: string;
  class_id: string;
  teacher_id: string;
  title: string;
  description?: string;
  exam_type: string;
  exam_date: string;
  duration_minutes: number;
  total_marks: number;
  passing_marks: number;
  syllabus?: string[];
  instructions?: string;
  room_number?: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  result?: ExamResult;
}

export interface ExamResult {
  id: string;
  exam_id: string;
  student_id: string;
  marks_obtained: number;
  grade?: string;
  rank?: number;
  percentage: number;
  remarks?: string;
  evaluated_at?: string;
}

export const studentExamService = {
  /**
   * Get all scheduled exams for a student
   */
  async getStudentExams(studentId: string): Promise<Exam[]> {
    const supabase = await createClient();

    // Get student's enrolled classes
    const { data: enrollments } = await supabase
      .from("class_enrollments")
      .select("class_id")
      .eq("student_id", studentId)
      .eq("status", "active");

    if (!enrollments || enrollments.length === 0) {
      return [];
    }

    const classIds = enrollments.map((e: any) => e.class_id);

    // Get exams
    const { data: exams, error } = await supabase
      .from("student_exams")
      .select(
        `
        *,
        class:classes (
          class_name,
          subject
        ),
        teacher:profiles!student_exams_teacher_id_fkey (
          first_name,
          last_name
        ),
        result:student_exam_results!student_exam_results_exam_id_fkey (
          id,
          marks_obtained,
          grade,
          rank,
          percentage,
          remarks,
          evaluated_at
        )
      `,
      )
      .in("class_id", classIds)
      .order("exam_date", { ascending: true });

    if (error) {
      console.error("Error fetching exams:", error);
      return [];
    }

    return exams || [];
  },

  /**
   * Get upcoming exams
   */
  async getUpcomingExams(studentId: string): Promise<Exam[]> {
    const exams = await this.getStudentExams(studentId);
    const now = new Date();

    return exams.filter((exam: any) => {
      const examDate = new Date(exam.exam_date);
      return exam.status === "scheduled" && examDate > now;
    });
  },

  /**
   * Get completed exams with results
   */
  async getCompletedExams(studentId: string): Promise<Exam[]> {
    const exams = await this.getStudentExams(studentId);

    return exams.filter(
      (exam: any) => exam.status === "completed" && exam.result?.length > 0,
    );
  },

  /**
   * Get exam by ID with details
   */
  async getExamById(examId: string): Promise<Exam | null> {
    const supabase = await createClient();

    const { data: exam, error } = await supabase
      .from("student_exams")
      .select(
        `
        *,
        class:classes (
          class_name,
          subject,
          teacher:profiles!classes_teacher_id_fkey (
            first_name,
            last_name,
            email
          )
        )
      `,
      )
      .eq("id", examId)
      .single();

    if (error) {
      console.error("Error fetching exam:", error);
      return null;
    }

    return exam;
  },

  /**
   * Get exam result for a student
   */
  async getExamResult(
    examId: string,
    studentId: string,
  ): Promise<ExamResult | null> {
    const supabase = await createClient();

    const { data: result, error } = await supabase
      .from("student_exam_results")
      .select("*")
      .eq("exam_id", examId)
      .eq("student_id", studentId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching exam result:", error);
    }

    return result || null;
  },

  /**
   * Calculate exam statistics for student
   */
  async getExamStats(studentId: string): Promise<any> {
    const exams = await this.getStudentExams(studentId);

    const stats = {
      total: exams.length,
      upcoming: 0,
      completed: 0,
      averageScore: 0,
      averagePercentage: 0,
      passed: 0,
      failed: 0,
      highestScore: 0,
      lowestScore: 100,
    };

    let totalPercentage = 0;
    let resultsCount = 0;

    exams.forEach((exam: any) => {
      if (exam.status === "scheduled") {
        stats.upcoming++;
      } else if (exam.status === "completed") {
        stats.completed++;

        const result = exam.result?.[0];
        if (result) {
          resultsCount++;
          totalPercentage += result.percentage;

          if (result.marks_obtained >= exam.passing_marks) {
            stats.passed++;
          } else {
            stats.failed++;
          }

          if (result.percentage > stats.highestScore) {
            stats.highestScore = result.percentage;
          }
          if (result.percentage < stats.lowestScore) {
            stats.lowestScore = result.percentage;
          }
        }
      }
    });

    stats.averagePercentage =
      resultsCount > 0 ? totalPercentage / resultsCount : 0;

    return stats;
  },

  /**
   * Get exam calendar (month view)
   */
  async getExamCalendar(
    studentId: string,
    year: number,
    month: number,
  ): Promise<any[]> {
    const exams = await this.getUpcomingExams(studentId);

    return exams.filter((exam: any) => {
      const examDate = new Date(exam.exam_date);
      return (
        examDate.getFullYear() === year && examDate.getMonth() + 1 === month
      );
    });
  },

  /**
   * Get exam preparation timeline
   */
  async getExamPreparationTimeline(examId: string): Promise<any> {
    const exam = await this.getExamById(examId);

    if (!exam) {
      return null;
    }

    const examDate = new Date(exam.exam_date);
    const now = new Date();
    const daysUntilExam = Math.ceil(
      (examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      examId: exam.id,
      examTitle: exam.title,
      examDate: exam.exam_date,
      daysRemaining: daysUntilExam,
      syllabus: exam.syllabus || [],
      totalTopics: exam.syllabus?.length || 0,
      completedTopics: 0, // Would track progress separately
      studyPlan: this.generateStudyPlan(daysUntilExam, exam.syllabus || []),
    };
  },

  /**
   * Generate study plan based on days until exam
   */
  generateStudyPlan(daysRemaining: number, syllabus: string[]): any[] {
    if (!syllabus || syllabus.length === 0 || daysRemaining <= 0) {
      return [];
    }

    const topicsPerDay = Math.ceil(syllabus.length / daysRemaining);
    const plan: any[] = [];

    for (let day = 0; day < daysRemaining; day++) {
      const startIndex = day * topicsPerDay;
      const endIndex = Math.min(startIndex + topicsPerDay, syllabus.length);
      const topics = syllabus.slice(startIndex, endIndex);

      if (topics.length > 0) {
        plan.push({
          day: day + 1,
          date: new Date(Date.now() + day * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          topics,
          status: "pending",
        });
      }
    }

    return plan;
  },

  /**
   * Get subject-wise exam performance
   */
  async getSubjectPerformance(studentId: string): Promise<any[]> {
    const exams = await this.getCompletedExams(studentId);

    const subjectMap: Record<string, any> = {};

    exams.forEach((exam: any) => {
      const subject = exam.class.subject;
      const result = exam.result?.[0];

      if (!result) return;

      if (!subjectMap[subject]) {
        subjectMap[subject] = {
          subject,
          examCount: 0,
          totalPercentage: 0,
          averagePercentage: 0,
          highestScore: 0,
          lowestScore: 100,
        };
      }

      subjectMap[subject].examCount++;
      subjectMap[subject].totalPercentage += result.percentage;
      subjectMap[subject].highestScore = Math.max(
        subjectMap[subject].highestScore,
        result.percentage,
      );
      subjectMap[subject].lowestScore = Math.min(
        subjectMap[subject].lowestScore,
        result.percentage,
      );
    });

    // Calculate averages
    Object.values(subjectMap).forEach((subject: any) => {
      subject.averagePercentage = subject.totalPercentage / subject.examCount;
    });

    return Object.values(subjectMap);
  },
};
