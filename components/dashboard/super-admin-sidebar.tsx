"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  Settings,
  LifeBuoy,
  Shield,
  LogOut,
  ChevronRight,
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

const mainNav = [
  {
    title: "Overview",
    href: "/super-admin",
    icon: LayoutDashboard,
  },
  {
    title: "Schools",
    href: "/super-admin/schools",
    icon: Building2,
  },
  {
    title: "Users",
    href: "/super-admin/users",
    icon: Users,
  },
  {
    title: "Analytics",
    href: "/super-admin/analytics",
    icon: BarChart3,
  },
];

const secondaryNav = [
  {
    title: "Settings",
    href: "/super-admin/settings",
    icon: Settings,
  },
  {
    title: "Support",
    href: "/super-admin/support",
    icon: LifeBuoy,
  },
];

export function SuperAdminSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <div className="flex h-full w-[280px] flex-col bg-slate-900 border-r border-slate-800 text-slate-400 [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div className="flex h-20 items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            Admin Console
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 [&::-webkit-scrollbar]:hidden">
        {/* Main Menu */}
        <div className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Platform Management
        </div>
        <nav className="space-y-1 mb-8">
          {mainNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-indigo-600/10 text-indigo-400 shadow-sm ring-1 ring-indigo-500/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive
                        ? "text-indigo-400"
                        : "text-slate-500 group-hover:text-slate-300",
                    )}
                  />
                  <span>{item.title}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* System */}
        <div className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
          System
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
                    ? "bg-indigo-600/10 text-indigo-400 shadow-sm ring-1 ring-indigo-500/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive
                      ? "text-indigo-400"
                      : "text-slate-500 group-hover:text-slate-300",
                  )}
                />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile */}
      <div className="p-4 mt-auto border-t border-slate-800">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full rounded-2xl p-2 hover:bg-slate-800 transition-colors text-left border border-transparent hover:border-slate-700">
              <Avatar className="h-10 w-10 border border-slate-700">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-indigo-900 text-indigo-300 font-semibold">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold text-slate-200">
                  {user?.user_metadata?.full_name || "Super Admin"}
                </p>
                <p className="truncate text-xs text-slate-500">
                  System Administrator
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-slate-900 border-slate-800 text-slate-300"
            side="right"
            sideOffset={10}
          >
            <DropdownMenuLabel className="text-slate-500">
              My Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="focus:bg-slate-800 focus:text-slate-200 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
