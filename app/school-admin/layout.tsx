import { SchoolAdminSidebar } from "@/components/school-admin/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SchoolAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?callbackUrl=/school-admin/dashboard");
  }

  // Fetch user role and verify access
  const { data: userProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = userProfile?.role;
  const isAdmin = role === "admin" || role === "school_admin";

  if (!isAdmin) {
    redirect("/unauthorized");
  }

  return (
    <div
      className="flex min-h-screen bg-neutral-50 overflow-hidden"
      suppressHydrationWarning={true}
    >
      {/* Fixed Sidebar */}
      <aside
        className="hidden w-[280px] flex-col border-r bg-white fixed inset-y-0 left-0 z-50 lg:flex"
        suppressHydrationWarning={true}
      >
        <SchoolAdminSidebar />
      </aside>

      {/* Main Content Area */}
      <div
        className="flex flex-1 flex-col lg:pl-[280px] h-screen overflow-hidden"
        suppressHydrationWarning={true}
      >
        <DashboardHeader />
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden p-6"
          suppressHydrationWarning={true}
        >
          <div
            className="mx-auto max-w-7xl w-full"
            suppressHydrationWarning={true}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
