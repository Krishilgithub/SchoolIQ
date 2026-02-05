import { Users, GraduationCap, CalendarCheck, Wallet } from "lucide-react";

export interface DashboardMetric {
  id: string;
  title: string;
  value: string;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  icon?: any;
}

export const SCHOOL_ADMIN_METRICS: DashboardMetric[] = [
  {
    id: "total-students",
    title: "Total Students",
    value: "2,543",
    trend: { value: 12, label: "this month", isPositive: true },
    icon: Users,
  },
  {
    id: "total-teachers",
    title: "Total Teachers",
    value: "145",
    trend: { value: 4, label: "this month", isPositive: true },
    icon: GraduationCap,
  },
  {
    id: "attendance-rate",
    title: "Avg. Attendance",
    value: "94.2%",
    trend: { value: 0.8, label: "last week", isPositive: false },
    icon: CalendarCheck,
  },
  {
    id: "fee-collection",
    title: "Fee Collection",
    value: "$425k",
    trend: { value: 24, label: "year over year", isPositive: true },
    icon: Wallet,
  },
];

export const ATTENDANCE_DATA = [
  { name: "Mon", present: 92, absent: 8 },
  { name: "Tue", present: 95, absent: 5 },
  { name: "Wed", present: 94, absent: 6 },
  { name: "Thu", present: 91, absent: 9 },
  { name: "Fri", present: 88, absent: 12 },
];

export const PERFORMANCE_DATA = [
  { subject: "Math", A: 120, B: 110, fullMark: 150 },
  { subject: "Science", A: 98, B: 130, fullMark: 150 },
  { subject: "English", A: 86, B: 130, fullMark: 150 },
  { subject: "History", A: 99, B: 100, fullMark: 150 },
  { subject: "Geography", A: 85, B: 90, fullMark: 150 },
  { subject: "Physics", A: 65, B: 85, fullMark: 150 },
];
