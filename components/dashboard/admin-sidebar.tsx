"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
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
    <div className="flex h-full w-[280px] flex-col bg-gradient-to-b from-white via-white to-orange-50/30 border-r border-gray-200/80 shadow-xl [&::-webkit-scrollbar]:hidden relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.02] via-transparent to-transparent pointer-events-none" />

      {/* Header with refined spacing and gradient */}
      <div className="flex h-16 items-center px-6 border-b border-gray-100 bg-gradient-to-r from-white to-orange-50/30 relative z-10">
        <Logo
          textClassName="text-gray-900 scale-110 origin-left font-bold"
          iconClassName="text-orange-600"
        />
        <motion.span
          className="ml-2 text-[10px] font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-white px-2.5 py-1 rounded-md shadow-sm uppercase tracking-wide"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          Admin
        </motion.span>
      </div>

      <div className="flex-1 overflow-y-auto py-5 px-3 [&::-webkit-scrollbar]:hidden relative z-10">
        {/* Main Menu with improved spacing */}
        <motion.div
          className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          Administration
        </motion.div>
        <nav className="space-y-0.5 mb-6">
          {adminNav.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-300",
                    isActive
                      ? "bg-gradient-to-r from-orange-500/10 via-orange-500/[0.08] to-transparent text-orange-700 shadow-sm"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent hover:text-gray-900 hover:shadow-sm hover:translate-x-0.5",
                  )}
                >
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-r-full shadow-lg shadow-orange-500/30"
                      layoutId="activeIndicator"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}

                  <motion.div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300",
                      isActive
                        ? "bg-gradient-to-br from-orange-100 to-orange-50"
                        : "bg-gray-100/60 group-hover:bg-gray-100",
                    )}
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon
                      className={cn(
                        "h-[17px] w-[17px] transition-colors duration-300",
                        isActive
                          ? "text-orange-600"
                          : "text-gray-500 group-hover:text-gray-700",
                      )}
                    />
                  </motion.div>

                  <span className={cn(isActive && "font-semibold")}>
                    {item.title}
                  </span>
                  {item.badge && (
                    <motion.span
                      className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-[10px] font-medium text-orange-600 shadow-sm"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                    >
                      {item.badge}
                    </motion.span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Elegant Divider with gradient */}
        <div className="relative h-px my-4">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-200/30 to-transparent blur-sm" />
        </div>

        {/* Settings & News with refined styling */}
        <motion.div
          className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          Resources
        </motion.div>
        <nav className="space-y-0.5 mb-6">
          {secondaryNav.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + 0.05 * index }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-300",
                    isActive
                      ? "bg-gradient-to-r from-orange-500/10 via-orange-500/[0.08] to-transparent text-orange-700 shadow-sm"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent hover:text-gray-900",
                  )}
                >
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-r-full shadow-lg shadow-orange-500/30"
                      layoutId="secondaryActiveIndicator"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}

                  <motion.div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300",
                      isActive
                        ? "bg-gradient-to-br from-orange-100 to-orange-50"
                        : "bg-gray-100/60 group-hover:bg-gray-100",
                    )}
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon
                      className={cn(
                        "h-[17px] w-[17px] transition-colors duration-300",
                        isActive
                          ? "text-orange-600"
                          : "text-gray-500 group-hover:text-gray-700",
                      )}
                    />
                  </motion.div>
                  <span className={cn(isActive && "font-semibold")}>
                    {item.title}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Link
            href="/dashboard/settings"
            className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-300 text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent hover:text-gray-900"
          >
            <motion.div
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100/60 group-hover:bg-gray-100 transition-all duration-300"
              whileHover={{ scale: 1.05, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="h-[17px] w-[17px] text-gray-500 group-hover:text-gray-700 transition-colors duration-300" />
            </motion.div>
            <span>Settings</span>
          </Link>
        </motion.div>
      </div>

      {/* User Profile with elegant design and animations */}
      <motion.div
        className="p-3 mt-auto border-t border-gray-100 bg-gradient-to-b from-transparent via-orange-50/20 to-orange-50/40 backdrop-blur-sm relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button
              className="flex items-center gap-3 w-full rounded-xl p-2.5 hover:bg-white/80 hover:shadow-md transition-all duration-300 text-left border border-transparent hover:border-orange-200/50 backdrop-blur-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-white shadow-md ring-2 ring-orange-100/50">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold text-sm">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <motion.div
                  className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {user?.user_metadata?.full_name || "Admin"}
                </p>
                <p className="truncate text-xs text-orange-600 font-medium">
                  {user?.user_metadata?.role || "Administrator"}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 shadow-xl border-gray-200/80 bg-white/95 backdrop-blur-sm"
            side="right"
            sideOffset={10}
          >
            <DropdownMenuLabel className="text-gray-700 font-semibold">
              My Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            <DropdownMenuItem
              onSelect={async (e) => {
                e.preventDefault();
                try {
                  await signOut();
                } catch (error) {
                  console.error("Logout error:", error);
                }
              }}
              className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer font-medium"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>
    </div>
  );
}
