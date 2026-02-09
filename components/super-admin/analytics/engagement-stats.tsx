"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { name: "Mon", dau: 1200, session: 15 },
  { name: "Tue", dau: 1350, session: 18 },
  { name: "Wed", dau: 1500, session: 20 },
  { name: "Thu", dau: 1400, session: 16 },
  { name: "Fri", dau: 1600, session: 22 },
  { name: "Sat", dau: 900, session: 12 },
  { name: "Sun", dau: 850, session: 10 },
];

export function EngagementStats() {
  return (
    <Card className="col-span-4 border-slate-200/60 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-slate-800">
          User Engagement (Last 7 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorDau" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-slate-100"
                vertical={false}
              />
              <Area
                type="monotone"
                dataKey="dau"
                stroke="#ec4899"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorDau)"
                name="Daily Active Users"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
