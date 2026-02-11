"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Calendar,
  Clock,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

// Mock data
const exams = [
  {
    id: 1,
    title: "Mathematics Midterm",
    subject: "Mathematics",
    date: "2024-02-20T09:00:00",
    duration: 180,
    totalMarks: 100,
    passingMarks: 40,
    room: "Hall A",
    status: "scheduled",
    syllabus: ["Calculus", "Linear Algebra", "Differential Equations"],
    daysLeft: 5,
  },
  {
    id: 2,
    title: "Physics Final Exam",
    subject: "Physics",
    date: "2024-02-25T14:00:00",
    duration: 150,
    totalMarks: 80,
    passingMarks: 32,
    room: "Lab 2B",
    status: "scheduled",
    syllabus: ["Quantum Mechanics", "Thermodynamics", "Optics"],
    daysLeft: 10,
  },
  {
    id: 3,
    title: "English Literature Test",
    subject: "English",
    date: "2024-02-15T10:00:00",
    duration: 120,
    totalMarks: 50,
    passingMarks: 20,
    room: "Room 205",
    status: "completed",
    result: { marksObtained: 45, grade: "A", percentage: 90 },
  },
];

export default function ExamsPage() {
  const [selectedExam, setSelectedExam] = useState<any>(null);

  const upcomingExams = exams.filter((e) => e.status === "scheduled");
  const completedExams = exams.filter((e) => e.status === "completed");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Exams & Tests
          </h2>
          <p className="text-muted-foreground">
            Prepare for upcoming exams and view your results
          </p>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <Calendar className="mr-2 h-4 w-4" />
          View Exam Calendar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingExams.length}</div>
            <p className="text-xs text-orange-600">
              Next in {upcomingExams[0]?.daysLeft} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            {" "}
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedExams.length}</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-green-600">+5% from last semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">All exams passed</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="bg-white p-1 border border-slate-200 rounded-xl">
          <TabsTrigger
            value="upcoming"
            className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"
          >
            Upcoming ({upcomingExams.length})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"
          >
            Completed ({completedExams.length})
          </TabsTrigger>
          <TabsTrigger
            value="preparation"
            className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"
          >
            Preparation
          </TabsTrigger>
        </TabsList>

        {/* Upcoming Exams */}
        <TabsContent value="upcoming">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {upcomingExams.map((exam) => (
              <motion.div key={exam.id} variants={item}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold">{exam.title}</h3>
                            <Badge className="bg-orange-100 text-orange-700 border-orange-300">
                              {exam.subject}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {new Date(exam.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              {exam.duration} minutes
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <FileText className="h-4 w-4" />
                              {exam.totalMarks} marks
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              Room {exam.room}
                            </div>
                          </div>
                        </div>

                        {/* Syllabus */}
                        <div>
                          <div className="text-sm font-medium mb-2">
                            Syllabus:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {exam.syllabus?.map((topic, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs"
                              >
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            <BookOpen className="mr-2 h-4 w-4" />
                            View Syllabus
                          </Button>
                          <Button size="sm" variant="outline">
                            <Calendar className="mr-2 h-4 w-4" />
                            Add to Calendar
                          </Button>
                        </div>
                      </div>

                      {/* Days Countdown */}
                      <div className="ml-6 text-center">
                        <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
                          <div>
                            <div className="text-2xl font-bold text-orange-600">
                              {exam.daysLeft}
                            </div>
                            <div className="text-xs text-orange-600">
                              days left
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        {/* Completed Exams */}
        <TabsContent value="completed">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {completedExams.map((exam) => (
              <motion.div key={exam.id} variants={item}>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{exam.title}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-muted-foreground">
                              Date:{" "}
                            </span>
                            {new Date(exam.date).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Score:{" "}
                            </span>
                            {exam.result?.marksObtained} / {exam.totalMarks}
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Grade:{" "}
                            </span>
                            <Badge className="ml-2">{exam.result?.grade}</Badge>
                          </div>
                        </div>
                        <Progress
                          value={exam.result?.percentage}
                          className="h-2"
                        />
                      </div>
                      <div className="ml-6 text-right">
                        <div className="text-3xl font-bold text-green-600">
                          {exam.result?.percentage}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Percentage
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        {/* Preparation */}
        <TabsContent value="preparation">
          <Card>
            <CardHeader>
              <CardTitle>Exam Preparation Tools</CardTitle>
              <CardDescription>
                Track your preparation progress and study plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>
                  Preparation tools will be implemented with backend integration
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
