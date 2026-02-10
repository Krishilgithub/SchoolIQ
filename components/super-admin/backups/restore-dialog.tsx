"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const restoreSchema = z.object({
  confirmation_text: z.string().refine((val) => val === "RESTORE", {
    message: 'Type "RESTORE" to confirm',
  }),
  create_backup_before_restore: z.boolean(),
});

type RestoreFormData = z.infer<typeof restoreSchema>;

interface RestoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  backupId: string;
  backupDate: string;
  onRestore: (backupId: string, createBackup: boolean) => Promise<void>;
}

export function RestoreDialog({
  open,
  onOpenChange,
  backupId,
  backupDate,
  onRestore,
}: RestoreDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(restoreSchema),
    defaultValues: {
      confirmation_text: "",
      create_backup_before_restore: true,
    },
  });

  const onSubmit = async (data: RestoreFormData) => {
    setIsSubmitting(true);
    try {
      await onRestore(backupId, data.create_backup_before_restore);
      toast.success("Database restored successfully");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to restore database");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Restore Database
          </DialogTitle>
          <DialogDescription>
            This is a critical operation that will restore the database to its
            state from <strong>{new Date(backupDate).toLocaleString()}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-red-50 p-4 border border-red-200 space-y-2">
          <h4 className="font-semibold text-red-800">⚠️ Critical Warning</h4>
          <ul className="text-sm text-red-900 space-y-1 list-disc list-inside">
            <li>All current data will be replaced with the backup data</li>
            <li>Any changes made after the backup date will be lost</li>
            <li>This operation cannot be undone</li>
            <li>The platform will be unavailable during restoration</li>
            <li>All users will be logged out</li>
          </ul>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="create_backup_before_restore"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Create backup before restoring (Recommended)
                    </FormLabel>
                    <FormDescription>
                      A backup of the current state will be created before the
                      restore operation
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmation_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type "RESTORE" to confirm</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="RESTORE"
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription>
                    This confirmation is required to proceed with the
                    restoration
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Restoring..." : "Restore Database"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
