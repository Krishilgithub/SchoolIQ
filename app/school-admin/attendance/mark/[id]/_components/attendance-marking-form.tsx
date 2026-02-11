"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { upsertAttendanceAction } from "@/lib/actions/attendance-actions";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  roll_number?: string;
}

interface AttendanceRecord {
  student_id: string;
  status: string;
  remarks?: string;
}

interface AttendanceMarkingFormProps {
  classId: string;
  students: Student[];
  existingAttendance: AttendanceRecord[];
  date: string;
}

type AttendanceStatus = "present" | "absent" | "late" | "excused";

export function AttendanceMarkingForm({
  classId,
  students,
  existingAttendance,
  date,
}: AttendanceMarkingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Initialize attendance state
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(
    () => {
      const initial: Record<string, AttendanceStatus> = {};
      students.forEach((student) => {
        const existing = existingAttendance.find(
          (a) => a.student_id === student.id
        );
        initial[student.id] = (existing?.status as AttendanceStatus) || "present";
      });
      return initial;
    }
  );

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const newAttendance: Record<string, AttendanceStatus> = {};
    students.forEach((student) => {
      newAttendance[student.id] = status;
    });
    setAttendance(newAttendance);
  };

  const handleSubmit = async () => {
    startTransition(async () => {
      try {
        // Submit attendance for all students
        const promises = students.map((student) =>
          upsertAttendanceAction(classId, {
            student_id: student.id,
            class_id: classId,
            date,
            status: attendance[student.id] || "present",
          })
        );

        await Promise.all(promises);
        toast.success("Attendance marked successfully!");
        router.push("/school-admin/attendance");
        router.refresh();
      } catch (error) {
        console.error("Error marking attendance:", error);
        toast.error("Failed to mark attendance. Please try again.");
      }
    });
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case "present":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "absent":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "late":
        return <Clock className="h-4 w-4 text-orange-600" />;
      case "excused":
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "absent":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "late":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      case "excused":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    }
  };

  const stats = {
    present: Object.values(attendance).filter((s) => s === "present").length,
    absent: Object.values(attendance).filter((s) => s === "absent").length,
    late: Object.values(attendance).filter((s) => s === "late").length,
    excused: Object.values(attendance).filter((s) => s === "excused").length,
  };

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleMarkAll("present")}
            disabled={isPending}
          >
            Mark All Present
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleMarkAll("absent")}
            disabled={isPending}
          >
            Mark All Absent
          </Button>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span>{stats.present} Present</span>
          </div>
          <div className="flex items-center gap-1">
            <XCircle className="h-4 w-4 text-red-600" />
            <span>{stats.absent} Absent</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-orange-600" />
            <span>{stats.late} Late</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <span>{stats.excused} Excused</span>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Roll No.</TableHead>
            <TableHead className="w-[150px]">Admission No.</TableHead>
            <TableHead>Student Name</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">
                {student.roll_number || "-"}
              </TableCell>
              <TableCell>{student.admission_number}</TableCell>
              <TableCell>
                {student.first_name} {student.last_name}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  {(["present", "absent", "late", "excused"] as AttendanceStatus[]).map(
                    (status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={attendance[student.id] === status ? "default" : "outline"}
                        className={cn(
                          "capitalize",
                          attendance[student.id] === status && getStatusColor(status)
                        )}
                        onClick={() => handleStatusChange(student.id, status)}
                        disabled={isPending}
                      >
                        {getStatusIcon(status)}
                        <span className="ml-1">{status}</span>
                      </Button>
                    )
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Submit Button */}
      <div className="flex justify-end gap-2 pt-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Saving..." : "Save Attendance"}
        </Button>
      </div>
    </div>
  );
}
