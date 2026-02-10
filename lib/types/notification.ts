export type NotificationType =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "announcement";

export type NotificationCategory =
  | "system"
  | "academic"
  | "attendance"
  | "exam"
  | "assignment"
  | "communication";

export interface Notification {
  id: string;
  user_id: string;
  school_id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  /** Optional action button */
  action?: {
    label: string;
    url: string;
  };
  /** Link to related resource */
  resource_type?: string;
  resource_id?: string;
  /** Is notification read */
  is_read: boolean;
  /** Created timestamp */
  created_at: Date;
  /** Read timestamp */
  read_at?: Date;
}

export interface CreateNotificationParams {
  user_ids: string[]; // Can send to multiple users
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  action?: {
    label: string;
    url: string;
  };
  resource_type?: string;
  resource_id?: string;
}
