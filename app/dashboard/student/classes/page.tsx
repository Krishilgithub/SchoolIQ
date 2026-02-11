"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  User,
  MapPin,
  Clock,
  FileText,
  TrendingUp,
  Calendar,
  BarChart3,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

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

// Mock data - will be replaced with actual API calls
const classes = [
  {
    id: 1,
    name: "Mathematics",
    subject: "Advanced Calculus",
    teacher: "Mr. Anderson",
    teacherAvatar: "/avatars/teacher-1.jpg",
    room: "Room 301",
    schedule: "Mon, Wed, Fri - 9:00 AM",
    progress: 68,
    grade: "A-",
    nextClass: "Tomorrow at 9:00 AM",
    studentsCount: 28,
    materials: 15,
    assignments: 3,
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: 2,
    name: "Physics",
    subject: "Quantum Mechanics",
    teacher: "Dr. Wilson",
    teacherAvatar: "/avatars/teacher-2.jpg",
    room: "Lab 2B",
    schedule: "Tue, Thu - 11:00 AM",
    progress: 72,
    grade: "A",
    nextClass: "Today at 11:00 AM",
    studentsCount: 22,
    materials: 12,
    assignments: 2,
    color: "from-purple-500 to-pink-600",
  },
  {
    id: 3,
    name: "English Literature",
    subject: "Modern Poetry",
    teacher: "Ms. Davis",
    teacherAvatar: "/avatars/teacher-3.jpg",
    room: "Room 205",
    schedule: "Mon, Wed - 2:00 PM",
    progress: 85,
    grade: "A+",
    nextClass: "Monday at 2:00 PM",
    studentsCount: 30,
    materials: 20,
    assignments: 1,
    color: "from-green-500 to-teal-600",
  },
  {
    id: 4,
    name: "Chemistry",
    subject: "Organic Chemistry",
    teacher: "Dr. Brown",
    teacherAvatar: "/avatars/teacher-4.jpg",
    room: "Lab 3A",
    schedule: "Tue, Fri - 10:00 AM",
    progress: 61,
    grade: "B+",
    nextClass: "Friday at 10:00 AM",
    studentsCount: 25,
    materials: 18,
    assignments: 4,
    color: "from-orange-500 to-red-600",
  },
  {
    id: 5,
    name: "Computer Science",
    subject: "Data Structures",
    teacher: "Mr. Taylor",
    teacherAvatar: "/avatars/teacher-5.jpg",
    room: "Computer Lab",
    schedule: "Wed, Fri - 1:00 PM",
    progress: 75,
    grade: "A",
    nextClass: "Tomorrow at 1:00 PM",
    studentsCount: 35,
    materials: 25,
    assignments: 2,
    color: "from-cyan-500 to-blue-600",
  },
];

export default function MyClassesPage() {
  const [selectedTab, setSelectedTab] = useState("all");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Classes
          </h2>
          <p className="text-muted-foreground">
            Track your courses, progress, and upcoming sessions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            View Schedule
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Classes
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classes.length}</div>
              <p className="text-xs text-muted-foreground">This semester</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Progress
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(
                  classes.reduce((sum, c) => sum + c.progress, 0) /
                    classes.length,
                )}
                %
              </div>
              <p className="text-xs text-green-600">+2.4% from last month</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Assignments
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {classes.reduce((sum, c) => sum + c.assignments, 0)}
              </div>
              <p className="text-xs text-orange-600">Due this week</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Grade</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">A-</div>
              <p className="text-xs text-muted-foreground">
                Across all subjects
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Class Cards */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-white p-1 border border-slate-200 rounded-xl">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 rounded-lg"
          >
            All Classes
          </TabsTrigger>
          <TabsTrigger
            value="today"
            className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 rounded-lg"
          >
            Today
          </TabsTrigger>
          <TabsTrigger
            value="favorites"
            className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 rounded-lg"
          >
            Favorites
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {classes.map((classItem) => (
              <motion.div key={classItem.id} variants={item}>
                <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${classItem.color}`} />
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-1">
                          {classItem.name}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {classItem.subject}
                        </CardDescription>
                      </div>
                      <Badge
                        variant="secondary"
                        className="ml-2 bg-slate-100 text-slate-700 font-semibold"
                      >
                        {classItem.grade}
                      </Badge>
                    </div>

                    {/* Teacher Info */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={classItem.teacherAvatar} />
                        <AvatarFallback>{classItem.teacher[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{classItem.teacher}</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Course Progress
                        </span>
                        <span className="font-semibold">
                          {classItem.progress}%
                        </span>
                      </div>
                      <Progress value={classItem.progress} className="h-2" />
                    </div>

                    {/* Schedule & Location */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{classItem.schedule}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{classItem.room}</span>
                      </div>
                    </div>

                    {/* Next Class */}
                    <div className="pt-3 border-t">
                      <div className="text-xs text-muted-foreground mb-1">
                        Next Class
                      </div>
                      <div className="text-sm font-medium text-orange-600">
                        {classItem.nextClass}
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-900">
                          {classItem.materials}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Materials
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">
                          {classItem.assignments}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Pending
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-900">
                          {classItem.studentsCount}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Students
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                      size="sm"
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        <TabsContent value="today">
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>
              Filter by today's classes will be implemented with backend
              integration
            </p>
          </div>
        </TabsContent>

        <TabsContent value="favorites">
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Favorites feature coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
