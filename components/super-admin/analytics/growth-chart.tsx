"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { name: "Jan", signups: 400, active: 2400 },
  { name: "Feb", signups: 300, active: 1398 },
  { name: "Mar", signups: 520, active: 3800 },
  { name: "Apr", signups: 278, active: 3908 },
  { name: "May", signups: 189, active: 4800 },
  { name: "Jun", signups: 239, active: 3800 },
  { name: "Jul", signups: 349, active: 4300 },
];

export function GrowthChart() {
  return (
    <Card className="col-span-4 border-slate-200/60 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-slate-800">
          Platform Growth
        </CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-slate-100"
                vertical={false}
              />
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
                cursor={{ fill: "#f1f5f9" }}
              />
              <Legend />
              <Bar
                dataKey="signups"
                name="New Signups"
                fill="#4f46e5"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="active"
                name="Active Users"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
