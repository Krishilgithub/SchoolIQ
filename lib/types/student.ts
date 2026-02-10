export interface Student {
  id: string;
  school_id: string;
  first_name: string;
  last_name: string;
  email: string;
  grade_level?: number;
  section?: string;
  roll_number?: string;
  parent_name?: string;
  parent_email?: string;
  parent_phone?: string;
  address?: string;
  date_of_birth?: string | Date;
  gender?: string;
  admission_date?: string | Date;
  status: "active" | "inactive" | "graduated" | "transferred";
  avatar_url?: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface CreateStudentParams {
  first_name: string;
  last_name: string;
  email: string;
  grade_level?: number;
  section?: string;
  roll_number?: string;
  parent_name?: string;
  parent_email?: string;
  parent_phone?: string;
  address?: string;
  date_of_birth?: string | Date;
  gender?: string;
  admission_date?: string | Date;
  status?: "active" | "inactive" | "graduated" | "transferred";
}

export interface UpdateStudentParams extends Partial<CreateStudentParams> {}
