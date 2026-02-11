// Student Academic Service
// Handles student-specific academic operations

import { createClient } from "@/lib/supabase/server";

export interface ClassEnrollment {
  id: string;
  student_id: string;
  class_id: string;
  enrollment_date: string;
  status: "active" | "dropped" | "completed";
  academic_year: string;
  semester: string;
  created_at: string;
  updated_at: string;
}

export interface StudentClass {
  id: string;
  name: string;
  subject: string;
  teacher_name: string;
  teacher_id: string;
  grade_level: string;
  section: string;
  room_number?: string;
  schedule?: any[];
  enrollment_status: string;
  progress?: number;
}

export const studentAcademicService = {
  /**
   * Get all classes enrolled by a student
   */
  async getEnrolledClasses(studentId: string): Promise<StudentClass[]> {
    const supabase = await createClient();

    const { data: enrollments, error } = await supabase
      .from("class_enrollments")
      .select(
        `
        id,
        status,
        academic_year,
        semester,
        class:classes (
          id,
          class_name,
          subject,
          grade_level,
          section,
          room_number,
          teacher:profiles!classes_teacher_id_fkey (
            id,
            first_name,
            last_name
          )
        )
      `,
      )
      .eq("student_id", studentId)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(" Error fetching enrolled classes:", error);
      return [];
    }

    return (enrollments || []).map((enrollment: any) => ({
      id: enrollment.class.id,
      name: enrollment.class.class_name,
      subject: enrollment.class.subject,
      teacher_name: `${enrollment.class.teacher.first_name} ${enrollment.class.teacher.last_name}`,
      teacher_id: enrollment.class.teacher.id,
      grade_level: enrollment.class.grade_level,
      section: enrollment.class.section,
      room_number: enrollment.class.room_number,
      enrollment_status: enrollment.status,
    }));
  },

  /**
   * Get detailed information about a specific class
   */
  async getClassDetails(classId: string): Promise<any> {
    const supabase = await createClient();

    const { data: classData, error } = await supabase
      .from("classes")
      .select(
        `
        *,
        teacher:profiles!classes_teacher_id_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `,
      )
      .eq("id", classId)
      .single();

    if (error) {
      console.error("Error fetching class details:", error);
      return null;
    }

    return classData;
  },

  /**
   * Get student's schedule for the week
   */
  async getStudentSchedule(studentId: string): Promise<any[]> {
    const supabase = await createClient();

    // Get student's enrolled classes
    const { data: enrollments, error: enrollError } = await supabase
      .from("class_enrollments")
      .select("class_id")
      .eq("student_id", studentId)
      .eq("status", "active");

    if (enrollError || !enrollments) {
      console.error("Error fetching enrollments:", enrollError);
      return [];
    }

    const classIds = enrollments.map((e: any) => e.class_id);

    // Get schedule for these classes
    const { data: schedule, error: scheduleError } = await supabase
      .from("class_schedule")
      .select(
        `
        *,
        class:classes (
          class_name,
          subject
        ),
        teacher:profiles!class_schedule_teacher_id_fkey (
          first_name,
          last_name
        )
      `,
      )
      .in("class_id", classIds)
      .eq("is_active", true)
      .order("day_of_week")
      .order("start_time");

    if (scheduleError) {
      console.error("Error fetching schedule:", scheduleError);
      return [];
    }

    return schedule || [];
  },

  /**
   * Get student's overall progress across all classes
   */
  async getStudentProgress(studentId: string): Promise<any> {
    const supabase = await createClient();

    const { data: progress, error } = await supabase
      .from("student_progress")
      .select(
        `
        *,
        class:classes (
          class_name,
          subject
        )
      `,
      )
      .eq("student_id", studentId)
      .order("last_updated", { ascending: false });

    if (error) {
      console.error("Error fetching progress:", error);
      return [];
    }

    return progress || [];
  },

  /**
   * Enroll student in a class
   */
  async enrollInClass(
    studentId: string,
    classId: string,
    academicYear: string,
    semester: string,
  ): Promise<boolean> {
    const supabase = await createClient();

    const { error } = await supabase.from("class_enrollments").insert({
      student_id: studentId,
      class_id: classId,
      academic_year: academicYear,
      semester: semester,
      status: "active",
    });

    if (error) {
      console.error("Error enrolling in class:", error);
      return false;
    }

    return true;
  },

  /**
   * Drop a class
   */
  async dropClass(studentId: string, classId: string): Promise<boolean> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("class_enrollments")
      .update({ status: "dropped" })
      .eq("student_id", studentId)
      .eq("class_id", classId);

    if (error) {
      console.error("Error dropping class:", error);
      return false;
    }

    return true;
  },

  /**
   * Get class syllabus progress
   */
  async getClassSyllabusProgress(classId: string): Promise<any> {
    const supabase = await createClient();

    // This would typically fetch from a syllabus tracking table
    // For now, return mock structure
    return {
      classId,
      totalTopics: 0,
      completedTopics: 0,
      progress: 0,
      upcomingTopics: [],
    };
  },
};
