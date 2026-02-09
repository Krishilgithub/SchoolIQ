"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, Slash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Fragment } from "react";
import { ThemeToggle } from "@/components/features/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";

export function AdminHeader() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean).slice(1);
  const { signOut, user } = useAuth();
  const supabase = createClient();

  const { data } = supabase.storage
    .from("default")
    .getPublicUrl("super-admin-profile-image.jpeg");

  const avatarUrl = data?.publicUrl;

  // Format breadcrumbs: dashboard -> Dashboard, schools -> Schools
  const breadcrumbs = segments.map(
    (s) => s.charAt(0).toUpperCase() + s.slice(1),
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50">
      <div className="flex h-16 items-center px-6 gap-4">
        {/* Breadcrumbs */}
        <div className="hidden md:flex items-center text-sm font-medium text-muted-foreground">
          <Link
            href="/super-admin/dashboard"
            className="hover:text-foreground transition-colors"
          >
            Admin
          </Link>
          {breadcrumbs.map((crumb, i) => (
            <Fragment key={i}>
              <Slash className="mx-2 h-3 w-3 text-muted-foreground/50" />
              <span
                className={
                  i === breadcrumbs.length - 1
                    ? "text-foreground"
                    : "hover:text-foreground transition-colors"
                }
              >
                {crumb}
              </span>
            </Fragment>
          ))}
        </div>

        <div className="flex-1" />

        {/* Global Search Mockup */}
        <div className="w-full max-w-sm hidden md:flex items-center relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search schools, users, logs..."
            className="pl-9 h-9 bg-muted/50 border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all w-full"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full"
          >
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-destructive border-2 border-background" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full border border-border overflow-hidden hover:border-primary/50"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={avatarUrl || "/avatars/01.png"}
                    alt="Super Admin"
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                    SA
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-foreground">
                    Super Admin
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || "krishilagrawal026@gmail.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                Audit Logs
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                onClick={() => signOut()}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
