import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

// Use service role key for Super Admin operations to bypass RLS potentially.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export interface DashboardStats {
  totalSchools: number;
  totalUsers: number;
  monthlyRevenue: number;
  systemUptime: number;
}

export interface SystemHealth {
  database: "healthy" | "degraded" | "down";
  apiLatency: number;
  storageUsage: number;
}

export interface BillingStat {
  totalRevenue: number;
  pendingInvoices: number;
  mrr: number;
  activeSubscriptions: number;
}

export class SuperAdminService {
  private supabase;

  constructor() {
    this.supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
  }

  async getPlatformStats(): Promise<DashboardStats> {
    const { count: schoolsCount } = await this.supabase
      .from("schools")
      .select("*", { count: "exact", head: true });

    const { count: usersCount } = await this.supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Mock revenue for now as we don't have a payments table yet
    return {
      totalSchools: schoolsCount || 0,
      totalUsers: usersCount || 0,
      monthlyRevenue: 45230, // Placeholder
      systemUptime: 99.98,
    };
  }

  async getDashboardStats() {
    return this.getPlatformStats();
  }

  async getSystemHealth(): Promise<SystemHealth> {
    // In a real app, check DB connection, external API status, etc.
    return {
      database: "healthy",
      apiLatency: 45,
      storageUsage: 45, // percentage
    };
  }

  async getBillingStats(): Promise<BillingStat> {
    // Placeholder fetching
    return {
      totalRevenue: 45230,
      pendingInvoices: 6,
      mrr: 18400,
      activeSubscriptions: 84,
    };
  }

  async getRecentAuditLogs(limit = 5) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase as any)
      .from("audit_logs")
      .select("*, changed_by(email), school:schools(name)")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  async getSchools() {
    const { data, error } = await this.supabase
      .from("schools")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  async getUsers(searchQuery?: string, limit = 100) {
    let query = this.supabase
      .from("profiles")
      .select("*, school_members(role, school:schools(name))")
      .order("created_at", { ascending: false });

    if (searchQuery) {
      query = query.ilike("email", `%${searchQuery}%`);
    }

    const { data, error } = await query.limit(limit);

    if (error) throw error;
    return data;
  }

  async createSchool(data: {
    name: string;
    slug: string;
    address?: any; // Use any to bypass Json type strictness for now
    contact_email: string;
    contact_phone?: string;
  }) {
     
    const { data: school, error } = await this.supabase
      .from("schools")
      .insert(data as any)
      .select()
      .single();

    if (error) throw error;
    return school;
  }

  async createSchoolAdmin(schoolId: string, email: string) {
    // 1. Check if user exists (mock check, would need auth admin api)
    // 2. If not, create invite (mock)
    // 3. Assign role

    // For now, just a placeholder record in school_members
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase as any)
      .from("school_members")
      .insert({
        school_id: schoolId,
        user_id: "placeholder-user-id", // This needs real user ID logic
        role: "admin",
        status: "invited",
      });

    if (error) throw error;

    await this.logAction({
      table_name: "school_members",
      operation: "CREATE",
      school_id: schoolId,
      new_values: { email, role: "admin" },
    });
  }

  async toggleSchoolStatus(
    schoolId: string,
    status: "active" | "inactive" | "suspended",
  ) {
     
    const { error } = await this.supabase
      .from("schools")
      .update({ subscription_status: status } as any)
      .eq("id", schoolId);

    if (error) throw error;

    await this.logAction({
      table_name: "schools",
      operation: "UPDATE",
      record_id: schoolId,
      new_values: { status },
    });
  }

  async logAction(action: {
    table_name?: string;
    operation: string;
    record_id?: string | null;
    old_values?: any;
    new_values?: any;
    school_id?: string | null;
  }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase as any)
      .from("audit_logs")
      .insert(action);

    if (error) {
      console.error("CRITICAL: Failed to log audit action:", error);
      // In a real production app, we might want to throw here or send to an external monitoring service
      // to ensure we don't silently lose audit trails.
    }
  }
}
