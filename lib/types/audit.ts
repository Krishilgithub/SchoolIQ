/**
 * Audit Log Types
 * Defines the structure for tracking user actions across the system
 */

export type AuditAction =
  // Authentication & Authorization
  | "auth.login"
  | "auth.logout"
  | "auth.password_change"
  | "auth.permission_grant"
  | "auth.permission_revoke"

  // Student Management
  | "student.create"
  | "student.update"
  | "student.delete"
  | "student.status_change"
  | "student.promote"

  // Teacher Management
  | "teacher.create"
  | "teacher.update"
  | "teacher.delete"
  | "teacher.assign_class"
  | "teacher.assign_subject"

  // Academic Operations
  | "class.create"
  | "class.update"
  | "class.delete"
  | "subject.create"
  | "subject.update"
  | "subject.delete"
  | "timetable.create"
  | "timetable.update"

  // Exam Management
  | "exam.create"
  | "exam.update"
  | "exam.delete"
  | "exam.schedule"
  | "exam.results_publish"
  | "exam.results_update"
  | "exam.results_delete"

  // Attendance
  | "attendance.mark"
  | "attendance.update"
  | "attendance.bulk_mark"

  // Assignments
  | "assignment.create"
  | "assignment.update"
  | "assignment.delete"
  | "assignment.grade"

  // Communication
  | "announcement.create"
  | "announcement.update"
  | "announcement.delete"
  | "message.send"

  // Settings & Configuration
  | "settings.update"
  | "role.create"
  | "role.update"
  | "role.delete"

  // Data Operations
  | "data.import"
  | "data.export"
  | "data.bulk_update"
  | "data.bulk_delete";

export type AuditStatus = "success" | "failure" | "pending";

export interface AuditLogEntry {
  id: string;
  /** User who performed the action */
  user_id: string;
  /** School context */
  school_id: string;
  /** Action performed */
  action: AuditAction;
  /** Resource type being acted upon (e.g., 'student', 'exam') */
  resource_type: string;
  /** ID of the resource being acted upon */
  resource_id?: string;
  /** Status of the action */
  status: AuditStatus;
  /** Additional metadata about the action */
  metadata?: Record<string, any>;
  /** Changes made (before/after values) */
  changes?: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
  /** IP address of the user */
  ip_address?: string;
  /** User agent string */
  user_agent?: string;
  /** Error message if action failed */
  error_message?: string;
  /** Timestamp */
  created_at: Date;
}

export interface CreateAuditLogParams {
  action: AuditAction;
  resource_type: string;
  resource_id?: string;
  status: AuditStatus;
  metadata?: Record<string, any>;
  changes?: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
  error_message?: string;
}

export interface AuditLogFilters {
  user_id?: string;
  action?: AuditAction;
  resource_type?: string;
  resource_id?: string;
  status?: AuditStatus;
  start_date?: Date;
  end_date?: Date;
  limit?: number;
  offset?: number;
}
