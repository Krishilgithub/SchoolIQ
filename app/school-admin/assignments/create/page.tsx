import { getCurrentSchoolId } from "@/lib/services/auth";
import { redirect } from "next/navigation";
import { getClassesAction } from "@/lib/actions/class-actions";
import { getSubjectsAction } from "@/lib/actions/subject-actions";
import { CreateAssignmentForm } from "./_components/create-assignment-form";

export default async function CreateAssignmentPage() {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    redirect("/login");
  }

  const [classes, subjects] = await Promise.all([
    getClassesAction(schoolId),
    getSubjectsAction(schoolId),
  ]);

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Create Assignment
          </h2>
          <p className="text-muted-foreground">
            Create a new assignment for a class.
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <CreateAssignmentForm
          classes={classes}
          subjects={subjects}
          schoolId={schoolId}
        />
      </div>
    </div>
  );
}
