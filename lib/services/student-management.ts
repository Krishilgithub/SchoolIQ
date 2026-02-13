import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/database.types";

type Student = Database["public"]["Tables"]["students"]["Row"];
type StudentInsert = Database["public"]["Tables"]["students"]["Insert"];
type StudentUpdate = Database["public"]["Tables"]["students"]["Update"];
type Guardian = Database["public"]["Tables"]["guardians"]["Row"];
type GuardianInsert = Database["public"]["Tables"]["guardians"]["Insert"];
type StudentGuardian = Database["public"]["Tables"]["student_guardians"]["Row"];
type StudentGuardianInsert =
  Database["public"]["Tables"]["student_guardians"]["Insert"];

export interface StudentWithDetails extends Student {
  student_guardians?: (StudentGuardian & { guardians?: Guardian })[];
  current_enrollment?: any;
  class_name?: string;
  section_name?: string;
}

export interface StudentSearchFilters {
  searchQuery?: string;
  classId?: string;
  sectionId?: string;
  status?: string;
  gender?: string;
  admissionYear?: number;
  transportRequired?: boolean;
  page?: number;
  pageSize?: number;
}

export interface StudentSearchResult {
  students: StudentWithDetails[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Student Management Service
 * Handles all student CRUD operations, search, filters, and profile management
 */
export class StudentManagementService {
  /**
   * Get all active students for a school with filters and pagination
   */
  static async getStudents(
    schoolId: string,
    filters: StudentSearchFilters = {},
  ): Promise<StudentSearchResult> {
    const supabase = await createClient();

    const {
      searchQuery,
      classId,
      sectionId,
      status = "active",
      gender,
      admissionYear,
      transportRequired,
      page = 1,
      pageSize = 50,
    } = filters;

    // Build query
    let query = supabase
      .from("students")
      .select(
        `
        *,
        student_guardians!student_guardians_student_id_fkey(
          relationship,
          is_primary,
          is_emergency_contact,
          guardians(
            id,
            first_name,
            last_name,
            email,
            phone,
            address
          )
        ),
        enrollments!enrollments_student_id_fkey(
          id,
          academic_year_id,
          section_id,
          roll_number,
          status,
          sections(
            id,
            name,
            class_id,
            classes(id, name)
          )
        )
      `,
        { count: "exact" },
      )
      .eq("school_id", schoolId)
      .eq("is_active", true);

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }

    if (gender) {
      query = query.eq("gender", gender);
    }

    if (admissionYear) {
      const startDate = `${admissionYear}-01-01`;
      const endDate = `${admissionYear}-12-31`;
      query = query
        .gte("enrollment_date", startDate)
        .lte("enrollment_date", endDate);
    }

    // Search by name or admission number
    if (searchQuery) {
      query = query.or(
        `first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,admission_number.ilike.%${searchQuery}%`,
      );
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // Order by name
    query = query.order("first_name", { ascending: true });

    const { data, error, count } = await query;

    if (error) throw error;

    // Filter by class/section if needed (post-query filter)
    let students = data || [];

    if (classId || sectionId || transportRequired !== undefined) {
      students = students.filter((student) => {
        // Filter by class
        if (classId) {
          const currentEnrollment = student.enrollments?.find(
            (e: any) => e.status === "active",
          );
          if (
            !currentEnrollment ||
            currentEnrollment.sections?.class_id !== classId
          ) {
            return false;
          }
        }

        // Filter by section
        if (sectionId) {
          const currentEnrollment = student.enrollments?.find(
            (e: any) => e.status === "active",
          );
          if (
            !currentEnrollment ||
            currentEnrollment.section_id !== sectionId
          ) {
            return false;
          }
        }

        // Note: transport_required field doesn't exist in students table
        // Skip this filter for now

        return true;
      });
    }

    // Add class and section names to students
    const studentsWithDetails: StudentWithDetails[] = students.map(
      (student: any) => {
        const currentEnrollment = student.enrollments?.find(
          (e: any) => e.status === "active",
        );

        return {
          ...student,
          current_enrollment: currentEnrollment,
          class_name: currentEnrollment?.sections?.classes?.name,
          section_name: currentEnrollment?.sections?.name,
        };
      },
    );

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize);

    return {
      students: studentsWithDetails,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * Get a single student by ID with full details
   */
  static async getStudentById(
    studentId: string,
    schoolId: string,
  ): Promise<StudentWithDetails | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("students")
      .select(
        `
        *,
        student_guardians!student_guardians_student_id_fkey(
          id,
          relationship,
          is_primary,
          is_emergency_contact,
          guardians(
            id,
            first_name,
            last_name,
            email,
            phone,
            address
          )
        ),
        enrollments!enrollments_student_id_fkey(
          id,
          academic_year_id,
          section_id,
          roll_number,
          status,
          enrolled_at,
          sections(
            id,
            name,
            class_id,
            classes(id, name)
          ),
          academic_years(id, name, start_date, end_date)
        )
      `,
      )
      .eq("id", studentId)
      .eq("school_id", schoolId)
      .eq("is_active", true)
      .single();

    if (error) throw error;

    // Get current enrollment
    const currentEnrollment = data.enrollments?.find(
      (e: any) => e.status === "active",
    );

    return {
      ...data,
      current_enrollment: currentEnrollment,
      class_name: currentEnrollment?.sections?.classes?.name,
      section_name: currentEnrollment?.sections?.name,
    };
  }

  /**
   * Create a new student
   */
  static async createStudent(
    studentData: StudentInsert,
    guardianData?: (GuardianInsert & {
      relationship: string;
      is_primary?: boolean;
    })[],
  ): Promise<Student> {
    const supabase = await createClient();

    // Check for duplicate admission number
    const { data: existing } = await supabase
      .from("students")
      .select("id")
      .eq("school_id", studentData.school_id)
      .eq("admission_number", studentData.admission_number)
      .eq("is_active", true)
      .single();

    if (existing) {
      throw new Error("Admission number already exists for this school");
    }

    // Create student
    const { data: student, error: studentError } = await supabase
      .from("students")
      .insert(studentData)
      .select()
      .single();

    if (studentError) throw studentError;

    // Create guardians and link them if provided
    if (guardianData && guardianData.length > 0 && student) {
      for (const guardianInput of guardianData) {
        const { relationship, is_primary, ...guardianInfo } = guardianInput;

        // Create guardian
        const { data: guardian, error: guardianError } = await supabase
          .from("guardians")
          .insert({
            ...guardianInfo,
            school_id: studentData.school_id,
          })
          .select()
          .single();

        if (guardianError) throw guardianError;

        // Link to student
        const { error: linkError } = await supabase
          .from("student_guardians")
          .insert({
            student_id: student.id,
            guardian_id: guardian.id,
            relationship: relationship as any,
            is_primary: is_primary || false,
          });

        if (linkError) throw linkError;
      }
    }

    return student;
  }

  /**
   * Update a student
   */
  static async updateStudent(
    studentId: string,
    schoolId: string,
    studentData: StudentUpdate,
  ): Promise<Student> {
    const supabase = await createClient();

    // Get old data for audit
    const { data: oldStudent } = await supabase
      .from("students")
      .select("*")
      .eq("id", studentId)
      .eq("school_id", schoolId)
      .single();

    if (!oldStudent) {
      throw new Error("Student not found");
    }

    // Update student
    const { data: student, error: studentError } = await supabase
      .from("students")
      .update(studentData)
      .eq("id", studentId)
      .eq("school_id", schoolId)
      .select()
      .single();

    if (studentError) throw studentError;

    return student;
  }

  /**
   * Soft delete a student (mark as inactive)
   */
  static async deleteStudent(
    studentId: string,
    schoolId: string,
  ): Promise<void> {
    const supabase = await createClient();

    // Get student data for audit
    const { data: student } = await supabase
      .from("students")
      .select("*")
      .eq("id", studentId)
      .eq("school_id", schoolId)
      .single();

    if (!student) {
      throw new Error("Student not found");
    }

    // Mark as inactive
    const { error } = await supabase
      .from("students")
      .update({
        is_active: false,
      })
      .eq("id", studentId)
      .eq("school_id", schoolId);

    if (error) throw error;
  }

  /**
   * Restore a deleted student
   */
  static async restoreStudent(
    studentId: string,
    schoolId: string,
  ): Promise<Student> {
    const supabase = await createClient();

    const { data: student, error } = await supabase
      .from("students")
      .update({
        is_active: true,
      })
      .eq("id", studentId)
      .eq("school_id", schoolId)
      .select()
      .single();

    if (error) throw error;

    return student;
  }

  /**
   * Bulk promote students to next class
   */
  static async bulkPromote(
    studentIds: string[],
    schoolId: string,
    targetClassId: string,
    targetSectionId: string | null,
    academicYearId: string,
    promotedBy: string,
  ): Promise<{ success: number; failed: number; errors: any[] }> {
    const supabase = await createClient();
    const results = { success: 0, failed: 0, errors: [] as any[] };

    for (const studentId of studentIds) {
      try {
        // Close current enrollment
        await supabase
          .from("enrollments")
          .update({
            status: "graduated",
          })
          .eq("student_id", studentId)
          .eq("status", "active");

        // Create new enrollment
        await supabase.from("enrollments").insert({
          student_id: studentId,
          academic_year_id: academicYearId,
          section_id: targetSectionId!,
          status: "active",
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({ studentId, error });
      }
    }

    return results;
  }

  /**
   * Get student statistics for dashboard
   */
  static async getStudentStats(schoolId: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    newAdmissions: number;
    transferred: number;
  }> {
    const supabase = await createClient();

    const { count: total } = await supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("school_id", schoolId);

    const { count: active } = await supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .eq("is_active", true);

    const { count: inactive } = await supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .eq("is_active", false);

    // New admissions this year
    const currentYear = new Date().getFullYear();
    const { count: newAdmissions } = await supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .gte("enrollment_date", `${currentYear}-01-01`);

    const { count: transferred } = await supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .eq("is_active", false);

    return {
      total: total || 0,
      active: active || 0,
      inactive: inactive || 0,
      newAdmissions: newAdmissions || 0,
      transferred: transferred || 0,
    };
  }

  /**
   * Search students by various criteria
   */
  static async searchStudents(
    schoolId: string,
    searchTerm: string,
  ): Promise<StudentWithDetails[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("students")
      .select(
        `
        *,
        enrollments!enrollments_student_id_fkey(
          id,
          section_id,
          roll_number,
          status,
          sections(
            id,
            name,
            class_id,
            classes(id, name)
          )
        )
      `,
      )
      .eq("school_id", schoolId)
      .eq("is_active", true)
      .or(
        `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,admission_number.ilike.%${searchTerm}%`,
      )
      .limit(20);

    if (error) throw error;

    return data.map((student: any) => {
      const currentEnrollment = student.enrollments?.find(
        (e: any) => e.status === "active",
      );

      return {
        ...student,
        current_enrollment: currentEnrollment,
        class_name: currentEnrollment?.sections?.classes?.name,
        section_name: currentEnrollment?.sections?.name,
      };
    });
  }
}
