import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/database.types";

type Enrollment = Database["public"]["Tables"]["enrollments"]["Row"];
type EnrollmentInsert = Database["public"]["Tables"]["enrollments"]["Insert"];
type EnrollmentUpdate = Database["public"]["Tables"]["enrollments"]["Update"];

export interface EnrollmentWithDetails extends Enrollment {
  student?: any;
  class?: any;
  section?: any;
  academic_year?: any;
}

export interface AdmissionData {
  // Student Data
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: string;
  admissionNumber: string;
  bloodGroup?: string;
  nationality?: string;
  religion?: string;
  motherTongue?: string;

  // Enrollment Data
  classId: string;
  sectionId?: string;
  academicYearId: string;
  rollNumber?: string;
  enrollmentDate?: string;

  // Profile Data
  fatherName?: string;
  fatherPhone?: string;
  fatherEmail?: string;
  motherName?: string;
  motherPhone?: string;
  motherEmail?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;

  // Address
  currentAddressLine1?: string;
  currentAddressLine2?: string;
  currentCity?: string;
  currentState?: string;
  currentCountry?: string;
  currentPostalCode?: string;

  // Previous School
  previousSchoolName?: string;
  previousSchoolAddress?: string;
  transferCertificateNumber?: string;
  tcDate?: string;

  // Other
  transportRequired?: boolean;
  hostelResident?: boolean;
  hasSpecialNeeds?: boolean;
  specialNeedsDescription?: string;

  // Metadata
  createdBy: string;
  schoolId: string;
}

export interface TransferData {
  studentId: string;
  schoolId: string;
  fromClassId?: string;
  toClassId: string;
  toSectionId?: string;
  academicYearId: string;
  transferDate: string;
  transferReason: string;
  rollNumber?: string;
  transferredBy: string;
}

/**
 * Enrollment Service
 * Handles student enrollment lifecycle: admission, promotion, transfer, withdrawal
 */
