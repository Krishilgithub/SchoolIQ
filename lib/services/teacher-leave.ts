/**
 * Teacher Leave Management Service
 *
 * Handles leave requests, approvals, conflict detection, substitute assignment,
 * and leave balance tracking with workflow automation.
 */

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type TeacherLeave = Database["public"]["Tables"]["teacher_leaves"]["Row"];
type TeacherLeaveInsert =
  Database["public"]["Tables"]["teacher_leaves"]["Insert"];
type TeacherLeaveUpdate =
  Database["public"]["Tables"]["teacher_leaves"]["Update"];
type LeaveBalance = Database["public"]["Tables"]["leave_balances"]["Row"];

export interface LeaveFilters {
  teacherId?: string;
  status?: "pending" | "approved" | "rejected" | "cancelled";
  leaveType?: string;
  startDate?: string;
  endDate?: string;
  hasConflicts?: boolean;
  page?: number;
  limit?: number;
}

export interface LeaveRequestData {
  teacherId: string;
  leaveType:
    | "sick"
    | "casual"
    | "earned"
    | "maternity"
    | "paternity"
    | "unpaid"
    | "compensatory";
  startDate: string;
  endDate: string;
  isHalfDay?: boolean;
  halfDayPeriod?: "morning" | "afternoon";
  reason: string;
  attachments?: any[];
}

export interface LeaveApprovalData {
  leaveId: string;
  reviewerId: string;
  status: "approved" | "rejected";
  approvalNotes?: string;
  substituteTeacherId?: string;
  substituteNotes?: string;
}

/**
 * Get leaves with filtering
 */
