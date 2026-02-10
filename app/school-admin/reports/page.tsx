import { getCurrentSchoolId } from "@/lib/services/auth";
import { redirect } from "next/navigation";
import {
  getDashboardStatsAction,
  getAttendanceReportAction,
  getStudentDistributionAction,
} from "@/lib/actions/report-actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { BarChart, Users, GraduationCap, School } from "lucide-react";
import { Overview } from "@/components/dashboard/overview"; // Assuming this exists or I'll implement a simple one

export default async function ReportsPage() {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    redirect("/login");
  }

  const [stats, attendanceReport, studentDistribution] = await Promise.all([
    getDashboardStatsAction(schoolId),
    getAttendanceReportAction(schoolId, "daily"),
    getStudentDistributionAction(schoolId),
  ]);

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Reports & Analytics
          </h2>
          <p className="text-muted-foreground">
            View detailed stats and reports for your school.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Active students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Teachers
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeachers}</div>
            <p className="text-xs text-muted-foreground">
              Active faculty members
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClasses}</div>
            <p className="text-xs text-muted-foreground">Total classes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Attendance
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">
              Based on recent records
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
            <CardDescription>Weekly attendance overview.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {/* Visual Placeholder for Chart - In a real app use Recharts */}
            <div className="h-[240px] flex items-end justify-between px-4 pb-4">
              {attendanceReport.map((day) => (
                <div
                  key={day.date}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="relative w-12 bg-muted rounded-t-md overflow-hidden h-[200px]">
                    <div
                      className="absolute bottom-0 w-full bg-primary transition-all duration-500"
                      style={{ height: `${day.present}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {day.date}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Student Distribution</CardTitle>
            <CardDescription>Students per grade level.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentDistribution.map((item) => (
                <div key={item.grade_level} className="flex items-center">
                  <div className="w-16 text-sm font-medium">
                    Grade {item.grade_level}
                  </div>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden ml-2">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${(item.count / Math.max(...studentDistribution.map((d) => d.count))) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="w-12 text-sm text-right ml-2 text-muted-foreground">
                    {item.count}
                  </div>
                </div>
              ))}
              {studentDistribution.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
