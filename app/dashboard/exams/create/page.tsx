"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ExamService } from "@/lib/services/exam";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, FileText } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

export default function CreateExamPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    exam_name: "",
    description: "",
    academic_year_id: "",
    exam_type: "term" as "term" | "unit" | "final" | "entrance" | "other",
    start_date: "",
    end_date: "",
    is_weighted: false,
    weightage: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const exam = await ExamService.createExam({
        ...formData,
        school_id: "", // Will be filled by the service
        status: "draft",
      });

      toast({
        title: "Success",
        description: "Exam created successfully",
      });

      router.push(`/dashboard/exams/${exam.id}/papers`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create exam",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
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
              Create Exam
            </h2>
            <p className="text-muted-foreground">
              Set up a new exam or assessment
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <FileText className="mr-2 h-5 w-5 text-orange-600" />
                Basic Information
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="exam_name">Exam Name *</Label>
                  <Input
                    id="exam_name"
                    placeholder="e.g., Mid-Term Exam 2024"
                    value={formData.exam_name}
                    onChange={(e) =>
                      setFormData({ ...formData, exam_name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exam_type">Exam Type *</Label>
                  <Select
                    value={formData.exam_type}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, exam_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="term">Term Exam</SelectItem>
                      <SelectItem value="unit">Unit Test</SelectItem>
                      <SelectItem value="final">Final Exam</SelectItem>
                      <SelectItem value="entrance">Entrance</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter a description for this exam..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-semibold">Schedule</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Weightage */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-semibold">Weightage (Optional)</h3>

              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  id="is_weighted"
                  checked={formData.is_weighted}
                  onChange={(e) =>
                    setFormData({ ...formData, is_weighted: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="is_weighted">
                  Apply weightage to this exam
                </Label>
              </div>

              {formData.is_weighted && (
                <div className="space-y-2">
                  <Label htmlFor="weightage">
                    Weightage (%) *
                  </Label>
                  <Input
                    id="weightage"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g., 30"
                    value={formData.weightage || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weightage: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Percentage contribution to final grade
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t">
              <Link href="/dashboard/exams">
                <Button type="button" variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {loading ? (
                  "Creating..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Exam
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
