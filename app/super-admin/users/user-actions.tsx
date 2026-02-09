"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  Ban,
  Trash2,
  UserCog,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { suspendUserAction, deleteUserAction } from "./actions";

interface UserActionsProps {
  userId: string;
  isSuspended: boolean;
  userName: string;
}

export function UserActions({
  userId,
  isSuspended,
  userName,
}: UserActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSuspend = () => {
    startTransition(async () => {
      const result = await suspendUserAction(userId, !isSuspended);
      if (result.success) {
        toast.success(
          `User ${userName} has been ${isSuspended ? "activated" : "suspended"}.`,
        );
        setShowSuspendDialog(false);
      } else {
        toast.error(`Failed to update user: ${result.error}`);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteUserAction(userId);
      if (result.success) {
        toast.success(`User ${userName} has been deleted.`);
        setShowDeleteDialog(false);
      } else {
        toast.error(`Failed to delete user: ${result.error}`);
      }
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(userId)}
          >
            Copy User ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowSuspendDialog(true)}>
            {isSuspended ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />
                Activate User
              </>
            ) : (
              <>
                <Ban className="mr-2 h-4 w-4 text-orange-500" />
                Suspend User
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600 focus:bg-red-50"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Suspend/Activate Dialog */}
      <AlertDialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isSuspended ? "Activate User?" : "Suspend User?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isSuspended
                ? `Are you sure you want to activate ${userName}? They will verify access to the platform.`
                : `Are you sure you want to suspend ${userName}? They will immediately lose access to the platform.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspend}
              disabled={isPending}
              className={
                isSuspended
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-orange-600 hover:bg-orange-700"
              }
            >
              {isPending
                ? "Processing..."
                : isSuspended
                  ? "Activate"
                  : "Suspend"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{userName}</strong>? This
              action cannot be undone. All data associated with this user will
              be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
