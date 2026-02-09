import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

// Types matching the dashboard components
export interface StatMetric {
  label: string;
  value: string | number;
  change: number; // percentage
  trend: "up" | "down" | "neutral";
  history?: number[]; // for sparklines
}

export interface DashboardSchool {
  id: string;
  name: string;
  plan: "Free" | "Pro" | "Enterprise";
  status: "Active" | "Suspended" | "Pending";
  users: number;
  revenue: number;
  health: number; // 0-100
  lastActive: string;
}

export interface Ticket {
  id: string;
  subject: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "In Progress" | "Resolved";
  created: string;
  user: string;
}

export interface PlatformHealth {
  apiLatency: number; // ms
  dbLoad: number; // %
  errorRate: number; // %
  queueDepth: number;
}

export interface SuperAdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  phone_number: string | null;
  is_super_admin: boolean;
  created_at: string;
  updated_at: string;
  is_suspended?: boolean;
  deleted_at?: string | null;
  school_admins: {
    role: string;
    schools: {
      name: string;
    } | null;
  }[];
}

export const superAdminService = {
  /**
   * Create a new school and its primary admin in a transaction-like manner.
   */
  createSchoolWithAdmin: async (data: {
    schoolName: string;
    adminEmail: string;
    adminName: string;
  }) => {
    const supabase = createAdminClient();

    // 1. Create School
    const { data: school, error: schoolError } = await supabase
      .from("schools")
      .insert({
        name: data.schoolName,
        slug: slugify(data.schoolName),
        contact_email: data.adminEmail,
        subscription_status: "active",
        school_type: "k12", // Default for now
      })
      .select()
      .single();

    if (schoolError)
      throw new Error(`Failed to create school: ${schoolError.message}`);

    // 2. Invite/Create Admin User
    const { data: authUser, error: authError } =
      await supabase.auth.admin.inviteUserByEmail(data.adminEmail, {
        data: {
          full_name: data.adminName,
          role: "school_admin",
          school_id: school.id,
        },
      });

    if (authError)
      throw new Error(`Failed to create admin user: ${authError.message}`);

    // 3. Link Admin to School (school_admins table)
    const { error: memberError } = await supabase.from("school_admins").insert({
      user_id: authUser.user.id,
      school_id: school.id,
      role: "admin",
    });

    if (memberError) {
      // Rollback logic would go here in a real transaction,
      // but Supabase HTTP API doesn't support multi-table transactions easily without RPC.
      // For now, we throw.
      throw new Error(`Failed to link admin to school: ${memberError.message}`);
    }

    return { school, user: authUser.user };
  },

  /**
   * Get all schools with their key metrics
   */
  getAllSchools: async () => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("schools")
      .select("*, school_admins(count)");

    if (error) throw error;
    return data;
  },

  /**
   * Suspend a school
   */
  suspendSchool: async (schoolId: string) => {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("schools")
      .update({ subscription_status: "canceled" }) // or whatever state 'suspended' maps to
      .eq("id", schoolId);

    if (error) throw error;
  },

  /**
   * Get all users with their school and role info
   */
  getAllUsers: async () => {
    const supabase = createAdminClient();
    // Fetch profiles and join with school_admins to get school info
    // @ts-ignore
    const { data, error } = await supabase.from("profiles").select(`
        *,
        school_admins (
          role,
          schools (
            name
          )
        )
      `);

    if (error) throw error;

    // Explicitly cast to include the new fields and ensure serialization
    return JSON.parse(JSON.stringify(data)) as unknown as SuperAdminUser[];
  },

  /**
   * Get executive stats for the dashboard
   */
  getExecutiveStats: async (): Promise<StatMetric[]> => {
    const supabase = createAdminClient();

    // 1. Active Schools Count
    const { count: activeSchoolsCount } = await supabase
      .from("schools")
      .select("*", { count: "exact", head: true })
      .eq("subscription_status", "active");

    // 2. Total Students Count (using profiles for now as proxy or students table if populated)
    const { count: studentsCount } = await supabase
      .from("profiles") // Or "students"
      .select("*", { count: "exact", head: true });

    // Mock history for charts
    const generateHistory = () =>
      Array.from({ length: 7 }, () => Math.floor(Math.random() * 100));

    return [
      {
        label: "Active Schools",
        value: (activeSchoolsCount || 0).toLocaleString(),
        change: 12.5, // Mock change
        trend: "up",
        history: generateHistory(),
      },
      {
        label: "Total Users",
        value: (studentsCount || 0).toLocaleString(),
        change: 8.2, // Mock change
        trend: "up",
        history: generateHistory(),
      },
      {
        label: "MRR",
        value: "$0.00", // Hardcoded for now
        change: 0,
        trend: "neutral",
        history: generateHistory(),
      },
      {
        label: "Avg Uptime",
        value: "99.99%",
        change: 0,
        trend: "up",
        history: [100, 100, 100, 100, 100, 100, 100],
      },
      {
        label: "Open Tickets",
        value: 0,
        change: 0,
        trend: "neutral",
        history: generateHistory(),
      },
    ];
  },

  getPlatformHealth: async (): Promise<PlatformHealth> => {
    // Mock health data
    return {
      apiLatency: 45 + Math.random() * 20,
      dbLoad: 32 + Math.random() * 15,
      errorRate: Math.random() * 0.5,
      queueDepth: Math.floor(Math.random() * 50),
    };
  },

  getRecentSchools: async (): Promise<DashboardSchool[]> => {
    const supabase = createAdminClient();
    const { data: schools } = await supabase
      .from("schools")
      .select("*, school_admins(count)")
      .order("created_at", { ascending: false })
      .limit(5);

    if (!schools) return [];

    return schools.map((s: any) => ({
      id: s.id,
      name: s.name,
      plan: "Free", // Default
      status:
        s.subscription_status === "active"
          ? "Active"
          : s.subscription_status === "canceled"
            ? "Suspended"
            : "Pending",
      users: s.school_admins ? s.school_admins[0].count : 0,
      revenue: 0,
      health: 100,
      lastActive: new Date(s.updated_at || s.created_at).toLocaleDateString(),
    }));
  },

  getRecentTickets: async (): Promise<Ticket[]> => {
    // Mock tickets
    return [];
  },

  /**
   * Suspend or unsuspend a user.
   * Updates both the profile status and the Supabase Auth ban duration.
   */
  suspendUser: async (userId: string, shouldSuspend: boolean) => {
    const supabase = createAdminClient();

    // 1. Update Profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ is_suspended: shouldSuspend })
      .eq("id", userId);

    if (profileError) throw profileError;

    // 2. Update Auth User (Ban/Unban)
    const banDuration = shouldSuspend ? "876000h" : "0s"; // ~100 years or 0
    const { error: authError } = await supabase.auth.admin.updateUserById(
      userId,
      { ban_duration: banDuration },
    );

    if (authError) throw authError;
  },

  /**
   * Soft delete a user.
   * Sets deleted_at and bans the user.
   */
  deleteUser: async (userId: string) => {
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    // 1. Soft delete profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ deleted_at: now, is_suspended: true })
      .eq("id", userId);

    if (profileError) throw profileError;

    // 2. Soft delete from school_admins (optional but good for consistency)
    const { error: memberError } = await supabase
      .from("school_admins")
      .delete()
      .eq("user_id", userId);

    // 3. Ban in Auth (We don't hard delete from Auth to keep ID reference if needed, or we can hard delete)
    // For now, let's hard delete from Auth to ensure they can't login and email is freed up
    // BUT requirements might say "Soft Delete". Let's stick to Ban + Soft Delete in DB.
    const { error: authError } = await supabase.auth.admin.updateUserById(
      userId,
      { ban_duration: "876000h" },
    );

    if (authError) throw authError;
  },
};
