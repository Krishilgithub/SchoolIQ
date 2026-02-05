"use client";

import { Sidebar, MobileSidebar } from "./sidebar-nav";
import { Topbar } from "@/components/layout/topbar";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar className="hidden md:flex border-r border-slate-200 dark:border-slate-800" />
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile Header with Sidebar Trigger */}
        <div className="md:hidden flex items-center p-4 border-b bg-background">
          <MobileSidebar />
          <span className="ml-2 font-bold text-lg">SchoolIQ</span>
        </div>

        {/* We reuse the Topbar but might need to adapt it for dashboard if it has specific needs */}
        <div className="hidden md:block">
          <Topbar />
        </div>
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
