"use client";

import { Bell, MessageSquare, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from "./sidebar-nav";
import { usePathname } from "next/navigation";

export function DashboardHeader() {
  const pathname = usePathname();

  // Extract page title from pathname
  const getPageTitle = (path: string) => {
    const segments = path.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    if (!lastSegment || lastSegment === "dashboard") return "Overview";

    return lastSegment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const pageTitle = getPageTitle(pathname);

  return (
    <header
      className="sticky top-0 z-40 w-full border-b bg-white px-6 py-4"
      suppressHydrationWarning={true}
    >
      <div
        className="flex items-center justify-between"
        suppressHydrationWarning={true}
      >
        {/* Left: Mobile Menu & Breadcrumb/Title */}
        <div
          className="flex items-center gap-4"
          suppressHydrationWarning={true}
        >
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6 text-neutral-600" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 border-r-0 w-[280px]">
              <SidebarNav />
            </SheetContent>
          </Sheet>

          <div
            className="flex items-center gap-2 text-sm text-neutral-500"
            suppressHydrationWarning={true}
          >
            <span className="hidden sm:inline">Maham</span>
            <span className="hidden sm:inline text-neutral-300">›</span>
            <span className="font-semibold text-neutral-900 flex items-center gap-2">
              {/* Dynamic Icon could go here */}
              {pageTitle}
            </span>
          </div>
        </div>

        {/* Right: Search & Actions */}
        <div
          className="flex items-center gap-4"
          suppressHydrationWarning={true}
        >
          {/* Search Bar */}
          <div
            className="relative hidden md:block"
            suppressHydrationWarning={true}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search..."
              className="w-[300px] rounded-full pl-10 bg-neutral-50 border-neutral-200 focus-visible:ring-orange-500"
            />
          </div>

          <div
            className="flex items-center gap-2"
            suppressHydrationWarning={true}
          >
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-neutral-500 hover:text-orange-600 hover:bg-orange-50"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-neutral-500 hover:text-orange-600 hover:bg-orange-50 relative"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-neutral-500 hover:text-orange-600 hover:bg-orange-50 lg:hidden"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Search - Visible only on small screens below header */}
      <div className="mt-4 md:hidden pb-2" suppressHydrationWarning={true}>
        <div className="relative" suppressHydrationWarning={true}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search..."
            className="w-full rounded-full pl-10 bg-neutral-50 border-neutral-200 focus-visible:ring-orange-500"
          />
        </div>
      </div>
    </header>
  );
}
