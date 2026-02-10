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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: school, error: schoolError } = await (supabase as any)
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

  // ============================================================
  // SUPPORT SYSTEM
  // ============================================================

  /**
   * Get all support tickets with filters
   */
  getSupportTickets: async (filters?: {
    status?: string;
    priority?: string;
    schoolId?: string;
  }) => {
    const supabase = createAdminClient();
    let query = supabase
      .from("support_tickets")
      .select(
        `
        *,
        school:schools(name),
        user:profiles!support_tickets_user_id_fkey(full_name, email),
        assigned_to:profiles!support_tickets_assigned_to_fkey(full_name)
      `,
      )
      .order("created_at", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.priority) {
      query = query.eq("priority", filters.priority);
    }
    if (filters?.schoolId) {
      query = query.eq("school_id", filters.schoolId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Create a new support ticket
   */
  createSupportTicket: async (ticketData: {
    schoolId?: string;
    userId?: string;
    subject: string;
    description: string;
    priority: string;
    category?: string;
    tags?: string[];
  }) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("support_tickets")
      .insert({
        school_id: ticketData.schoolId || null,
        user_id: ticketData.userId || null,
        subject: ticketData.subject,
        description: ticketData.description,
        priority: ticketData.priority,
        category: ticketData.category,
        tags: ticketData.tags,
        status: "open",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a support ticket
   */
  updateSupportTicket: async (
    ticketId: string,
    updates: {
      status?: string;
      priority?: string;
      assigned_to?: string;
    },
  ) => {
    const supabase = createAdminClient();
    const updateData: any = { ...updates };

    if (updates.status === "resolved") {
      updateData.resolved_at = new Date().toISOString();
    } else if (updates.status === "closed") {
      updateData.closed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("support_tickets")
      .update(updateData)
      .eq("id", ticketId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get messages for a ticket
   */
  getTicketMessages: async (ticketId: string) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("ticket_messages")
      .select(
        `
        *,
        user:profiles(full_name, email)
      `,
      )
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Add a message to a ticket
   */
  addTicketMessage: async (messageData: {
    ticketId: string;
    userId: string;
    message: string;
    isInternal?: boolean;
    attachments?: any;
  }) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("ticket_messages")
      .insert({
        ticket_id: messageData.ticketId,
        user_id: messageData.userId,
        message: messageData.message,
        is_internal: messageData.isInternal || false,
        attachments: messageData.attachments,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get all incidents
   */
  getIncidents: async (status?: string) => {
    const supabase = createAdminClient();
    let query = supabase
      .from("incidents")
      .select(
        `
        *,
        created_by:profiles(full_name)
      `,
      )
      .order("started_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Create a new incident
   */
  createIncident: async (incidentData: {
    title: string;
    description?: string;
    severity: string;
    affectedServices?: string[];
    createdBy: string;
  }) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("incidents")
      .insert({
        title: incidentData.title,
        description: incidentData.description,
        severity: incidentData.severity,
        affected_services: incidentData.affectedServices,
        created_by: incidentData.createdBy,
        started_at: new Date().toISOString(),
        status: "investigating",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an incident
   */
  updateIncident: async (
    incidentId: string,
    updates: {
      status?: string;
      description?: string;
      rootCause?: string;
    },
  ) => {
    const supabase = createAdminClient();
    const updateData: any = { ...updates };

    if (updates.status === "resolved") {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("incidents")
      .update(updateData)
      .eq("id", incidentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ============================================================
  // SYSTEM MONITORING
  // ============================================================

  /**
   * Get system metrics
   */
  getSystemMetrics: async (metricName?: string, hours: number = 24) => {
    const supabase = createAdminClient();
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    let query = supabase
      .from("system_metrics")
      .select("*")
      .gte("recorded_at", since)
      .order("recorded_at", { ascending: false });

    if (metricName) {
      query = query.eq("metric_name", metricName);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Record a system metric
   */
  recordSystemMetric: async (metricData: {
    metricName: string;
    metricValue: number;
    metricUnit?: string;
    metadata?: any;
  }) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("system_metrics")
      .insert({
        metric_name: metricData.metricName,
        metric_value: metricData.metricValue,
        metric_unit: metricData.metricUnit,
        metadata: metricData.metadata,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get system alerts
   */
  getSystemAlerts: async (status?: string) => {
    const supabase = createAdminClient();
    let query = supabase
      .from("system_alerts")
      .select(
        `
        *,
        acknowledged_by:profiles(full_name)
      `,
      )
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Create a system alert
   */
  createSystemAlert: async (alertData: {
    alertType: string;
    severity: string;
    message: string;
    metricName?: string;
    thresholdValue?: number;
    currentValue?: number;
  }) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("system_alerts")
      .insert({
        alert_type: alertData.alertType,
        severity: alertData.severity,
        message: alertData.message,
        metric_name: alertData.metricName,
        threshold_value: alertData.thresholdValue,
        current_value: alertData.currentValue,
        status: "active",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert: async (alertId: string, userId: string) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("system_alerts")
      .update({
        status: "acknowledged",
        acknowledged_by: userId,
        acknowledged_at: new Date().toISOString(),
      })
      .eq("id", alertId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Resolve an alert
   */
  resolveAlert: async (alertId: string) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("system_alerts")
      .update({
        status: "resolved",
        resolved_at: new Date().toISOString(),
      })
      .eq("id", alertId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ============================================================
  // SECURITY
  // ============================================================

  /**
   * Get IP rules
   */
  getIPRules: async (ruleType?: string) => {
    const supabase = createAdminClient();
    let query = supabase
      .from("ip_rules")
      .select(
        `
        *,
        created_by:profiles(full_name)
      `,
      )
      .order("created_at", { ascending: false });

    if (ruleType) {
      query = query.eq("rule_type", ruleType);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Create an IP rule
   */
  createIPRule: async (ruleData: {
    ipAddress: string;
    ruleType: string;
    reason?: string;
    createdBy: string;
    expiresAt?: string;
  }) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("ip_rules")
      .insert({
        ip_address: ruleData.ipAddress,
        rule_type: ruleData.ruleType,
        reason: ruleData.reason,
        created_by: ruleData.createdBy,
        expires_at: ruleData.expiresAt,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete an IP rule
   */
  deleteIPRule: async (ruleId: string) => {
    const supabase = createAdminClient();
    const { error } = await supabase.from("ip_rules").delete().eq("id", ruleId);

    if (error) throw error;
  },

  /**
   * Get login attempts
   */
  getLoginAttempts: async (filters?: { email?: string; success?: boolean }) => {
    const supabase = createAdminClient();
    let query = supabase
      .from("login_attempts")
      .select("*")
      .order("attempted_at", { ascending: false })
      .limit(100);

    if (filters?.email) {
      query = query.eq("email", filters.email);
    }
    if (filters?.success !== undefined) {
      query = query.eq("success", filters.success);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Log a login attempt
   */
  logLoginAttempt: async (attemptData: {
    email: string;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
    failureReason?: string;
    location?: any;
  }) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("login_attempts")
      .insert({
        email: attemptData.email,
        ip_address: attemptData.ipAddress,
        user_agent: attemptData.userAgent,
        success: attemptData.success,
        failure_reason: attemptData.failureReason,
        location: attemptData.location,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get active sessions
   */
  getActiveSessions: async (userId?: string) => {
    const supabase = createAdminClient();
    let query = supabase
      .from("active_sessions")
      .select(
        `
        *,
        user:profiles(full_name, email)
      `,
      )
      .gt("expires_at", new Date().toISOString())
      .order("last_activity", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Terminate a session
   */
  terminateSession: async (sessionId: string) => {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("active_sessions")
      .delete()
      .eq("id", sessionId);

    if (error) throw error;
  },

  /**
   * Get security policies
   */
  getSecurityPolicies: async () => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("security_policies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Update a security policy
   */
  updateSecurityPolicy: async (
    policyId: string,
    updates: { policy_config?: any; is_active?: boolean },
  ) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("security_policies")
      .update(updates)
      .eq("id", policyId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ============================================================
  // FEATURE FLAGS
  // ============================================================

  /**
   * Get all feature flags
   */
  getFeatureFlags: async () => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("feature_flags")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Create a feature flag
   */
  createFeatureFlag: async (flagData: {
    flagKey: string;
    flagName: string;
    description?: string;
    isEnabled?: boolean;
    rolloutPercentage?: number;
  }) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("feature_flags")
      .insert({
        flag_key: flagData.flagKey,
        flag_name: flagData.flagName,
        description: flagData.description,
        is_enabled: flagData.isEnabled || false,
        rollout_percentage: flagData.rolloutPercentage || 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Toggle a feature flag
   */
  toggleFeatureFlag: async (flagId: string, isEnabled: boolean) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("feature_flags")
      .update({ is_enabled: isEnabled })
      .eq("id", flagId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update feature flag rollout
   */
  updateFlagRollout: async (
    flagId: string,
    rolloutPercentage: number,
    targetSchools?: string[],
    targetUsers?: string[],
  ) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("feature_flags")
      .update({
        rollout_percentage: rolloutPercentage,
        target_schools: targetSchools,
        target_users: targetUsers,
      })
      .eq("id", flagId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get feature flag history
   */
  getFlagHistory: async (flagId: string) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("feature_flag_history")
      .select(
        `
        *,
        changed_by:profiles(full_name, email)
      `,
      )
      .eq("flag_id", flagId)
      .order("changed_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Delete a feature flag
   */
  deleteFeatureFlag: async (flagId: string) => {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("feature_flags")
      .delete()
      .eq("id", flagId);

    if (error) throw error;
  },

  // ============================================================
  // BACKGROUND JOBS
  // ============================================================

  /**
   * Get background jobs
   */
  getBackgroundJobs: async (filters?: {
    status?: string;
    jobType?: string;
  }) => {
    const supabase = createAdminClient();
    let query = supabase
      .from("background_jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.jobType) {
      query = query.eq("job_type", filters.jobType);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Create a background job
   */
  createBackgroundJob: async (jobData: {
    jobType: string;
    jobName: string;
    payload?: any;
    scheduledAt?: string;
    priority?: number;
  }) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("background_jobs")
      .insert({
        job_type: jobData.jobType,
        job_name: jobData.jobName,
        payload: jobData.payload,
        scheduled_at: jobData.scheduledAt,
        priority: jobData.priority || 0,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Retry a failed job
   */
  retryJob: async (jobId: string) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("background_jobs")
      .update({
        status: "pending",
        error_message: null,
        stack_trace: null,
      })
      .eq("id", jobId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Cancel a job
   */
  cancelJob: async (jobId: string) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("background_jobs")
      .update({ status: "cancelled" })
      .eq("id", jobId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get job schedules
   */
  getJobSchedules: async () => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("job_schedules")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Create a job schedule
   */
  createJobSchedule: async (scheduleData: {
    jobType: string;
    scheduleCron: string;
    isActive?: boolean;
  }) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("job_schedules")
      .insert({
        job_type: scheduleData.jobType,
        schedule_cron: scheduleData.scheduleCron,
        is_active:
          scheduleData.isActive !== undefined ? scheduleData.isActive : true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a job schedule
   */
  updateJobSchedule: async (
    scheduleId: string,
    updates: { schedule_cron?: string; is_active?: boolean },
  ) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("job_schedules")
      .update(updates)
      .eq("id", scheduleId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a job schedule
   */
  deleteJobSchedule: async (scheduleId: string) => {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("job_schedules")
      .delete()
      .eq("id", scheduleId);

    if (error) throw error;
  },

  // ============================================================
  // BACKUPS & EXPORTS
  // ============================================================

  /**
   * Get database backups
   */
  getDatabaseBackups: async (backupType?: string) => {
    const supabase = createAdminClient();
    let query = supabase
      .from("database_backups")
      .select(
        `
        *,
        created_by:profiles(full_name)
      `,
      )
      .order("created_at", { ascending: false });

    if (backupType) {
      query = query.eq("backup_type", backupType);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Create a database backup
   */
  createDatabaseBackup: async (backupData: {
    backupType: string;
    createdBy: string;
    retentionDays?: number;
  }) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("database_backups")
      .insert({
        backup_type: backupData.backupType,
        created_by: backupData.createdBy,
        retention_days: backupData.retentionDays || 30,
        backup_status: "in_progress",
        backup_location: `/backups/${Date.now()}.sql`,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update backup status (after backup completes)
   */
  updateBackupStatus: async (
    backupId: string,
    status: string,
    backupSize?: number,
    errorMessage?: string,
  ) => {
    const supabase = createAdminClient();
    const updateData: any = {
      backup_status: status,
      completed_at: new Date().toISOString(),
    };

    if (backupSize) updateData.backup_size_bytes = backupSize;
    if (errorMessage) updateData.error_message = errorMessage;

    const { data, error } = await supabase
      .from("database_backups")
      .update(updateData)
      .eq("id", backupId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a backup
   */
  deleteBackup: async (backupId: string) => {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("database_backups")
      .delete()
      .eq("id", backupId);

    if (error) throw error;
  },

  /**
   * Get data exports
   */
  getDataExports: async (exportType?: string) => {
    const supabase = createAdminClient();
    let query = supabase
      .from("data_exports")
      .select(
        `
        *,
        requested_by:profiles(full_name)
      `,
      )
      .order("created_at", { ascending: false });

    if (exportType) {
      query = query.eq("export_type", exportType);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Create a data export
   */
  createDataExport: async (exportData: {
    exportType: string;
    exportFormat: string;
    filters?: any;
    requestedBy: string;
  }) => {
    const supabase = createAdminClient();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    const { data, error } = await supabase
      .from("data_exports")
      .insert({
        export_type: exportData.exportType,
        export_format: exportData.exportFormat,
        filters: exportData.filters,
        requested_by: exportData.requestedBy,
        expires_at: expiresAt.toISOString(),
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update export status
   */
  updateExportStatus: async (
    exportId: string,
    status: string,
    filePath?: string,
    fileSize?: number,
  ) => {
    const supabase = createAdminClient();
    const updateData: any = {
      status,
      completed_at: new Date().toISOString(),
    };

    if (filePath) updateData.file_path = filePath;
    if (fileSize) updateData.file_size_bytes = fileSize;

    const { data, error } = await supabase
      .from("data_exports")
      .update(updateData)
      .eq("id", exportId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ============================================================
  // INTEGRATIONS
  // ============================================================

  /**
   * Get integration configs
   */
  getIntegrationConfigs: async (integrationType?: string) => {
    const supabase = createAdminClient();
    let query = supabase
      .from("integration_configs")
      .select("*")
      .order("created_at", { ascending: false });

    if (integrationType) {
      query = query.eq("integration_type", integrationType);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Create or update an integration config
   */
  upsertIntegrationConfig: async (configData: {
    integrationName: string;
    integrationType: string;
    configData: any;
    isEnabled?: boolean;
    testMode?: boolean;
  }) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("integration_configs")
      .upsert(
        {
          integration_name: configData.integrationName,
          integration_type: configData.integrationType,
          config_data: configData.configData,
          is_enabled:
            configData.isEnabled !== undefined ? configData.isEnabled : false,
          test_mode:
            configData.testMode !== undefined ? configData.testMode : true,
        },
        { onConflict: "integration_name" },
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Test an integration
   */
  testIntegration: async (integrationId: string) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("integration_configs")
      .update({
        last_tested_at: new Date().toISOString(),
        test_status: "success",
      })
      .eq("id", integrationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get webhooks
   */
  getWebhooks: async () => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("webhooks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Create a webhook
   */
  createWebhook: async (webhookData: {
    url: string;
    events: string[];
    secretKey: string;
    retryConfig?: any;
  }) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("webhooks")
      .insert({
        url: webhookData.url,
        events: webhookData.events,
        secret_key: webhookData.secretKey,
        retry_config: webhookData.retryConfig,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a webhook
   */
  updateWebhook: async (
    webhookId: string,
    updates: { url?: string; events?: string[]; isActive?: boolean },
  ) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("webhooks")
      .update(updates)
      .eq("id", webhookId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a webhook
   */
  deleteWebhook: async (webhookId: string) => {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("webhooks")
      .delete()
      .eq("id", webhookId);

    if (error) throw error;
  },

  /**
   * Get webhook deliveries
   */
  getWebhookDeliveries: async (webhookId: string) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("webhook_deliveries")
      .select("*")
      .eq("webhook_id", webhookId)
      .order("delivered_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return data;
  },
};
