/**
 * Teacher Management Service
 *
 * Comprehensive service for teacher CRUD operations, search, filters,
 * workload management, and assignment tracking.
 */

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type Teacher = Database["public"]["Tables"]["teachers"]["Row"];
type TeacherInsert = Database["public"]["Tables"]["teachers"]["Insert"];
type TeacherUpdate = Database["public"]["Tables"]["teachers"]["Update"];

export interface TeacherFilters {
  search?: string; // Name or employee ID
  department?: string;
  status?: "active" | "on_leave" | "suspended" | "terminated";
  employmentType?: "full_time" | "part_time" | "contract" | "guest";
  workloadStatus?: "overloaded" | "optimal" | "available";
  subjectId?: string;
  classId?: string;
  minExperience?: number;
  maxExperience?: number;
  page?: number;
  limit?: number;
  sortBy?: "name" | "employee_id" | "workload" | "date_of_joining";
  sortOrder?: "asc" | "desc";
}

export interface TeacherWithDetails extends Teacher {
  assignments?: any[];
  subjects?: any[];
  classes?: any[];
  leave_balance?: any[];
  workload_summary?: any;
  profile?: any;
}

/**
 * Get teachers with advanced filtering and pagination
 */
export async function getTeachers(
  schoolId: string,
  filters: TeacherFilters = {},
) {
  const supabase = await createClient();

  const {
    search,
    department,
    status,
    employmentType,
    workloadStatus,
    subjectId,
    classId,
    minExperience,
    maxExperience,
    page = 1,
    limit = 50,
    sortBy = "name",
    sortOrder = "asc",
  } = filters;

  let query = supabase
    .from("teachers")
    .select(
      `
      *,
      profile:profiles!teachers_user_id_fkey(
        id,
        email,
        full_name
      ),
      assignments:teacher_assignments!teacher_assignments_teacher_id_fkey(
        id,
        assignment_type,
        workload_hours,
        subject:subjects(id, name),
        class:classes(id, name)
      )
    `,
      { count: "exact" },
    )
    .eq("school_id", schoolId)
    .eq("is_deleted", false);

  // Search filter (name or employee ID)
  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,employee_id.ilike.%${search}%`,
    );
  }

  // Department filter
  if (department) {
    query = query.eq("department", department);
  }

  // Status filter
  if (status) {
    query = query.eq("status", status);
  }

  // Employment type filter
  if (employmentType) {
    query = query.eq("employment_type", employmentType);
  }

  // Experience range filter
  if (minExperience !== undefined) {
    query = query.gte("experience_years", minExperience);
  }
  if (maxExperience !== undefined) {
    query = query.lte("experience_years", maxExperience);
  }

  // Workload status filter
  if (workloadStatus) {
    if (workloadStatus === "overloaded") {
      query = query.gt(
        "current_workload_hours",
        supabase.rpc("max_workload_hours"),
      );
    } else if (workloadStatus === "optimal") {
      // 80-100% of max workload
      query = query.gte(
        "current_workload_hours",
        supabase.rpc("max_workload_hours * 0.8"),
      );
      query = query.lte(
        "current_workload_hours",
        supabase.rpc("max_workload_hours"),
      );
    } else if (workloadStatus === "available") {
      query = query.lt(
        "current_workload_hours",
        supabase.rpc("max_workload_hours * 0.8"),
      );
    }
  }

  // Sorting
  const sortColumn = sortBy === "name" ? "first_name" : sortBy;
  query = query.order(sortColumn, { ascending: sortOrder === "asc" });

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data: teachers, error, count } = await query;

  if (error) throw error;

  // Filter by subject or class if needed (post-query filtering)
  let filteredTeachers = teachers || [];

  if (subjectId) {
    filteredTeachers = filteredTeachers.filter((t: any) =>
      t.assignments?.some((a: any) => a.subject?.id === subjectId),
    );
  }

  if (classId) {
    filteredTeachers = filteredTeachers.filter((t: any) =>
      t.assignments?.some((a: any) => a.class?.id === classId),
    );
  }

  return {
    teachers: filteredTeachers,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

/**
 * Get teacher by ID with complete details (360° view)
 */
export async function getTeacherById(teacherId: string, schoolId: string) {
  const supabase = await createClient();

  const { data: teacher, error } = await supabase
    .from("teachers")
    .select(
      `
      *,
      profile:profiles!teachers_user_id_fkey(
        id,
        email,
        full_name,
        phone
      ),
      assignments:teacher_assignments!teacher_assignments_teacher_id_fkey(
        *,
        subject:subjects(id, name, code),
        class:classes(id, name, grade_level),
        section:sections(id, name),
        academic_year:academic_years(id, name, is_active)
      ),
      leaves:teacher_leaves!teacher_leaves_teacher_id_fkey(
        *,
        substitute_teacher:teachers!teacher_leaves_substitute_teacher_id_fkey(
          id,
          first_name,
          last_name,
          employee_id
        )
      ),
      leave_balances:leave_balances!leave_balances_teacher_id_fkey(
        *,
        academic_year:academic_years(id, name)
      ),
      performance_reviews:performance_reviews!performance_reviews_teacher_id_fkey(
        *,
        reviewer:profiles!performance_reviews_reviewed_by_fkey(
          id,
          full_name
        ),
        academic_year:academic_years(id, name)
      ),
      timetable_slots:timetable_slots!timetable_slots_teacher_id_fkey(
        id,
        day_of_week,
        period_number,
        subject:subjects(id, name),
        class:classes(id, name),
        section:sections(id, name)
      )
    `,
    )
    .eq("id", teacherId)
    .eq("school_id", schoolId)
    .eq("is_deleted", false)
    .single();

  if (error) throw error;
  return teacher;
}

/**
 * Create new teacher with initial setup
 */
export async function createTeacher(
  teacherData: TeacherInsert,
  assignmentData?: Array<{
    subjectId: string;
    classId: string;
    sectionId?: string;
    weeklyPeriods: number;
    workloadHours: number;
  }>,
) {
  const supabase = await createClient();

  // Check for duplicate employee ID
  if (teacherData.employee_id) {
    const { data: existing } = await supabase
      .from("teachers")
      .select("id")
      .eq("school_id", teacherData.school_id)
      .eq("employee_id", teacherData.employee_id)
      .eq("is_deleted", false)
      .single();

    if (existing) {
      throw new Error("Employee ID already exists");
    }
  }

  // Create teacher
  const { data: teacher, error: teacherError } = await supabase
    .from("teachers")
    .insert({
      ...teacherData,
      status: teacherData.status || "active",
      current_workload_hours: 0,
      experience_years: teacherData.experience_years || 0,
    })
    .select()
    .single();

  if (teacherError) throw teacherError;

  // Initialize leave balances
  const { data: activeYear } = await supabase
    .from("academic_years")
    .select("id")
    .eq("school_id", teacherData.school_id)
    .eq("is_active", true)
    .single();

  if (activeYear) {
    await supabase.rpc("initialize_teacher_leave_balances", {
      p_school_id: teacherData.school_id,
      p_teacher_id: teacher.id,
      p_academic_year_id: activeYear.id,
    });
  }

  // Create initial assignments if provided
  if (assignmentData && assignmentData.length > 0 && activeYear) {
    const assignments = assignmentData.map((assignment) => ({
      school_id: teacherData.school_id,
      teacher_id: teacher.id,
      subject_id: assignment.subjectId,
      class_id: assignment.classId,
      section_id: assignment.sectionId || null,
      academic_year_id: activeYear.id,
      weekly_periods: assignment.weeklyPeriods,
      workload_hours: assignment.workloadHours,
      start_date: new Date().toISOString().split("T")[0],
      is_active: true,
    }));

    await supabase.from("teacher_assignments").insert(assignments);
  }

  return teacher;
}

/**
 * Update teacher information
 */
export async function updateTeacher(
  teacherId: string,
  schoolId: string,
  updates: TeacherUpdate,
) {
  const supabase = await createClient();

  // Check if employee_id is being changed and is unique
  if (updates.employee_id) {
    const { data: existing } = await supabase
      .from("teachers")
      .select("id")
      .eq("school_id", schoolId)
      .eq("employee_id", updates.employee_id)
      .neq("id", teacherId)
      .eq("is_deleted", false)
      .single();

    if (existing) {
      throw new Error("Employee ID already exists");
    }
  }

  const { data: teacher, error } = await supabase
    .from("teachers")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", teacherId)
    .eq("school_id", schoolId)
    .select()
    .single();

  if (error) throw error;
  return teacher;
}

/**
 * Soft delete teacher
 */
export async function deleteTeacher(teacherId: string, schoolId: string) {
  const supabase = await createClient();

  // Check if teacher has active assignments or leaves
  const { data: activeAssignments } = await supabase
    .from("teacher_assignments")
    .select("id")
    .eq("teacher_id", teacherId)
    .eq("is_active", true);

  if (activeAssignments && activeAssignments.length > 0) {
    throw new Error(
      "Cannot delete teacher with active assignments. Please deactivate assignments first.",
    );
  }

  const { data: activeLeaves } = await supabase
    .from("teacher_leaves")
    .select("id")
    .eq("teacher_id", teacherId)
    .eq("status", "pending");

  if (activeLeaves && activeLeaves.length > 0) {
    throw new Error(
      "Cannot delete teacher with pending leave requests. Please resolve leave requests first.",
    );
  }

  // Soft delete
  const { error } = await supabase
    .from("teachers")
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      status: "terminated",
    })
    .eq("id", teacherId)
    .eq("school_id", schoolId);

  if (error) throw error;

  return { success: true };
}

/**
 * Get teacher assignments
 */
export async function getTeacherAssignments(
  teacherId: string,
  schoolId: string,
  filters: {
    academicYearId?: string;
    isActive?: boolean;
    assignmentType?: string;
  } = {},
) {
  const supabase = await createClient();

  let query = supabase
    .from("teacher_assignments")
    .select(
      `
      *,
      subject:subjects(id, name, code),
      class:classes(id, name, grade_level),
      section:sections(id, name),
      academic_year:academic_years(id, name, is_active)
    `,
    )
    .eq("teacher_id", teacherId)
    .eq("school_id", schoolId);

  if (filters.academicYearId) {
    query = query.eq("academic_year_id", filters.academicYearId);
  }

  if (filters.isActive !== undefined) {
    query = query.eq("is_active", filters.isActive);
  }

  if (filters.assignmentType) {
    query = query.eq("assignment_type", filters.assignmentType);
  }

  query = query.order("created_at", { ascending: false });

  const { data: assignments, error } = await query;

  if (error) throw error;
  return assignments || [];
}

/**
 * Assign subject to teacher
 */
export async function assignSubjectToTeacher(
  teacherId: string,
  schoolId: string,
  assignmentData: {
    subjectId: string;
    classId: string;
    sectionId?: string;
    weeklyPeriods: number;
    workloadHours: number;
    assignmentType?: string;
    isPrimary?: boolean;
    startDate?: string;
    endDate?: string;
  },
) {
  const supabase = await createClient();

  // Get active academic year
  const { data: activeYear } = await supabase
    .from("academic_years")
    .select("id")
    .eq("school_id", schoolId)
    .eq("is_active", true)
    .single();

  if (!activeYear) {
    throw new Error("No active academic year found");
  }

  // Check if assignment already exists
  const { data: existing } = await supabase
    .from("teacher_assignments")
    .select("id")
    .eq("teacher_id", teacherId)
    .eq("subject_id", assignmentData.subjectId)
    .eq("class_id", assignmentData.classId)
    .eq("section_id", assignmentData.sectionId || null)
    .eq("academic_year_id", activeYear.id)
    .eq("is_active", true)
    .single();

  if (existing) {
    throw new Error("Teacher already assigned to this subject and class");
  }

  // Check workload limit
  const { data: teacher } = await supabase
    .from("teachers")
    .select("current_workload_hours, max_workload_hours")
    .eq("id", teacherId)
    .single();

  if (teacher) {
    const newWorkload =
      teacher.current_workload_hours + assignmentData.workloadHours;
    if (newWorkload > teacher.max_workload_hours) {
      throw new Error(
        `Assignment exceeds workload limit. Current: ${teacher.current_workload_hours}h, Max: ${teacher.max_workload_hours}h`,
      );
    }
  }

  const { data: assignment, error } = await supabase
    .from("teacher_assignments")
    .insert({
      school_id: schoolId,
      teacher_id: teacherId,
      subject_id: assignmentData.subjectId,
      class_id: assignmentData.classId,
      section_id: assignmentData.sectionId || null,
      academic_year_id: activeYear.id,
      assignment_type: assignmentData.assignmentType || "subject",
      is_primary: assignmentData.isPrimary ?? true,
      weekly_periods: assignmentData.weeklyPeriods,
      workload_hours: assignmentData.workloadHours,
      start_date:
        assignmentData.startDate || new Date().toISOString().split("T")[0],
      end_date: assignmentData.endDate || null,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return assignment;
}

/**
 * Remove assignment
 */
export async function removeAssignment(assignmentId: string, schoolId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("teacher_assignments")
    .update({
      is_active: false,
      end_date: new Date().toISOString().split("T")[0],
    })
    .eq("id", assignmentId)
    .eq("school_id", schoolId);

  if (error) throw error;
  return { success: true };
}

/**
 * Get teacher statistics
 */
export async function getTeacherStats(schoolId: string) {
  const supabase = await createClient();

  const { data: stats, error } = await supabase.rpc("get_teacher_stats", {
    p_school_id: schoolId,
  });

  if (error) {
    // Fallback to manual calculation
    const { count: total } = await supabase
      .from("teachers")
      .select("*", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .eq("is_deleted", false);

    const { count: active } = await supabase
      .from("teachers")
      .select("*", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .eq("status", "active")
      .eq("is_deleted", false);

    const { count: onLeave } = await supabase
      .from("teachers")
      .select("*", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .eq("status", "on_leave")
      .eq("is_deleted", false);

    return {
      total: total || 0,
      active: active || 0,
      on_leave: onLeave || 0,
      terminated: (total || 0) - (active || 0) - (onLeave || 0),
    };
  }

  return stats || {};
}

/**
 * Fast search teachers by name or employee ID
 */
export async function searchTeachers(schoolId: string, searchTerm: string) {
  const supabase = await createClient();

  const { data: teachers, error } = await supabase
    .from("teachers")
    .select(
      `
      id,
      employee_id,
      first_name,
      last_name,
      email,
      department,
      designation,
      status,
      current_workload_hours,
      max_workload_hours
    `,
    )
    .eq("school_id", schoolId)
    .eq("is_deleted", false)
    .or(
      `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,employee_id.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`,
    )
    .limit(10);

  if (error) throw error;
  return teachers || [];
}

/**
 * Get workload summary for a teacher
 */
export async function getTeacherWorkloadSummary(
  teacherId: string,
  schoolId: string,
) {
  const supabase = await createClient();

  const { data: workload, error } = await supabase
    .from("teacher_workload_summary")
    .select("*")
    .eq("teacher_id", teacherId)
    .eq("school_id", schoolId)
    .single();

  if (error) throw error;
  return workload;
}

/**
 * Get teachers available for assignment (not overloaded)
 */
export async function getAvailableTeachers(
  schoolId: string,
  subjectId?: string,
) {
  const supabase = await createClient();

  let query = supabase
    .from("teachers")
    .select(
      `
      id,
      employee_id,
      first_name,
      last_name,
      department,
      specialization,
      current_workload_hours,
      max_workload_hours,
      status,
      assignments:teacher_assignments!teacher_assignments_teacher_id_fkey(
        subject:subjects(id, name)
      )
    `,
    )
    .eq("school_id", schoolId)
    .eq("status", "active")
    .eq("is_deleted", false)
    .lt("current_workload_hours", supabase.rpc("max_workload_hours"))
    .order("current_workload_hours", { ascending: true });

  const { data: teachers, error } = await query;

  if (error) throw error;

  // Filter by subject expertise if provided
  if (subjectId) {
    return (teachers || []).filter((t: any) =>
      t.assignments?.some((a: any) => a.subject?.id === subjectId),
    );
  }

  return teachers || [];
}

/**
 * Bulk update teacher status (for mass operations)
 */
export async function bulkUpdateTeacherStatus(
  teacherIds: string[],
  schoolId: string,
  status: "active" | "on_leave" | "suspended" | "terminated",
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("teachers")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("school_id", schoolId)
    .in("id", teacherIds);

  if (error) throw error;
  return { success: true, updated: teacherIds.length };
}

/**
 * Get teacher history (audit trail)
 */
export async function getTeacherHistory(
  teacherId: string,
  schoolId: string,
  limit: number = 50,
) {
  const supabase = await createClient();

  const { data: history, error } = await supabase
    .from("teacher_history")
    .select(
      `
      *,
      changed_by_profile:profiles!teacher_history_changed_by_fkey(
        id,
        full_name,
        email
      )
    `,
    )
    .eq("teacher_id", teacherId)
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return history || [];
}
