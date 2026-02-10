"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarSearchProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export function SidebarSearch({
  value,
  onChange,
  onClear,
}: SidebarSearchProps) {
  return (
    <div className="relative px-3 pb-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search navigation..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "h-9 pl-9 pr-9 bg-white border-gray-200",
            "focus-visible:ring-orange-500 focus-visible:border-orange-500",
            "placeholder:text-gray-400",
          )}
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 hover:bg-gray-100"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
