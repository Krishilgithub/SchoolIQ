export interface Attendance {
  id: string;
  student_id: string;
  class_id?: string;
  date: string | Date; // YYYY-MM-DD
  status: "present" | "absent" | "late" | "excused";
  remarks?: string;
  marked_by?: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface CreateAttendanceParams {
  student_id: string;
  class_id?: string;
  date: string | Date;
  status: "present" | "absent" | "late" | "excused";
  reason?: string; // Maps to remarks in database
  marked_by?: string;
}

export interface AttendanceStats {
  total_students: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  attendance_percentage: number;
}
