"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function useRequireSuperAdmin() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          toast.error("Please sign in to continue");
          router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("is_super_admin")
          .eq("id", session.user.id)
          .single();

        if (!profile?.is_super_admin) {
          toast.error("Super admin access required");
          router.push("/unauthorized");
          return;
        }

        setIsSuperAdmin(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        toast.error("Authentication failed");
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname, supabase]);

  return { isLoading, isSuperAdmin };
}
