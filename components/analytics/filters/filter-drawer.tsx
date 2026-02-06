"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAnalyticsStore } from "@/store/analytics-store"; // Correct path

export function FilterDrawer() {
  const { filters, setFilter, resetFilters } = useAnalyticsStore();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Analytics Filters</SheetTitle>
        </SheetHeader>
        <div className="grid gap-6 py-6">
          <div className="grid gap-2">
            <Label>Academic Year</Label>
            <Select
              value={filters.academicYear}
              onValueChange={(v) => setFilter("academicYear", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023-2024">2023-2024</SelectItem>
                <SelectItem value="2022-2023">2022-2023</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Term</Label>
            <Select
              value={filters.term}
              onValueChange={(v) => setFilter("term", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Term 1">Term 1 (Sep-Dec)</SelectItem>
                <SelectItem value="Term 2">Term 2 (Jan-Mar)</SelectItem>
                <SelectItem value="Term 3">Term 3 (Apr-Jun)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Class / Cohort</Label>
            <Select
              value={filters.classId}
              onValueChange={(v) => setFilter("classId", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Classes</SelectItem>
                <SelectItem value="10-A">10-A</SelectItem>
                <SelectItem value="10-B">10-B</SelectItem>
                <SelectItem value="11-A">11-A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <Button
              onClick={() => console.log("Applying filters", filters)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Apply Filters
            </Button>
            <Button variant="ghost" onClick={resetFilters}>
              Reset Defaults
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
