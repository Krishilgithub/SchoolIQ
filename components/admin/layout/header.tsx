"use client";

import {
  Bell,
  HelpCircle,
  LogOut,
  User as UserIcon,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminCommandPalette } from "@/components/admin/command-palette";
import { ThemeToggle } from "@/components/features/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/providers/auth-provider";
// Assuming you have a theme toggle, otherwise I'd build one, but trying to reuse existing

export function AdminHeader() {
  const { user, signOut, profile } = useAuth();

  // Derived user initials
  const initials = user?.email ? user.email[0].toUpperCase() : "SA";

  const displayName =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : user?.user_metadata?.first_name && user?.user_metadata?.last_name
        ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
        : user?.user_metadata?.full_name ||
          user?.email?.split("@")[0] ||
          "Admin";

  const displayImage =
    profile?.avatar_url || user?.user_metadata?.avatar_url || ""; // Added logic for image

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-md">
      <div className="flex flex-1 items-center gap-4">
        <AdminCommandPalette />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <HelpCircle className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
          </Button>
          <ThemeToggle />
        </div>

        <div className="h-8 w-px bg-border mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-full md:w-auto justify-start gap-3 rounded-full md:rounded-lg px-2 hover:bg-muted/50"
            >
              <Avatar className="h-8 w-8 border border-border">
                <AvatarImage src={displayImage} alt={displayName} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left text-sm">
                <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {user?.email || "admin@schooliq.com"}
                </p>
              </div>
              <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
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
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
