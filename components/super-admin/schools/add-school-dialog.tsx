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
      if (state.emailWarning) {
        toast.warning(state.emailWarning);
      } else {
        toast.success(
          "School created successfully and credentials email sent!",
        );
      }
      setOpen(false);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, setOpen]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-500/20 transition-all hover:scale-105 active:scale-95">
          <Plus className="mr-2 h-4 w-4" /> Add School
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add New School</SheetTitle>
          <SheetDescription>
            Create a new school tenant and its primary administrator account.
          </SheetDescription>
        </SheetHeader>
        <form
          action={formAction}
          className="space-y-4 mt-6 max-h-[70vh] overflow-y-auto pr-2"
        >
          <div className="space-y-2">
            <Label htmlFor="schoolName">School Name *</Label>
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
            <Label htmlFor="slug">Slug (optional)</Label>
            <Input
              id="slug"
              name="slug"
              placeholder="e.g. springfield-high (auto-generated if blank)"
            />
            {state.fieldErrors?.slug && (
              <p className="text-xs text-red-500">
                {state.fieldErrors.slug[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="schoolType">School Type</Label>
            <select
              id="schoolType"
              name="schoolType"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="k12">K-12</option>
              <option value="higher_ed">Higher Education</option>
              <option value="vocational">Vocational</option>
            </select>
            {state.fieldErrors?.schoolType && (
              <p className="text-xs text-red-500">
                {state.fieldErrors.schoolType[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="e.g. +1 (555) 123-4567"
            />
            {state.fieldErrors?.phone && (
              <p className="text-xs text-red-500">
                {state.fieldErrors.phone[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address (optional)</Label>
            <Input
              id="address"
              name="address"
              placeholder="e.g. 123 Main St, Springfield, ST 12345"
            />
            {state.fieldErrors?.address && (
              <p className="text-xs text-red-500">
                {state.fieldErrors.address[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminName">Admin Name *</Label>
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
            <Label htmlFor="adminEmail">Admin Email *</Label>
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
              className="w-full bg-orange-600 hover:bg-orange-700"
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
