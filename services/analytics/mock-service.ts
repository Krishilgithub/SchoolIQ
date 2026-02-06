import {
  KPIMetric,
  SubjectPerformance,
  RiskProfile,
  InterventionPlan,
  StudentAnalyticsProfile,
} from "./schemas";

// Helper for random data
const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);
const randomFloat = (min: number, max: number) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(1));
const randomItem = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

export const AnalyticsService = {
  getOverviewMetrics: async (): Promise<KPIMetric[]> => {
    await new Promise((resolve) => setTimeout(resolve, 800)); // Network delay
    return [
      {
        id: "avg_gpa",
        label: "Avg GPA",
        value: 3.4,
        change: 2.1,
        trend: "up",
        status: "positive",
      },
      {
        id: "attendance",
        label: "Attendance Rate",
        value: "94.2%",
        change: -0.5,
        trend: "down",
        status: "negative",
      },
      {
        id: "risk_count",
        label: "At-Risk Students",
        value: 42,
        change: 12,
        trend: "up",
        status: "negative",
      },
      {
        id: "intervention",
        label: "Intervention Success",
        value: "78%",
        change: 5.4,
        trend: "up",
        status: "positive",
      },
    ];
  },

  getSubjectHeatmap: async (): Promise<SubjectPerformance[]> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const subjects = ["Math", "Science", "English", "History", "Physics"];
    const classes = ["10-A", "10-B", "11-A", "11-B", "12-A"];

    const data: SubjectPerformance[] = [];
    classes.forEach((c) => {
      subjects.forEach((s) => {
        data.push({
          subject: s,
          classId: c,
          avgScore: randomInt(65, 95),
          attendance: randomInt(85, 99),
        });
      });
    });
    return data;
  },

  getRiskAnalysis: async (): Promise<RiskProfile[]> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return Array.from({ length: 15 }).map((_, i) => ({
      studentId: `ST-${1000 + i}`,
      name:
        [
          "Alex Johnson",
          "Sam Smith",
          "Jordan Lee",
          "Casey West",
          "Taylor Green",
        ][i % 5] + (i > 4 ? ` ${i}` : ""),
      class: ["10-A", "11-B", "9-C"][i % 3],
      riskScore: randomInt(60, 95),
      riskLevel: i < 5 ? "high" : i < 10 ? "medium" : "low",
      factors: [
        randomItem(["Attendance < 75%", "Math Failure", "Behavior Flag"]),
        randomItem(["Grade Drop", "Incomplete Homework"]),
      ],
      trend: randomItem(["worsening", "stable", "improving"]),
    }));
  },

  getInterventions: async (): Promise<InterventionPlan[]> => {
    await new Promise((resolve) => setTimeout(resolve, 700));
    return Array.from({ length: 8 }).map((_, i) => ({
      id: `INT-${2000 + i}`,
      studentId: `ST-${1000 + i}`,
      studentName: `Student ${i + 1}`,
      type: randomItem(["academic", "behavioral", "attendance"]),
      mentor: "Mr. Anderson",
      startDate: "2024-01-15",
      status: randomItem(["active", "monitoring"]),
      progress: randomInt(20, 90),
    }));
  },

  getStudentProfile: async (id: string): Promise<StudentAnalyticsProfile> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      studentId: id,
      radarData: [
        { subject: "Math", studentScore: 85, classAvg: 78, gradeAvg: 75 },
        { subject: "Science", studentScore: 92, classAvg: 80, gradeAvg: 79 },
        { subject: "English", studentScore: 88, classAvg: 85, gradeAvg: 82 },
        { subject: "History", studentScore: 76, classAvg: 82, gradeAvg: 80 },
        { subject: "Art", studentScore: 95, classAvg: 88, gradeAvg: 85 },
      ],
      history: [
        { term: "Term 1", gpa: 3.2, attendance: 95 },
        { term: "Term 2", gpa: 3.5, attendance: 96 },
        { term: "Term 3", gpa: 3.8, attendance: 94 },
      ],
    };
  },
};
