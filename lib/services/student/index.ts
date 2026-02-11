// Student Services Index
// Central export for all student-related services

export { studentAcademicService } from "./academic";
export type { ClassEnrollment, StudentClass } from "./academic";

export { studentAssignmentService } from "./assignments";
export type { Assignment, AssignmentSubmission } from "./assignments";

export { studentAttendanceService } from "./attendance";
export type { AttendanceRecord, AttendanceStats } from "./attendance";

export { studentExamService } from "./exams";
export type { Exam, ExamResult } from "./exams";

export { studentResourceService } from "./resources";
export type { LearningResource, ResourceBookmark } from "./resources";

export { studentMessagingService } from "./messaging";
export type { StudentMessage } from "./messaging";
