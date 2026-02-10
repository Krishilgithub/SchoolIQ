import { AdminSidebar } from "@/components/super-admin/admin-sidebar";
import { SuperAdminHeader } from "@/components/super-admin/header";
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
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <SuperAdminHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl space-y-4">{children}</div>
        </main>
      </div>
    </div>
  );
}
