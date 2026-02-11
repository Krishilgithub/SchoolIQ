"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  ChevronLeft,
  ChevronRight,
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
import { cn } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

// Mock weekly schedule
const schedule = [
  {
    day: "Monday",
    classes: [
      {
        id: 1,
        subject: "Mathematics",
        teacher: "Dr. Smith",
        time: "09:00 - 10:30",
        room: "Room 301",
        type: "lecture",
        color: "bg-blue-500",
      },
      {
        id: 2,
        subject: "Physics",
        teacher: "Prof. Johnson",
        time: "11:00 - 12:30",
        room: "Lab 2B",
        type: "lab",
        color: "bg-purple-500",
      },
      {
        id: 3,
        subject: "English",
        teacher: "Ms. Davis",
        time: "14:00 - 15:30",
        room: "Room 205",
        type: "lecture",
        color: "bg-green-500",
      },
    ],
  },
  {
    day: "Tuesday",
    classes: [
      {
        id: 4,
        subject: "Chemistry",
        teacher: "Dr. Brown",
        time: "09:00 - 10:30",
        room: "Lab 3A",
        type: "lab",
        color: "bg-pink-500",
      },
      {
        id: 5,
        subject: "Computer Science",
        teacher: "Mr. Wilson",
        time: "11:00 - 12:30",
        room: "Computer Lab",
        type: "practical",
        color: "bg-orange-500",
      },
    ],
  },
  {
    day: "Wednesday",
    classes: [
      {
        id: 6,
        subject: "Mathematics",
        teacher: "Dr. Smith",
        time: "09:00 - 10:30",
        room: "Room 301",
        type: "tutorial",
        color: "bg-blue-500",
      },
      {
        id: 7,
        subject: "Physics",
        teacher: "Prof. Johnson",
        time: "11:00 - 12:30",
        room: "Room 401",
        type: "lecture",
        color: "bg-purple-500",
      },
      {
        id: 8,
        subject: "English",
        teacher: "Ms. Davis",
        time: "14:00 - 15:30",
        room: "Room 205",
        type: "discussion",
        color: "bg-green-500",
      },
    ],
  },
  {
    day: "Thursday",
    classes: [
      {
        id: 9,
        subject: "Chemistry",
        teacher: "Dr. Brown",
        time: "09:00 - 10:30",
        room: "Lab 3A",
        type: "lab",
        color: "bg-pink-500",
      },
      {
        id: 10,
        subject: "Computer Science",
        teacher: "Mr. Wilson",
        time: "11:00 - 12:30",
        room: "Computer Lab",
        type: "lecture",
        color: "bg-orange-500",
      },
    ],
  },
  {
    day: "Friday",
    classes: [
      {
        id: 11,
        subject: "Mathematics",
        teacher: "Dr. Smith",
        time: "09:00 - 10:30",
        room: "Room 301",
        type: "lecture",
        color: "bg-blue-500",
      },
      {
        id: 12,
        subject: "English",
        teacher: "Ms. Davis",
        time: "11:00 - 12:30",
        room: "Room 205",
        type: "lecture",
        color: "bg-green-500",
      },
    ],
  },
];

export default function SchedulePage() {
  const [currentWeek, setCurrentWeek] = useState(0);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Schedule
          </h2>
          <p className="text-muted-foreground">
            Your weekly class timetable and schedule
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeek(currentWeek - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            Week{" "}
            {currentWeek === 0
              ? "Current"
              : currentWeek > 0
                ? `+${currentWeek}`
                : currentWeek}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeek(currentWeek + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Today's Quick Info */}
      <Card className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Today is {today}</h3>
              <p className="opacity-90">
                You have{" "}
                {schedule.find((d) => d.day === today)?.classes.length || 0}{" "}
                classes scheduled
              </p>
            </div>
            <Calendar className="h-12 w-12 opacity-80" />
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {schedule.map((daySchedule) => (
          <motion.div key={daySchedule.day} variants={item}>
            <Card
              className={cn(
                "overflow-hidden transition-shadow hover:shadow-md",
                daySchedule.day === today && "ring-2 ring-orange-500",
              )}
            >
              <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    {daySchedule.day}
                    {daySchedule.day === today && (
                      <Badge className="ml-3 bg-orange-600">Today</Badge>
                    )}
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {daySchedule.classes.length} classes
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {daySchedule.classes.map((cls) => (
                    <div
                      key={cls.id}
                      className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Color Bar */}
                        <div
                          className={cn("w-1 h-16 rounded-full", cls.color)}
                        />

                        {/* Time */}
                        <div className="flex flex-col items-center justify-center min-w-[80px] text-center">
                          <Clock className="h-4 w-4 text-muted-foreground mb-1" />
                          <div className="text-sm font-medium">{cls.time}</div>
                        </div>

                        {/* Class Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-bold text-lg">
                                {cls.subject}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {cls.teacher}
                              </p>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {cls.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {cls.room}
                            </div>
                          </div>
                        </div>

                        {/* Action */}
                        <Button variant="ghost" size="icon">
                          <BookOpen className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
