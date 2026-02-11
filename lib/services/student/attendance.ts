// Student Attendance Service
// Handles attendance tracking and reporting

import { createClient } from "@/lib/supabase/server";

export interface AttendanceRecord {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: "present" | "absent" | "late" | "excused" | "sick";
  remarks?: string;
  created_at: string;
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  percentage: number;
  trend: string; // "improving" | "declining" | "stable"
}

export const studentAttendanceService = {
  /**
   * Get attendance records for a student
   */
  async getAttendanceRecords(
    studentId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<AttendanceRecord[]> {
    const supabase = await createClient();

    let query = supabase
      .from("student_attendance")
      .select(
        `
        *,
        class:classes (
          class_name,
          subject
        )
      `,
      )
      .eq("student_id", studentId)
      .order("date", { ascending: false });

    if (startDate) {
      query = query.gte("date", startDate);
    }
    if (endDate) {
      query = query.lte("date", endDate);
    }

    const { data: records, error } = await query;

    if (error) {
      console.error("Error fetching attendance:", error);
      return [];
    }

    return records || [];
  },

  /**
   * Get attendance for current month
   */
  async getCurrentMonthAttendance(
    studentId: string,
  ): Promise<AttendanceRecord[]> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];

    return this.getAttendanceRecords(studentId, startOfMonth, endOfMonth);
  },

  /**
   * Calculate attendance statistics
   */
  async getAttendanceStats(
    studentId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<AttendanceStats> {
    const records = await this.getAttendanceRecords(
      studentId,
      startDate,
      endDate,
    );

    const stats: AttendanceStats = {
      totalDays: records.length,
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
      excusedDays: 0,
      percentage: 0,
      trend: "stable",
    };

    records.forEach((record) => {
      switch (record.status) {
        case "present":
          stats.presentDays++;
          break;
        case "absent":
          stats.absentDays++;
          break;
        case "late":
          stats.lateDays++;
          stats.presentDays++; // Count late as present for percentage
          break;
        case "excused":
        case "sick":
          stats.excusedDays++;
          break;
      }
    });

    stats.percentage =
      stats.totalDays > 0 ? (stats.presentDays / stats.totalDays) * 100 : 0;

    // Calculate trend (compare last 2 weeks vs previous 2 weeks)
    const trend = await this.calculateTrend(studentId);
    stats.trend = trend;

    return stats;
  },

  /**
   * Calculate attendance trend
   */
  async calculateTrend(studentId: string): Promise<string> {
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

    // Recent 2 weeks
    const recentRecords = await this.getAttendanceRecords(
      studentId,
      twoWeeksAgo.toISOString().split("T")[0],
      now.toISOString().split("T")[0],
    );

    // Previous 2 weeks
    const previousRecords = await this.getAttendanceRecords(
      studentId,
      fourWeeksAgo.toISOString().split("T")[0],
      twoWeeksAgo.toISOString().split("T")[0],
    );

    const recentPercentage =
      recentRecords.length > 0
        ? (recentRecords.filter(
            (r) => r.status === "present" || r.status === "late",
          ).length /
            recentRecords.length) *
          100
        : 0;

    const previousPercentage =
      previousRecords.length > 0
        ? (previousRecords.filter(
            (r) => r.status === "present" || r.status === "late",
          ).length /
            previousRecords.length) *
          100
        : 0;

    const difference = recentPercentage - previousPercentage;

    if (difference > 5) return "improving";
    if (difference < -5) return "declining";
    return "stable";
  },

  /**
   * Get attendance by class
   */
  async getAttendanceByClass(
    studentId: string,
    classId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<AttendanceRecord[]> {
    const supabase = await createClient();

    let query = supabase
      .from("student_attendance")
      .select("*")
      .eq("student_id", studentId)
      .eq("class_id", classId)
      .order("date", { ascending: false });

    if (startDate) {
      query = query.gte("date", startDate);
    }
    if (endDate) {
      query = query.lte("date", endDate);
    }

    const { data: records, error } = await query;

    if (error) {
      console.error("Error fetching class attendance:", error);
      return [];
    }

    return records || [];
  },

  /**
   * Get attendance warnings (low attendance alerts)
   */
  async getAttendanceWarnings(studentId: string): Promise<any[]> {
    const supabase = await createClient();

    // Get all enrolled classes
    const { data: enrollments } = await supabase
      .from("class_enrollments")
      .select(
        `
        class_id,
        class:classes (
          class_name,
          subject
        )
      `,
      )
      .eq("student_id", studentId)
      .eq("status", "active");

    if (!enrollments) return [];

    const warnings: any[] = [];

    for (const enrollment of enrollments) {
      const stats = await this.getAttendanceByClass(
        studentId,
        (enrollment as any).class_id,
      );

      const presentCount = stats.filter(
        (s) => s.status === "present" || s.status === "late",
      ).length;
      const percentage =
        stats.length > 0 ? (presentCount / stats.length) * 100 : 100;

      if (percentage < 75) {
        warnings.push({
          classId: (enrollment as any).class_id,
          className: (enrollment as any).class.class_name,
          subject: (enrollment as any).class.subject,
          percentage,
          severity: percentage < 65 ? "critical" : "warning",
          message: `Your attendance is ${percentage.toFixed(1)}%. Minimum required is 75%.`,
        });
      }
    }

    return warnings;
  },

  /**
   * Get attendance heatmap data (for calendar visualization)
   */
  async getAttendanceHeatmap(
    studentId: string,
    year: number,
    month: number,
  ): Promise<any> {
    const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
    const endDate = new Date(year, month, 0).toISOString().split("T")[0];

    const records = await this.getAttendanceRecords(
      studentId,
      startDate,
      endDate,
    );

    // Group by date
    const heatmap: Record<string, any> = {};

    records.forEach((record) => {
      const date = record.date;
      if (!heatmap[date]) {
        heatmap[date] = {
          date,
          status: record.status,
          count: 0,
        };
      }
      heatmap[date].count++;
    });

    return Object.values(heatmap);
  },
};
