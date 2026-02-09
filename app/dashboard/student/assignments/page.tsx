"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  FileText,
  Search,
  Filter,
  AlertCircle,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data - replace with DB fetch
const assignments = [
  {
    id: 1,
    title: "Linear Algebra Problem Set",
    subject: "Mathematics",
    teacher: "Mr. Anderson",
    dueDate: "2024-02-15T23:59:00",
    status: "pending",
    points: 100,
    progress: 0,
    description:
      "Complete exercises 4.1 through 4.5 in the textbook. Show all work.",
  },
  {
    id: 2,
    title: "Hamlet Essay Draft",
    subject: "English Literature",
    teacher: "Ms. Davis",
    dueDate: "2024-02-18T23:59:00",
    status: "in-progress",
    points: 50,
    progress: 45,
    description:
      "Write a 5-page analysis of Hamlet's soliloquy. Focus on themes of mortality.",
  },
  {
    id: 3,
    title: "Physics Lab Report: Optics",
    subject: "Physics",
    teacher: "Dr. Wilson",
    dueDate: "2024-02-10T23:59:00",
    status: "submitted",
    points: 100,
    progress: 100,
    grade: null,
    submittedAt: "2024-02-10T14:30:00",
  },
  {
    id: 4,
    title: "History Presentation Slides",
    subject: "World History",
    teacher: "Mrs. Thompson",
    dueDate: "2024-02-05T23:59:00",
    status: "graded",
    points: 20,
    progress: 100,
    grade: 18,
    submittedAt: "2024-02-04T10:15:00",
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

export default function AssignmentsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAssignments = assignments.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.subject.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const pending = filteredAssignments.filter((a) =>
    ["pending", "in-progress"].includes(a.status),
  );
  const completed = filteredAssignments.filter((a) =>
    ["submitted", "graded"].includes(a.status),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "in-progress":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "submitted":
        return "text-green-600 bg-green-50 border-green-200";
      case "graded":
        return "text-purple-600 bg-purple-50 border-purple-200";
      default:
        return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Assignments
          </h2>
          <p className="text-muted-foreground">
            Track your coursework, deadlines, and submissions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="hidden md:flex">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Upload className="mr-2 h-4 w-4" />
            Submit Assignment
          </Button>
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search assignments by title or subject..."
            className="pl-10 max-w-md bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="bg-white p-1 border border-slate-200 rounded-xl">
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 rounded-lg"
            >
              Pending & In Progress
              <Badge
                variant="secondary"
                className="ml-2 bg-slate-100 text-slate-600 font-normal"
              >
                {pending.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 rounded-lg"
            >
              Completed & Graded
              <Badge
                variant="secondary"
                className="ml-2 bg-slate-100 text-slate-600 font-normal"
              >
                {completed.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-0">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {pending.map((assignment) => (
                <motion.div key={assignment.id} variants={item}>
                  <AssignmentCard
                    assignment={assignment}
                    getStatusColor={getStatusColor}
                  />
                </motion.div>
              ))}
              {pending.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500">
                  <div className="flex justify-center mb-4">
                    <CheckCircle2 className="h-12 w-12 text-green-500 opacity-20" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">
                    All caught up!
                  </h3>
                  <p>You satisfy all current assignment requirements.</p>
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="completed" className="mt-0">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {completed.map((assignment) => (
                <motion.div key={assignment.id} variants={item}>
                  <AssignmentCard
                    assignment={assignment}
                    getStatusColor={getStatusColor}
                  />
                </motion.div>
              ))}
              {completed.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500">
                  <p>No completed assignments yet.</p>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AssignmentCard({
  assignment,
  getStatusColor,
}: {
  assignment: any;
  getStatusColor: (s: string) => string;
}) {
  const isUrgent =
    new Date(assignment.dueDate).getTime() - new Date().getTime() <
      3 * 24 * 60 * 60 * 1000 &&
    assignment.status !== "submitted" &&
    assignment.status !== "graded";

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <Badge
            variant="outline"
            className={getStatusColor(assignment.status)}
          >
            {assignment.status.replace("-", " ")}
          </Badge>
          {assignment.grade !== null && (
            <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
              {assignment.grade}/{assignment.points} pts
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg font-semibold line-clamp-1 group-hover:text-orange-600 transition-colors">
          {assignment.title}
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <span className="font-medium text-slate-700">
            {assignment.subject}
          </span>
          <span>•</span>
          <span>{assignment.teacher}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-3">
        <p className="text-sm text-slate-600 line-clamp-3 mb-4">
          {assignment.description}
        </p>

        {assignment.status === "in-progress" && (
          <div className="space-y-1.5 mb-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Progress</span>
              <span>{assignment.progress}%</span>
            </div>
            <Progress
              value={assignment.progress}
              className="h-1.5"
              indicatorClassName="bg-blue-600"
            />
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-slate-500 mt-auto">
          <Clock className={`h-3.5 w-3.5 ${isUrgent ? "text-red-500" : ""}`} />
          <span className={isUrgent ? "text-red-600 font-medium" : ""}>
            Due {new Date(assignment.dueDate).toLocaleDateString()}
          </span>
          {isUrgent && (
            <span className="flex items-center text-red-600 font-medium ml-auto">
              <AlertCircle className="h-3.5 w-3.5 mr-1" />
              Urgent
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-3 border-t bg-slate-50/50">
        <Button
          variant="ghost"
          className="w-full justify-between group-hover:text-orange-600"
        >
          View Details
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function ArrowRightIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
