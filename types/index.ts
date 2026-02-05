export type Role = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  schoolId: string;
}

export interface Student extends User {
  role: "STUDENT";
  grade: string; // e.g., "10-A"
  rollNumber: string;
  guardianName: string;
  guardianContact: string;
  attendancePercentage: number;
  riskScore: number; // 0-100, higher is worse
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  teacherId: string;
}

export interface Exam {
  id: string;
  name: string; // e.g., "Mid-Term 2024"
  date: string;
  totalMarks: number;
}

export interface MarkEntry {
  studentId: string;
  studentName: string;
  rollNumber: string;
  obtainedMarks: number;
  maxMarks: number;
  grade?: string;
  comments?: string;
}

export interface AttendanceRecord {
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  readBy: number; // percentage
}
