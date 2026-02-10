"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Building2, GraduationCap, Shield, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const roles = [
  {
    value: "Principal",
    label: "Principal",
    description: "School head administrator",
    icon: Shield,
  },
  {
    value: "Vice Principal",
    label: "Vice Principal",
    description: "Deputy administrator",
    icon: Users,
  },
  {
    value: "Owner",
    label: "Owner/Director",
    description: "School proprietor",
    icon: Building2,
  },
  {
    value: "Admin",
    label: "Admin",
    description: "Administrative staff",
    icon: User,
  },
  {
    value: "Teacher",
    label: "Teacher",
    description: "Teaching staff",
    icon: GraduationCap,
  },
];

export function RoleSelector({ value, onChange, error }: RoleSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">
        Your Role <span className="text-red-500">*</span>
      </Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
      >
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = value === role.value;

          return (
            <label
              key={role.value}
              className={cn(
                "relative flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all",
                isSelected
                  ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                  : "border-neutral-200 dark:border-neutral-800 hover:border-orange-300 dark:hover:border-orange-900",
              )}
            >
              <RadioGroupItem
                value={role.value}
                id={role.value}
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
                    {role.label}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {role.description}
                </p>
              </div>
            </label>
          );
        })}
      </RadioGroup>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
