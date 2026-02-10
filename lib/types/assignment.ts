export interface Assignment {
  id: string;
  title: string;
  description?: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  school_id: string;
  due_date: string | Date;
  status: "draft" | "published" | "archived";
  created_at: string | Date;
  updated_at: string | Date;
  // Relations
  class_name?: string;
  subject_name?: string;
  teacher_name?: string;
}

export interface CreateAssignmentParams {
  title: string;
  description?: string;
  class_id: string;
  subject_id: string;
  due_date: string | Date;
  status?: "draft" | "published";
}

export interface UpdateAssignmentParams extends Partial<CreateAssignmentParams> {}
