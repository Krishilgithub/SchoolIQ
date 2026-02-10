import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ClassService } from "@/lib/services/class";
import { ClassOverview } from "./_components/class-overview";
import { SubjectAllocation } from "./_components/subject-allocation";
import { StudentList } from "./_components/student-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getCurrentSchoolId } from "@/hooks/use-current-school";

interface ClassDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function ClassDetailsPage({
  params,
}: ClassDetailsPageProps) {
  const { id } = params;
  const schoolId = await getCurrentSchoolId();
  const { class: classData, error } = await ClassService.getClass(id);

  if (error || !classData) {
    notFound();
  }

  // Safe check to ensure we only view classes from our school
  if (classData.school_id !== schoolId) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/school-admin/academics/classes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {classData.name}
          </h2>
          <p className="text-muted-foreground">
            Grade {classData.grade_level} - Section {classData.section}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-2 lg:col-span-2 space-y-6">
          <ClassOverview classData={classData} />
        </div>
        <div className="col-span-2 lg:col-span-5">
          <Tabs defaultValue="subjects" className="w-full">
            <TabsList>
              <TabsTrigger value="subjects">Subjects & Teachers</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="timetable">Timetable</TabsTrigger>
            </TabsList>
            <TabsContent value="subjects" className="mt-6">
              <SubjectAllocation
                classId={id}
                schoolId={context.schoolId || ""}
                initialSubjects={classData.subjects || []}
              />
            </TabsContent>
            <TabsContent value="students" className="mt-6">
              <StudentList classId={id} />
            </TabsContent>
            <TabsContent value="timetable" className="mt-6">
              <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed text-muted-foreground">
                Timetable module coming soon
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
