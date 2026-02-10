export interface Teacher {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  school_id: string;
  role: "teacher";
  created_at: Date | string;
  updated_at: Date | string;
  avatar_url?: string;
  specialization?: string;
  subjects_taught?: string[];
}
