"use client";

import {
  SCHOOL_ADMIN_METRICS,
  ATTENDANCE_DATA,
  PERFORMANCE_DATA,
} from "@/services/mocks/dashboard-data";
import { MetricCard } from "@/components/dashboard/widgets/metric-card";
import { ChartCard } from "@/components/dashboard/widgets/chart-card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { StarStudents } from "@/components/dashboard/widgets/student-list";
import { RecentActivity } from "@/components/dashboard/widgets/recent-activity";
import { QuickActions } from "@/components/dashboard/widgets/quick-actions";
import { RiskAlerts } from "@/components/dashboard/widgets/risk-alerts";
import { Announcements } from "@/components/dashboard/widgets/announcements";

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

export default function SchoolAdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Admin Dashboard
          </h2>
          <p className="text-muted-foreground">
            Overview of your school&apos;s performance and operational health.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Date Picker Placeholder */}
          <div className="text-sm font-medium text-slate-500 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-md border shadow-sm">
            Academic Year: 2023-2024
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
          {SCHOOL_ADMIN_METRICS.map((metric) => (
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

        {/* Quick Actions & Risk Alerts */}
        <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-4">
          <QuickActions />
          <RiskAlerts />
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <motion.div variants={item} className="col-span-4">
            <ChartCard
              title="Weekly Attendance"
              description="Student attendance overview for the current week"
            >
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={350}>
                  <BarChart data={ATTENDANCE_DATA}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E2E8F0"
                    />
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                      }}
                      itemStyle={{ color: "#1e293b" }}
                      cursor={{ fill: "transparent" }}
                    />
                    <Bar
                      dataKey="present"
                      name="Present"
                      fill="#ea580c" // Orange-600
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </motion.div>

          <motion.div variants={item} className="col-span-3">
            <Announcements />
          </motion.div>
        </div>

        {/* Performance & Activity */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <motion.div variants={item} className="col-span-3">
            <ChartCard
              title="Subject Performance"
              description="Average grades across departments"
            >
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={350}>
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    data={PERFORMANCE_DATA}
                  >
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: "#64748b", fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 150]}
                      tick={false}
                      axisLine={false}
                    />
                    <Radar
                      name="Section A"
                      dataKey="A"
                      stroke="#ea580c" // Orange-600
                      fill="#ea580c"
                      fillOpacity={0.4}
                    />
                    <Radar
                      name="Section B"
                      dataKey="B"
                      stroke="#0ea5e9" // Sky-500 for contrast
                      fill="#0ea5e9"
                      fillOpacity={0.4}
                    />
                    <Legend />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                      }}
                      itemStyle={{ color: "#1e293b" }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </motion.div>

          <div className="col-span-4 space-y-4">
            <RecentActivity />
            <StarStudents />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
