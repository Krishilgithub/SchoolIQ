"use client";

import { useState, useEffect } from "react";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createSubjectAction } from "@/lib/actions/subject-actions";
import { useRouter } from "next/navigation";

const createSubjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  code: z.string().min(1, "Subject code is required"),
  description: z.string().optional(),
});

interface CreateSubjectModalProps {
  schoolId: string;
}

export function CreateSubjectModal({ schoolId }: CreateSubjectModalProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const form = useForm<z.infer<typeof createSubjectSchema>>({
    resolver: zodResolver(createSubjectSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof createSubjectSchema>) {
    try {
      const { success, error } = await createSubjectAction(schoolId, values);

      if (!success) {
        throw new Error(error);
      }

      toast({
        title: "Success",
        description: "Subject created successfully",
        variant: "success",
      });
      setOpen(false);
      form.reset();
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create subject",
        variant: "destructive",
      });
    }
  }

  if (!mounted) {
    return (
      <Button className="gap-2">
        <Plus className="h-4 w-4" />
        Add Subject
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Subject
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Add New Subject</DialogTitle>
          <DialogDescription>
            Create a new subject to be taught in classes.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Mathematics" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. MATH101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the subject..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Create Subject</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