export class EnrollmentService {
  /**
   * Get all enrollments for a school with filters
   */
  static async getEnrollments(
    schoolId: string,
    academicYearId?: string,
    status?: string,
  ): Promise<EnrollmentWithDetails[]> {
    const supabase = await createClient();

    let query = supabase
      .from("enrollments")
      .select(
        `
        *,
        student:students(
          id,
          admission_number,
          first_name,
          last_name,
          date_of_birth,
          gender,
          status
        ),
        class:classes(id, name),
        section:sections(id, name),
        academic_year:academic_years(id, year_name, start_date, end_date)
      `,
      )
      .eq("school_id", schoolId)
      .eq("is_deleted", false)
      .order("enrollment_date", { ascending: false });

    if (academicYearId) {
      query = query.eq("academic_year_id", academicYearId);
    }

    if (status) {
      query = query.eq("enrollment_status", status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * Get enrollment by ID
   */
  static async getEnrollmentById(
    enrollmentId: string,
    schoolId: string,
  ): Promise<EnrollmentWithDetails | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("enrollments")
      .select(
        `
       enroll,
        student:students(*),
        class:classes(*),
        section:sections(*),
        academic_year:academic_years(*)
      `,
      )
      .eq("id", enrollmentId)
      .eq("school_id", schoolId)
      .eq("is_deleted", false)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get current enrollment for a student
   */
  static async getCurrentEnrollment(
    studentId: string,
    schoolId: string,
  ): Promise<EnrollmentWithDetails | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("enrollments")
      .select(
        `
        *,
        class:classes(*),
        section:sections(*),
        academic_year:academic_years(*)
      `,
      )
      .eq("student_id", studentId)
      .eq("school_id", schoolId)
      .eq("is_current", true)
      .eq("is_deleted", false)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }

    return data;
  }

  /**
   * Admit a new student (comprehensive admission process)
   */
  static async admitStudent(admissionData: AdmissionData): Promise<{
    student: any;
    enrollment: Enrollment;
    profile: any;
  }> {
    const supabase = await createClient();

    const {
      firstName,
      lastName,
      middleName,
      dateOfBirth,
      gender,
      admissionNumber,
      bloodGroup,
      nationality,
      religion,
      motherTongue,
      classId,
      sectionId,
      academicYearId,
      rollNumber,
      enrollmentDate,
      schoolId,
      createdBy,
      ...profileFields
    } = admissionData;

    // Check for duplicate admission number
    const { data: existing } = await supabase
      .from("students")
      .select("id")
      .eq("school_id", schoolId)
      .eq("admission_number", admissionNumber)
      .eq("is_deleted", false)
      .maybeSingle();

    if (existing) {
      throw new Error("Admission number already exists");
    }

    // Check for duplicate enrollment in same class/section
    if (rollNumber) {
      const { data: existingRoll } = await supabase
        .from("enrollments")
        .select("id")
        .eq("school_id", schoolId)
        .eq("class_id", classId)
        .eq("section_id", sectionId || null)
        .eq("academic_year_id", academicYearId)
        .eq("roll_number", rollNumber)
        .eq("is_deleted", false)
        .maybeSingle();

      if (existingRoll) {
        throw new Error("Roll number already exists in this class/section");
      }
    }

    // 1. Create student record
    const { data: student, error: studentError } = await supabase
      .from("students")
      .insert({
        school_id: schoolId,
        first_name: firstName,
        last_name: lastName,
        middle_name: middleName,
        date_of_birth: dateOfBirth,
        gender: gender,
        admission_number: admissionNumber,
        blood_group: bloodGroup,
        nationality: nationality,
        religion: religion,
        mother_tongue: motherTongue,
        enrollment_date: enrollmentDate || new Date().toISOString(),
        status: "active",
        is_active: true,
        created_by: createdBy,
      })
      .select()
      .single();

    if (studentError) throw studentError;

    // 2. Create enrollment record
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("enrollments")
      .insert({
        student_id: student.id,
        school_id: schoolId,
        academic_year_id: academicYearId,
        class_id: classId,
        section_id: sectionId,
        roll_number: rollNumber,
        enrollment_type: "new_admission",
        enrollment_status: "active",
        enrollment_date: enrollmentDate || new Date().toISOString(),
        is_current: true,
        created_by: createdBy,
      })
      .select()
      .single();

    if (enrollmentError) throw enrollmentError;

    // 3. Create student profile
    const { data: profile, error: profileError } = await supabase
      .from("student_profiles")
      .insert({
        student_id: student.id,
        school_id: schoolId,
        father_name: profileFields.fatherName,
        father_phone: profileFields.fatherPhone,
        father_email: profileFields.fatherEmail,
        mother_name: profileFields.motherName,
        mother_phone: profileFields.motherPhone,
        mother_email: profileFields.motherEmail,
        guardian_name: profileFields.guardianName,
        guardian_phone: profileFields.guardianPhone,
        guardian_email: profileFields.guardianEmail,
        current_address_line1: profileFields.currentAddressLine1,
        current_address_line2: profileFields.currentAddressLine2,
        current_city: profileFields.currentCity,
        current_state: profileFields.currentState,
        current_country: profileFields.currentCountry,
        current_postal_code: profileFields.currentPostalCode,
        previous_school_name: profileFields.previousSchoolName,
        previous_school_address: profileFields.previousSchoolAddress,
        transfer_certificate_number: profileFields.transferCertificateNumber,
        tc_date: profileFields.tcDate,
        transport_required: profileFields.transportRequired || false,
        hostel_resident: profileFields.hostelResident || false,
        has_special_needs: profileFields.hasSpecialNeeds || false,
        special_needs_description: profileFields.specialNeedsDescription,
        created_by: createdBy,
      })
      .select()
      .single();

    if (profileError) throw profileError;

    // 4. Create parent links if parent information provided
    const parentLinks = [];

    if (profileFields.fatherPhone || profileFields.fatherEmail) {
      parentLinks.push({
        student_id: student.id,
        school_id: schoolId,
        parent_name: profileFields.fatherName || "Father",
        parent_email: profileFields.fatherEmail,
        parent_phone: profileFields.fatherPhone,
        relation: "father",
        is_primary: true,
        created_by: createdBy,
      });
    }

    if (profileFields.motherPhone || profileFields.motherEmail) {
      parentLinks.push({
        student_id: student.id,
        school_id: schoolId,
        parent_name: profileFields.motherName || "Mother",
        parent_email: profileFields.motherEmail,
        parent_phone: profileFields.motherPhone,
        relation: "mother",
        is_primary: !parentLinks.length, // Primary if no father added
        created_by: createdBy,
      });
    }

    if (parentLinks.length > 0) {
      const { error: parentError } = await supabase
        .from("parent_links")
        .insert(parentLinks);

      if (parentError) console.error("Parent link error:", parentError);
    }

    // 5. Log to history
    await supabase.from("student_history").insert({
      student_id: student.id,
      school_id: schoolId,
      change_type: "enrolled",
      change_description: `Student admitted to ${classId}`,
      entity_type: "enrollments",
      entity_id: enrollment.id,
      new_data: enrollment,
      changed_by: createdBy,
    });

    return {
      student,
      enrollment,
      profile,
    };
  }

  /**
   * Promote student to next class
   */
  static async promoteStudent(
    studentId: string,
    schoolId: string,
    targetClassId: string,
    targetSectionId: string | null,
    targetAcademicYearId: string,
    rollNumber: string | null,
    promotedBy: string,
  ): Promise<Enrollment> {
    const supabase = await createClient();

    // Get current enrollment
    const currentEnrollment = await this.getCurrentEnrollment(
      studentId,
      schoolId,
    );

    if (!currentEnrollment) {
      throw new Error("No active enrollment found for student");
    }

    // Close current enrollment
    await supabase
      .from("enrollments")
      .update({
        is_current: false,
        enrollment_status: "promoted",
        exit_date: new Date().toISOString(),
        final_result: "promoted",
        updated_by: promotedBy,
      })
      .eq("id", currentEnrollment.id);

    // Create new enrollment
    const { data: newEnrollment, error } = await supabase
      .from("enrollments")
      .insert({
        student_id: studentId,
        school_id: schoolId,
        academic_year_id: targetAcademicYearId,
        class_id: targetClassId,
        section_id: targetSectionId,
        roll_number: rollNumber,
        enrollment_type: "promoted",
        enrollment_status: "active",
        enrollment_date: new Date().toISOString(),
        is_current: true,
        created_by: promotedBy,
      })
      .select()
      .single();

    if (error) throw error;

    // Log history
    await supabase.from("student_history").insert({
      student_id: studentId,
      school_id: schoolId,
      change_type: "promoted",
      change_description: `Student promoted to class ${targetClassId}`,
      entity_type: "enrollments",
      entity_id: newEnrollment.id,
      old_data: currentEnrollment,
      new_data: newEnrollment,
      changed_by: promotedBy,
    });

    return newEnrollment;
  }

  /**
   * Transfer student within school (class/section change)
   */
  static async transferStudent(
    transferData: TransferData,
  ): Promise<Enrollment> {
    const {
      studentId,
      schoolId,
      toClassId,
      toSectionId,
      academicYearId,
      transferDate,
      transferReason,
      rollNumber,
      transferredBy,
    } = transferData;

    const supabase = await createClient();

    // Get current enrollment
    const currentEnrollment = await this.getCurrentEnrollment(
      studentId,
      schoolId,
    );

    if (!currentEnrollment) {
      throw new Error("No active enrollment found for student");
    }

    // Close current enrollment
    await supabase
      .from("enrollments")
      .update({
        is_current: false,
        enrollment_status: "transferred_out",
        exit_date: transferDate,
        exit_reason: transferReason,
        updated_by: transferredBy,
      })
      .eq("id", currentEnrollment.id);

    // Create new enrollment
    const { data: newEnrollment, error } = await supabase
      .from("enrollments")
      .insert({
        student_id: studentId,
        school_id: schoolId,
        academic_year_id: academicYearId,
        class_id: toClassId,
        section_id: toSectionId,
        roll_number: rollNumber,
        enrollment_type: "transferred_in",
        enrollment_status: "active",
        enrollment_date: transferDate,
        is_current: true,
        created_by: transferredBy,
      })
      .select()
      .single();

    if (error) throw error;

    // Log history
    await supabase.from("student_history").insert({
      student_id: studentId,
      school_id: schoolId,
      change_type: "class_changed",
      change_description: `Student transferred from ${currentEnrollment.class_id} to ${toClassId}`,
      entity_type: "enrollments",
      entity_id: newEnrollment.id,
      old_data: currentEnrollment,
      new_data: newEnrollment,
      changed_by: transferredBy,
    });

    return newEnrollment;
  }

  /**
   * Withdraw a student (mark as inactive/transferred out)
   */
  static async withdrawStudent(
    studentId: string,
    schoolId: string,
    withdrawalReason: string,
    transferToSchool: string | null,
    leavingCertificateNumber: string | null,
    withdrawnBy: string,
  ): Promise<void> {
    const supabase = await createClient();

    // Get current enrollment
    const currentEnrollment = await this.getCurrentEnrollment(
      studentId,
      schoolId,
    );

    if (!currentEnrollment) {
      throw new Error("No active enrollment found for student");
    }

    // Close enrollment
    await supabase
      .from("enrollments")
      .update({
        is_current: false,
        enrollment_status: "withdrawn",
        exit_date: new Date().toISOString(),
        exit_reason: withdrawalReason,
        transfer_to_school: transferToSchool,
        leaving_certificate_number: leavingCertificateNumber,
        leaving_certificate_date: new Date().toISOString(),
        updated_by: withdrawnBy,
      })
      .eq("id", currentEnrollment.id);

    // Update student status
    await supabase
      .from("students")
      .update({
        status: transferToSchool ? "transferred_out" : "inactive",
        is_active: false,
        updated_by: withdrawnBy,
      })
      .eq("id", studentId)
      .eq("school_id", schoolId);

    // Log history
    await supabase.from("student_history").insert({
      student_id: studentId,
      school_id: schoolId,
      change_type: transferToSchool ? "transferred_out" : "withdrawn",
      change_description: `Student withdrawn. Reason: ${withdrawalReason}`,
      entity_type: "enrollments",
      entity_id: currentEnrollment.id,
      old_data: currentEnrollment,
      changed_by: withdrawnBy,
    });
  }

  /**
   * Get enrollment history for a student
   */
  static async getEnrollmentHistory(
    studentId: string,
    schoolId: string,
  ): Promise<EnrollmentWithDetails[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("enrollments")
      .select(
        `
        *,
        class:classes(id, name),
        section:sections(id, name),
        academic_year:academic_years(id, year_name, start_date, end_date)
      `,
      )
      .eq("student_id", studentId)
      .eq("school_id", schoolId)
      .eq("is_deleted", false)
      .order("enrollment_date", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get enrollment statistics
   */
  static async getEnrollmentStats(
    schoolId: string,
    academicYearId: string,
  ): Promise<{
    total: number;
    active: number;
    newAdmissions: number;
    promotions: number;
    transfers: number;
    withdrawals: number;
  }> {
    const supabase = await createClient();

    const { count: total } = await supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .eq("academic_year_id", academicYearId)
      .eq("is_deleted", false);

    const { count: active } = await supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .eq("academic_year_id", academicYearId)
      .eq("enrollment_status", "active")
      .eq("is_deleted", false);

    const { count: newAdmissions } = await supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .eq("academic_year_id", academicYearId)
      .eq("enrollment_type", "new_admission")
      .eq("is_deleted", false);

    const { count: promotions } = await supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .eq("academic_year_id", academicYearId)
      .eq("enrollment_type", "promoted")
      .eq("is_deleted", false);

    const { count: transfers } = await supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .eq("academic_year_id", academicYearId)
      .eq("enrollment_type", "transferred_in")
      .eq("is_deleted", false);

    const { count: withdrawals } = await supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .eq("academic_year_id", academicYearId)
      .eq("enrollment_status", "withdrawn")
      .eq("is_deleted", false);

    return {
      total: total || 0,
      active: active || 0,
      newAdmissions: newAdmissions || 0,
      promotions: promotions || 0,
      transfers: transfers || 0,
      withdrawals: withdrawals || 0,
    };
  }
}
