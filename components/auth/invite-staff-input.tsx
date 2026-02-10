"use client";

import { useState, KeyboardEvent } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Mail, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface InviteStaffInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  maxEmails?: number;
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export function InviteStaffInput({
  value,
  onChange,
  error,
  maxEmails = 10,
}: InviteStaffInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState("");

  const addEmail = (email: string) => {
    const trimmedEmail = email.trim().toLowerCase();

    // Clear input error
    setInputError("");

    // Validate email
    if (!trimmedEmail) return;

    if (!validateEmail(trimmedEmail)) {
      setInputError("Invalid email format");
      return;
    }

    if (value.includes(trimmedEmail)) {
      setInputError("Email already added");
      return;
    }

    if (value.length >= maxEmails) {
      setInputError(`Maximum ${maxEmails} emails allowed`);
      return;
    }

    onChange([...value, trimmedEmail]);
    setInputValue("");
  };

  const removeEmail = (emailToRemove: string) => {
    onChange(value.filter((email) => email !== emailToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      addEmail(inputValue);
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      // Remove last email if backspace pressed on empty input
      removeEmail(value[value.length - 1]);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addEmail(inputValue);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="invite-staff" className="text-sm font-medium">
          Invite Staff Members{" "}
          <span className="text-neutral-400">(Optional)</span>
        </Label>
        <p className="text-xs text-neutral-500 mt-1">
          Add email addresses of staff you want to invite. Press Enter, comma,
          or space to add.
        </p>
      </div>

      {/* Email Chips Display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
          {value.map((email) => (
            <Badge
              key={email}
              variant="secondary"
              className="pl-2 pr-1 py-1 bg-orange-100 dark:bg-orange-950 text-orange-900 dark:text-orange-100 border-orange-200 dark:border-orange-800"
            >
              <Mail className="w-3 h-3 mr-1.5" />
              {email}
              <button
                type="button"
                onClick={() => removeEmail(email)}
                className="ml-1.5 hover:bg-orange-200 dark:hover:bg-orange-900 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input Field */}
      <div className="relative">
        <Input
          id="invite-staff"
          type="email"
          placeholder="Enter email address..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          disabled={value.length >= maxEmails}
          className={cn(
            inputError && "border-red-500 focus-visible:ring-red-500",
          )}
        />
        {value.length >= maxEmails && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
        )}
      </div>

      {/* Input Error */}
      {inputError && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {inputError}
        </p>
      )}

      {/* Prop Error */}
      {error && !inputError && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}

      {/* Counter */}
      {value.length > 0 && (
        <p className="text-xs text-neutral-500">
          {value.length} / {maxEmails} emails added
        </p>
      )}
    </div>
  );
}
