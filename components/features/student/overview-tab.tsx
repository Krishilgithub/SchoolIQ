import { Student } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, AlertCircle } from "lucide-react";

interface OverviewTabProps {
  student: Student & { academicHistory?: unknown[]; skills?: string[] };
}

export function OverviewTab({ student }: OverviewTabProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
      {/* Key Stats */}
      <div className="col-span-4 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {student.attendancePercentage}%
              </div>
              <p className="text-xs text-muted-foreground">
                +2% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Grade</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">A-</div>
              <p className="text-xs text-muted-foreground">Top 10% of class</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Container - Placeholder for Recharts */}
        <Card className="h-[300px]">
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="mx-auto h-10 w-10 opacity-20 mb-2" />
              <p>Performance Chart Visualization</p>
              <p className="text-xs">(Recharts implementation required here)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Side Panel */}
      <div className="col-span-3 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 rounded-md bg-yellow-50 p-3 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200 border border-yellow-100 dark:border-yellow-900/50">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium">Late Arrival Trend</p>
                <p className="opacity-80">Arrived late 3 times this week.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills & Interests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {student.skills?.map((skill) => (
                <div
                  key={skill}
                  className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                >
                  {skill}
                </div>
              ))}
              {!student.skills && (
                <p className="text-sm text-muted-foreground">
                  No skills recorded.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
