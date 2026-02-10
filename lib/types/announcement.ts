export interface Announcement {
  id: string;
  title: string;
  content: string;
  school_id: string;
  author_id: string;
  target_audience: "all" | "students" | "teachers" | "parents" | "staff";
  status: "draft" | "published" | "archived";
  created_at: string | Date;
  updated_at: string | Date;
  // Relations
  author_name?: string;
  read_count?: number; // Optional statistics
}

export interface CreateAnnouncementParams {
  title: string;
  content: string;
  target_audience: "all" | "students" | "teachers" | "parents" | "staff";
  status?: "draft" | "published";
}

export interface UpdateAnnouncementParams extends Partial<CreateAnnouncementParams> {}
