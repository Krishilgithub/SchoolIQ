"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CreditCard,
  LineChart,
  MessageSquare,
  Settings,
  LogOut,
  ChevronRight,
  Baby,
  CalendarDays,
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

const parentNav = [
  {
    title: "Overview",
    href: "/dashboard/parent",
    icon: LayoutDashboard,
  },
  {
    title: "My Children",
    href: "/dashboard/parent/children",
    icon: Baby,
  },
  {
    title: "Academic Progress",
    href: "/dashboard/parent/progress",
    icon: LineChart,
  },
  {
    title: "Fees & Payments",
    href: "/dashboard/parent/fees",
    icon: CreditCard,
  },
  {
    title: "Attendance",
    href: "/dashboard/parent/attendance",
    icon: CalendarDays,
  },
  {
    title: "Messages",
    href: "/dashboard/parent/messages",
    icon: MessageSquare,
  },
];

export function ParentSidebar() {
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
        <span className="ml-2 text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
          Parent
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 [&::-webkit-scrollbar]:hidden">
        {/* Main Menu */}
        <div className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Family Portal
        </div>
        <nav className="space-y-1 mb-8">
          {parentNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-orange-50 text-orange-600 shadow-sm ring-1 ring-orange-200"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive
                        ? "text-orange-600"
                        : "text-slate-400 group-hover:text-slate-600",
                    )}
                  />
                  <span>{item.title}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <Link
          href="/dashboard/parent/settings"
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
                <AvatarFallback className="bg-orange-100 text-orange-600 font-semibold">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {user?.user_metadata?.full_name || "Parent"}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {user?.user_metadata?.role || "Parent"}
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
