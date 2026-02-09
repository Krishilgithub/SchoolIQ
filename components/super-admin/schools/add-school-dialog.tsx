"use client";

import { createSchoolAction } from "@/app/actions/super-admin";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionState } from "react";
import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AddSchoolDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createSchoolAction, {});

  useEffect(() => {
    if (state.success) {
      toast.success("School created successfully");
      setOpen(false);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, setOpen]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95">
          <Plus className="mr-2 h-4 w-4" /> Add School
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add New School</SheetTitle>
          <SheetDescription>
            Create a new school tenant and its primary administrator account.
          </SheetDescription>
        </SheetHeader>
        <form action={formAction} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="schoolName">School Name</Label>
            <Input
              id="schoolName"
              name="schoolName"
              placeholder="e.g. Springfield High"
              required
              minLength={3}
            />
            {state.fieldErrors?.schoolName && (
              <p className="text-xs text-red-500">
                {state.fieldErrors.schoolName[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminName">Admin Name</Label>
            <Input
              id="adminName"
              name="adminName"
              placeholder="e.g. Principal Skinner"
              required
              minLength={2}
            />
            {state.fieldErrors?.adminName && (
              <p className="text-xs text-red-500">
                {state.fieldErrors.adminName[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminEmail">Admin Email</Label>
            <Input
              id="adminEmail"
              name="adminEmail"
              type="email"
              placeholder="admin@school.edu"
              required
            />
            {state.fieldErrors?.adminEmail && (
              <p className="text-xs text-red-500">
                {state.fieldErrors.adminEmail[0]}
              </p>
            )}
          </div>

          <SheetFooter>
            <Button
              disabled={isPending}
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Creating..." : "Create School"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
