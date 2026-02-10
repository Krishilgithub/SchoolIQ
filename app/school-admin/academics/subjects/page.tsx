import { Suspense } from "react";
import { Metadata } from "next";
import { getCurrentSchoolId } from "@/hooks/use-current-school";
import { redirect } from "next/navigation";
import { SubjectList } from "./_components/subject-list";
import { CreateSubjectModal } from "./_components/create-subject-modal";

export const metadata: Metadata = {
  title: "Subjects Management | SchoolIQ",
  description: "Manage school subjects",
};

export default async function SubjectsPage() {
  const schoolId = await getCurrentSchoolId();

  if (!schoolId) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Subjects</h2>
          <p className="text-muted-foreground">
            Manage your school subjects and course catalog.
          </p>
        </div>
        <CreateSubjectModal schoolId={schoolId} />
      </div>

      <Suspense fallback={<div>Loading subjects...</div>}>
        <SubjectList schoolId={schoolId} />
      </Suspense>
    </div>
  );
}
