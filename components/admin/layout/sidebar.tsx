"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import {
  BarChart3,
  Building2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  LayoutDashboard,
  Settings,
  ShieldAlert,
  Users,
  Activity,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/super-admin" },
  { icon: Activity, label: "Platform Health", href: "/super-admin/health" },
  { icon: Building2, label: "Schools", href: "/super-admin/schools" },
  { icon: Users, label: "Users & Roles", href: "/super-admin/users" },
  { icon: CreditCard, label: "Billing", href: "/super-admin/billing" },
  { icon: BarChart3, label: "Analytics", href: "/super-admin/analytics" },
  { icon: ShieldAlert, label: "Support", href: "/super-admin/support" },
  { icon: FileText, label: "Audit Logs", href: "/super-admin/audit" },
  { icon: Settings, label: "Settings", href: "/super-admin/settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { signOut } = useAuth();

  return (
    <motion.aside
      initial={{ width: 260 }}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative z-20 flex h-screen flex-col border-r border-border bg-card/50 backdrop-blur-xl"
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-border/50">
        <div
          className={cn(
            "flex items-center gap-2",
            collapsed && "justify-center w-full",
          )}
        >
          <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold">S</span>
          </div>
          {!collapsed && (
            <span className="text-lg font-bold font-heading tracking-tight">
              SchoolIQ
              <span className="text-xs font-normal text-muted-foreground ml-2 px-1.5 py-0.5 rounded-md bg-muted">
                Admin
              </span>
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-muted/80",
                isActive
                  ? "bg-primary/10 text-primary hover:bg-primary/15"
                  : "text-muted-foreground hover:text-foreground",
                collapsed && "justify-center px-2",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}

              {/* Tooltip implementation for collapsed state could happen here */}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border/50 space-y-2">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full text-destructive hover:text-destructive hover:bg-destructive/10",
            collapsed ? "justify-center" : "justify-start",
          )}
          onClick={() => signOut()}
        >
          <LogOut className={cn("h-4 w-4", !collapsed && "mr-2")} />
          {!collapsed && <span>Logout</span>}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse Sidebar</span>
            </div>
          )}
        </Button>
      </div>
    </motion.aside>
  );
}
