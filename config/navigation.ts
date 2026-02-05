import {
  LayoutDashboard,
  GraduationCap,
  Users,
  CalendarCheck,
  Megaphone,
  Settings,
  BookOpen,
  PieChart,
  Wallet,
  Bus,
  Shield,
  FileText,
  School,
} from "lucide-react";
import { NavGroup } from "@/types/navigation";
import { Role } from "@/types/auth";

export const NAVIGATION_CONFIG: Record<Role, NavGroup[]> = {
  SUPER_ADMIN: [
    {
      title: "Overview",
      items: [
        { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { title: "Analytics", href: "/dashboard/analytics", icon: PieChart },
      ],
    },
    {
      title: "Management",
      items: [
        { title: "Schools", href: "/dashboard/schools", icon: School },
        { title: "Users", href: "/dashboard/users", icon: Users },
        {
          title: "SaaS Settings",
          href: "/dashboard/saas-settings",
          icon: Settings,
        },
      ],
    },
  ],
  SCHOOL_ADMIN: [
    {
      title: "Core",
      items: [
        { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        {
          title: "Academics",
          href: "/dashboard/academics",
          icon: GraduationCap,
        },
        { title: "Students", href: "/dashboard/students", icon: Users },
        { title: "Staff", href: "/dashboard/staff", icon: Shield },
      ],
    },
    {
      title: "Operations",
      items: [
        {
          title: "Attendance",
          href: "/dashboard/attendance",
          icon: CalendarCheck,
        },
        { title: "Finance", href: "/dashboard/finance", icon: Wallet },
        { title: "Transport", href: "/dashboard/transport", icon: Bus },
      ],
    },
    {
      title: "Communication",
      items: [
        {
          title: "Announcements",
          href: "/dashboard/communication",
          icon: Megaphone,
        },
      ],
    },
    {
      title: "System",
      items: [
        { title: "Settings", href: "/dashboard/settings", icon: Settings },
      ],
    },
  ],
  TEACHER: [
    {
      title: "Classroom",
      items: [
        { title: "My Classes", href: "/dashboard/classes", icon: BookOpen },
        {
          title: "Attendance",
          href: "/dashboard/attendance",
          icon: CalendarCheck,
        },
        { title: "Gradebook", href: "/dashboard/gradebook", icon: FileText },
      ],
    },
    {
      title: "School",
      items: [
        {
          title: "Timetable",
          href: "/dashboard/timetable",
          icon: CalendarCheck,
        },
        { title: "Leaves", href: "/dashboard/leaves", icon: FileText },
      ],
    },
  ],
  STUDENT: [
    {
      title: "Learning",
      items: [
        { title: "My Courses", href: "/dashboard/courses", icon: BookOpen },
        {
          title: "Assignments",
          href: "/dashboard/assignments",
          icon: FileText,
        },
        { title: "Results", href: "/dashboard/results", icon: GraduationCap },
      ],
    },
  ],
  PARENT: [
    {
      title: "Children",
      items: [
        { title: "Overview", href: "/dashboard/children", icon: Users },
        { title: "Fees", href: "/dashboard/fees", icon: Wallet },
      ],
    },
  ],
};
