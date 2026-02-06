import React from "react";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  UserCog,
  CalendarCheck,
  Wallet,
  Bus,
  BarChart3,
  AlertTriangle,
  Megaphone,
  Search,
  Bell,
  Sun,
  Plus,
  Calendar,
  FileText,
} from "lucide-react";

// Types for our component props
interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  isNegative?: boolean;
  icon: React.ElementType;
  color: string;
}

interface ActionButtonProps {
  icon: React.ElementType;
  label: string;
  variant?: "primary" | "secondary";
}

interface AlertItemProps {
  title: string;
  desc: string;
  color: string;
}

export const MockDashboard = () => (
  <div className="w-full h-full bg-neutral-50 flex font-sans overflow-hidden rounded-xl border border-neutral-200">
    {/* Sidebar */}
    <div className="w-60 bg-white border-r border-neutral-200 flex-shrink-0 flex flex-col">
      <div className="p-4 flex items-center gap-2 border-b border-neutral-100/50">
        <div className="h-8 w-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
          S
        </div>
        <span className="font-bold text-neutral-900 text-lg tracking-tight">
          SchoolIQ
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        <div>
          <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2 px-2">
            Core
          </div>
          <div className="space-y-0.5">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active />
            <SidebarItem icon={GraduationCap} label="Academics" />
            <SidebarItem icon={Users} label="Students" />
            <SidebarItem icon={UserCog} label="Staff" />
          </div>
        </div>

        <div>
          <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2 px-2">
            Operations
          </div>
          <div className="space-y-0.5">
            <SidebarItem icon={CalendarCheck} label="Attendance" />
            <SidebarItem icon={Wallet} label="Finance" />
            <SidebarItem icon={Bus} label="Transport" />
          </div>
        </div>

        <div>
          <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2 px-2">
            Intelligence
          </div>
          <div className="space-y-0.5">
            <SidebarItem icon={BarChart3} label="Analytics" />
            <SidebarItem icon={AlertTriangle} label="Risk & Warning" />
          </div>
        </div>

        <div>
          <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2 px-2">
            Communication
          </div>
          <div className="space-y-0.5">
            <SidebarItem icon={Megaphone} label="Announcements" />
          </div>
        </div>
      </div>
    </div>

    {/* Main Content */}
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-6">
        <div className="flex items-center gap-2 text-neutral-400 bg-neutral-50 px-3 py-1.5 rounded-md border border-neutral-100 min-w-[300px]">
          <Search size={14} />
          <span className="text-xs">
            Search students, staff, or settings (Ctrl+K)...
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-neutral-400">
            <Bell size={18} className="hover:text-neutral-600 cursor-pointer" />
            <Sun size={18} className="hover:text-neutral-600 cursor-pointer" />
          </div>
          <div className="h-6 w-[1px] bg-neutral-200" />
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-neutral-900">
                Rahul Verma
              </div>
              <div className="text-[10px] text-neutral-500">School Admin</div>
            </div>
            <div className="h-8 w-8 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-700 font-bold text-xs">
              RV
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Body */}
      <div className="flex-1 overflow-y-auto p-6 bg-neutral-50/50">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              Overview of your school&apos;s performance and operational health.
            </p>
          </div>
          <div className="bg-white border border-neutral-200 text-neutral-600 px-3 py-1.5 rounded text-xs font-medium shadow-sm">
            Academic Year: 2023-2024
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="TOTAL STUDENTS"
            value="2,543"
            change="+12%"
            icon={Users}
            color="text-brand-600"
          />
          <StatsCard
            title="TOTAL TEACHERS"
            value="145"
            change="+4%"
            icon={GraduationCap}
            color="text-orange-600"
          />
          <StatsCard
            title="AVG. ATTENDANCE"
            value="94.2%"
            change="-0.8%"
            isNegative
            icon={CalendarCheck}
            color="text-green-600"
          />
          <StatsCard
            title="FEE COLLECTION"
            value="$425k"
            change="+24%"
            icon={Wallet}
            color="text-blue-600"
          />
        </div>

        {/* Lower Section Grid */}
        <div className="grid grid-cols-2 gap-6 h-full">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <ActionButton
                icon={Megaphone}
                label="Publish Notice"
                variant="primary"
              />
              <ActionButton icon={Plus} label="Add Student" />
              <ActionButton icon={Calendar} label="Schedule Exam" />
              <ActionButton icon={FileText} label="Generate Report" />
            </div>
          </div>

          {/* Warning System */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-900 mb-1 flex items-center gap-2">
              <AlertTriangle className="text-orange-500" size={20} />
              Needs Attention
            </h3>
            <p className="text-sm text-neutral-500 mb-4">
              Operational risks and alerts
            </p>

            <div className="space-y-4">
              <AlertItem
                title="Low Attendance Warning"
                desc="15 students from Class 10-B have < 75% attendance."
                color="bg-red-500"
              />
              <AlertItem
                title="Grade Drop detected"
                desc="Science department average fell by 12% this month."
                color="bg-orange-500"
              />
              <AlertItem
                title="Pending Fee Approvals"
                desc="8 scholarship applications waiting for review."
                color="bg-yellow-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Helpers
const SidebarItem = ({ icon: Icon, label, active }: SidebarItemProps) => (
  <div
    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-default ${
      active
        ? "bg-brand-50 text-brand-700"
        : "text-neutral-600 hover:bg-neutral-100"
    }`}
  >
    <Icon size={16} />
    {label}
  </div>
);

const StatsCard = ({
  title,
  value,
  change,
  isNegative,
  icon: Icon,
  color,
}: StatsCardProps) => (
  <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm flex flex-col justify-between h-32">
    <div className="flex justify-between items-start">
      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
        {title}
      </span>
      <Icon size={16} className={color} />
    </div>
    <div>
      <div className="text-2xl font-bold text-neutral-900">{value}</div>
      <div
        className={`text-xs font-semibold mt-1 ${
          isNegative ? "text-red-600" : "text-green-600"
        }`}
      >
        {change}
      </div>
    </div>
  </div>
);

const ActionButton = ({ icon: Icon, label, variant }: ActionButtonProps) => (
  <div
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-semibold transition-all cursor-default ${
      variant === "primary"
        ? "bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-500/20"
        : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300"
    }`}
  >
    <Icon size={16} />
    {label}
  </div>
);

const AlertItem = ({ title, desc, color }: AlertItemProps) => (
  <div className="flex gap-3 items-start p-3 bg-neutral-50 rounded-lg border border-neutral-100">
    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${color}`} />
    <div>
      <div className="text-sm font-bold text-neutral-800">{title}</div>
      <div className="text-xs text-neutral-500 leading-relaxed mt-0.5">
        {desc}
      </div>
    </div>
  </div>
);

// Exports
export const AdminDashboardWidget = MockDashboard; // Alias for backward compatibility

export const GradebookWidget = () => (
  // ... Placeholder to avoid breaking other imports if any (though likely none)
  <div className="p-4">Gradebook Widget Placeholder</div>
);

export const ParentAppPreview = () => (
  <div className="p-4">Parent App Placeholder</div>
);
