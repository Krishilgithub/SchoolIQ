"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  BookOpen,
  UserCheck,
  DollarSign,
  BarChart3,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PrimaryGoalsSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

const goals = [
  {
    value: "Academic",
    label: "Academic Management",
    description: "Curriculum, subjects, exams",
    icon: BookOpen,
  },
  {
    value: "Attendance",
    label: "Attendance Tracking",
    description: "Daily attendance, leave management",
    icon: UserCheck,
  },
  {
    value: "Fee",
    label: "Fee Management",
    description: "Billing, payments, receipts",
    icon: DollarSign,
  },
  {
    value: "Analytics",
    label: "Performance Analytics",
    description: "Reports, dashboards, insights",
    icon: BarChart3,
  },
  {
    value: "Communication",
    label: "Parent Communication",
    description: "Messages, notifications, updates",
    icon: MessageCircle,
  },
];

export function PrimaryGoalsSelector({
  value,
  onChange,
  error,
}: PrimaryGoalsSelectorProps) {
  const handleToggle = (goalValue: string) => {
    if (value.includes(goalValue)) {
      onChange(value.filter((v) => v !== goalValue));
    } else {
      onChange([...value, goalValue]);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-medium">
          Primary Goals <span className="text-red-500">*</span>
        </Label>
        <p className="text-xs text-neutral-500 mt-1">
          Select one or more areas you want to manage (select at least one)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {goals.map((goal) => {
          const Icon = goal.icon;
          const isSelected = value.includes(goal.value);

          return (
            <label
              key={goal.value}
              className={cn(
                "relative flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all",
                isSelected
                  ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                  : "border-neutral-200 dark:border-neutral-800 hover:border-orange-300 dark:hover:border-orange-900",
              )}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => handleToggle(goal.value)}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Icon
                    className={cn(
                      "w-4 h-4",
                      isSelected ? "text-orange-600" : "text-neutral-500",
                    )}
                  />
                  <span
                    className={cn(
                      "font-medium text-sm",
                      isSelected
                        ? "text-orange-900 dark:text-orange-100"
                        : "text-neutral-900 dark:text-neutral-100",
                    )}
                  >
                    {goal.label}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {goal.description}
                </p>
              </div>
              {isSelected && (
                <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-orange-600" />
              )}
            </label>
          );
        })}
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
