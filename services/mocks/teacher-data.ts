import {
  LucideIcon,
  Users,
  Clock,
  CheckCircle,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { MetricItem } from "./dashboard-data";

export interface ScheduleItem {
  id: string;
  time: string;
  subject: string;
  class: string;
  room: string;
  status: "completed" | "current" | "upcoming";
}

export interface TaskItem {
  id: string;
  title: string;
  deadline: string;
  type: "grading" | "attendance" | "report";
  priority: "high" | "medium" | "low";
}

export const TEACHER_METRICS: MetricItem[] = [
  {
    id: "total-classes",
    title: "Today's Classes",
    value: "5",
    trend: { value: 0, label: "completed", isPositive: true },
    icon: BookOpen,
  },
  {
    id: "students-taught",
    title: "Students",
    value: "142",
    trend: { value: 2, label: "new", isPositive: true },
    icon: Users,
  },
  {
    id: "hours-taught",
    title: "Teaching Hours",
    value: "4.5",
    trend: { value: 0.5, label: "vs last week", isPositive: false },
    icon: Clock,
  },
  {
    id: "attendance-completion",
    title: "Attendance Marked",
    value: "80%",
    // trend: "pending",
    icon: CheckCircle,
  },
];

export const TEACHER_SCHEDULE: ScheduleItem[] = [
  {
    id: "1",
    time: "08:30 AM - 09:15 AM",
    subject: "Mathematics",
    class: "10-A",
    room: "Room 101",
    status: "completed",
  },
  {
    id: "2",
    time: "09:15 AM - 10:00 AM",
    subject: "Mathematics",
    class: "9-B",
    room: "Room 102",
    status: "current",
  },
  {
    id: "3",
    time: "10:30 AM - 11:15 AM",
    subject: "Physics",
    class: "10-A",
    room: "Lab 2",
    status: "upcoming",
  },
  {
    id: "4",
    time: "01:00 PM - 01:45 PM",
    subject: "Mathematics",
    class: "8-C",
    room: "Room 105",
    status: "upcoming",
  },
];

export const TEACHER_TASKS: TaskItem[] = [
  {
    id: "t1",
    title: "Grade Class 10-A Math Quiz",
    deadline: "Today, 5:00 PM",
    type: "grading",
    priority: "high",
  },
  {
    id: "t2",
    title: "Submit Monthly Syllabus Report",
    deadline: "Tomorrow",
    type: "report",
    priority: "medium",
  },
  {
    id: "t3",
    title: "Mark Attendance for 9-B",
    deadline: "Within 1 hour",
    type: "attendance",
    priority: "high",
  },
];
