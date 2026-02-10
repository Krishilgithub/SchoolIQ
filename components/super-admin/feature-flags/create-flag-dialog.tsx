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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const flagSchema = z.object({
  flag_key: z
    .string()
    .min(3, "Key must be at least 3 characters")
    .regex(/^[a-z0-9_]+$/, "Key must be lowercase with underscores only"),
  flag_name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  is_enabled: z.boolean().default(false),
  rollout_percentage: z.number().min(0).max(100).default(0),
});

type FlagFormData = z.infer<typeof flagSchema>;

interface CreateFlagDialogProps {
  onCreateFlag: (data: FlagFormData) => Promise<void>;
}

export function CreateFlagDialog({ onCreateFlag }: CreateFlagDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(flagSchema),
    defaultValues: {
      flag_key: "",
      flag_name: "",
      description: "",
      is_enabled: false,
      rollout_percentage: 0,
    },
  });

  const onSubmit = async (data: FlagFormData) => {
    setIsSubmitting(true);
    try {
      await onCreateFlag(data);
      toast.success("Feature flag created successfully");
      form.reset();
      setOpen(false);
    } catch (error) {
      toast.error("Failed to create feature flag");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchRollout = form.watch("rollout_percentage");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Flag
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle>Create Feature Flag</DialogTitle>
          <DialogDescription>
            Create a new feature flag to control feature rollouts across the
            platform.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="flag_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Flag Key</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., new_analytics_dashboard"
                      {...field}
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription>
                    Unique identifier (lowercase, underscores only)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="flag_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Flag Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., New Analytics Dashboard"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Human-readable name for the feature
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this feature flag controls..."
                      className="min-h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_enabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable Flag</FormLabel>
                    <FormDescription>
                      Turn this flag on immediately after creation
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rollout_percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rollout Percentage: {watchRollout}%</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={100}
                      step={5}
                      value={[field.value ?? 0]}
                      onValueChange={(vals: number[]) =>
                        field.onChange(vals[0])
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Percentage of users who will see this feature
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Flag"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
