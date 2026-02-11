"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ResultService } from "@/lib/services/result";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Award,
  TrendingUp,
  FileText,
  Plus,
  Eye,
  Download,
  BarChart3,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { Database } from "@/types/database.types";

type StudentResult = Database["public"]["Tables"]["student_results"]["Row"];

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

export default function ResultsPage() {
  const [results, setResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "draft" | "published">("all");

  useEffect(() => {
    loadResults();
  }, [filter]);

  const loadResults = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      setResults([]);
    } catch (error) {
      console.error("Error loading results:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      published: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    };
    return variants[status as keyof typeof variants] || variants.draft;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Results Management
          </h2>
          <p className="text-muted-foreground">
            Calculate, publish, and analyze student results
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/dashboard/results/analytics">
            <Button variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Button>
          </Link>
          <Link href="/dashboard/results/report-cards">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Report Cards
            </Button>
          </Link>
          <Link href="/dashboard/results/calculate">
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="mr-2 h-4 w-4" />
              Calculate Results
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
                  Total Results
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {results.length}
                </p>
              </div>
              <Award className="h-8 w-8 text-orange-600" />
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Published
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {results.filter((r) => r.status === "published").length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Performance
                </p>
                <p className="text-2xl font-bold text-blue-600">85.5%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Top Performers
                </p>
                <p className="text-2xl font-bold text-purple-600">45</p>
              </div>
              <Trophy className="h-8 w-8 text-purple-600" />
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Recent Results */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Recent Results</h3>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground mb-4">
              Calculate exam results to get started
            </p>
            <Link href="/dashboard/results/calculate">
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="mr-2 h-4 w-4" />
                Calculate Results
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => (
              <Card key={result.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{result.exam_id}</h4>
                    <p className="text-sm text-muted-foreground">
                      Total: {result.total_marks} / {result.max_marks} (
                      {result.percentage}%)
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusBadge(result.status)}>
                      {result.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/dashboard/results/rankings">
            <div className="flex items-start space-x-4">
              <Trophy className="h-8 w-8 text-orange-600" />
              <div>
                <h3 className="font-semibold mb-1">View Rankings</h3>
                <p className="text-sm text-muted-foreground">
                  Check class and school rankings
                </p>
              </div>
            </div>
          </Link>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/dashboard/results/analytics">
            <div className="flex items-start space-x-4">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold mb-1">Performance Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Analyze trends and patterns
                </p>
              </div>
            </div>
          </Link>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/dashboard/results/report-cards">
            <div className="flex items-start space-x-4">
              <FileText className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold mb-1">Generate Report Cards</h3>
                <p className="text-sm text-muted-foreground">
                  Create and download reports
                </p>
              </div>
            </div>
          </Link>
        </Card>
      </div>
    </div>
  );
}
