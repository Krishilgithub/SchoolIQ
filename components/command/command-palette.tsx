"use client";

import * as React from "react";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  GraduationCap,
  LayoutDashboard,
  Search,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { NAVIGATION_CONFIG } from "@/config/navigation";

export function GlobalCommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuthStore();
  const role = user?.role || "SCHOOL_ADMIN";
  const navItems = NAVIGATION_CONFIG[role] || [];

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Navigation Group */}
        <CommandGroup heading="Navigation">
          {navItems.flatMap((group) =>
            group.items.map((item) => {
              const Icon = item.icon || Smile;
              return (
                <CommandItem
                  key={item.href}
                  onSelect={() =>
                    runCommand(() => router.push(item.href || "#"))
                  }
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span>Go to {item.title}</span>
                </CommandItem>
              );
            }),
          )}
        </CommandGroup>

        <CommandSeparator />

        {/* Global Actions */}
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push("/dashboard/students/new"))
            }
          >
            <User className="mr-2 h-4 w-4" />
            <span>Create Student</span>
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push("/dashboard/fees/collect"))
            }
          >
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Collect Fees</span>
            <CommandShortcut>⌘F</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push("/dashboard/settings"))
            }
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        {/* Context Changing */}
        <CommandGroup heading="Switch Context">
          <CommandItem
            onSelect={() => runCommand(() => console.log("Switch school"))}
          >
            <GraduationCap className="mr-2 h-4 w-4" />
            <span>Switch School</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
