"use client";

import React, { use } from "react";
import { useStudent } from "@/hooks/use-student";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileHeader } from "@/components/features/student/profile-header";
import { OverviewTab } from "@/components/features/student/overview-tab";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Unwrap params using React.use for Next.js 15+ compatibility
  const { id } = use(params);

  const { data: student, isLoading } = useStudent(id);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!student) {
    return <div>Student not found</div>;
  }

  const safeStudent = {
    ...student,
    id: student.id || "1",
    name: student.name || "Student Name",
    email: student.email || "student@example.com",
    role: "STUDENT" as const,
    grade: student.grade || "10-A",
    rollNumber: student.rollNumber || "001",
    guardianName: student.guardianName || "Parent",
    guardianContact: student.guardianContact || "N/A",
    attendancePercentage: student.attendancePercentage || 0,
    riskScore: student.riskScore || 0,
    schoolId: student.schoolId || "school-1",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/students">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold font-heading">Student Profile</h1>
      </div>

      <ProfileHeader student={safeStudent} />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="academics">Academics</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
          <OverviewTab student={safeStudent} />
        </TabsContent>
        <TabsContent value="academics">
          <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
            Academics Module Placeholder
          </div>
        </TabsContent>
        <TabsContent value="attendance">
          <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
            Attendance Module Placeholder
          </div>
        </TabsContent>
        <TabsContent value="notes">
          <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
            Notes Module Placeholder
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
