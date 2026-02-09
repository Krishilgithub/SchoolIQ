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
  slug: string;
  school_type: string;
  logo_url: string | null;
  subscription_status: string;
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
  storageUsage?: number; // GB, optional field
}

export interface AuditLog {
  id: string;
  operation: string;
  table_name: string;
  created_at: string;
  school?: { name: string } | null;
  changed_by?: { email: string } | null;
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
    slug?: string;
    schoolType?: string;
    phone?: string;
    address?: string;
    adminEmail: string;
    adminName: string;
  }): Promise<{ school: any; user: any; temporaryPassword: string }> => {
    const supabase = createAdminClient();

    // Generate unique slug
    let finalSlug = data.slug || slugify(data.schoolName);
    let slugExists = true;
    let counter = 1;

    // Check if slug exists and append number if needed
    while (slugExists) {
      const { data: existingSchool } = await supabase
        .from("schools")
        .select("id")
        .eq("slug", finalSlug)
        .single();

      if (!existingSchool) {
        slugExists = false;
      } else {
        // Append counter to make it unique
        finalSlug = `${data.slug || slugify(data.schoolName)}-${counter}`;
        counter++;
      }
    }

    // 1. Create School
    const { data: school, error: schoolError } = await supabase
      .from("schools")
      .insert({
        name: data.schoolName,
        slug: finalSlug,
        contact_email: data.adminEmail,
        subscription_status: "active",
        school_type:
          (data.schoolType as "k12" | "higher_ed" | "vocational") || "k12",
        phone: data.phone || null,
        address: data.address || null,
      })
      .select()
      .single();

    if (schoolError)
      throw new Error(`Failed to create school: ${schoolError.message}`);

    // 2. Create Admin User with temporary password
    // Generate a secure temporary password
    const temporaryPassword = `School${Math.random().toString(36).slice(-8)}@${Date.now().toString(36)}`;

    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email: data.adminEmail,
        password: temporaryPassword,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
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

    return { school, user: authUser.user, temporaryPassword };
  },

  /**
   * Get all schools with their key metrics
   */
  getAllSchools: async () => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("schools")
      .select("*, school_admins(user_id, role)");

    if (error) throw error;
    return data;
  },

  /**
   * Get a single school by ID
   */
  getSchoolById: async (schoolId: string) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("schools")
      .select("*, school_admins(user_id, role)")
      .eq("id", schoolId)
      .single();

    if (error) return null;
    return data;
  },

  /**
   * Get all users for a specific school
   */
  getUsersBySchoolId: async (schoolId: string) => {
    const supabase = createAdminClient();

    // Fetch school admins first
    const { data: admins, error: adminError } = await supabase
      .from("school_admins")
      .select("user_id, role")
      .eq("school_id", schoolId);

    if (adminError) throw adminError;

    if (!admins || admins.length === 0) return [];

    const userIds = admins.map((a) => a.user_id);

    // Fetch profiles for these admins
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .in("id", userIds);

    if (profileError) throw profileError;

    // Merge data
    const users = profiles.map((profile) => {
      const adminInfo = admins.find((a) => a.user_id === profile.id);
      return {
        ...profile,
        school_admins: adminInfo ? [adminInfo] : [],
      };
    });

    return users as unknown as SuperAdminUser[];
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
   * Update school details
   */
  updateSchool: async (
    schoolId: string,
    updates: { name?: string; slug?: string; contact_email?: string },
  ) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("schools")
      .update(updates)
      .eq("id", schoolId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update school: ${error.message}`);
    return data;
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

    // 2. Total Users Count (using profiles for now as proxy)
    const { count: studentsCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // 3. Calculate MRR (Mock logic based on assumption: $100/school for 'Pro', $0 for 'Free')
    // Ideally we'd join with a plans table. For now, we'll estimate.
    // Let's assume all active schools are on a $99/mo plan for this MVP calculation if plan info is missing.
    const estimatedMRR = (activeSchoolsCount || 0) * 99;

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
        label: "Monthly Revenue",
        value: `$${estimatedMRR.toLocaleString()}`,
        change: 5.4,
        trend: "up",
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
        value: 0, // Placeholder until ticketing system is connected
        change: 0,
        trend: "neutral",
        history: generateHistory(),
      },
    ];
  },

  /**
   * Impersonate a user
   * WARNING: This is a sensitive operation.
   * For the MVP, this will return a URL or indicator to the frontend to handle the session switch
   * if using client-side auth, or we'd generate a magic link.
   *
   * For now, we'll just return a success flags to simulate the action.
   */
  impersonateUser: async (userId: string) => {
    const supabase = createAdminClient();

    // Check if user exists
    const { data: user, error } = await supabase.auth.admin.getUserById(userId);
    if (error || !user) throw new Error("User not found");

    // In a real implementation with Supabase, we might generate a magic link
    // that the admin can click to sign in as that user.
    const { data: linkData, error: linkError } =
      await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: user.user.email ?? "",
      });

    if (linkError)
      throw new Error(
        `Failed to generate impersonation link: ${linkError.message}`,
      );

    return {
      success: true,
      redirectUrl: linkData.properties?.action_link,
      message: "Impersonation link generated",
    };
  },

  getPlatformHealth: async (): Promise<PlatformHealth> => {
    // Mock health data
    return {
      apiLatency: 45 + Math.random() * 20,
      dbLoad: 32 + Math.random() * 15,
      errorRate: Math.random() * 0.5,
      queueDepth: Math.floor(Math.random() * 50),
      storageUsage: 450 + Math.floor(Math.random() * 100), // Mock storage in GB
    };
  },

  getRecentAuditLogs: async (): Promise<AuditLog[]> => {
    // Mock audit logs for now - in production this would query the audit_logs table
    const mockOperations = ["INSERT", "UPDATE", "DELETE"];
    const mockTables = ["schools", "profiles", "students", "classes", "grades"];

    return Array.from({ length: 5 }, (_, i) => ({
      id: `audit-${i}`,
      operation:
        mockOperations[Math.floor(Math.random() * mockOperations.length)],
      table_name: mockTables[Math.floor(Math.random() * mockTables.length)],
      created_at: new Date(Date.now() - i * 3600000).toISOString(),
      school: { name: `School ${i + 1}` },
      changed_by: { email: `admin${i}@test.com` },
    }));
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
      slug: s.slug,
      school_type: s.school_type || "k12",
      logo_url: s.logo_url || null,
      subscription_status: s.subscription_status || "active",
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
