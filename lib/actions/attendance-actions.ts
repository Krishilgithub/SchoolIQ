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
  const supabase = await createClient();
  
  // Get student IDs for the school
  const { data: students, error: studentError } = await supabase
    .from("students")
    .select("id")
    .eq("school_id", schoolId);

  if (studentError) {
    console.error("Error fetching students:", studentError);
    throw new Error(studentError.message);
  }

  const studentIds = students?.map((s) => s.id) || [];

  if (studentIds.length === 0) {
    return [];
  }

  // Build attendance query
  let query = supabase
    .from("student_attendance")
    .select("*")
    .in("student_id", studentIds);

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
  const supabase = await createClient();

  // Verify student belongs to this school
  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id")
    .eq("id", attendanceData.student_id)
    .eq("school_id", schoolId)
    .single();

  if (studentError || !student) {
    throw new Error("Student not found or doesn't belong to this school");
  }

  // Check if record exists for student on that date
  const { data: existing } = await supabase
    .from("student_attendance")
    .select("id")
    .eq("student_id", attendanceData.student_id)
    .eq("date", attendanceData.date)
    .single();

  let result;
  if (existing) {
    // Update
    result = await supabase
      .from("student_attendance")
      .update({
        status: attendanceData.status,
        remarks: attendanceData.reason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single();
  } else {
    // Insert
    result = await supabase
      .from("student_attendance")
      .insert({
        student_id: attendanceData.student_id,
        class_id: attendanceData.class_id,
        date: attendanceData.date,
        status: attendanceData.status,
        remarks: attendanceData.reason,
        marked_by: attendanceData.marked_by,
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
  const supabase = await createClient();

  // Get all student IDs for the school
  const { data: students, error: studentError } = await supabase
    .from("students")
    .select("id")
    .eq("school_id", schoolId)
    .eq("is_active", true);

  if (studentError) throw new Error(studentError.message);

  const studentIds = students?.map((s) => s.id) || [];
  const totalStudents = studentIds.length;

  if (totalStudents === 0) {
    return {
      total_students: 0,
      present_count: 0,
      absent_count: 0,
      late_count: 0,
      attendance_percentage: 0,
    };
  }

  // Get attendance for the date
  const { data: attendance, error: attendanceError } = await supabase
    .from("student_attendance")
    .select("status")
    .eq("date", date)
    .in("student_id", studentIds);

  if (attendanceError) throw new Error(attendanceError.message);

  const present = attendance?.filter((a) => a.status === "present").length || 0;
  const absent = attendance?.filter((a) => a.status === "absent").length || 0;
  const late = attendance?.filter((a) => a.status === "late").length || 0;

  return {
    total_students: totalStudents,
    present_count: present,
    absent_count: absent,
    late_count: late,
    attendance_percentage: totalStudents
      ? ((present + late) / totalStudents) * 100
      : 0,
  };
}
