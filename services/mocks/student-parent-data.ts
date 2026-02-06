import {
  BookCheck,
  Calendar,
  CreditCard,
  Award,
  GraduationCap,
} from "lucide-react";
import { MetricItem } from "./dashboard-data";

export const STUDENT_METRICS: MetricItem[] = [
  {
    id: "attendance",
    title: "Attendance",
    value: "92%",
    trend: { value: 1, label: "vs last month", isPositive: false },
    icon: Calendar,
  },
  {
    id: "assignments",
    title: "Pending Assignments",
    value: "4",
    // trend: "Due this week",
    icon: BookCheck,
  },
  {
    id: "gpa",
    title: "Current GPA",
    value: "3.8",
    trend: { value: 10, label: "top %", isPositive: true },
    icon: Award,
  },
];

export const PARENT_METRICS: MetricItem[] = [
  {
    id: "fees",
    title: "Fee Outstanding",
    value: "$1,200",
    // trend: "Due in 5 days",
    icon: CreditCard,
  },
  {
    id: "attendance",
    title: "Child's Attendance",
    value: "92%",
    trend: { value: 1, label: "vs last month", isPositive: false },
    icon: Calendar,
  },
];

export const HOMEWORK_LIST = [
  {
    id: 1,
    subject: "Mathematics",
    title: "Algebra Worksheet 4.2",
    dueDate: "Tomorrow",
    status: "pending",
  },
  {
    id: 2,
    subject: "Science",
    title: "Lab Report: Photosynthesis",
    dueDate: "Fri, Feb 9",
    status: "pending",
  },
  {
    id: 3,
    subject: "English",
    title: "Essay: Macbeth",
    dueDate: "Mon, Feb 12",
    status: "submitted",
  },
];

export const UPCOMING_EXAMS = [
  {
    id: 1,
    subject: "Physics",
    date: "Feb 15",
    topics: "Mechanics, Newton's Laws",
  },
  {
    id: 2,
    subject: "History",
    date: "Feb 18",
    topics: "World War II",
  },
];

export const RECENT_GRADES = [
  { subject: "Math Quiz", grade: "A", date: "Feb 2" },
  { subject: "History Essay", grade: "B+", date: "Jan 28" },
  { subject: "Science Lab", grade: "A-", date: "Jan 25" },
];
