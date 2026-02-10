import { getCurrentSchoolId } from "@/lib/services/auth";
import { getAttendanceStatsAction } from "@/lib/actions/attendance-actions";
import { AttendanceStatsView } from "./_components/attendance-stats";
import { Button } from "@/components/ui/button";
import { CalendarCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";

export default async function AttendancePage() {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    redirect("/login");
  }

  const today = format(new Date(), "yyyy-MM-dd");
  const stats = await getAttendanceStatsAction(schoolId, today);

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Attendance</h2>
          <p className="text-muted-foreground">
            Overview of today's attendance ({format(new Date(), "PPP")})
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/school-admin/attendance/mark">
            <Button>
              <CalendarCheck className="mr-2 h-4 w-4" />
              Mark Attendance
            </Button>
          </Link>
        </div>
      </div>

      <AttendanceStatsView stats={stats} />

      {/* TODO: Add Recent Attendance Log or Calendar View */}
      <div className="rounded-md border p-4">
        <div className="text-center text-muted-foreground py-8">
          Attendance logs and detailed reports will appear here.
        </div>
      </div>
    </div>
  );
}
