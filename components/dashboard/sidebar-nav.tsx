"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { AdminSidebar } from "./admin-sidebar";
import { StudentSidebar } from "./student-sidebar";
import { TeacherSidebar } from "./teacher-sidebar";
import { ParentSidebar } from "./parent-sidebar";
import { SuperAdminSidebar } from "./super-admin-sidebar";

export function SidebarNav() {
  const { user, profile } = useAuth();

  if (!user || !profile) {
    return null;
  }

  // Render the appropriate sidebar based on user role
  switch (profile.role) {
    case "super_admin":
      return <SuperAdminSidebar />;
    case "school_admin":
      return <AdminSidebar />;
    case "teacher":
      return <TeacherSidebar />;
    case "student":
      return <StudentSidebar />;
    case "parent":
      return <ParentSidebar />;
    default:
      return <AdminSidebar />;
  }
}
