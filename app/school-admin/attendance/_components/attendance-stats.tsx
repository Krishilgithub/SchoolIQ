"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceStats } from "@/lib/types/attendance";
import { Users, UserCheck, UserX, Clock } from "lucide-react";

interface AttendanceStatsProps {
  stats: AttendanceStats;
}

export function AttendanceStatsView({ stats }: AttendanceStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_students}</div>
          <p className="text-xs text-muted-foreground">
            Active students in school
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Present</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.present_count}</div>
          <p className="text-xs text-muted-foreground">
            {stats.total_students
              ? ((stats.present_count / stats.total_students) * 100).toFixed(1)
              : 0}
            % attendance rate
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Absent</CardTitle>
          <UserX className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.absent_count}</div>
          <p className="text-xs text-muted-foreground">Students absent today</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Late</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.late_count}</div>
          <p className="text-xs text-muted-foreground">Students arrived late</p>
        </CardContent>
      </Card>
    </div>
  );
}
