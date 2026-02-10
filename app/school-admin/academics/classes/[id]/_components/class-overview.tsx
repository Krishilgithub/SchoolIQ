import { Class } from "@/lib/types/academic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, BookOpen, GraduationCap, Building2 } from "lucide-react";

interface ClassOverviewProps {
  classData: Class;
}

export function ClassOverview({ classData }: ClassOverviewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Class Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-muted">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">Class Teacher</p>
              <p className="text-sm text-muted-foreground">
                {/* @ts-ignore - joined data */}
                {classData.class_teacher?.full_name || "Unassigned"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-muted">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">Total Students</p>
              <p className="text-sm text-muted-foreground">
                {classData.total_students} / {classData.capacity || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-muted">
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">Room Number</p>
              <p className="text-sm text-muted-foreground">
                {classData.room_number || "Not assigned"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-muted">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">Academic Year</p>
              <p className="text-sm text-muted-foreground">
                {classData.academic_year}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
