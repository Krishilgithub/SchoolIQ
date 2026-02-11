import { getTeachersAction } from "@/lib/actions/teacher-actions";
import { getCurrentSchoolId } from "@/lib/services/auth";
import { TeacherList } from "./_components/teacher-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function TeachersPage() {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    redirect("/auth/login");
  }

  const teachers = await getTeachersAction(schoolId);

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Teachers</h2>
          <p className="text-muted-foreground">
            Manage your school's teachers directory.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Note: In a real app, creating a teacher might involve creating a user account first */}
          <Link href="/school-admin/teachers/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Teacher
            </Button>
          </Link>
        </div>
      </div>
      <TeacherList data={teachers} />
    </div>
  );
}
