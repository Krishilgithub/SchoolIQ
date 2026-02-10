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
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import { toast } from "sonner";

const backupSchema = z.object({
  backup_type: z.enum(["manual", "scheduled", "pre_migration"]),
  retention_days: z.number().min(1).max(365),
});

type BackupFormData = z.infer<typeof backupSchema>;

interface CreateBackupDialogProps {
  onCreateBackup: (data: BackupFormData) => Promise<void>;
}

export function CreateBackupDialog({
  onCreateBackup,
}: CreateBackupDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(backupSchema),
    defaultValues: {
      backup_type: "manual" as const,
      retention_days: 30,
    },
  });

  const onSubmit = async (data: BackupFormData) => {
    setIsSubmitting(true);
    try {
      await onCreateBackup(data);
      toast.success("Backup started successfully");
      form.reset();
      setOpen(false);
    } catch (error) {
      toast.error("Failed to start backup");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Database className="mr-2 h-4 w-4" />
          Create Backup
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Create Database Backup</DialogTitle>
          <DialogDescription>
            Create a manual backup of the entire database. This may take several
            minutes.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="backup_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Backup Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="pre_migration">
                        Pre-Migration
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Manual backups are initiated by users
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="retention_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Retention Period (days)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="365"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Backup will be automatically deleted after this period
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> Creating a backup may temporarily
                impact database performance. It's recommended to create backups
                during low-traffic periods.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating Backup..." : "Create Backup"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
