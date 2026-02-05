"use client";

import { motion } from "framer-motion";
import { MetricCard } from "@/components/dashboard/widgets/metric-card";
import { PARENT_METRICS } from "@/services/mocks/student-parent-data";
import { FeeStatusCard } from "@/components/dashboard/widgets/parent/fee-status";
import { Announcements } from "@/components/dashboard/widgets/announcements";
import { RecentGrades } from "@/components/dashboard/widgets/student/recent-grades"; // Reusing for Child's grades
import { AttendanceChart } from "@/components/dashboard/widgets/chart-card"; // Placeholder for re-use if possible, or create specific
import { TodaysSchedule } from "@/components/dashboard/widgets/teacher/todays-schedule"; // Reuse generic schedule style if needed, or specific child schedule

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
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Parent Portal
          </h2>
          <p className="text-muted-foreground">
            Monitoring progress for{" "}
            <span className="font-semibold text-foreground">Alex Johnson</span>{" "}
            (Class 10-A)
          </p>
        </div>
        {/* Child Selector Placeholder */}
        <div className="text-sm font-medium text-slate-500 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-md border shadow-sm">
          Alex Johnson
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* KPI Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Custom Fee Card takes prominence */}
          <FeeStatusCard />

          {/* Other Metrics */}
          <div className="col-span-full lg:col-span-1 grid gap-4 grid-cols-2 lg:grid-cols-1">
            {PARENT_METRICS.slice(1).map((metric) => (
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
        </div>

        {/* Child's Performance & Info */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-full lg:col-span-4 space-y-4">
            <RecentGrades />
            <Announcements />
          </div>

          {/* Note: In a real app, we'd have a specific ChildSchedule widget, but re-using space for now */}
          <div className="col-span-full lg:col-span-3">
            {/* Placeholder for detailed attendance or calendar */}
            <div className="h-full rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center p-8 text-muted-foreground text-sm">
              Detailed Attendance Calendar Coming Soon
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
