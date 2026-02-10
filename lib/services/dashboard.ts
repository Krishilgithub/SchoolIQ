/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/client";
import type {
  DashboardStats,
  ActivityItem,
  UpcomingEvent,
} from "@/lib/types/dashboard";

/**
 * Get comprehensive dashboard statistics for a school
 */
export async function getDashboardStats(
  schoolId: string,
): Promise<DashboardStats> {
  const supabase = createClient();

  // Initialize default values
  let totalStudents = 0;
  let totalTeachers = 0;
  let activeClasses = 0;
  let attendanceRate = 0;
  let pendingNotifications = 0;
  let recentEnrollments = 0;

  // Get total students (safely, tables might not exist yet)
  try {
    const result: any = await supabase
      .from("students" as any)
      .select("*", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .eq("is_active", true);
    totalStudents = result.count || 0;
  } catch (error) {
    console.warn("Students table not available yet");
  }

  // Get total teachers
  try {
    const result: any = await supabase
      .from("teachers" as any)
      .select("*", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .eq("status", "active");
    totalTeachers = result.count || 0;
  } catch (error) {
    console.warn("Teachers table not available yet");
  }

  // Get active classes
  try {
    const result = await supabase
      .from("classes" as any)
      .select("*", { count: "exact", head: true })
      .eq("school_id", schoolId);
    activeClasses = result.count || 0;
  } catch (error) {
    console.warn("Classes table not fully available");
  }

  // Get today's attendance rate
  try {
    const today = new Date().toISOString().split("T")[0];
    const { data: attendanceData }: any = await supabase
      .from("attendance" as any)
      .select("status")
      .eq("school_id", schoolId)
      .gte("created_at", today);

    if (attendanceData && attendanceData.length > 0) {
      attendanceRate =
        (attendanceData.filter((a: any) => a.status === "present").length /
          attendanceData.length) *
        100;
    }
  } catch (error) {
    console.warn("Attendance table not available yet");
  }

  // Get pending notifications (for current user)
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const result = await supabase
        .from("notifications" as any)
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      pendingNotifications = result.count || 0;
    }
  } catch (error) {
    console.warn("Notifications query failed");
  }

  // Get recent enrollments (last 30 days)
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const result: any = await supabase
      .from("students" as any)
      .select("*", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .gte("enrollment_date", thirtyDaysAgo.toISOString().split("T")[0]);
    recentEnrollments = result.count || 0;
  } catch (error) {
    console.warn("Students enrollment query failed");
  }

  // Calculate trends (placeholder for now)
  const studentTrend = {
    value: 0,
    direction: "neutral" as const,
    percentage: 0,
  };

  return {
    totalStudents,
    totalTeachers,
    activeClasses,
    attendanceRate: Math.round(attendanceRate * 10) / 10,
    pendingNotifications,
    recentEnrollments,
    trends: {
      students: studentTrend,
      teachers: { value: 0, direction: "neutral", percentage: 0 },
    },
  };
}

/**
 * Get recent activities from audit logs
 */
export async function getRecentActivities(
  schoolId: string,
  limit: number = 15,
): Promise<ActivityItem[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("audit_logs" as any)
      .select(
        `
        id,
        user_id,
        action,
        resource_type,
        resource_id,
        metadata,
        created_at,
        profiles:user_id (
          first_name,
          last_name
        )
      `,
      )
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching activities:", error);
      return [];
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      userName: item.profiles
        ? `${item.profiles.first_name} ${item.profiles.last_name}`
        : "Unknown User",
      action: item.action,
      resourceType: item.resource_type,
      resourceId: item.resource_id,
      timestamp: new Date(item.created_at),
      metadata: item.metadata,
    }));
  } catch (error) {
    console.error("Failed to fetch activities:", error);
    return [];
  }
}

/**
 * Get upcoming events (exams, holidays, etc.)
 */
/**
 * Get upcoming events (exams, holidays, etc.)
 */
export async function getUpcomingEvents(
  schoolId: string,
): Promise<UpcomingEvent[]> {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];

  const events: UpcomingEvent[] = [];

  // Get upcoming exams (safely, table might not exist yet)
  try {
    const { data: exams }: any = await supabase
      .from("exams" as any)
      .select("id, name, start_date")
      .eq("school_id", schoolId)
      .gte("start_date", today)
      .order("start_date", { ascending: true })
      .limit(5);

    if (exams) {
      events.push(
        ...exams.map((exam: any) => ({
          id: exam.id,
          title: exam.name,
          date: new Date(exam.start_date),
          type: "exam" as const,
        })),
      );
    }
  } catch (error) {
    console.warn("Exams table not available yet");
  }

  // Get other school events (holidays, meetings, etc.)
  try {
    const { data: schoolEvents }: any = await supabase
      .from("school_events")
      .select("id, title, start_date, event_type")
      .eq("school_id", schoolId)
      .gte("start_date", today)
      .order("start_date", { ascending: true })
      .limit(5);

    if (schoolEvents) {
      events.push(
        ...schoolEvents.map((event: any) => ({
          id: event.id,
          title: event.title,
          date: new Date(event.start_date),
          type: event.event_type,
        })),
      );
    }
  } catch (error) {
    console.warn("School events table fetch error", error);
  }

  // Sort by date and limit to 5
  return events.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 5);
}

/**
 * Calculate trend data
 */
function calculateTrend(
  current: number,
  previous: number,
): {
  value: number;
  direction: "up" | "down" | "neutral";
  percentage: number;
} {
  if (previous === 0) {
    return { value: current, direction: "neutral", percentage: 0 };
  }

  const difference = current - previous;
  const percentage = Math.abs((difference / previous) * 100);
  const direction = difference > 0 ? "up" : difference < 0 ? "down" : "neutral";

  return {
    value: difference,
    direction,
    percentage: Math.round(percentage * 10) / 10,
  };
}
