"use client";

import { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { Input, InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface PasswordInputProps extends InputProps {
  showStrength?: boolean;
}

export function PasswordInput({
  className,
  showStrength = false,
  value,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(0);

  const calculateStrength = (val: string) => {
    let score = 0;
    if (!val) return 0;
    if (val.length > 7) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    return score;
  };

  const currentVal = (value as string) || "";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (showStrength) {
      setStrength(calculateStrength(e.target.value));
    }
    props.onChange?.(e);
  };

  const getStrengthColor = (score: number) => {
    if (score === 0) return "bg-neutral-200";
    if (score <= 1) return "bg-red-500";
    if (score === 2) return "bg-yellow-500";
    if (score === 3) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthText = (score: number) => {
    if (score === 0) return "Enter password";
    if (score <= 1) return "Weak";
    if (score === 2) return "Fair";
    if (score === 3) return "Good";
    return "Strong";
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          className={cn("pr-10", className)}
          value={value}
          {...props}
          onChange={handleInputChange}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>

      {showStrength && currentVal.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-1"
        >
          <div className="flex gap-1 h-1">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={cn(
                  "h-full flex-1 rounded-full transition-all duration-300",
                  strength >= level
                    ? getStrengthColor(strength)
                    : "bg-neutral-100 dark:bg-neutral-800",
                )}
              />
            ))}
          </div>
          <p
            className={cn(
              "text-xs font-medium text-right",
              strength <= 1
                ? "text-red-500"
                : strength === 2
                  ? "text-yellow-600"
                  : strength === 3
                    ? "text-blue-600"
                    : "text-green-600",
            )}
          >
            {getStrengthText(strength)}
          </p>
        </motion.div>
      )}
    </div>
  );
}
