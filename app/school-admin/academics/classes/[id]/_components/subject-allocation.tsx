"use client";

import { useState } from "react";
import { ClassSubject, Subject } from "@/lib/types/academic";
// Assuming Teacher type is in types/academic or similar
import { Teacher } from "@/lib/types/academic"; // Fixing potential bad import of Teacher service as type
// SubjectAllocation is using assignTeacherAction from @/app/actions/academic which MIGHT be wrong if I just created class-actions.ts
// BUT, I see `import { assignTeacherAction } from "@/app/actions/academic";` in the file.
// I should update it to "@/lib/actions/class-actions".
import { assignTeacherAction } from "@/lib/actions/class-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Check, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

interface SubjectAllocationProps {
  classId: string;
  initialSubjects: ClassSubject[];
  schoolId: string;
  availableSubjects: Subject[];
  availableTeachers: Teacher[];
}

export function SubjectAllocation({
  classId,
  initialSubjects,
  schoolId,
  availableSubjects,
  availableTeachers,
}: SubjectAllocationProps) {
  // Since we are revalidating path on server action, we can rely on props updating
  // But for immediate feedback, we might want local state.
  // Actually, revalidatePath will refresh the Server Component, but Client Component props will update
  // only if the parent re-renders. Next.js handles this well usually.
  // However, simpler is to just assume success and maybe local update or wait for refresh.
  // I will use optimistic UI or just local state update + router refresh?
  // Since I passed `initialSubjects`, if parent refreshes, it will pass new `initialSubjects`.

  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  // New allocation form state
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [periodsPerWeek, setPeriodsPerWeek] = useState(4); // Default value

  const handleAllocate = async () => {
    if (!selectedSubjectId) return;

    try {
      const result = await assignTeacherAction({
        class_id: classId,
        subject_id: selectedSubjectId,
        teacher_id: selectedTeacherId || undefined,
        periods_per_week: periodsPerWeek,
      });

      if (!result.success) throw new Error(result.error);

      toast({
        title: "Success",
        description: "Subject allocated successfully",
      });

      // Clear form
      setIsAdding(false);
      setSelectedSubjectId("");
      setSelectedTeacherId("");
      setPeriodsPerWeek(4);
      // The list will update automatically if the server component refreshes and passes new props.
      // If strictly needed, we could call router.refresh() here.
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to allocate subject",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Subject Allocation</CardTitle>
          <CardDescription>
            Assign subjects and teachers to this class.
          </CardDescription>
        </div>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
          <Plus className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Periods/Week</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isAdding && (
              <TableRow className="bg-muted/50">
                <TableCell>
                  <Select
                    value={selectedSubjectId}
                    onValueChange={setSelectedSubjectId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubjects
                        .filter(
                          (s) =>
                            !initialSubjects.some(
                              (cs) => cs.subject_id === s.id,
                            ),
                        ) // Filter out already added subjects
                        .map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name} ({subject.code})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={selectedTeacherId}
                    onValueChange={setSelectedTeacherId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Teacher (Optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTeachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={periodsPerWeek}
                    onChange={(e) =>
                      setPeriodsPerWeek(parseInt(e.target.value))
                    }
                    className="w-20"
                    min={0}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      onClick={handleAllocate}
                      disabled={!selectedSubjectId}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsAdding(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {initialSubjects.map((cs) => (
              <TableRow key={cs.id}>
                <TableCell className="font-medium">
                  {cs.subject?.name}{" "}
                  <span className="text-muted-foreground ml-1 text-xs">
                    ({cs.subject?.code})
                  </span>
                </TableCell>
                <TableCell>
                  {cs.teacher?.full_name ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{cs.teacher.full_name}</span>
                    </div>
                  ) : (
                    <Badge variant="secondary">Unassigned</Badge>
                  )}
                </TableCell>
                <TableCell>{cs.periods_per_week || 0}</TableCell>
                <TableCell className="text-right">
                  {/* Edit/Delete actions in future */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {initialSubjects.length === 0 && !isAdding && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-6 text-muted-foreground"
                >
                  No subjects allocated yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
