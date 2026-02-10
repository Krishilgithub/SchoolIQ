import { Permission } from "@/lib/permissions/roles";

export interface Class {
  id: string;
  school_id: string;
  name: string; // e.g., "10A", "Grade 5 - Section B"
  grade_level: number; // 1-12
  section: string; // A, B, C, etc.
  academic_year: string; // e.g., "2024-2025"
  class_teacher_id?: string;
  total_students: number;
  capacity?: number;
  room_number?: string;
  created_at: Date;
  updated_at: Date;
  // Relations
  class_teacher?: {
    full_name: string;
    email: string;
  };
  subjects?: ClassSubject[];
}

export interface Subject {
  id: string;
  school_id: string;
  name: string; // e.g., "Mathematics", "Physics"
  code: string; // e.g., "MATH101", "PHY201"
  description?: string;
  department?: string; // e.g., "Science", "Arts", "Commerce"
  credit_hours?: number;
  is_core: boolean; // Core subject vs elective
  grade_levels: number[]; // Which grades this subject is for [9, 10, 11, 12]
  created_at: Date;
  updated_at: Date;
}

export interface ClassSubject {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id?: string;
  periods_per_week: number;
  created_at: Date;
  // Relations
  subject?: Subject;
  teacher?: {
    full_name: string;
    email: string;
  };
}

export interface Teacher {
  id: string;
  school_id: string;
  user_id: string; // Links to profiles table
  employee_id: string;
  subjects: string[]; // Array of subject IDs they can teach
  qualifications: string[];
  joining_date: Date;
  status: "active" | "on_leave" | "inactive";
  created_at: Date;
  updated_at: Date;
  // Relations
  full_name?: string; // Often joined
  email?: string; // Often joined
}

export interface CreateClassParams {
  name: string;
  grade_level: number;
  section: string;
  academic_year: string;
  class_teacher_id?: string;
  capacity?: number;
  room_number?: string;
}

export interface UpdateClassParams {
  name?: string;
  class_teacher_id?: string;
  capacity?: number;
  room_number?: string;
}

export interface CreateSubjectParams {
  name: string;
  code: string;
  description?: string;
  department?: string;
  credit_hours?: number;
  is_core: boolean;
  grade_levels: number[];
}

export interface UpdateSubjectParams {
  name?: string;
  code?: string;
  description?: string;
  department?: string;
  credit_hours?: number;
  is_core?: boolean;
  grade_levels?: number[];
}

export interface AssignTeacherParams {
  class_id: string;
  subject_id: string;
  teacher_id?: string;
  periods_per_week: number;
}
