"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";
import { NAVIGATION_CONFIG } from "@/config/navigation";
import { Role } from "@/types/auth";
// import { useAuthStore } from "@/store/auth-store"; // Unused
// import { Logo } from "@/components/logo"; // Unused
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  // TODO: Replace with real auth store role
  // const { user } = useAuthStore();
  // const role: Role = user?.role || "SCHOOL_ADMIN";
  const role: Role = "SCHOOL_ADMIN"; // Hardcoded for dev
  const navGroups = NAVIGATION_CONFIG[role] || [];
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "pb-12 h-screen border-r bg-background hidden md:block",
        className,
        collapsed ? "w-[80px]" : "w-[240px]",
        "transition-all duration-300",
      )}
    >
      <div className="space-y-4 py-4 h-full flex flex-col">
        <div
          className={cn(
            "px-3 py-2 flex items-center",
            collapsed ? "justify-center" : "px-6",
          )}
        >
          {/* Placeholder for Logo, using simple text for now if Logo component not checked */}
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <div className="h-8 w-8 bg-orange-600 rounded-lg flex items-center justify-center text-white text-lg">
              S
            </div>
            {!collapsed && <span>SchoolIQ</span>}
          </div>
        </div>
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-6">
            {navGroups.map((group, i) => (
              <div key={i} className="px-3 py-2">
                {!collapsed && group.title && (
                  <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground uppercase">
                    {group.title}
                  </h2>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon as React.ElementType; // Fix TS error
                    const isActive = pathname === item.href;
                    return (
                      <TooltipProvider
                        key={item.href}
                        disableHoverableContent={!collapsed}
                      >
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <Button
                              asChild
                              variant={isActive ? "secondary" : "ghost"}
                              className={cn(
                                "w-full justify-start",
                                collapsed ? "justify-center px-2" : "",
                                isActive
                                  ? "bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400"
                                  : "hover:text-orange-600",
                              )}
                            >
                              <Link href={item.href}>
                                {Icon && (
                                  <Icon
                                    className={cn(
                                      "h-4 w-4",
                                      collapsed ? "mr-0" : "mr-2",
                                      isActive && "text-orange-600",
                                    )}
                                  />
                                )}
                                {!collapsed && <span>{item.title}</span>}
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          {collapsed && (
                            <TooltipContent side="right">
                              {item.title}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        {/* Collapse Toggle at Bottom */}
        <div
          className={cn(
            "px-3 py-2 mt-auto border-t",
            collapsed ? "flex justify-center" : "",
          )}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full"
          >
            {collapsed ? <Menu className="h-4 w-4" /> : "Collapse Sidebar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function MobileSidebar() {
  const role: Role = "SCHOOL_ADMIN"; // Hardcoded for dev
  const navGroups = NAVIGATION_CONFIG[role] || [];
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <div className="px-7 py-4">
          <span className="font-bold text-xl">SchoolIQ</span>
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="flex flex-col gap-4 py-4 pr-6">
            {navGroups.map((group, i) => (
              <div key={i} className="px-3">
                <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground uppercase">
                  {group.title}
                </h2>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon as React.ElementType; // Fix TS error
                    const isActive = pathname === item.href;
                    return (
                      <Button
                        key={item.href}
                        asChild
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start",
                          isActive && "text-orange-600 bg-orange-50",
                        )}
                        onClick={() => setOpen(false)}
                      >
                        <Link href={item.href}>
                          {Icon && <Icon className="mr-2 h-4 w-4" />}
                          {item.title}
                        </Link>
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
