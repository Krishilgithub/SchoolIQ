/**
 * Permission definitions for the school admin system
 * These permissions control access to various features and actions
 */

export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: "dashboard:view",

  // Academics - Classes
  VIEW_CLASSES: "academics:classes:view",
  MANAGE_CLASSES: "academics:classes:manage",
  DELETE_CLASSES: "academics:classes:delete",

  // Academics - Subjects
  VIEW_SUBJECTS: "academics:subjects:view",
  MANAGE_SUBJECTS: "academics:subjects:manage",

  // Academics - Timetable
  VIEW_TIMETABLE: "academics:timetable:view",
  MANAGE_TIMETABLE: "academics:timetable:manage",

  // Academics - Exams
  VIEW_EXAMS: "academics:exams:view",
  CREATE_EXAMS: "academics:exams:create",
  MANAGE_EXAMS: "academics:exams:manage",
  MODERATE_RESULTS: "academics:exams:moderate",
  PUBLISH_RESULTS: "academics:exams:publish",

  // Students
  VIEW_STUDENTS: "students:view",
  MANAGE_STUDENTS: "students:manage",
  DELETE_STUDENTS: "students:delete",
  VIEW_STUDENT_RECORDS: "students:records:view",
  MANAGE_STUDENT_RECORDS: "students:records:manage",

  // Teachers
  VIEW_TEACHERS: "teachers:view",
  MANAGE_TEACHERS: "teachers:manage",
  VIEW_TEACHER_PERFORMANCE: "teachers:performance:view",

  // Attendance
  VIEW_ATTENDANCE: "attendance:view",
  MARK_ATTENDANCE: "attendance:mark",
  EDIT_ATTENDANCE: "attendance:edit",

  // Assignments
  VIEW_ASSIGNMENTS: "assignments:view",
  CREATE_ASSIGNMENTS: "assignments:create",
  GRADE_ASSIGNMENTS: "assignments:grade",

  // Communication
  SEND_ANNOUNCEMENTS: "communication:announcements:send",
  SEND_MESSAGES: "communication:messages:send",
  VIEW_MESSAGES: "communication:messages:view",

  // Analytics & Reports
  VIEW_ANALYTICS: "analytics:view",
  VIEW_REPORTS: "reports:view",
  EXPORT_REPORTS: "reports:export",
  CREATE_CUSTOM_REPORTS: "reports:create",

  // Settings
  MANAGE_SCHOOL_SETTINGS: "settings:school:manage",
  MANAGE_ROLES: "settings:roles:manage",
  MANAGE_PERMISSIONS: "settings:permissions:manage",
  VIEW_AUDIT_LOGS: "settings:audit:view",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Role-based permission mappings
 * Defines which permissions each role has
 */
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  // School Admin - Full access to all features
  admin: Object.values(PERMISSIONS),
  school_admin: Object.values(PERMISSIONS),

  // Vice Principal - Most features except system settings
  vice_principal: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_CLASSES,
    PERMISSIONS.MANAGE_CLASSES,
    PERMISSIONS.VIEW_SUBJECTS,
    PERMISSIONS.MANAGE_SUBJECTS,
    PERMISSIONS.VIEW_TIMETABLE,
    PERMISSIONS.MANAGE_TIMETABLE,
    PERMISSIONS.VIEW_EXAMS,
    PERMISSIONS.CREATE_EXAMS,
    PERMISSIONS.MANAGE_EXAMS,
    PERMISSIONS.MODERATE_RESULTS,
    PERMISSIONS.PUBLISH_RESULTS,
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.MANAGE_STUDENTS,
    PERMISSIONS.VIEW_STUDENT_RECORDS,
    PERMISSIONS.MANAGE_STUDENT_RECORDS,
    PERMISSIONS.VIEW_TEACHERS,
    PERMISSIONS.MANAGE_TEACHERS,
    PERMISSIONS.VIEW_TEACHER_PERFORMANCE,
    PERMISSIONS.VIEW_ATTENDANCE,
    PERMISSIONS.MARK_ATTENDANCE,
    PERMISSIONS.EDIT_ATTENDANCE,
    PERMISSIONS.VIEW_ASSIGNMENTS,
    PERMISSIONS.SEND_ANNOUNCEMENTS,
    PERMISSIONS.SEND_MESSAGES,
    PERMISSIONS.VIEW_MESSAGES,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
  ],

  // Department Head - Department-specific access
  department_head: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_CLASSES,
    PERMISSIONS.VIEW_SUBJECTS,
    PERMISSIONS.VIEW_TIMETABLE,
    PERMISSIONS.VIEW_EXAMS,
    PERMISSIONS.MANAGE_EXAMS,
    PERMISSIONS.MODERATE_RESULTS,
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.VIEW_STUDENT_RECORDS,
    PERMISSIONS.VIEW_TEACHERS,
    PERMISSIONS.VIEW_TEACHER_PERFORMANCE,
    PERMISSIONS.VIEW_ATTENDANCE,
    PERMISSIONS.VIEW_ASSIGNMENTS,
    PERMISSIONS.CREATE_ASSIGNMENTS,
    PERMISSIONS.GRADE_ASSIGNMENTS,
    PERMISSIONS.SEND_ANNOUNCEMENTS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_REPORTS,
  ],

  // Exam Coordinator - Exam and results focused
  exam_coordinator: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_CLASSES,
    PERMISSIONS.VIEW_SUBJECTS,
    PERMISSIONS.VIEW_EXAMS,
    PERMISSIONS.CREATE_EXAMS,
    PERMISSIONS.MANAGE_EXAMS,
    PERMISSIONS.MODERATE_RESULTS,
    PERMISSIONS.PUBLISH_RESULTS,
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
  ],

  // Teacher - Limited to teaching responsibilities
  teacher: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_CLASSES,
    PERMISSIONS.VIEW_SUBJECTS,
    PERMISSIONS.VIEW_TIMETABLE,
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.VIEW_ATTENDANCE,
    PERMISSIONS.MARK_ATTENDANCE,
    PERMISSIONS.VIEW_ASSIGNMENTS,
    PERMISSIONS.CREATE_ASSIGNMENTS,
    PERMISSIONS.GRADE_ASSIGNMENTS,
    PERMISSIONS.VIEW_MESSAGES,
  ],
};

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(
  role: string,
  permission: Permission,
): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}
