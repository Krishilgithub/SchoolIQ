"use client";

import { MetricCard } from "./metric-card";
import {
  Users,
  GraduationCap,
  BookOpen,
  CheckCircle,
  Bell,
  UserPlus,
} from "lucide-react";
import { useDashboardStats } from "@/lib/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface OverviewMetricsProps {
  schoolId: string;
}

export function OverviewMetrics({ schoolId }: OverviewMetricsProps) {
  const { stats, isLoading, isError } = useDashboardStats(schoolId);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="text-center py-8 text-gray-500">
        Failed to load dashboard stats. Please try again.
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <MetricCard
        title="Total Students"
        value={stats.totalStudents}
        icon={Users}
        trend={stats.trends.students}
        color="blue"
        subtitle="Active students"
      />

      <MetricCard
        title="Total Teachers"
        value={stats.totalTeachers}
        icon={GraduationCap}
        trend={stats.trends.teachers}
        color="purple"
        subtitle="Active staff"
      />

      <MetricCard
        title="Active Classes"
        value={stats.activeClasses}
        icon={BookOpen}
        color="green"
        subtitle="This academic year"
      />

      <MetricCard
        title="Attendance Rate"
        value={`${stats.attendanceRate}%`}
        icon={CheckCircle}
        color="green"
        subtitle="Today's attendance"
      />

      <MetricCard
        title="Pending Actions"
        value={stats.pendingNotifications}
        icon={Bell}
        color="amber"
        subtitle="Unread notifications"
      />

      <MetricCard
        title="Recent Enrollments"
        value={stats.recentEnrollments}
        icon={UserPlus}
        color="pink"
        subtitle="Last 30 days"
      />
    </div>
  );
}
