export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  attendanceRate: number;
}

export interface AttendanceReport {
  date: string;
  present: number;
  absent: number;
  late: number;
  total: number;
}

export interface AcademicPerformanceReport {
  class_name: string;
  average_grade: number;
}

export interface StudentDistributionReport {
  grade_level: number;
  count: number;
}
