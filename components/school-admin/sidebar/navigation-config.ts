import {
  LayoutDashboard,
  School,
  BookOpen,
  Calendar,
  FileText,
  Award,
  GraduationCap,
  Users,
  CheckCircle,
  Clipboard,
  MessageSquare,
  TrendingUp,
  FileBarChart,
  Settings,
} from "lucide-react";
import { NavGroup } from "./types";

/**
 * Main navigation configuration for school admin dashboard
 */
export const navigationConfig: NavGroup[] = [
  {
    title: "Administration",
    items: [
      {
        title: "Dashboard",
        href: "/school-admin/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Calendar",
        href: "/school-admin/calendar",
        icon: Calendar,
      },
    ],
  },
  {
    title: "Academics",
    collapsible: true,
    items: [
      {
        title: "Classes",
        href: "/school-admin/academics/classes",
        icon: School,
      },
      {
        title: "Subjects",
        href: "/school-admin/academics/subjects",
        icon: BookOpen,
      },
      {
        title: "Timetable",
        href: "/school-admin/academics/timetable",
        icon: Calendar,
      },
      {
        title: "Exams",
        href: "/school-admin/academics/exams",
        icon: FileText,
      },
      {
        title: "Results",
        href: "/school-admin/academics/results",
        icon: Award,
      },
    ],
  },
  {
    title: "People",
    collapsible: true,
    items: [
      {
        title: "Students",
        href: "/school-admin/students",
        icon: GraduationCap,
      },
      {
        title: "Teachers",
        href: "/school-admin/teachers",
        icon: Users,
      },
    ],
  },
  {
    title: "Operations",
    collapsible: true,
    items: [
      {
        title: "Attendance",
        href: "/school-admin/attendance",
        icon: CheckCircle,
      },
      {
        title: "Assignments",
        href: "/school-admin/assignments",
        icon: Clipboard,
      },
    ],
  },
  {
    title: "Communication",
    items: [
      {
        title: "Messages",
        href: "/school-admin/communication",
        icon: MessageSquare,
      },
    ],
  },
  {
    title: "Insights",
    items: [
      {
        title: "Analytics",
        href: "/school-admin/analytics",
        icon: TrendingUp,
      },
      {
        title: "Reports",
        href: "/school-admin/reports",
        icon: FileBarChart,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "Settings",
        href: "/school-admin/settings",
        icon: Settings,
      },
    ],
  },
];
