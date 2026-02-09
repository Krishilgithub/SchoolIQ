"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Download, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Mock data
const semesterData = {
  gpa: 3.8,
  rank: 5,
  totalStudents: 320,
  credits: 18,
  attendance: 96,
};

const grades = [
  {
    subject: "Mathematics",
    teacher: "Mr. Anderson",
    midterm: 92,
    final: 94,
    grade: "A",
    percentage: 93,
    credits: 4,
    trend: "up",
  },
  {
    subject: "Physics",
    teacher: "Dr. Wilson",
    midterm: 88,
    final: 91,
    grade: "A-",
    percentage: 89.5,
    credits: 4,
    trend: "up",
  },
  {
    subject: "English Literature",
    teacher: "Ms. Davis",
    midterm: 85,
    final: 82,
    grade: "B",
    percentage: 83.5,
    credits: 3,
    trend: "down",
  },
  {
    subject: "World History",
    teacher: "Mrs. Thompson",
    midterm: 95,
    final: 96,
    grade: "A+",
    percentage: 95.5,
    credits: 3,
    trend: "up",
  },
  {
    subject: "Computer Science",
    teacher: "Mr. Roberts",
    midterm: 98,
    final: 99,
    grade: "A+",
    percentage: 98.5,
    credits: 4,
    trend: "flat",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

export default function GradesPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Academic Report
          </h2>
          <p className="text-muted-foreground">
            View your grades, GPA, and academic standing for Spring 2024.
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download Report Card
        </Button>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* GPA Card */}
          <motion.div variants={item}>
            <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-indigo-100 uppercase tracking-wide">
                  Current GPA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{semesterData.gpa}</div>
                <p className="text-xs text-indigo-100 mt-1">
                  Weighted Scale (4.0)
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Class Rank */}
          <motion.div variants={item}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Class Rank
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-slate-900">
                  Top{" "}
                  {(
                    (semesterData.rank / semesterData.totalStudents) *
                    100
                  ).toFixed(1)}
                  %
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Rank {semesterData.rank} out of {semesterData.totalStudents}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Credits */}
          <motion.div variants={item}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Credits Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-slate-900">
                  {semesterData.credits}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Out of 18 attempted
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Attendance */}
          <motion.div variants={item}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Attendance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-slate-900">
                  {semesterData.attendance}%
                </div>
                <Progress
                  value={semesterData.attendance}
                  className="h-2 mt-2"
                  indicatorClassName="bg-green-500"
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Grades Table */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>Subject Performance</CardTitle>
              <CardDescription>
                Detailed breakdown of your performance across all subjects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead className="text-right">Credits</TableHead>
                    <TableHead className="text-right">Midterm</TableHead>
                    <TableHead className="text-right">Final</TableHead>
                    <TableHead className="text-right">Overall</TableHead>
                    <TableHead className="text-center">Trend</TableHead>
                    <TableHead className="text-right">Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((grade) => (
                    <TableRow key={grade.subject}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                            {grade.subject.substring(0, 2)}
                          </div>
                          {grade.subject}
                        </div>
                      </TableCell>
                      <TableCell>{grade.teacher}</TableCell>
                      <TableCell className="text-right">
                        {grade.credits}
                      </TableCell>
                      <TableCell className="text-right">
                        {grade.midterm}%
                      </TableCell>
                      <TableCell className="text-right">
                        {grade.final}%
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-900">
                        {grade.percentage}%
                      </TableCell>
                      <TableCell className="text-center">
                        {grade.trend === "up" && (
                          <TrendingUp className="h-4 w-4 text-green-500 mx-auto" />
                        )}
                        {grade.trend === "down" && (
                          <TrendingDown className="h-4 w-4 text-red-500 mx-auto" />
                        )}
                        {grade.trend === "flat" && (
                          <Minus className="h-4 w-4 text-slate-400 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={
                            grade.grade.startsWith("A")
                              ? "bg-green-50 text-green-700 border-green-200"
                              : grade.grade.startsWith("B")
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-slate-100 text-slate-700"
                          }
                        >
                          {grade.grade}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
