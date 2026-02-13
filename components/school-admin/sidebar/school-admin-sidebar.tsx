"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronRight, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/marketing/logo";
import { useAuth } from "@/components/providers/auth-provider";
import { usePermissions } from "@/hooks/use-permissions";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationCenter } from "@/components/notifications";
import { NavGroup } from "./nav-group";
import { SidebarSearch } from "./sidebar-search";
import { navigationConfig } from "./navigation-config";

export function SchoolAdminSidebar() {
  const { user, signOut } = useAuth();
  const { hasPermission } = usePermissions();
  const { unreadCount, refreshCount } = useNotifications();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter navigation based on search query and permissions
  const filteredNavigation = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return navigationConfig
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          // Filter by permission
          if (
            item.requiredPermission &&
            !hasPermission(item.requiredPermission as any)
          ) {
            return false;
          }

          // Filter by search query
          if (query && !item.title.toLowerCase().includes(query)) {
            return false;
          }

          return true;
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [searchQuery, hasPermission]);

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div
      className="flex h-full w-[280px] flex-col bg-gradient-to-b from-white via-white to-orange-50/30 border-r border-gray-200/80 shadow-xl"
      suppressHydrationWarning={true}
    >
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.02] via-transparent to-transparent pointer-events-none"
        suppressHydrationWarning={true}
      />

      {/* Header */}
      <div
        className="flex h-16 items-center px-6 border-b border-gray-100 bg-gradient-to-r from-white to-orange-50/30 relative z-10"
        suppressHydrationWarning={true}
      >
        <Logo />
        <motion.span
          className="ml-2 bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-sm font-bold text-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          School Admin
        </motion.span>
        <div className="ml-auto" suppressHydrationWarning={true}>
          <NotificationCenter
            unreadCount={unreadCount}
            onUnreadCountChange={refreshCount}
          />
        </div>
      </div>

      {/* Search */}
      <div className="pt-3" suppressHydrationWarning={true}>
        <SidebarSearch
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={handleClearSearch}
        />
      </div>

      {/* Navigation */}
      <div
        className="flex-1 overflow-y-auto py-2 px-3 [&::-webkit-scrollbar]:hidden relative z-10"
        suppressHydrationWarning={true}
      >
        {filteredNavigation.length > 0 ? (
          filteredNavigation.map((group, index) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <NavGroup group={group} />
            </motion.div>
          ))
        ) : (
          <div
            className="px-3 py-8 text-center text-sm text-gray-400"
            suppressHydrationWarning={true}
          >
            No results found for &ldquo;{searchQuery}&rdquo;
          </div>
        )}
      </div>

      {/* User Profile */}
      <motion.div
        className="p-3 mt-auto border-t border-gray-100 bg-gradient-to-b from-transparent via-orange-50/20 to-orange-50/40 backdrop-blur-sm relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button
              className="flex items-center gap-3 w-full rounded-xl p-2.5 hover:bg-white/80 hover:shadow-md transition-all duration-300 text-left border border-transparent hover:border-orange-200/50 backdrop-blur-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative" suppressHydrationWarning={true}>
                <Avatar className="h-10 w-10 border-2 border-white shadow-md ring-2 ring-orange-100/50">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold text-sm">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <motion.div
                  className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              </div>
              <div
                className="flex-1 overflow-hidden"
                suppressHydrationWarning={true}
              >
                <p className="truncate text-sm font-semibold text-gray-900">
                  {user?.user_metadata?.full_name || "Admin"}
                </p>
                <p className="truncate text-xs text-orange-600 font-medium">
                  {user?.user_metadata?.role || "Administrator"}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 shadow-xl border-gray-200/80 bg-white/95 backdrop-blur-sm"
            side="right"
            sideOffset={10}
          >
            <DropdownMenuLabel className="text-gray-700 font-semibold">
              My Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            <DropdownMenuItem
              onSelect={async (e) => {
                e.preventDefault();
                try {
                  await signOut();
                } catch (error) {
                  console.error("Logout error:", error);
                }
              }}
              className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer font-medium"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>
    </div>
  );
}
