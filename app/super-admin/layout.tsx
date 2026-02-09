import { SuperAdminSidebar } from "@/components/dashboard/super-admin-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?callbackUrl=/super-admin");
  }

  // Check role in profiles table
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    // Handle error or missing profile
    redirect("/auth/login?error=ProfileNotFound");
  }

  if (!profile.is_super_admin) {
    redirect("/unauthorized");
  }

  return (
    <div className="flex min-h-screen bg-neutral-50 overflow-hidden">
      {/* Fixed Sidebar */}
      <aside className="hidden w-[280px] flex-col border-r bg-white fixed inset-y-0 left-0 z-50 lg:flex">
        <SuperAdminSidebar />
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
