import { z } from "zod";

export const AnalyticFilterSchema = z.object({
  academicYear: z.string().default("2023-2024"),
  term: z.string().optional(),
  classId: z.string().optional(),
  subjectId: z.string().optional(),
});

export type AnalyticFilter = z.infer<typeof AnalyticFilterSchema>;

// KPI Schema
export const KPIMetricSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.number().or(z.string()),
  change: z.number(), // percentage
  trend: z.enum(["up", "down", "neutral"]),
  status: z.enum(["positive", "negative", "neutral"]),
});

export type KPIMetric = z.infer<typeof KPIMetricSchema>;

// Heatmap Data Schema
export const SubjectPerformanceSchema = z.object({
  subject: z.string(),
  classId: z.string(),
  avgScore: z.number(),
  attendance: z.number(),
});

export type SubjectPerformance = z.infer<typeof SubjectPerformanceSchema>;

// Risk Profile Schema
export const RiskProfileSchema = z.object({
  studentId: z.string(),
  name: z.string(),
  class: z.string(),
  avatar: z.string().optional(),
  riskScore: z.number().min(0).max(100),
  riskLevel: z.enum(["high", "medium", "low"]),
  factors: z.array(z.string()), // e.g., ["Attendance < 75%", "Math Failure"]
  trend: z.enum(["improving", "worsening", "stable"]),
});

export type RiskProfile = z.infer<typeof RiskProfileSchema>;

// Intervention Plan Schema
export const InterventionPlanSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  type: z.enum(["academic", "behavioral", "attendance"]),
  mentor: z.string(),
  startDate: z.string(),
  status: z.enum(["active", "completed", "monitoring"]),
  progress: z.number(), // 0-100
});

export type InterventionPlan = z.infer<typeof InterventionPlanSchema>;

// Student Performance Profile
export const StudentAnalyticsProfileSchema = z.object({
  studentId: z.string(),
  radarData: z.array(
    z.object({
      subject: z.string(),
      studentScore: z.number(),
      classAvg: z.number(),
      gradeAvg: z.number(),
    }),
  ),
  history: z.array(
    z.object({
      term: z.string(),
      gpa: z.number(),
      attendance: z.number(),
    }),
  ),
});

export type StudentAnalyticsProfile = z.infer<
  typeof StudentAnalyticsProfileSchema
>;
