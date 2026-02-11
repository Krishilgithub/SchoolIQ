import { Suspense } from "react";
import { Metadata } from "next";
import { getCurrentSchoolId } from "@/lib/services/auth";
import { redirect } from "next/navigation";
import { ClassList } from "./_components/class-list";
import { CreateClassModal } from "./_components/create-class-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Classes Management | SchoolIQ",
  description: "Manage school classes and sections",
};

export default async function ClassesPage() {
  const schoolId = await getCurrentSchoolId();

  if (!schoolId) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Classes</h2>
          <p className="text-muted-foreground">
            Manage your school classes, sections, and class teachers.
          </p>
        </div>
        <CreateClassModal schoolId={schoolId} />
      </div>

      <Suspense fallback={<div>Loading classes...</div>}>
        <ClassList schoolId={schoolId} />
      </Suspense>
    </div>
  );
}
