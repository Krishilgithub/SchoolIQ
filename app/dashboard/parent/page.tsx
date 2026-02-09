"use client";

import { motion } from "framer-motion";
import {
  Users,
  CreditCard,
  Bell,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Mock data
const children = [
  {
    id: 1,
    name: "Alex Thompson",
    grade: "10th Grade",
    school: "Springfield High",
    attendance: 96,
    nextExam: "Mathematics - Feb 15",
    feesDue: 0,
    avatar: "/avatars/alex.jpg",
  },
  {
    id: 2,
    name: "Sarah Thompson",
    grade: "8th Grade",
    school: "Springfield Middle",
    attendance: 92,
    nextExam: "Science - Feb 12",
    feesDue: 450,
    avatar: "/avatars/sarah.jpg",
  },
];

const notices = [
  {
    id: 1,
    title: "School Annual Day",
    date: "Feb 20, 2024",
    type: "Event",
    description:
      "Annual day celebrations will start at 5 PM in the main auditorium.",
  },
  {
    id: 2,
    title: "Exam Schedule Released",
    date: "Feb 05, 2024",
    type: "Academic",
    description: "Final term examination schedule has been published.",
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

export default function ParentDashboard() {
  const totalFeesDue = children.reduce((acc, child) => acc + child.feesDue, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Family Overview
        </h2>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening with your children
          today.
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {/* Quick Stats - Children */}
        <motion.div variants={item}>
          <Card className="h-full border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Children
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{children.length}</div>
              <p className="text-xs text-muted-foreground">
                Enrolled in 2 schools
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats - Fees */}
        <motion.div variants={item}>
          <Card className="h-full border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Outstanding Fees
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${totalFeesDue}
              </div>
              <p className="text-xs text-muted-foreground">
                Due by Feb 28, 2024
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats - Events */}
        <motion.div variants={item}>
          <Card className="h-full border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Events
              </CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                Scheduled this month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Children Detail Cards */}
        <div className="col-span-full lg:col-span-2 space-y-6">
          <h3 className="text-lg font-semibold text-slate-900">My Children</h3>
          <div className="grid gap-6 md:grid-cols-2">
            {children.map((child) => (
              <motion.div key={child.id} variants={item}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center gap-4 bg-slate-50 border-b pb-4">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                      <AvatarImage src={child.avatar} />
                      <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">
                        {child.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-base font-semibold">
                        {child.name}
                      </CardTitle>
                      <CardDescription>
                        {child.grade} • {child.school}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4 grid gap-4 text-sm">
                    <div className="flex justify-between py-1 border-b border-dashed">
                      <span className="text-slate-500">Attendance</span>
                      <span
                        className={`font-semibold ${child.attendance >= 90 ? "text-green-600" : "text-amber-600"}`}
                      >
                        {child.attendance}%
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-dashed">
                      <span className="text-slate-500">Next Exam</span>
                      <span className="font-medium text-slate-900">
                        {child.nextExam}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 pt-2">
                      <span className="text-slate-500">Fees Status</span>
                      {child.feesDue > 0 ? (
                        <Badge variant="destructive">
                          Overdue: ${child.feesDue}
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-green-600 bg-green-50 border-green-200"
                        >
                          Paid
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Notifications / Announcements */}
        <motion.div variants={item} className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-600" />
                Notices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  className="relative pl-4 border-l-2 border-slate-200 hover:border-orange-300 transition-colors"
                >
                  <div className="text-xs text-slate-400 mb-0.5">
                    {notice.date}
                  </div>
                  <div className="font-semibold text-sm text-slate-900">
                    {notice.title}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {notice.description}
                  </p>
                  <Badge
                    variant="secondary"
                    className="mt-2 text-[10px] px-1.5 h-5"
                  >
                    {notice.type}
                  </Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full text-xs">
                View All Notices
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
