"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
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
import { cn } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

// Mock attendance data
const attendanceStats = {
  overall: 92,
  present: 138,
  absent: 8,
  late: 4,
  total: 150,
  trend: "improving",
};

const subjectAttendance = [
  {
    subject: "Mathematics",
    percentage: 95,
    present: 38,
    total: 40,
    trend: "stable",
    color: "bg-blue-500",
  },
  {
    subject: "Physics",
    percentage: 90,
    present: 36,
    total: 40,
    trend: "improving",
    color: "bg-purple-500",
  },
  {
    subject: "English",
    percentage: 88,
    present: 35,
    total: 40,
    trend: "declining",
    color: "bg-green-500",
  },
  {
    subject: "Chemistry",
    percentage: 93,
    present: 37,
    total: 40,
    trend: "stable",
    color: "bg-pink-500",
  },
  {
    subject: "Computer Science",
    percentage: 97,
    present: 39,
    total: 40,
    trend: "improving",
    color: "bg-orange-500",
  },
];

// Mock calendar data (last 30 days)
const generateCalendarData = () => {
  const data = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();

    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const rand = Math.random();
    let status = "present";
    if (rand < 0.05) status = "absent";
    else if (rand < 0.08) status = "late";

    data.push({
      date: date.toISOString().split("T")[0],
      status,
    });
  }
  return data;
};

const calendarData = generateCalendarData();

const recentRecords = [
  {
    id: 1,
    date: "2024-02-14",
    subject: "Mathematics",
    status: "present",
    time: "09:00 AM",
  },
  {
    id: 2,
    date: "2024-02-14",
    subject: "Physics",
    status: "present",
    time: "11:00 AM",
  },
  {
    id: 3,
    date: "2024-02-13",
    subject: "English",
    status: "late",
    time: "02:05 PM",
  },
  {
    id: 4,
    date: "2024-02-13",
    subject: "Chemistry",
    status: "present",
    time: "09:00 AM",
  },
  {
    id: 5,
    date: "2024-02-12",
    subject: "Computer Science",
    status: "absent",
    time: "-",
    reason: "Sick leave",
  },
];

export default function AttendancePage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-500";
      case "absent":
        return "bg-red-500";
      case "late":
        return "bg-yellow-500";
      default:
        return "bg-gray-300";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-300">
            Present
          </Badge>
        );
      case "absent":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-300">
            Absent
          </Badge>
        );
      case "late":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
            Late
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Attendance
          </h2>
          <p className="text-muted-foreground">
            Track your attendance and view detailed records
          </p>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <Calendar className="mr-2 h-4 w-4" />
          Request Leave
        </Button>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStats.overall}%</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              {attendanceStats.trend}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {attendanceStats.present}
            </div>
            <p className="text-xs text-muted-foreground">
              out of {attendanceStats.total} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {attendanceStats.absent}
            </div>
            <p className="text-xs text-muted-foreground">days missed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {attendanceStats.late}
            </div>
            <p className="text-xs text-muted-foreground">times late</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Heatmap (Last 30 Days)</CardTitle>
          <CardDescription>
            Visual representation of your daily attendance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {calendarData.map((day, idx) => (
              <div
                key={idx}
                className={cn(
                  "w-8 h-8 rounded transition-transform hover:scale-110 cursor-pointer",
                  getStatusColor(day.status),
                )}
                title={`${day.date}: ${day.status}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span>Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500" />
              <span>Late</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span>Absent</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject-wise Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Subject-wise Attendance</CardTitle>
          <CardDescription>
            Your attendance breakdown by subject
          </CardDescription>
        </CardHeader>
        <CardContent>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {subjectAttendance.map((subject) => (
              <motion.div key={subject.subject} variants={item}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn("w-3 h-3 rounded-full", subject.color)}
                    />
                    <span className="font-medium">{subject.subject}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {subject.present}/{subject.total}
                    </span>
                    {subject.trend === "improving" && (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    )}
                    {subject.trend === "declining" && (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-bold w-12 text-right">
                      {subject.percentage}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all",
                      subject.color,
                    )}
                    style={{ width: `${subject.percentage}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>

      {/* Recent Records */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Records</CardTitle>
          <CardDescription>Your latest attendance entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentRecords.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[80px]">
                    <div className="text-sm font-medium">{record.date}</div>
                    <div className="text-xs text-muted-foreground">
                      {record.time}
                    </div>
                  </div>
                  <div className="border-l pl-4">
                    <div className="font-medium">{record.subject}</div>
                    {record.reason && (
                      <div className="text-xs text-muted-foreground">
                        {record.reason}
                      </div>
                    )}
                  </div>
                </div>
                {getStatusBadge(record.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
