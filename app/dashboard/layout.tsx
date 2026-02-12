import { StudentSidebar } from "@/components/dashboard/student-sidebar";
import { ParentSidebar } from "@/components/dashboard/parent-sidebar";
import { TeacherSidebar } from "@/components/dashboard/teacher-sidebar";
import { SchoolAdminSidebar } from "@/components/school-admin/sidebar";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?callbackUrl=/dashboard");
  }

  // Fetch user role
  const { data: userProfile } = await supabase
    .from("profiles")
    .select("role, is_super_admin")
    .eq("id", user.id)
    .single();

  const role = userProfile?.role;
  const isStudent = role === "student";
  const isParent = role === "guardian";
  const isTeacher = role === "teacher";
  const isAdmin = role === "school_admin";

  // Strict Sidebar Selection
  let SidebarComponent;

  if (isStudent) {
    SidebarComponent = StudentSidebar;
  } else if (isParent) {
    SidebarComponent = ParentSidebar;
  } else if (isTeacher) {
    SidebarComponent = TeacherSidebar;
  } else if (isAdmin) {
    SidebarComponent = SchoolAdminSidebar;
  } else {
    // Fallback for unknown roles or if they shouldn't be here
    // But for now, let's redirect to unauthorized if it's none of the above
    // or arguably we could show a default (but user wants strict 5 dashboards)
    redirect("/unauthorized");
  }

  return (
    <div className="flex min-h-screen bg-neutral-50 overflow-hidden">
      {/* Fixed Sidebar */}
      <aside className="hidden w-[280px] flex-col border-r bg-white fixed inset-y-0 left-0 z-50 lg:flex">
        <SidebarComponent />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-[280px] h-screen overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          <div className="mx-auto max-w-7xl w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
