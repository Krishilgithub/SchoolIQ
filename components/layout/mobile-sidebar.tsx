"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, School, LogOut } from "lucide-react";
import { NAVIGATION_CONFIG } from "@/config/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Role } from "@/types/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const pathname = usePathname();

  const role: Role = user?.role || "SCHOOL_ADMIN";
  const navGroups = NAVIGATION_CONFIG[role] || [];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
        <div className="flex flex-col h-full bg-sidebar">
          <div className="h-16 flex items-center px-6 border-b border-sidebar-border/50">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-500/20 mr-3">
              <School className="h-5 w-5" />
            </div>
            <span className="font-heading text-xl font-bold text-sidebar-foreground">
              SchoolIQ
            </span>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
            {navGroups.map((group, idx) => (
              <div key={idx} className="space-y-2">
                {group.title && (
                  <h4 className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider px-2">
                    {group.title}
                  </h4>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon || School;
                    return (
                      <Link
                        key={item.href}
                        href={item.href || "#"}
                        onClick={() => setOpen(false)}
                      >
                        <div
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                            isActive
                              ? "bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300 font-semibold"
                              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          )}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          <span>{item.title}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-sidebar-border p-4">
            <Button
              variant="ghost"
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
