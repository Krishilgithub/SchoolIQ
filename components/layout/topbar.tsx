"use client";

import { Search, LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/providers/auth-provider";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationCenter } from "@/components/features/notification-center";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";

import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/features/theme-toggle";

export function Topbar() {
  const { user, signOut, profile } = useAuth();

  // Derived user initials
  const initials = user?.email ? user.email[0].toUpperCase() : "U";

  const displayName =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : user?.user_metadata?.first_name && user?.user_metadata?.last_name
        ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
        : user?.user_metadata?.full_name ||
          user?.email?.split("@")[0] ||
          "User";

  const displayImage =
    profile?.avatar_url || user?.user_metadata?.avatar_url || "";

  return (
    <div className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="flex w-full max-w-md items-center space-x-2">
        <MobileSidebar />
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search students, staff, or settings (Ctrl+K)..."
            className="h-9 w-full rounded-full bg-secondary/50 pl-10 border-transparent focus:border-brand-200 focus:bg-background transition-all"
          />
          <div className="absolute right-3 top-2.5 flex items-center gap-1">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NotificationCenter />

        <ThemeToggle />

        <Separator orientation="vertical" className="h-6 mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="pl-0 hover:bg-transparent">
              <div className="flex items-center gap-3 text-left">
                <div className="hidden md:block">
                  <p className="text-sm font-medium leading-none">
                    {displayName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">
                    {profile?.is_super_admin
                      ? "Super Admin"
                      : user?.user_metadata?.role || "User"}
                  </p>
                </div>
                <Avatar className="h-9 w-9 border-2 border-brand-100 cursor-pointer">
                  <AvatarImage src={displayImage} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-3 w-3 text-muted-foreground/50" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {displayName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
