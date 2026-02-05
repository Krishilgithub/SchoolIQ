"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  School,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { NAVIGATION_CONFIG } from "@/config/navigation";
import { Role } from "@/types/auth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Default to SCHOOL_ADMIN if no user (dev mode safety)
  const role: Role = user?.role || "SCHOOL_ADMIN";
  const navGroups = NAVIGATION_CONFIG[role] || [];

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <motion.div
      animate={{ width: collapsed ? 80 : 280 }}
      className="relative flex h-screen flex-col border-r bg-sidebar border-sidebar-border shadow-sm transition-all duration-300 z-40 hidden md:flex"
    >
      {/* Header */}
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border/50">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-500/20">
            <School className="h-5 w-5" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="whitespace-nowrap font-heading text-xl font-bold text-sidebar-foreground"
              >
                SchoolIQ
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 z-50 h-6 w-6 rounded-full border border-border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6 scrollbar-thin scrollbar-thumb-sidebar-border">
        <TooltipProvider delayDuration={0}>
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-2">
              {!collapsed && group.title && (
                <h4 className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider px-2">
                  {group.title}
                </h4>
              )}
              {/* Separator for collapsed mode if needed */}
              {collapsed && idx > 0 && (
                <div className="h-px bg-sidebar-border my-4 mx-2" />
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon || School;

                  if (collapsed) {
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>
                          <Link
                            href={item.href || "#"}
                            className="flex justify-center"
                          >
                            <div
                              className={cn(
                                "h-10 w-10 flex items-center justify-center rounded-md transition-all duration-200",
                                isActive
                                  ? "bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400"
                                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                              )}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="bg-sidebar-foreground text-sidebar"
                        >
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return (
                    <Link key={item.href} href={item.href || "#"}>
                      <div
                        className={cn(
                          "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300 font-semibold shadow-sm"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4.5 w-4.5 shrink-0 transition-colors",
                            isActive
                              ? "text-brand-600 dark:text-brand-400"
                              : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground",
                          )}
                        />
                        <span>{item.title}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </TooltipProvider>
      </div>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4 bg-sidebar/50">
        <Button
          variant="ghost"
          onClick={() => logout()}
          className={cn(
            "w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10",
            collapsed && "justify-center px-0",
          )}
        >
          <LogOut className="h-4.5 w-4.5" />
          {!collapsed && <span className="ml-2 font-medium">Logout</span>}
        </Button>
      </div>
    </motion.div>
  );
}
