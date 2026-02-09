"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldAlert,
  Activity,
  Settings,
  Ticket,
  LogOut,
  CreditCard,
} from "lucide-react";

const routes = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: "/super-admin/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Schools",
    icon: Building2,
    href: "/super-admin/schools",
    color: "text-violet-500",
  },
  {
    label: "Users & Admins",
    icon: Users,
    href: "/super-admin/users",
    color: "text-pink-700",
  },
  {
    label: "Billing",
    icon: CreditCard,
    href: "/super-admin/billing",
    color: "text-emerald-500",
  },
  {
    label: "System Health",
    icon: Activity,
    href: "/super-admin/system",
    color: "text-orange-700",
  },
  {
    label: "Security & Audit",
    icon: ShieldAlert,
    href: "/super-admin/audit",
    color: "text-red-700",
  },
  {
    label: "Support Tickets",
    icon: Ticket,
    href: "/super-admin/support",
    color: "text-green-700",
  },
  {
    label: "Platform Settings",
    icon: Settings,
    href: "/super-admin/settings",
  },
];

export function SuperAdminSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-gradient-to-b from-[#111827] via-[#0f172a] to-[#111827] text-white relative overflow-hidden border-r border-white/10 shadow-2xl">
      {/* Animated background gradient orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <div className="px-3 py-2 flex-1 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/super-admin/dashboard"
            className="flex items-center pl-3 mb-10 group"
          >
            <motion.div
              className="relative h-10 w-10 mr-4"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-purple-500/30 ring-2 ring-purple-400/30">
                SA
              </div>
            </motion.div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                Admin Console
              </h1>
              <p className="text-xs text-gray-400 font-medium">
                Platform Management
              </p>
            </div>
          </Link>
        </motion.div>

        <div className="space-y-1">
          {routes.map((route, index) => (
            <motion.div
              key={route.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.05 * index,
                type: "spring",
                stiffness: 300,
              }}
            >
              <Link
                href={route.href}
                className={cn(
                  "text-sm group relative flex p-3 w-full justify-start font-medium cursor-pointer rounded-xl transition-all duration-300",
                  pathname === route.href
                    ? "text-white bg-gradient-to-r from-purple-500/20 via-violet-500/10 to-transparent shadow-lg"
                    : "text-zinc-400 hover:text-white hover:bg-white/5",
                )}
              >
                {/* Active indicator */}
                {pathname === route.href && (
                  <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-500 to-violet-600 rounded-r-full shadow-lg shadow-purple-500/50"
                    layoutId="superAdminActiveIndicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <div className="flex items-center flex-1">
                  <motion.div
                    className={cn(
                      "flex items-center justify-center w-9 h-9 rounded-lg mr-3 transition-all duration-300",
                      pathname === route.href
                        ? "bg-gradient-to-br from-purple-500/30 to-violet-500/20 shadow-md"
                        : "bg-white/5 group-hover:bg-white/10",
                    )}
                    whileHover={{
                      scale: 1.05,
                      rotate: pathname === route.href ? 0 : 5,
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <route.icon
                      className={cn(
                        "h-5 w-5 transition-all duration-300",
                        route.color,
                        pathname === route.href && "drop-shadow-lg",
                      )}
                    />
                  </motion.div>
                  <span
                    className={cn(pathname === route.href && "font-semibold")}
                  >
                    {route.label}
                  </span>
                </div>

                {/* Glassmorphism hover effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* User Profile Section */}
      <motion.div
        className="px-3 py-4 border-t border-white/10 bg-gradient-to-b from-transparent to-black/20 backdrop-blur-sm relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          className="flex items-center gap-3 mb-3 p-2.5 rounded-xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/10"
          whileHover={{ scale: 1.02 }}
        >
          <div className="relative">
            <Avatar className="h-10 w-10 border-2 border-purple-500/30 shadow-lg ring-2 ring-purple-400/20">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white font-bold text-sm">
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* Online status indicator */}
            <motion.div
              className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#111827] rounded-full shadow-sm"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold text-white">
              {user?.user_metadata?.full_name || "Super Admin"}
            </p>
            <p className="truncate text-xs text-purple-400 font-medium">
              Super Administrator
            </p>
          </div>
        </motion.div>

        <Button
          variant="ghost"
          onClick={() => signOut()}
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-300 font-medium group"
        >
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <LogOut className="h-5 w-5 mr-3" />
          </motion.div>
          <span>Logout</span>
        </Button>
      </motion.div>
    </div>
  );
}
