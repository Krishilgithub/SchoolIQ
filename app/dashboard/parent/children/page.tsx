"use client";

import { motion } from "framer-motion";
import {
  User,
  GraduationCap,
  CalendarCheck,
  Clock,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data
const childrenDetail = [
  {
    id: 1,
    name: "Alex Thompson",
    role: "Student",
    grade: "10th Grade - Section A",
    school: "Springfield High School",
    avatar: "/avatars/alex.jpg",
    teacher: {
      name: "Mrs. Krabappel",
      email: "edna@springfield.edu",
      phone: "+1 234 567 8900",
    },
    performance: {
      gpa: 3.5,
      attendance: 96,
      assignments: 92,
    },
    schedule: [
      { time: "08:00 AM", subject: "Math" },
      { time: "09:00 AM", subject: "Physics" },
      { time: "10:30 AM", subject: "History" },
    ],
  },
  {
    id: 2,
    name: "Sarah Thompson",
    role: "Student",
    grade: "8th Grade - Section B",
    school: "Springfield Middle School",
    avatar: "/avatars/sarah.jpg",
    teacher: {
      name: "Ms. Hoover",
      email: "elizabeth@springfield.edu",
      phone: "+1 234 567 8901",
    },
    performance: {
      gpa: 3.8,
      attendance: 92,
      assignments: 98,
    },
    schedule: [
      { time: "08:00 AM", subject: "English" },
      { time: "09:00 AM", subject: "Biology" },
      { time: "10:30 AM", subject: "Art" },
    ],
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

export default function ChildrenPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          My Children
        </h2>
        <p className="text-muted-foreground">
          Detailed profiles and academic status for your enrolled children.
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {childrenDetail.map((child) => (
          <motion.div key={child.id} variants={item}>
            <Card className="overflow-hidden border-l-4 border-l-orange-500">
              <div className="md:flex">
                {/* Child Profile Sidebar */}
                <div className="bg-slate-50 p-6 md:w-80 border-r border-slate-100 flex flex-col items-center text-center">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-md mb-4">
                    <AvatarImage src={child.avatar} />
                    <AvatarFallback className="bg-orange-100 text-orange-600 text-3xl font-bold">
                      {child.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold text-slate-900">
                    {child.name}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 mb-1">
                    {child.grade}
                  </p>
                  <p className="text-xs text-slate-400 mb-6">{child.school}</p>

                  <div className="w-full space-y-2">
                    <Button className="w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-orange-600 shadow-sm">
                      View Full Report
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full">
                          Contact Teacher
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <div className="px-2 py-1.5 text-xs text-slate-500 font-medium">
                          Class Teacher: {child.teacher.name}
                        </div>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Email Teacher
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Phone className="mr-2 h-4 w-4" />
                          Call School
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Performance & Schedule */}
                <div className="flex-1 p-6">
                  <div className="grid md:grid-cols-2 gap-8 h-full">
                    {/* Performance Metrics */}
                    <div className="space-y-6">
                      <h4 className="text-sm font-semibold uppercase text-slate-500 tracking-wider">
                        Performance Overview
                      </h4>

                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                            <GraduationCap className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">GPA</span>
                              <span className="text-sm font-bold text-slate-900">
                                {child.performance.gpa}/4.0
                              </span>
                            </div>
                            <Progress
                              value={(child.performance.gpa / 4) * 100}
                              className="h-2"
                              indicatorClassName="bg-blue-600"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                            <CalendarCheck className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">
                                Attendance
                              </span>
                              <span className="text-sm font-bold text-slate-900">
                                {child.performance.attendance}%
                              </span>
                            </div>
                            <Progress
                              value={child.performance.attendance}
                              className="h-2"
                              indicatorClassName="bg-green-600"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                            <User className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">
                                Assignment Completion
                              </span>
                              <span className="text-sm font-bold text-slate-900">
                                {child.performance.assignments}%
                              </span>
                            </div>
                            <Progress
                              value={child.performance.assignments}
                              className="h-2"
                              indicatorClassName="bg-purple-600"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Today's Schedule */}
                    <div className="space-y-6">
                      <h4 className="text-sm font-semibold uppercase text-slate-500 tracking-wider">
                        Today&apos;s Schedule
                      </h4>
                      <div className="relative">
                        <div className="absolute top-0 bottom-0 left-3.5 w-0.5 bg-slate-100"></div>
                        <div className="space-y-4">
                          {child.schedule.map((slot, index) => (
                            <div
                              key={index}
                              className="relative pl-10 flex items-center"
                            >
                              <div className="absolute left-1.5 top-1.5 h-4 w-4 rounded-full border-2 border-white ring-2 ring-orange-200 bg-orange-500"></div>
                              <div className="bg-slate-50 rounded-lg p-3 w-full border border-slate-100 hover:border-orange-200 transition-colors">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm font-semibold text-slate-900">
                                    {slot.subject}
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] h-5 bg-white shadow-sm font-normal"
                                  >
                                    <Clock className="w-3 h-3 mr-1 text-slate-400" />
                                    {slot.time}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
