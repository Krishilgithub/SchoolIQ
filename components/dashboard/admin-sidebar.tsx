"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Settings,
  Sparkles,
  School,
  Newspaper,
  ChevronRight,
  LogOut,
  Building2,
  GraduationCap,
  BellRing,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/marketing/logo";
import { useAuth } from "@/components/providers/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const adminNav = [
  {
    title: "Overview",
    href: "/dashboard/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Students",
    href: "/dashboard/admin/students",
    icon: GraduationCap,
  },
  {
    title: "Teachers",
    href: "/dashboard/admin/teachers",
    icon: Users,
  },
  {
    title: "Classes",
    href: "/dashboard/admin/classes",
    icon: Building2,
  },
  {
    title: "Announcements",
    href: "/dashboard/admin/announcements",
    icon: BellRing,
    badge: 3,
  },
];

const secondaryNav = [
  {
    title: "School News",
    href: "/dashboard/news",
    icon: Sparkles,
  },
  {
    title: "School Activities",
    href: "/dashboard/activities",
    icon: School,
  },
  {
    title: "What's New",
    href: "/dashboard/changelog",
    icon: Newspaper,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <div className="flex h-full w-[280px] flex-col bg-white border-r border-slate-200 text-slate-600 [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div className="flex h-20 items-center px-6 border-b border-slate-100">
        <Logo
          textClassName="text-slate-900 scale-110 origin-left"
          iconClassName="text-orange-600"
        />
        <span className="ml-2 text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
          Admin
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 [&::-webkit-scrollbar]:hidden">
        {/* Main Menu */}
        <div className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Administration
        </div>
        <nav className="space-y-1 mb-8">
          {adminNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-200"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive
                        ? "text-indigo-600"
                        : "text-slate-400 group-hover:text-slate-600",
                    )}
                  />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold",
                      isActive
                        ? "bg-indigo-200 text-indigo-700"
                        : "bg-slate-100 text-slate-600",
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Settings & News */}
        <div className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
          System & Updates
        </div>
        <nav className="space-y-1 mb-8">
          {secondaryNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-200"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive
                      ? "text-indigo-600"
                      : "text-slate-400 group-hover:text-slate-600",
                  )}
                />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <Link
          href="/dashboard/settings"
          className={cn(
            "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900",
          )}
        >
          <Settings className="h-5 w-5 text-slate-400 group-hover:text-slate-600" />
          <span>Settings</span>
        </Link>
      </div>

      {/* User Profile */}
      <div className="p-4 mt-auto border-t border-slate-100 flex flex-col gap-2">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          <span>Log out</span>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full rounded-2xl p-2 hover:bg-slate-50 transition-colors text-left border border-transparent hover:border-slate-200">
              <Avatar className="h-10 w-10 border border-slate-200">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-indigo-100 text-indigo-600 font-semibold">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {user?.user_metadata?.full_name || "Admin"}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {user?.user_metadata?.role || "Administrator"}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56"
            side="right"
            sideOffset={10}
          >
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
