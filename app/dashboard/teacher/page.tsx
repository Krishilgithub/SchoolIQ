"use client";

import { motion } from "framer-motion";
import { MetricCard } from "@/components/dashboard/widgets/metric-card";
import { TEACHER_METRICS } from "@/services/mocks/teacher-data";
import { TodaysSchedule } from "@/components/dashboard/widgets/teacher/todays-schedule";
import { TaskQueue } from "@/components/dashboard/widgets/teacher/task-queue";
import { NextClassCard } from "@/components/dashboard/widgets/teacher/next-class";
import { QuickActions } from "@/components/dashboard/widgets/quick-actions"; // Reusing generic actions for now, can be customized

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

export default function TeacherDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Teacher Dashboard
          </h2>
          <p className="text-muted-foreground">
            Manage your classes, assignments, and schedule.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm font-medium text-slate-500 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-md border shadow-sm">
            Today, Feb 06
          </div>
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
          {TEACHER_METRICS.map((metric) => (
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

        {/* Next Class & Actions */}
        <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-4">
          <NextClassCard />
          {/* Reusing RiskAlerts or creating notification widget later */}
          <div className="col-span-2 hidden lg:block">
            {/* Placeholder for Quick Actions or similar utility */}
            <QuickActions />
          </div>
        </div>

        {/* Schedule & Tasks */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <TodaysSchedule />
          <TaskQueue />
        </div>
      </motion.div>
    </div>
  );
}
