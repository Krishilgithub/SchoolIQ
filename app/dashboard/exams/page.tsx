"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Plus,
  Eye,
  Edit,
  Calendar,
  BookOpen,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { Database } from "@/types/database.types";

type Exam = Database["public"]["Tables"]["exam_master"]["Row"];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "draft" | "published">("all");

  useEffect(() => {
    loadExams();
  }, [filter]);

  const loadExams = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.append("status", filter);
      const response = await fetch(`/api/exams?${params}`);
      const data = await response.json();
      setExams(data);
    } catch (error) {
      console.error("Error loading exams:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      published:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      ongoing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      completed:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    };
    return variants[status as keyof typeof variants] || variants.draft;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Exam Management
          </h2>
          <p className="text-muted-foreground">
            Create and manage exams, papers, and assessments
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/dashboard/exams/marks">
            <Button variant="outline">
              <BookOpen className="mr-2 h-4 w-4" />
              Enter Marks
            </Button>
          </Link>
          <Link href="/dashboard/exams/moderation">
            <Button variant="outline">
              <CheckCircle className="mr-2 h-4 w-4" />
              Moderation Queue
            </Button>
          </Link>
          <Link href="/dashboard/exams/create">
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Exam
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-4"
      >
        <motion.div variants={item}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Exams
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {exams.length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Ongoing
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {exams.filter((e) => e.status === "ongoing").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completed
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {exams.filter((e) => e.status === "completed").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Drafts
                </p>
                <p className="text-2xl font-bold text-gray-600">
                  {exams.filter((e) => e.status === "draft").length}
                </p>
              </div>
              <Edit className="h-8 w-8 text-gray-600" />
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </Card>
              ))}
            </div>
          ) : exams.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No exams found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first exam
              </p>
              <Link href="/dashboard/exams/create">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Exam
                </Button>
              </Link>
            </Card>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              {exams.map((exam) => (
                <motion.div key={exam.id} variants={item}>
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">
                          {exam.exam_name}
                        </h3>
                        <Badge className={getStatusBadge(exam.status)}>
                          {exam.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        Academic Year: {exam.academic_year_id}
                      </div>
                      {exam.start_date && (
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          {new Date(
                            exam.start_date,
                          ).toLocaleDateString()} -{" "}
                          {exam.end_date &&
                            new Date(exam.end_date).toLocaleDateString()}
                        </div>
                      )}
                      <div className="flex items-center">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Max Marks: {exam.total_max_marks || 0}
                      </div>
                    </div>

                    {exam.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {exam.description}
                      </p>
                    )}

                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/dashboard/exams/${exam.id}`}
                        className="flex-1"
                      >
                        <Button variant="outline" className="w-full" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </Link>
                      <Link
                        href={`/dashboard/exams/${exam.id}/edit`}
                        className="flex-1"
                      >
                        <Button variant="outline" className="w-full" size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
