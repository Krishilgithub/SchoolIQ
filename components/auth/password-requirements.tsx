"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface PasswordRequirement {
  label: string;
  met: boolean;
}

interface PasswordRequirementsProps {
  password: string;
  className?: string;
}

export function PasswordRequirements({
  password,
  className,
}: PasswordRequirementsProps) {
  const requirements: PasswordRequirement[] = useMemo(() => {
    return [
      {
        label: "At least 8 characters",
        met: password.length >= 8,
      },
      {
        label: "One uppercase letter (A-Z)",
        met: /[A-Z]/.test(password),
      },
      {
        label: "One lowercase letter (a-z)",
        met: /[a-z]/.test(password),
      },
      {
        label: "One number (0-9)",
        met: /[0-9]/.test(password),
      },
    ];
  }, [password]);

  // Only show if password has some input
  if (!password) return null;

  const allMet = requirements.every((req) => req.met);

  return (
    <div
      className={cn(
        "space-y-2 p-3 rounded-lg border",
        allMet
          ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
          : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800",
        className,
      )}
    >
      <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
        Password Requirements:
      </p>
      <ul className="space-y-1">
        {requirements.map((requirement, index) => (
          <li
            key={index}
            className={cn(
              "flex items-center gap-2 text-xs transition-colors",
              requirement.met
                ? "text-green-700 dark:text-green-400"
                : "text-neutral-500 dark:text-neutral-400",
            )}
          >
            {requirement.met ? (
              <Check className="w-3.5 h-3.5 flex-shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 flex-shrink-0" />
            )}
            <span>{requirement.label}</span>
          </li>
        ))}
      </ul>
      {allMet && (
        <p className="text-xs font-medium text-green-700 dark:text-green-400 pt-1">
          ✓ Password meets all requirements
        </p>
      )}
    </div>
  );
}
