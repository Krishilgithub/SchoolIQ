import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthState, User, Session } from "@/types/auth";
import { MockAuthService } from "@/services/auth";

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setSession: (session) => set({ session }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { user, session } = await MockAuthService.login(
            email,
            password,
          );
          set({ user, session, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        await MockAuthService.logout();
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: "schooliq-auth-storage",
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
