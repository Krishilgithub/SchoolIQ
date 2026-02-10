"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useCurrentSchool() {
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchSchoolId() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        // First try school_admins
        let { data: adminData, error: adminError } = await supabase
          .from("school_admins")
          .select("school_id")
          .eq("user_id", user.id)
          .single();

        if (adminData) {
          setSchoolId(adminData.school_id);
        } else {
          // If not admin, check teachers (if table exists and RLS allows)
          // or other roles. for now we assume admin.
          // If we add teachers later, we can extend this.
          // For now just error if not found.
          if (adminError) {
            console.error("Error fetching school admin:", adminError);
          }
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchSchoolId();
  }, [supabase]);

  return { schoolId, loading, error };
}
