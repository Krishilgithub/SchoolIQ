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
        const [profileResult, schoolMemberResult] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (supabase as any)
            .from("school_members")
            .select("school_id")
            .eq("user_id", userId)
            .maybeSingle(),
        ]);

        if (profileResult.error) {
          console.error(
            "Error fetching profile:",
            JSON.stringify(profileResult.error, null, 2),
          );
        } else if (profileResult.data) {
          setProfile(profileResult.data);
        } else {
          // Profile doesn't exist. User must contact support or trigger must handle it.
          console.warn(`Profile missing for user ${userId}`);
        }

        if (schoolMemberResult.error) {
          console.error(
            "Error fetching school member:",
            JSON.stringify(schoolMemberResult.error, null, 2),
          );
        } else if (schoolMemberResult.data) {
          setSchoolId(schoolMemberResult.data.school_id);
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
    await supabase.auth.signOut();
    router.push("/auth/login");
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
