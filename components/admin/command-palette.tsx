"use client";

import * as React from "react";
import {
  CreditCard,
  Settings,
  User,
  Search,
  School,
  FileText,
  ShieldAlert,
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
import { useRouter } from "next/navigation";

export function AdminCommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm text-muted-foreground shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-w-[200px] lg:min-w-[300px] hover:bg-muted/50 transition-colors"
      >
        <span className="inline-flex items-center gap-2">
          <Search className="h-4 w-4" />
          <span className="hidden lg:inline">Search anything...</span>
          <span className="lg:hidden">Search...</span>
        </span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem
              onSelect={() =>
                runCommand(() => router.push("/super-admin/schools"))
              }
            >
              <School className="mr-2 h-4 w-4" />
              <span>Active Schools</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => router.push("/super-admin/users"))
              }
            >
              <User className="mr-2 h-4 w-4" />
              <span>User Management</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => router.push("/super-admin/billing"))
              }
            >
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing & Revenue</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="System">
            <CommandItem
              onSelect={() =>
                runCommand(() => router.push("/super-admin/settings"))
              }
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => router.push("/super-admin/audit"))
              }
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>Audit Logs</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => router.push("/super-admin/support"))
              }
            >
              <ShieldAlert className="mr-2 h-4 w-4" />
              <span>Support Tickets</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
