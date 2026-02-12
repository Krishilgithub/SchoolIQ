import { getCurrentSchoolId } from "@/lib/services/auth";
import { redirect } from "next/navigation";
import { CreateExamForm } from "./_components/create-exam-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function CreateExamPage() {
  const schoolId = await getCurrentSchoolId();

  if (!schoolId) {
    redirect("/auth/login");
  }

  const supabase = await createClient();

  // Fetch academic years
  const { data: academicYears } = await supabase
    .from("academic_years")
    .select("*")
    .eq("school_id", schoolId)
    .order("start_date", { ascending: false });

  // Fetch exam types
  const { data: examTypes } = await supabase
    .from("exam_types")
    .select("*")
    .eq("school_id", schoolId)
    .order("name");

  // Fetch grading schemes
  const { data: gradingSchemes } = await supabase
    .from("grading_schemes_new")
    .select("*")
    .eq("school_id", schoolId)
    .order("name");

  // Fetch terms
  const { data: terms } = await supabase
    .from("terms")
    .select("*")
    .eq("school_id", schoolId)
    .order("start_date");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/school-admin/academics/exams">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Create New Exam</h2>
          <p className="text-muted-foreground">
            Set up a new examination for your school
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exam Details</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateExamForm
            schoolId={schoolId}
            academicYears={academicYears || []}
            examTypes={examTypes || []}
            gradingSchemes={gradingSchemes || []}
            terms={terms || []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
