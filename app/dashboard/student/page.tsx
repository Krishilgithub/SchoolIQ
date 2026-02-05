"use client";

import { motion } from "framer-motion";
import { MetricCard } from "@/components/dashboard/widgets/metric-card";
import { STUDENT_METRICS } from "@/services/mocks/student-parent-data";
import { HomeworkList } from "@/components/dashboard/widgets/student/homework-list";
import { UpcomingExams } from "@/components/dashboard/widgets/student/upcoming-exams";
import { RecentGrades } from "@/components/dashboard/widgets/student/recent-grades";
import { Announcements } from "@/components/dashboard/widgets/announcements"; // Reuse announcements

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

export default function StudentDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Dashboard
          </h2>
          <p className="text-muted-foreground">
            Welcome back, Alex! Here&apos;s your academic overview.
          </p>
        </div>
        <div className="text-sm font-medium text-slate-500 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-md border shadow-sm">
          Class 10-A
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* KPI Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {STUDENT_METRICS.map((metric) => (
            <motion.div key={metric.id} variants={item}>
              <MetricCard
                title={metric.title}
                value={metric.value}
                trend={metric.trend}
                icon={metric.icon}
                iconClassName="text-orange-600"
              />
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Left Column */}
          <div className="col-span-full lg:col-span-4 space-y-4">
            <HomeworkList />
            <Announcements />
          </div>

          {/* Right Column */}
          <div className="col-span-full lg:col-span-3 space-y-4">
            <UpcomingExams />
            <RecentGrades />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
