import { getStudentsAction } from "@/lib/actions/student-actions";
import { getCurrentSchoolId } from "@/lib/services/auth";
import { StudentList } from "./_components/student-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function StudentsPage() {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    redirect("/auth/login");
  }

  const students = await getStudentsAction(schoolId);

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Students</h2>
          <p className="text-muted-foreground">
            Manage your school's students directory.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/school-admin/students/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </Link>
        </div>
      </div>
      <StudentList data={students} />
    </div>
  );
}
