"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Download, Plus, Eye, ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/types/database.types";

type ReportCard = Database["public"]["Tables"]["report_cards"]["Row"];

export default function ReportCardsPage() {
  const { toast } = useToast();
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    exam_id: "",
    class_id: "",
    template_id: "",
  });

  useEffect(() => {
    loadReportCards();
  }, []);

  const loadReportCards = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      setReportCards([]);
    } catch (error) {
      console.error("Error loading report cards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBulk = async () => {
    if (!formData.exam_id || !formData.template_id) {
      toast({
        title: "Error",
        description: "Please select exam and template",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      await fetch("/api/report-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk_generate",
          examId: formData.exam_id,
          templateId: formData.template_id,
          classId: formData.class_id || undefined,
        }),
      });

      toast({
        title: "Success",
        description: "Report cards generated successfully",
      });

      setDialogOpen(false);
      loadReportCards();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report cards",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (reportCardId: string) => {
    try {
      await fetch("/api/report-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "track_download", reportCardId }),
      });
      toast({
        title: "Download Started",
        description: "Your report card is being downloaded",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download report card",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/results">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Report Cards
            </h2>
            <p className="text-muted-foreground">
              Generate and manage student report cards
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/dashboard/results/report-cards/templates">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Manage Templates
            </Button>
          </Link>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="mr-2 h-4 w-4" />
                Generate Report Cards
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Report Cards</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="exam">Select Exam *</Label>
                  <Select
                    value={formData.exam_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, exam_id: value })
                    }
                  >
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
                  <Label htmlFor="template">Select Template *</Label>
                  <Select
                    value={formData.template_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, template_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="template1">
                        Standard Template
                      </SelectItem>
                      <SelectItem value="template2">
                        Detailed Template
                      </SelectItem>
                      <SelectItem value="template3">
                        Simplified Template
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="class">Class/Section (Optional)</Label>
                  <Select
                    value={formData.class_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, class_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Classes</SelectItem>
                      <SelectItem value="class1">Class 10A</SelectItem>
                      <SelectItem value="class2">Class 10B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={generating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleGenerateBulk}
                    disabled={generating}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {generating ? (
                      "Generating..."
                    ) : (
                      <>
                        <Users className="mr-2 h-4 w-4" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid gap-4 md:grid-cols-4"
      >
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Report Cards
              </p>
              <p className="text-2xl font-bold">{reportCards.length}</p>
            </div>
            <FileText className="h-8 w-8 text-orange-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Downloaded
              </p>
              <p className="text-2xl font-bold text-green-600">
                {reportCards.filter((r) => r.download_count > 0).length}
              </p>
            </div>
            <Download className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Pending
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {reportCards.filter((r) => r.download_count === 0).length}
              </p>
            </div>
            <Eye className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Downloads
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {reportCards.reduce((sum, r) => sum + r.download_count, 0)}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
      </motion.div>

      {/* Report Cards Table */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Generated Report Cards</h3>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            </div>
          ) : reportCards.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-muted-foreground">
                No report cards generated yet
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Exam</TableHead>
                  <TableHead>Generated Date</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportCards.map((reportCard) => (
                  <TableRow key={reportCard.id}>
                    <TableCell className="font-medium">
                      {reportCard.student_id}
                    </TableCell>
                    <TableCell>{reportCard.student_result_id}</TableCell>
                    <TableCell>
                      {new Date(reportCard.generated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {reportCard.download_count}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {reportCard.download_count > 0 ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Downloaded
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(reportCard.id)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
}
