"use server";

import { createClient } from "@/lib/supabase/server";
import {
  Attendance,
  CreateAttendanceParams,
  AttendanceStats,
} from "@/lib/types/attendance";
import { revalidatePath } from "next/cache";

export async function getAttendanceAction(
  schoolId: string,
  params: { date?: string; studentId?: string } = {},
) {
  const supabase = createClient();
  let query = supabase.from("attendance").select("*").eq("school_id", schoolId);

  if (params.date) {
    query = query.eq("date", params.date);
  }
  if (params.studentId) {
    query = query.eq("student_id", params.studentId);
  }

  const { data, error } = await query.order("date", { ascending: false });

  if (error) {
    console.error("Error fetching attendance:", error);
    throw new Error(error.message);
  }

  return data as Attendance[];
}

export async function upsertAttendanceAction(
  schoolId: string,
  attendanceData: CreateAttendanceParams,
) {
  const supabase = createClient();

  // Check if record exists for student on that date
  const { data: existing } = await supabase
    .from("attendance")
    .select("id")
    .eq("school_id", schoolId)
    .eq("student_id", attendanceData.student_id)
    .eq("date", attendanceData.date)
    .single();

  let result;
  if (existing) {
    // Update
    result = await supabase
      .from("attendance")
      .update({
        status: attendanceData.status,
        reason: attendanceData.reason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single();
  } else {
    // Insert
    result = await supabase
      .from("attendance")
      .insert({
        ...attendanceData,
        school_id: schoolId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
  }

  if (result.error) {
    console.error("Error upserting attendance:", result.error);
    throw new Error(result.error.message);
  }

  revalidatePath("/school-admin/attendance");
  return result.data as Attendance;
}

export async function getAttendanceStatsAction(
  schoolId: string,
  date: string,
): Promise<AttendanceStats> {
  const supabase = createClient();

  // Get total students
  const { count: totalStudents, error: studentError } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("school_id", schoolId)
    .eq("status", "active");

  if (studentError) throw new Error(studentError.message);

  // Get attendance for the date
  const { data: attendance, error: attendanceError } = await supabase
    .from("attendance")
    .select("status")
    .eq("school_id", schoolId)
    .eq("date", date);

  if (attendanceError) throw new Error(attendanceError.message);

  const present = attendance.filter((a) => a.status === "present").length;
  const absent = attendance.filter((a) => a.status === "absent").length;
  const late = attendance.filter((a) => a.status === "late").length;

  return {
    total_students: totalStudents || 0,
    present_count: present,
    absent_count: absent,
    late_count: late,
    attendance_percentage: totalStudents
      ? ((present + late) / totalStudents) * 100
      : 0,
  };
}
