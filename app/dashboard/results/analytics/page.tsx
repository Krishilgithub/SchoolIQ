"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Award,
  Users,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

const COLORS = ["#ea580c", "#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6"];

const performanceData = [
  { subject: "Math", average: 85 },
  { subject: "Science", average: 78 },
  { subject: "English", average: 82 },
  { subject: "History", average: 75 },
  { subject: "Geography", average: 80 },
];

const trendData = [
  { exam: "Term 1", average: 75 },
  { exam: "Term 2", average: 78 },
  { exam: "Mid-Term", average: 82 },
  { exam: "Term 3", average: 85 },
];

const gradeDistribution = [
  { grade: "A+", count: 45 },
  { grade: "A", count: 78 },
  { grade: "B", count: 62 },
  { grade: "C", count: 23 },
  { grade: "D", count: 12 },
];

export default function ResultsAnalyticsPage() {
  const [selectedExam, setSelectedExam] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");

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
              Performance Analytics
            </h2>
            <p className="text-muted-foreground">
              Analyze student performance trends and patterns
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Exam</label>
            <Select value={selectedExam} onValueChange={setSelectedExam}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exams</SelectItem>
                <SelectItem value="exam1">Mid-Term Exam 2024</SelectItem>
                <SelectItem value="exam2">Final Exam 2024</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Class</label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="class1">Class 10A</SelectItem>
                <SelectItem value="class2">Class 10B</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid gap-4 md:grid-cols-4"
      >
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Class Average
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                85.5%
              </p>
            </div>
            <Award className="h-8 w-8 text-orange-600" />
          </div>
          <div className="flex items-center mt-2 text-sm text-green-600">
            <TrendingUp className="mr-1 h-4 w-4" />
            <span>+5.2% from last exam</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Pass Rate
              </p>
              <p className="text-2xl font-bold text-green-600">96.8%</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
          <div className="flex items-center mt-2 text-sm text-green-600">
            <TrendingUp className="mr-1 h-4 w-4" />
            <span>+2.1% from last exam</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Highest Score
              </p>
              <p className="text-2xl font-bold text-blue-600">98.5%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-sm text-muted-foreground mt-2">John Doe</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                At Risk Students
              </p>
              <p className="text-2xl font-bold text-red-600">8</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-sm text-muted-foreground mt-2">Below 40%</p>
        </Card>
      </motion.div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-orange-600" />
            Subject-wise Performance
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="average" fill="#ea580c" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
            Performance Trend
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="exam" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="average"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={{ fill: "#0ea5e9", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Award className="mr-2 h-5 w-5 text-green-600" />
            Grade Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.grade}: ${entry.count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
          <div className="space-y-4">
            {[
              { name: "John Doe", score: 98.5, rank: 1 },
              { name: "Jane Smith", score: 97.2, rank: 2 },
              { name: "Bob Johnson", score: 96.8, rank: 3 },
              { name: "Alice Williams", score: 95.4, rank: 4 },
              { name: "Charlie Brown", score: 94.9, rank: 5 },
            ].map((student) => (
              <div
                key={student.rank}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                    #{student.rank}
                  </Badge>
                  <span className="font-medium">{student.name}</span>
                </div>
                <span className="text-lg font-semibold text-green-600">
                  {student.score}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
