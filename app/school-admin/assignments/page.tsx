import { getCurrentSchoolId } from "@/lib/services/auth";
import { getAssignmentsAction } from "@/lib/actions/assignment-actions";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Clock, User } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default async function AssignmentsPage() {
  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    redirect("/login");
  }

  const assignments = await getAssignmentsAction(schoolId);

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Assignments</h2>
          <p className="text-muted-foreground">
            Manage student assignments and homework.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/school-admin/assignments/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {assignments.map((assignment) => (
          <Card
            key={assignment.id}
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-1">
                  {assignment.title}
                </CardTitle>
                <Badge
                  variant={
                    assignment.status === "published" ? "default" : "secondary"
                  }
                >
                  {assignment.status}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {assignment.description || "No description provided."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>
                    {assignment.class_name} - {assignment.subject_name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{assignment.teacher_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    Due: {format(new Date(assignment.due_date), "PPP")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {assignments.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No assignments yet</h3>
            <p className="text-muted-foreground max-w-sm mt-2 mb-4">
              Create your first assignment to get started sharing homework and
              tasks with students.
            </p>
            <Link href="/school-admin/assignments/create">
              <Button>Create Assignment</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
