import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function requireSuperAdmin() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login?redirect=/super-admin/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", session.user.id)
    .single();

  if (!profile?.is_super_admin) {
    redirect("/dashboard");
  }

  return session;
}
