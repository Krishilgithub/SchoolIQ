"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  LifeBuoy,
  LogOut,
  ChevronRight,
  School,
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
          Super Admin
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
          Platform Management
        </motion.div>
        <nav className="space-y-0.5 mb-6">
          {mainNav.map((item, index) => {
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
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4" />

        {/* System */}
        <motion.div
          className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          System Administration
        </motion.div>
        <nav className="space-y-0.5 mb-6">
          {secondaryNav.map((item, index) => {
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
                </Link>
              </motion.div>
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
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold text-sm shadow-orange-500/20">
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
              onSelect={async (e) => {
                e.preventDefault();
                try {
                  await signOut();
                } catch (error) {
                  console.error("Logout error:", error);
                }
              }}
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
