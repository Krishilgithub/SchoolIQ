"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/services/api";
import { MarkEntry } from "@/types";
import { Save, Upload, AlertTriangle } from "lucide-react";

export default function MarksEntryGrid({ subjectId }: { subjectId: string }) {
  const { data: initialStudents, isLoading } = useQuery({
    queryKey: ["marks", subjectId],
    queryFn: () => api.academics.getMarks(subjectId),
  });

  const [marks, setMarks] = useState<MarkEntry[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  // Hydrate local state when data loads
  React.useEffect(() => {
    if (initialStudents) {
      setMarks(initialStudents);
    }
  }, [initialStudents]);

  const handleMarkChange = (studentId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setMarks((prev) =>
      prev.map((m) =>
        m.studentId === studentId ? { ...m, obtainedMarks: numValue } : m,
      ),
    );
    setIsDirty(true);
  };

  const saveMutation = useMutation({
    mutationFn: (data: MarkEntry[]) => api.academics.submitMarks(data),
    onSuccess: () => {
      setIsDirty(false);
      // Toast would go here
      alert("Marks saved successfully!");
    },
  });

  if (isLoading) return <div>Loading class data...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-md bg-muted/50 p-4">
        <div className="flex gap-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Class:</span>{" "}
            <span className="font-medium">10-A</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Subject:</span>{" "}
            <span className="font-medium">Mathematics</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Max Marks:</span>{" "}
            <span className="font-medium">100</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" /> Import CSV
          </Button>
          <Button
            onClick={() => saveMutation.mutate(marks)}
            disabled={!isDirty || saveMutation.isPending}
            className={isDirty ? "bg-brand-600" : ""}
          >
            {saveMutation.isPending ? (
              "Saving..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Roll No</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead className="w-[150px]">Marks Obtained</TableHead>
              <TableHead className="w-[100px]">Grade</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {marks.map((entry) => (
              <TableRow key={entry.studentId}>
                <TableCell className="font-medium">
                  {entry.rollNumber}
                </TableCell>
                <TableCell>{entry.studentName}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    max={100}
                    value={entry.obtainedMarks}
                    onChange={(e) =>
                      handleMarkChange(entry.studentId, e.target.value)
                    }
                    className={
                      entry.obtainedMarks < 35
                        ? "border-red-300 bg-red-50 text-red-900 focus-visible:ring-red-500"
                        : "border-slate-200"
                    }
                  />
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "rounded px-2 py-1 text-xs font-bold",
                      entry.obtainedMarks >= 90
                        ? "bg-green-100 text-green-700"
                        : entry.obtainedMarks < 35
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-700",
                    )}
                  >
                    {entry.obtainedMarks >= 90
                      ? "A+"
                      : entry.obtainedMarks < 35
                        ? "F"
                        : "B"}
                  </span>
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="Optional remarks..."
                    defaultValue={entry.comments}
                    className="h-8 text-xs"
                  />
                </TableCell>
                <TableCell>
                  {entry.obtainedMarks < 35 && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
