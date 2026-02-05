"use client";

import React from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const data = [
  { month: "Jan", revenue: 4000, efficiency: 2400 },
  { month: "Feb", revenue: 4500, efficiency: 3200 },
  { month: "Mar", revenue: 6000, efficiency: 4500 },
  { month: "Apr", revenue: 8000, efficiency: 6000 },
  { month: "May", revenue: 11000, efficiency: 8500 },
  { month: "Jun", revenue: 16000, efficiency: 12000 },
];

export default function RoiChart() {
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e5e5"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            stroke="#d4d4d4"
            tick={{ fill: "#737373", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis
            stroke="#d4d4d4"
            tick={{ fill: "#737373", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#171717",
              borderColor: "#262626",
              borderRadius: "8px",
              color: "#fff",
            }}
            itemStyle={{ color: "#fff" }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#0ea5e9"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
          <Area
            type="monotone"
            dataKey="efficiency"
            stroke="#22c55e"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorEfficiency)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
