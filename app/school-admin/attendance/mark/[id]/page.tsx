import { getCurrentSchoolId } from "@/lib/services/auth";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AttendanceMarkingForm } from "./_components/attendance-marking-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface MarkClassAttendancePageProps {
  params: {
    id: string;
  };
}

interface AttendanceRecord {
  student_id: string;
  status: string;
  remarks?: string | null;
}

export default async function MarkClassAttendancePage({
  params,
}: MarkClassAttendancePageProps) {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    redirect("/auth/login");
  }

  const supabase = await createClient();

  // Get class details
  const { data: classData, error: classError } = await supabase
    .from("classes")
    .select("*")
    .eq("id", params.id)
    .eq("school_id", schoolId)
    .single();

  if (classError || !classData) {
    notFound();
  }

  // Get students in this class via enrollments
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("enrollments")
    .select(`
      id,
      student_id,
      roll_number,
      students (
        id,
        first_name,
        last_name,
        admission_number
      )
    `)
    .eq("section_id", params.id)
    .eq("status", "active");

  if (enrollmentsError) {
    console.error("Error fetching students:", enrollmentsError);
  }

  const students = enrollments?.map((enrollment: any) => ({
    id: enrollment.students.id,
    first_name: enrollment.students.first_name,
    last_name: enrollment.students.last_name,
    admission_number: enrollment.students.admission_number,
    roll_number: enrollment.roll_number,
  })) || [];

  // Get today's attendance if already marked
  const today = format(new Date(), "yyyy-MM-dd");
  const { data: existingAttendanceData } = await supabase
    .from("student_attendance")
    .select("*")
    .eq("class_id", params.id)
    .eq("date", today);

  // Map to simpler structure
  const existingAttendance: AttendanceRecord[] =
    existingAttendanceData?.map((record) => ({
      student_id: record.student_id,
      status: record.status,
      remarks: record.remarks ?? undefined,
    })) || [];

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Mark Attendance - {classData.name}
          </h2>
          <p className="text-muted-foreground">
            Grade {classData.grade_level} - {classData.section || "No Section"} •{" "}
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Attendance ({students.length} students)</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No students enrolled in this class yet.
            </div>
          ) : (
            <AttendanceMarkingForm
              classId={params.id}
              students={students}
              existingAttendance={existingAttendance}
              date={today}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
