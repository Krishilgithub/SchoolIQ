"use client";

import { useEffect, useState } from "react";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { NotificationService, Notification } from "@/services/notifications";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // Polling for "real-time" updates
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: NotificationService.getNotifications,
    refetchInterval: 30000, // Poll every 30s
  });

  const markReadMutation = useMutation({
    mutationFn: NotificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: NotificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: NotificationService.clearAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications cleared");
    },
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const NotificationItem = ({
    notification,
  }: {
    notification: Notification;
  }) => (
    <div
      className={cn(
        "flex flex-col gap-1 p-4 border-b hover:bg-muted/50 transition-colors relative group",
        !notification.read && "bg-blue-50/50 dark:bg-blue-900/10",
      )}
    >
      <div className="flex justify-between items-start">
        <h4
          className={cn(
            "text-sm font-semibold",
            !notification.read && "text-brand-600 dark:text-brand-400",
          )}
        >
          {notification.title}
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </span>
          {!notification.read && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => markReadMutation.mutate(notification.id)}
              title="Mark as read"
            >
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="sr-only">Mark as read</span>
            </Button>
          )}
        </div>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2">
        {notification.message}
      </p>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <div className="flex flex-col gap-0.5">
                    <div className="h-1 w-1 bg-foreground rounded-full" />
                    <div className="h-1 w-1 bg-foreground rounded-full" />
                    <div className="h-1 w-1 bg-foreground rounded-full" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => markAllReadMutation.mutate()}>
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Mark all as read
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => clearAllMutation.mutate()}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear all
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <SheetDescription>
            You have {unreadCount} unread messages.
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="all" className="flex-1 flex flex-col">
          <div className="px-4 py-2 border-b">
            <TabsList className="w-full justify-start h-9 p-0 bg-transparent border-b-0 space-x-4">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-2"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="unread"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-2"
              >
                Unread
                {unreadCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 h-5 px-1.5 text-[10px]"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="mentions"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-2"
              >
                Mentions
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            <TabsContent value="all" className="m-0">
              {isLoading ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((n) => (
                  <NotificationItem key={n.id} notification={n} />
                ))
              )}
            </TabsContent>
            <TabsContent value="unread" className="m-0">
              {notifications.filter((n) => !n.read).length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No unread notifications.
                </div>
              ) : (
                notifications
                  .filter((n) => !n.read)
                  .map((n) => <NotificationItem key={n.id} notification={n} />)
              )}
            </TabsContent>
            <TabsContent value="mentions" className="m-0">
              {notifications.filter((n) => n.type === "mention").length ===
              0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No mentions found.
                </div>
              ) : (
                notifications
                  .filter((n) => n.type === "mention")
                  .map((n) => <NotificationItem key={n.id} notification={n} />)
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
