import { User, Session, Role } from "@/types/auth";

const MOCK_DELAY_MS = 800;

export class MockAuthService {
  private static async delay() {
    return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  }

  static async login(
    email: string,
    password: string,
  ): Promise<{ user: User; session: Session }> {
    await this.delay();

    if (password === "error") {
      throw new Error("Invalid credentials");
    }

    // Simulate different roles based on email pattern
    let role: Role = "SCHOOL_ADMIN";
    if (email.includes("teacher")) role = "TEACHER";
    if (email.includes("student")) role = "STUDENT";
    if (email.includes("parent")) role = "PARENT";
    if (email.includes("super")) role = "SUPER_ADMIN";

    const user: User = {
      id: "usr_" + Math.random().toString(36).substr(2, 9),
      email,
      firstName: "Rahul",
      lastName: "Verma",
      role,
      schoolId: "sch_demo",
      permissions: ["users:read", "academics:read"], // Basic set
      preferences: {
        theme: "system",
        notifications: true,
      },
      avatarUrl: "https://github.com/shadcn.png",
    };

    const session: Session = {
      id: "sess_" + Math.random().toString(36).substr(2, 9),
      userId: user.id,
      token: "mock_jwt_" + Date.now(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      device: {
        ip: "192.168.1.1",
        userAgent: navigator.userAgent,
        lastActive: new Date().toISOString(),
        location: "Mumbai, India",
      },
    };

    // Persist to localStorage for "Remember Me" simulation
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "schooliq_session",
        JSON.stringify({ user, session }),
      );
    }

    return { user, session };
  }

  static async logout(): Promise<void> {
    await this.delay();
    if (typeof window !== "undefined") {
      localStorage.removeItem("schooliq_session");
    }
  }

  static async getSession(): Promise<{ user: User; session: Session } | null> {
    await this.delay();
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("schooliq_session");
      if (stored) return JSON.parse(stored);
    }
    return null;
  }
}
