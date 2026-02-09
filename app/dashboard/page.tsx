import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_super_admin")
    .eq("id", user.id)
    .single();

  if (profile?.is_super_admin) {
    redirect("/super-admin");
  }

  const role = profile?.role;

  if (role === "admin" || role === "school_admin") {
    redirect("/dashboard/admin");
  } else if (role === "teacher") {
    redirect("/dashboard/teacher");
  } else if (role === "student") {
    redirect("/dashboard/student");
  } else if (role === "parent") {
    redirect("/dashboard/parent");
  } else {
    redirect("/unauthorized");
  }
}
