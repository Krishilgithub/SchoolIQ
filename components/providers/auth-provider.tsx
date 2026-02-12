"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

import { Database } from "@/types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  schoolId: string | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  schoolId: null,
  isLoading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supabase] = useState(() => createClient());
  const router = useRouter();

  const fetchProfileAndSchool = useCallback(
    async (userId: string) => {
      try {
        // Fetch profile first
        const profileResult = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (profileResult.error) {
          console.error(
            "Error fetching profile:",
            JSON.stringify(profileResult.error, null, 2),
          );
        } else if (profileResult.data) {
          setProfile(profileResult.data);
        } else {
          console.warn(`Profile missing for user ${userId}`);
        }

        // Check for school assignment in school_admins table first (for admins created by super-admin)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const schoolAdminResult = await (supabase as any)
          .from("school_admins")
          .select("school_id")
          .eq("user_id", userId)
          .maybeSingle();

        if (schoolAdminResult.data) {
          // Found school assignment in school_admins
          setSchoolId(schoolAdminResult.data.school_id);
          return;
        }

        // If not found in school_admins, check school_members (for regular users)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const schoolMemberResult = await (supabase as any)
          .from("school_members")
          .select("school_id")
          .eq("user_id", userId)
          .maybeSingle();

        if (schoolMemberResult.error) {
          console.error(
            "Error fetching school member:",
            JSON.stringify(schoolMemberResult.error, null, 2),
          );
        } else if (schoolMemberResult.data) {
          setSchoolId(schoolMemberResult.data.school_id);
        } else {
          console.warn(`No school assigned to user ${userId}`);
        }
      } catch (error) {
        console.error("Unexpected error fetching profile/school:", error);
      }
    },
    [supabase],
  );

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfileAndSchool(session.user.id);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (event === "SIGNED_IN" && session?.user) {
        await fetchProfileAndSchool(session.user.id);
        router.refresh();
      } else if (event === "SIGNED_OUT") {
        setProfile(null);
        setSchoolId(null);
        setUser(null);
        setSession(null);
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, fetchProfileAndSchool]);

  const signOut = async () => {
    try {
      // Clear local state immediately
      setProfile(null);
      setSchoolId(null);
      setUser(null);
      setSession(null);

      // Call server-side signout to clear server cookies
      try {
        await fetch('/api/auth/signout', { method: 'POST' });
      } catch (error) {
        console.error('Server signout failed:', error);
      }

      // Sign out from Supabase with scope 'global' to clear all sessions
      await supabase.auth.signOut({ scope: 'global' });

      // Clear all local storage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }

      // Force redirect to login with cache clear
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Error signing out:", error);
      // Still redirect even if there's an error
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/auth/login";
      }
    }
  };

  const value = {
    user,
    session,
    profile,
    schoolId,
    isLoading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
