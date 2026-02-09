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
  School,
  Globe,
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
    icon: School,
  },
  {
    title: "Users",
    href: "/super-admin/users",
    icon: Users,
  },
  {
    title: "Global Analytics",
    href: "/super-admin/analytics",
    icon: BarChart3,
  },
];

const secondaryNav = [
  {
    title: "Platform Settings",
    href: "/super-admin/settings",
    icon: Settings,
  },
  {
    title: "System Health",
    href: "/super-admin/health",
    icon: LifeBuoy,
  },
];

export function SuperAdminSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <div className="flex h-full w-[280px] flex-col bg-white border-r border-gray-200/80 shadow-sm [&::-webkit-scrollbar]:hidden">
      {/* Header with refined spacing */}
      <div className="flex h-16 items-center px-6 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900 tracking-tight leading-none">
              SchoolIQ
            </span>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-0.5">
              Super Admin
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-5 px-3 [&::-webkit-scrollbar]:hidden">
        {/* Main Menu with improved spacing */}
        <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Platform Management
        </div>
        <nav className="space-y-0.5 mb-6">
          {mainNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-blue-50 to-blue-50/50 text-blue-700 shadow-sm border border-blue-100"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-md transition-all",
                      isActive
                        ? "bg-blue-100"
                        : "bg-gray-100/50 group-hover:bg-gray-100",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-[18px] w-[18px] transition-colors",
                        isActive
                          ? "text-blue-600"
                          : "text-gray-500 group-hover:text-gray-700",
                      )}
                    />
                  </div>
                  <span className={cn(isActive && "font-semibold")}>
                    {item.title}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4" />

        {/* System */}
        <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          System Administration
        </div>
        <nav className="space-y-0.5 mb-6">
          {secondaryNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-blue-50 to-blue-50/50 text-blue-700 shadow-sm border border-blue-100"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-md transition-all",
                    isActive
                      ? "bg-blue-100"
                      : "bg-gray-100/50 group-hover:bg-gray-100",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-[18px] w-[18px] transition-colors",
                      isActive
                        ? "text-blue-600"
                        : "text-gray-500 group-hover:text-gray-700",
                    )}
                  />
                </div>
                <span className={cn(isActive && "font-semibold")}>
                  {item.title}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile with elegant design */}
      <div className="p-3 mt-auto border-t border-gray-100 bg-gradient-to-b from-transparent to-gray-50/50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full rounded-xl p-2.5 hover:bg-white hover:shadow-sm transition-all duration-200 text-left border border-transparent hover:border-gray-200/50">
              <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-gray-200/50">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-sm">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {user?.user_metadata?.full_name || "Super Admin"}
                </p>
                <p className="truncate text-xs text-gray-500 font-medium">
                  System Administrator
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 shadow-lg border-gray-200"
            side="right"
            sideOffset={10}
          >
            <DropdownMenuLabel className="text-gray-700 font-semibold">
              My Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-200" />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span className="font-medium">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
