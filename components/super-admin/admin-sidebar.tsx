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
  Activity,
  Workflow,
  Database,
  Flag,
  Puzzle,
  LifeBuoy,
  Search,
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { Logo } from "@/components/marketing/logo";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// All available routes
const allRoutes = [
  {
    title: "Dashboard",
    href: "/super-admin/dashboard",
    icon: LayoutDashboard,
    group: "Overview",
  },
  {
    title: "Schools",
    href: "/super-admin/schools",
    icon: Building2,
    group: "Management",
    badge: "Active", // Example dynamic badge location
  },
  {
    title: "Users & Roles",
    href: "/super-admin/users",
    icon: Users,
    group: "Management",
  },
  {
    title: "Billing",
    href: "/super-admin/billing",
    icon: CreditCard,
    group: "Management",
  },
  {
    title: "System Health",
    href: "/super-admin/health",
    icon: Activity,
    group: "Observability",
  },
  {
    title: "Jobs & Workers",
    href: "/super-admin/jobs",
    icon: Workflow, // Using Workflow for Jobs
    group: "Observability",
  },
  {
    title: "Audit Logs",
    href: "/super-admin/audit",
    icon: FileText,
    group: "Observability",
  },
  {
    title: "Backups",
    href: "/super-admin/backups",
    icon: Database,
    group: "Observability",
  },
  {
    title: "Feature Flags",
    href: "/super-admin/feature-flags",
    icon: Flag,
    group: "Configuration",
  },
  {
    title: "Integrations",
    href: "/super-admin/integrations",
    icon: Puzzle,
    group: "Configuration",
  },
  {
    title: "Security",
    href: "/super-admin/security",
    icon: ShieldCheck,
    group: "Configuration",
  },
  {
    title: "Support",
    href: "/super-admin/support",
    icon: LifeBuoy,
    group: "Support",
  },
  {
    title: "Settings",
    href: "/super-admin/settings",
    icon: Settings,
    group: "Support",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRoutes = allRoutes.filter((route) =>
    route.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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

      {/* Search Bar - Only show when expanded */}
      {!collapsed && (
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-9 h-9 bg-background/50 border-input/50 focus:bg-background transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1 scrollbar-thin scrollbar-thumb-border">
        <TooltipProvider delayDuration={0}>
          {filteredRoutes.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group relative overflow-hidden",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      collapsed && "justify-center px-2 py-3",
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-nav-sidebar"
                        className="absolute left-0 top-1 bottom-1 w-1 bg-primary rounded-full"
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
                    {!collapsed && (
                      <div className="flex flex-1 items-center justify-between">
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5 px-1.5 bg-primary/5 border-primary/20 text-primary"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    )}
                    {collapsed && <span className="sr-only">{item.title}</span>}
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">
                    <div className="flex items-center gap-2">
                      {item.title}
                      {item.badge && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-5 px-1"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </TooltipProvider>

        {filteredRoutes.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No modules found
          </div>
        )}
      </div>

      {/* Environment Tag */}
      {!collapsed && (
        <div className="px-4 pb-2">
          <div className="flex items-center justify-center p-2 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 text-xs font-bold uppercase tracking-widest gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
            Generic Mode
          </div>
        </div>
      )}

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
