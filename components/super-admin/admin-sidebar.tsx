"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldCheck,
  Settings,
  CreditCard,
  FileText,
  ChevronLeft,
  Menu,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { Logo } from "@/components/marketing/logo";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/super-admin/dashboard",
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
    title: "Audit Logs",
    href: "/super-admin/audit",
    icon: FileText,
  },
  {
    title: "Billing",
    href: "/super-admin/billing",
    icon: CreditCard,
  },
  {
    title: "Security Center",
    href: "/super-admin/security",
    icon: ShieldCheck,
  },
  {
    title: "System Settings",
    href: "/super-admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { signOut } = useAuth(); // Removed unused 'user'

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen border-r border-border bg-card/80 backdrop-blur-xl transition-all duration-300 z-50 flex flex-col",
        collapsed ? "w-[80px]" : "w-[280px]",
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b border-border justify-between">
        {!collapsed && (
          <Link
            href="/super-admin/dashboard"
            className="flex items-center gap-2"
          >
            <Logo className="h-8 w-8 text-primary" showText={false} />
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg tracking-tight text-foreground leading-none">
                SchoolIQ
              </span>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                Super Admin
              </span>
            </div>
          </Link>
        )}
        {collapsed && (
          <div className="mx-auto">
            <Logo className="h-8 w-8 text-primary" showText={false} />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("hidden md:flex ml-auto", collapsed && "ml-0 mx-auto")}
        >
          {collapsed ? (
            <Menu className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <TooltipProvider delayDuration={0}>
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative overflow-hidden",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      collapsed && "justify-center px-2",
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-nav-sidebar"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-full"
                        transition={{ duration: 0.2 }}
                      />
                    )}
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-colors",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                    />
                    {!collapsed && <span>{item.title}</span>}
                    {collapsed && <span className="sr-only">{item.title}</span>}
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">{item.title}</TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10",
            collapsed && "justify-center px-0",
          )}
          onClick={() => signOut()}
        >
          <LogOut className={cn("h-5 w-5", !collapsed && "mr-2")} />
          {!collapsed && "Sign Out"}
        </Button>
      </div>
    </aside>
  );
}
