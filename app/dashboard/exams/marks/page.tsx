"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MarksService } from "@/lib/services/marks";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import { BookOpen, Save, ArrowLeft, Upload, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/types/database.types";

type StudentMark = {
  student_id: string;
  student_name: string;
  marks_obtained?: number;
  is_absent?: boolean;
};

export default function MarksEntryPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<StudentMark[]>([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedPaper, setSelectedPaper] = useState("");
  const [maxMarks, setMaxMarks] = useState(100);

  const loadStudents = async () => {
    // Mock data - replace with actual API call
    setStudents([
      { student_id: "1", student_name: "John Doe" },
      { student_id: "2", student_name: "Jane Smith" },
      { student_id: "3", student_name: "Bob Johnson" },
    ]);
  };

  useEffect(() => {
    if (selectedPaper) {
      loadStudents();
    }
  }, [selectedPaper]);

  const handleMarkChange = (studentId: string, marks: string) => {
    setStudents(
      students.map((s) =>
        s.student_id === studentId
          ? { ...s, marks_obtained: parseFloat(marks) || undefined }
          : s
      )
    );
  };

  const handleAbsentToggle = (studentId: string) => {
    setStudents(
      students.map((s) =>
        s.student_id === studentId
          ? { ...s, is_absent: !s.is_absent, marks_obtained: undefined }
          : s
      )
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const marksData = students
        .filter((s) => s.marks_obtained !== undefined || s.is_absent)
        .map((s) => ({
          exam_paper_id: selectedPaper,
          student_id: s.student_id,
          marks_obtained: s.marks_obtained || 0,
          is_absent: s.is_absent || false,
        }));

      await MarksService.bulkEnterMarks(marksData);

      toast({
        title: "Success",
        description: "Marks saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save marks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForModeration = async () => {
    setLoading(true);
    try {
      await handleSave();
      await MarksService.submitForModeration(selectedPaper);

      toast({
        title: "Success",
        description: "Marks submitted for moderation",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit for moderation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/exams">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Marks Entry
            </h2>
            <p className="text-muted-foreground">
              Enter student marks for exams
            </p>
          </div>
        </div>
      </div>

      {/* Selection Filters */}
      <Card className="p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Select Exam</Label>
            <Select value={selectedExam} onValueChange={setSelectedExam}>
              <SelectTrigger>
                <SelectValue placeholder="Choose exam" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exam1">Mid-Term Exam 2024</SelectItem>
                <SelectItem value="exam2">Final Exam 2024</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Select Paper/Subject</Label>
            <Select
              value={selectedPaper}
              onValueChange={setSelectedPaper}
              disabled={!selectedExam}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose paper" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paper1">Mathematics</SelectItem>
                <SelectItem value="paper2">Science</SelectItem>
                <SelectItem value="paper3">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Maximum Marks</Label>
            <Input
              type="number"
              value={maxMarks}
              onChange={(e) => setMaxMarks(parseInt(e.target.value) || 100)}
              disabled={!selectedPaper}
            />
          </div>
        </div>
      </Card>

      {/* Marks Table */}
      {selectedPaper && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <BookOpen className="mr-2 h-5 w-5 text-orange-600" />
                  Student Marks
                </h3>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {students.filter((s) => s.marks_obtained !== undefined).length}/
                    {students.length} Entered
                  </Badge>
                  <Badge variant="outline">
                    {students.filter((s) => s.is_absent).length} Absent
                  </Badge>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Marks Obtained</TableHead>
                    <TableHead className="w-32">Absent</TableHead>
                    <TableHead className="w-32">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => (
                    <TableRow key={student.student_id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{student.student_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            min="0"
                            max={maxMarks}
                            placeholder="0"
                            value={student.marks_obtained ?? ""}
                            onChange={(e) =>
                              handleMarkChange(student.student_id, e.target.value)
                            }
                            disabled={student.is_absent}
                            className="w-24"
                          />
                          <span className="text-sm text-muted-foreground">
                            / {maxMarks}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={student.is_absent || false}
                          onChange={() => handleAbsentToggle(student.student_id)}
                          className="rounded"
                        />
                      </TableCell>
                      <TableCell>
                        {student.is_absent ? (
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                            Absent
                          </Badge>
                        ) : student.marks_obtained !== undefined ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Entered
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Actions */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="text-sm text-muted-foreground">
                  <AlertTriangle className="inline h-4 w-4 mr-1" />
                  Save your work regularly. Submit for moderation when complete.
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Draft
                  </Button>
                  <Button
                    onClick={handleSubmitForModeration}
                    disabled={loading}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Submit for Moderation
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
