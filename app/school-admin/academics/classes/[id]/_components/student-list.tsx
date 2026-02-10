"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";

interface StudentListProps {
  classId: string;
}

export function StudentList({ classId }: StudentListProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("students")
        .select("*, profile:profiles(*)")
        .eq("class_id", classId);

      if (data) {
        setStudents(data);
      }
      setIsLoading(false);
    };

    fetchStudents();
  }, [classId]);

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Roll Number</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Parent Info</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6">
                Loading students...
              </TableCell>
            </TableRow>
          ) : students.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center py-6 text-muted-foreground"
              >
                No students assigned to this class yet.
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {student.profile?.full_name?.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid gap-0.5">
                      <span className="font-medium">
                        {student.profile?.full_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {student.admission_number}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{student.roll_number || "-"}</TableCell>
                <TableCell>
                  <Badge variant="outline">Active</Badge>
                </TableCell>
                <TableCell>{/* Parent info placeholder */}-</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