export async function getLeaves(schoolId: string, filters: LeaveFilters = {}) {
  const supabase = await createClient();

  const {
    teacherId,
    status,
    leaveType,
    startDate,
    endDate,
    hasConflicts,
    page = 1,
    limit = 50,
  } = filters;

  let query = supabase
    .from("teacher_leaves")
    .select(
      `
      *,
      teacher:teachers!teacher_leaves_teacher_id_fkey(
        id,
        employee_id,
        first_name,
        last_name,
        email,
        department
      ),
      substitute_teacher:teachers!teacher_leaves_substitute_teacher_id_fkey(
        id,
        employee_id,
        first_name,
        last_name
      ),
      reviewer:profiles!teacher_leaves_reviewed_by_fkey(
        id,
        full_name
      )
    `,
      { count: "exact" },
    )
    .eq("school_id", schoolId);

  // Filters
  if (teacherId) query = query.eq("teacher_id", teacherId);
  if (status) query = query.eq("status", status);
  if (leaveType) query = query.eq("leave_type", leaveType);
  if (startDate) query = query.gte("start_date", startDate);
  if (endDate) query = query.lte("end_date", endDate);
  if (hasConflicts !== undefined)
    query = query.eq("has_conflicts", hasConflicts);

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.order("requested_at", { ascending: false }).range(from, to);

  const { data: leaves, error, count } = await query;

  if (error) throw error;

  return {
    leaves: leaves || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

/**
 * Get leave by ID
 */
export async function getLeaveById(leaveId: string, schoolId: string) {
  const supabase = await createClient();

  const { data: leave, error } = await supabase
    .from("teacher_leaves")
    .select(
      `
      *,
      teacher:teachers!teacher_leaves_teacher_id_fkey(
        id,
        employee_id,
        first_name,
        last_name,
        email,
        phone,
        department,
        designation
      ),
      substitute_teacher:teachers!teacher_leaves_substitute_teacher_id_fkey(
        id,
        employee_id,
        first_name,
        last_name,
        email,
        phone
      ),
      reviewer:profiles!teacher_leaves_reviewed_by_fkey(
        id,
        full_name,
        email
      ),
      substitute_assigned_by_profile:profiles!teacher_leaves_substitute_assigned_by_fkey(
        id,
        full_name
      )
    `,
    )
    .eq("id", leaveId)
    .eq("school_id", schoolId)
    .single();

  if (error) throw error;
  return leave;
}

/**
 * Request leave
 */
export async function requestLeave(
  schoolId: string,
  requestData: LeaveRequestData,
) {
  const supabase = await createClient();

  const {
    teacherId,
    leaveType,
    startDate,
    endDate,
    isHalfDay,
    halfDayPeriod,
    reason,
    attachments,
  } = requestData;

  // Calculate total days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  let totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  if (isHalfDay) {
    totalDays = 0.5;
  }

  // Check leave balance
  const { data: activeYear } = await supabase
    .from("academic_years")
    .select("id")
    .eq("school_id", schoolId)
    .eq("is_active", true)
    .single();

  if (activeYear) {
    const { data: balance } = await supabase
      .from("leave_balances")
      .select("available")
      .eq("teacher_id", teacherId)
      .eq("academic_year_id", activeYear.id)
      .eq("leave_type", leaveType)
      .single();

    if (balance && balance.available < totalDays) {
      throw new Error(
        `Insufficient leave balance. Available: ${balance.available} days, Requested: ${totalDays} days`,
      );
    }
  }

  // Detect conflicts
  const conflicts = await detectLeaveConflicts(teacherId, startDate, endDate);

  // Create leave request
  const { data: leave, error } = await supabase
    .from("teacher_leaves")
    .insert({
      school_id: schoolId,
      teacher_id: teacherId,
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      total_days: totalDays,
      is_half_day: isHalfDay || false,
      half_day_period: halfDayPeriod || null,
      reason,
      attachments: attachments || [],
      status: "pending",
      has_conflicts: conflicts.length > 0,
      conflict_details: conflicts,
    })
    .select()
    .single();

  if (error) throw error;

  return leave;
}

/**
 * Approve or reject leave
 */
export async function reviewLeave(
  schoolId: string,
  approvalData: LeaveApprovalData,
) {
  const supabase = await createClient();

  const {
    leaveId,
    reviewerId,
    status,
    approvalNotes,
    substituteTeacherId,
    substituteNotes,
  } = approvalData;

  // Get leave details
  const { data: leave } = await supabase
    .from("teacher_leaves")
    .select("*")
    .eq("id", leaveId)
    .single();

  if (!leave) {
    throw new Error("Leave not found");
  }

  if (leave.status !== "pending") {
    throw new Error(`Leave already ${leave.status}`);
  }

  const updateData: any = {
    status,
    reviewed_by: reviewerId,
    reviewed_at: new Date().toISOString(),
    approval_notes: approvalNotes || null,
  };

  // If approved and substitute provided
  if (status === "approved" && substituteTeacherId) {
    updateData.substitute_teacher_id = substituteTeacherId;
    updateData.substitute_assigned_by = reviewerId;
    updateData.substitute_assigned_at = new Date().toISOString();
    updateData.substitute_notes = substituteNotes || null;
  }

  const { data: updatedLeave, error } = await supabase
    .from("teacher_leaves")
    .update(updateData)
    .eq("id", leaveId)
    .eq("school_id", schoolId)
    .select()
    .single();

  if (error) throw error;

  return updatedLeave;
}

/**
 * Assign substitute teacher to leave
 */
export async function assignSubstitute(
  leaveId: string,
  schoolId: string,
  substituteTeacherId: string,
  assignedBy: string,
  notes?: string,
) {
  const supabase = await createClient();

  // Check if substitute is available
  const { data: leave } = await supabase
    .from("teacher_leaves")
    .select("start_date, end_date")
    .eq("id", leaveId)
    .single();

  if (!leave) throw new Error("Leave not found");

  // Check for substitute's own leaves
  const { data: substituteLeaves } = await supabase
    .from("teacher_leaves")
    .select("id")
    .eq("teacher_id", substituteTeacherId)
    .eq("status", "approved")
    .lte("start_date", leave.end_date)
    .gte("end_date", leave.start_date);

  if (substituteLeaves && substituteLeaves.length > 0) {
    throw new Error("Substitute teacher has overlapping leave");
  }

  const { data: updatedLeave, error } = await supabase
    .from("teacher_leaves")
    .update({
      substitute_teacher_id: substituteTeacherId,
      substitute_assigned_by: assignedBy,
      substitute_assigned_at: new Date().toISOString(),
      substitute_notes: notes || null,
    })
    .eq("id", leaveId)
    .eq("school_id", schoolId)
    .select()
    .single();

  if (error) throw error;
  return updatedLeave;
}

/**
 * Cancel leave
 */
export async function cancelLeave(leaveId: string, schoolId: string) {
  const supabase = await createClient();

  const { data: leave } = await supabase
    .from("teacher_leaves")
    .select("status, start_date")
    .eq("id", leaveId)
    .single();

  if (!leave) throw new Error("Leave not found");

  if (leave.status === "rejected") {
    throw new Error("Cannot cancel already rejected leave");
  }

  const today = new Date().toISOString().split("T")[0];
  if (leave.start_date < today) {
    throw new Error("Cannot cancel leave that has already started");
  }

  const { error } = await supabase
    .from("teacher_leaves")
    .update({ status: "cancelled" })
    .eq("id", leaveId)
    .eq("school_id", schoolId);

  if (error) throw error;

  return { success: true };
}

/**
 * Detect leave conflicts (timetable, exams, etc.)
 */
export async function detectLeaveConflicts(
  teacherId: string,
  startDate: string,
  endDate: string,
) {
  const supabase = await createClient();

  const conflicts: any[] = [];

  // Check timetable conflicts
  const { data: timetableSlots } = await supabase
    .from("timetable_slots")
    .select(
      `
      id,
      day_of_week,
      period_number,
      subject:subjects(name),
      class:classes(name),
      section:sections(name)
    `,
    )
    .eq("teacher_id", teacherId);

  if (timetableSlots && timetableSlots.length > 0) {
    const periodCount = timetableSlots.length;
    conflicts.push({
      type: "timetable",
      count: periodCount,
      severity: "high",
      message: `${periodCount} timetable periods require substitute`,
      details: timetableSlots.slice(0, 5), // First 5 slots
    });
  }

  // Check exam invigilator duties
  const { data: examDuties } = await supabase
    .from("exam_invigilators")
    .select(
      `
      id,
      exam:exams(
        id,
        name,
        exam_date,
        exam_type,
        class:classes(name)
      )
    `,
    )
    .eq("teacher_id", teacherId)
    .gte("exam.exam_date", startDate)
    .lte("exam.exam_date", endDate);

  if (examDuties && examDuties.length > 0) {
    conflicts.push({
      type: "exam",
      count: examDuties.length,
      severity: "critical",
      message: `${examDuties.length} exam invigilator duties scheduled`,
      details: examDuties,
    });
  }

  // Check scheduled events/meetings
  const { data: events } = await supabase
    .from("calendar_events")
    .select("id, title, event_date, event_type")
    .contains("attendees", [teacherId])
    .gte("event_date", startDate)
    .lte("event_date", endDate);

  if (events && events.length > 0) {
    conflicts.push({
      type: "event",
      count: events.length,
      severity: "medium",
      message: `${events.length} scheduled events`,
      details: events,
    });
  }

  return conflicts;
}

/**
 * Get leave balance for teacher
 */
export async function getLeaveBalance(
  teacherId: string,
  schoolId: string,
  academicYearId?: string,
) {
  const supabase = await createClient();

  let query = supabase
    .from("leave_balances")
    .select(
      `
      *,
      academic_year:academic_years(id, name, is_active)
    `,
    )
    .eq("teacher_id", teacherId)
    .eq("school_id", schoolId);

  if (academicYearId) {
    query = query.eq("academic_year_id", academicYearId);
  } else {
    // Get current academic year
    query = query.eq("academic_year.is_active", true);
  }

  const { data: balances, error } = await query;

  if (error) throw error;
  return balances || [];
}

/**
 * Update leave balance (manual adjustment)
 */
export async function updateLeaveBalance(
  balanceId: string,
  schoolId: string,
  updates: {
    totalAllocated?: number;
    carriedForward?: number;
  },
) {
  const supabase = await createClient();

  const { data: balance, error } = await supabase
    .from("leave_balances")
    .update(updates)
    .eq("id", balanceId)
    .eq("school_id", schoolId)
    .select()
    .single();

  if (error) throw error;
  return balance;
}

/**
 * Get leave statistics for school
 */
export async function getLeaveStats(
  schoolId: string,
  filters: {
    startDate?: string;
    endDate?: string;
    department?: string;
  } = {},
) {
  const supabase = await createClient();

  let query = supabase
    .from("teacher_leaves")
    .select("id, status, leave_type, total_days, teacher:teachers(department)")
    .eq("school_id", schoolId);

  if (filters.startDate) query = query.gte("start_date", filters.startDate);
  if (filters.endDate) query = query.lte("end_date", filters.endDate);

  const { data: leaves, error } = await query;

  if (error) throw error;

  const stats = {
    total: leaves?.length || 0,
    pending: leaves?.filter((l) => l.status === "pending").length || 0,
    approved: leaves?.filter((l) => l.status === "approved").length || 0,
    rejected: leaves?.filter((l) => l.status === "rejected").length || 0,
    cancelled: leaves?.filter((l) => l.status === "cancelled").length || 0,
    totalDays: leaves?.reduce((sum, l) => sum + (l.total_days || 0), 0) || 0,
    byType: {} as any,
    byDepartment: {} as any,
  };

  // Group by type
  leaves?.forEach((leave) => {
    stats.byType[leave.leave_type] = (stats.byType[leave.leave_type] || 0) + 1;
  });

  // Group by department
  if (!filters.department) {
    leaves?.forEach((leave: any) => {
      const dept = leave.teacher?.department || "Unknown";
      stats.byDepartment[dept] = (stats.byDepartment[dept] || 0) + 1;
    });
  }

  return stats;
}

/**
 * Get pending leaves (for admin review)
 */
export async function getPendingLeaves(schoolId: string) {
  const supabase = await createClient();

  const { data: leaves, error } = await supabase
    .from("teacher_leaves")
    .select(
      `
      *,
      teacher:teachers!teacher_leaves_teacher_id_fkey(
        id,
        employee_id,
        first_name,
        last_name,
        email,
        department
      )
    `,
    )
    .eq("school_id", schoolId)
    .eq("status", "pending")
    .order("requested_at", { ascending: true });

  if (error) throw error;
  return leaves || [];
}

/**
 * Get substitute suggestions for a leave
 */
export async function getSubstituteSuggestions(
  leaveId: string,
  schoolId: string,
) {
  const supabase = await createClient();

  // Get the leave details
  const { data: leave } = await supabase
    .from("teacher_leaves")
    .select(
      `
      *,
      teacher:teachers!teacher_leaves_teacher_id_fkey(
        department,
        specialization,
        assignments:teacher_assignments(
          subject:subjects(id, name)
        )
      )
    `,
    )
    .eq("id", leaveId)
    .single();

  if (!leave) throw new Error("Leave not found");

  // Find teachers with:
  // 1. Same department or specialization
  // 2. Not on leave during this period
  // 3. Not overloaded
  // 4. Teaching same subjects (preferred)

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
      assignments:teacher_assignments(
        subject:subjects(id, name)
      )
    `,
    )
    .eq("school_id", schoolId)
    .eq("status", "active")
    .eq("is_deleted", false)
    .neq("id", leave.teacher_id)
    .lt("current_workload_hours", 40); // Not fully loaded

  const { data: potentialSubstitutes, error } = await query;

  if (error) throw error;

  // Check for conflicting leaves
  const { data: conflictingLeaves } = await supabase
    .from("teacher_leaves")
    .select("teacher_id")
    .eq("status", "approved")
    .lte("start_date", leave.end_date)
    .gte("end_date", leave.start_date);

  const conflictedTeacherIds = new Set(
    conflictingLeaves?.map((l) => l.teacher_id) || [],
  );

  // Filter and score substitutes
  const substitutes = (potentialSubstitutes || [])
    .filter((t) => !conflictedTeacherIds.has(t.id))
    .map((teacher: any) => {
      let score = 0;

      // Same department
      if (teacher.department === leave.teacher?.department) score += 30;

      // Same specialization
      if (teacher.specialization === leave.teacher?.specialization) score += 20;

      // Workload capacity
      const workloadPercent =
        (teacher.current_workload_hours / teacher.max_workload_hours) * 100;
      if (workloadPercent < 50) score += 30;
      else if (workloadPercent < 75) score += 20;
      else score += 10;

      // Common subjects
      const teacherSubjects = new Set(
        teacher.assignments?.map((a: any) => a.subject?.id) || [],
      );
      const requiredSubjects = new Set(
        leave.teacher?.assignments?.map((a: any) => a.subject?.id) || [],
      );
      const commonSubjects = [...teacherSubjects].filter((s) =>
        requiredSubjects.has(s),
      );
      score += commonSubjects.length * 10;

      return {
        ...teacher,
        matchScore: score,
        reasonsForMatch: [
          teacher.department === leave.teacher?.department && "Same department",
          workloadPercent < 75 && "Good workload capacity",
          commonSubjects.length > 0 &&
            `Teaches ${commonSubjects.length} common subjects`,
        ].filter(Boolean),
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return substitutes;
}

/**
 * Get leave history for teacher
 */
export async function getTeacherLeaveHistory(
  teacherId: string,
  schoolId: string,
  limit: number = 20,
) {
  const supabase = await createClient();

  const { data: leaves, error } = await supabase
    .from("teacher_leaves")
    .select(
      `
      *,
      reviewer:profiles!teacher_leaves_reviewed_by_fkey(full_name),
      substitute_teacher:teachers!teacher_leaves_substitute_teacher_id_fkey(
        first_name,
        last_name
      )
    `,
    )
    .eq("teacher_id", teacherId)
    .eq("school_id", schoolId)
    .order("requested_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return leaves || [];
}
