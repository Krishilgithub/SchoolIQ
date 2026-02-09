"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
          router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("is_super_admin")
          .eq("id", session.user.id)
          .single();

        if (!profile?.is_super_admin) {
          router.push("/dashboard");
          return;
        }

        setIsSuperAdmin(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname, supabase]);

  return { isLoading, isSuperAdmin };
}
