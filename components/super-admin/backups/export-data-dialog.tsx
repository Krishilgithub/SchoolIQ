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
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

const exportSchema = z.object({
  export_type: z.string().min(1, "Export type is required"),
  export_format: z.enum(["csv", "json", "xlsx"]),
});

type ExportFormData = z.infer<typeof exportSchema>;

const exportTypes = [
  { value: "schools", label: "Schools" },
  { value: "users", label: "Users" },
  { value: "students", label: "Students" },
  { value: "teachers", label: "Teachers" },
  { value: "classes", label: "Classes" },
  { value: "attendance", label: "Attendance Records" },
  { value: "exams", label: "Exams & Results" },
  { value: "audit_logs", label: "Audit Logs" },
  { value: "subscriptions", label: "Subscriptions" },
  { value: "invoices", label: "Invoices" },
];

interface ExportDataDialogProps {
  onExport: (data: ExportFormData) => Promise<void>;
}

export function ExportDataDialog({ onExport }: ExportDataDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ExportFormData>({
    resolver: zodResolver(exportSchema),
    defaultValues: {
      export_type: "",
      export_format: "csv",
    },
  });

  const onSubmit = async (data: ExportFormData) => {
    setIsSubmitting(true);
    try {
      await onExport(data);
      toast.success("Export started. You'll be notified when it's ready.");
      form.reset();
      setOpen(false);
    } catch (error) {
      toast.error("Failed to start export");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription>
            Export data from the platform in various formats for backup or
            analysis.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="export_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select data type to export" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {exportTypes
                        .filter(
                          (type) => type.value && type.value.trim() !== "",
                        )
                        .map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the type of data you want to export
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="export_format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Export Format</FormLabel>
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
                      <SelectItem value="csv">
                        CSV (Comma Separated Values)
                      </SelectItem>
                      <SelectItem value="json">
                        JSON (JavaScript Object Notation)
                      </SelectItem>
                      <SelectItem value="xlsx">
                        XLSX (Excel Spreadsheet)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    File format for the exported data
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
              <p className="text-sm text-blue-800">
                Large exports may take several minutes to process. You'll
                receive a notification with a download link when the export is
                ready.
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
                {isSubmitting ? "Exporting..." : "Start Export"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
