export type Role =
  | "SUPER_ADMIN"
  | "SCHOOL_ADMIN"
  | "TEACHER"
  | "STUDENT"
  | "PARENT";

export type Permission =
  | "users:create"
  | "users:read"
  | "users:update"
  | "users:delete"
  | "academics:read"
  | "academics:write"
  | "financials:read"
  | "financials:write"
  | "settings:manage";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatarUrl?: string;
  schoolId: string;
  permissions: Permission[];
  preferences: {
    theme: "light" | "dark" | "system";
    notifications: boolean;
  };
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  device: {
    ip: string;
    userAgent: string;
    location?: string;
    lastActive: string;
  };
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}
