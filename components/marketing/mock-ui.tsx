import React from "react";
import { Users, CheckCircle, TrendingUp, Bell } from "lucide-react";

export const AdminDashboardWidget = () => (
  <div className="w-full h-full bg-white rounded-xl border border-neutral-200 p-6 flex flex-col gap-6 font-sans shadow-sm">
    {/* Header */}
    <div className="flex justify-between items-center pb-4 border-b border-neutral-100">
      <div>
        <h4 className="text-neutral-900 font-semibold">Morning Overview</h4>
        <p className="text-xs text-neutral-500">Today, 24th Oct</p>
      </div>
      <div className="h-8 w-8 rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-200">
        <Bell size={14} className="text-neutral-400" />
      </div>
    </div>

    {/* Metric Cards */}
    <div className="flex gap-4">
      <div className="flex-1 bg-neutral-50 p-3 rounded-lg border border-neutral-100">
        <p className="text-xs text-neutral-500 mb-1">Attendance</p>
        <div className="flex items-end gap-2">
          <span className="text-xl font-bold text-neutral-900">96%</span>
          <span className="text-xs text-green-600 flex items-center">
            <TrendingUp size={10} className="mr-1" /> +2.4%
          </span>
        </div>
      </div>
      <div className="flex-1 bg-neutral-50 p-3 rounded-lg border border-neutral-100">
        <p className="text-xs text-neutral-500 mb-1">Revenue</p>
        <div className="flex items-end gap-2">
          <span className="text-xl font-bold text-neutral-900">$42k</span>
          <span className="text-xs text-neutral-500">collected</span>
        </div>
      </div>
    </div>

    {/* List */}
    <div className="flex-1 space-y-3">
      <div className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
        Recent Alerts
      </div>
      <div className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer">
        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
          <Users size={14} />
        </div>
        <div>
          <p className="text-sm text-neutral-900 font-medium">Staff Meeting</p>
          <p className="text-xs text-neutral-500">Starts in 15 mins</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer">
        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
          <CheckCircle size={14} />
        </div>
        <div>
          <p className="text-sm text-neutral-900 font-medium">System Backup</p>
          <p className="text-xs text-neutral-500">Completed successfully</p>
        </div>
      </div>
    </div>
  </div>
);

export const GradebookWidget = () => (
  <div className="w-full h-full bg-white rounded-xl border border-neutral-200 p-0 overflow-hidden flex flex-col font-sans shadow-sm">
    <div className="p-4 bg-neutral-50 border-b border-neutral-200 flex justify-between items-center">
      <h4 className="text-neutral-900 font-semibold text-sm">
        Gradebook: Class 10-A
      </h4>
      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded border border-green-200">
        Active Session
      </span>
    </div>
    <div className="p-4 flex-1">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-xs text-neutral-500 border-b border-neutral-100">
            <th className="pb-2 font-medium">Student</th>
            <th className="pb-2 font-medium">Math</th>
            <th className="pb-2 font-medium">Sci</th>
            <th className="pb-2 font-medium">Eng</th>
            <th className="pb-2 font-medium">Avg</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {[
            { name: "Alex Cohen", m: 92, s: 88, e: 90, a: "A" },
            { name: "Sarah Jin", m: 95, s: 94, e: 98, a: "A+" },
            { name: "Mike Ross", m: 78, s: 82, e: 80, a: "B" },
            { name: "Emily D.", m: 88, s: 85, e: 92, a: "A-" },
          ].map((row, i) => (
            <tr
              key={i}
              className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors"
            >
              <td className="py-3 text-neutral-700 font-medium">{row.name}</td>
              <td className="py-3 text-neutral-600">{row.m}</td>
              <td className="py-3 text-neutral-600">{row.s}</td>
              <td className="py-3 text-neutral-600">{row.e}</td>
              <td className="py-3 font-bold text-neutral-900">{row.a}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const ParentAppPreview = () => (
  <div className="w-full h-full bg-white rounded-xl border border-neutral-200 p-6 flex items-center justify-center shadow-sm">
    <div className="h-[380px] w-[220px] bg-white border-[3px] border-neutral-200 rounded-[2rem] p-3 shadow-xl relative overflow-hidden ring-1 ring-neutral-900/5">
      {/* Mobile Status Bar */}
      <div className="absolute top-0 inset-x-0 h-6 bg-white z-10 flex justify-between px-4 items-center border-b border-neutral-100">
        <span className="text-[8px] text-neutral-900 font-medium">9:41</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-neutral-900" />
          <div className="w-2 h-2 rounded-full bg-neutral-400" />
        </div>
      </div>

      {/* App Header */}
      <div className="mt-6 mb-4 flex justify-between items-center">
        <div>
          <p className="text-[10px] text-neutral-500">Good Morning,</p>
          <p className="text-xs font-bold text-neutral-900">Mrs. Anderson</p>
        </div>
        <div className="h-6 w-6 rounded-full bg-purple-100 border border-purple-200" />
      </div>

      {/* Child Card */}
      <div className="bg-gradient-to-br from-brand-600 to-blue-600 rounded-xl p-3 mb-3 text-white shadow-md shadow-brand-500/20">
        <div className="flex justify-between items-start mb-2">
          <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm" />
          <span className="text-[8px] bg-white/20 backdrop-blur-sm px-1.5 py-0.5 rounded border border-white/10">
            Grade 5
          </span>
        </div>
        <p className="text-xs font-bold">Leo Anderson</p>
        <p className="text-[9px] opacity-90">Attendance: 98%</p>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-2 flex flex-col gap-1 items-center justify-center h-16 hover:bg-neutral-100 transition-colors">
          <div className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px]">
            $
          </div>
          <span className="text-[8px] text-neutral-600 font-medium">Fees</span>
        </div>
        <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-2 flex flex-col gap-1 items-center justify-center h-16 hover:bg-neutral-100 transition-colors">
          <div className="h-6 w-6 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-[10px]">
            📝
          </div>
          <span className="text-[8px] text-neutral-600 font-medium">
            Homework
          </span>
        </div>
      </div>
    </div>
  </div>
);
