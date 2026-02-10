import { getCurrentSchoolId } from "@/lib/services/auth";
import { redirect } from "next/navigation";
import { getClassesAction } from "@/lib/actions/class-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";
import { Users } from "lucide-react";

export default async function MarkAttendancePage() {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    redirect("/login");
  }

  // Fetch classes to select which class to mark attendance for
  const classes = await getClassesAction(schoolId);

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mark Attendance</h2>
          <p className="text-muted-foreground">
            Select a class to mark attendance for today.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((cls) => (
          <Card
            key={cls.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">{cls.name}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Grade {cls.grade_level} - {cls.section || "No Section"}
              </CardDescription>
              <div className="mt-4">
                <Link href={`/school-admin/attendance/mark/${cls.id}`}>
                  <Button className="w-full">Mark Attendance</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
        {classes.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-12">
            No classes found. Please create classes first.
          </div>
        )}
      </div>
    </div>
  );
}
