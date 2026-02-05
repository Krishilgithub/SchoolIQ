import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
}

export function Logo({
  className,
  iconClassName,
  textClassName,
  showText = true,
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Icon: Abstract S + Spark */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("text-brand-600 shrink-0", iconClassName)}
      >
        {/* Main shape: Stylized S constructed from two interlocking paths */}
        <path
          d="M16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28C22.6274 28 28 22.6274 28 16"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="opacity-20"
        />
        <path
          d="M22 10C24.5 11.5 26 14 26 16C26 21.5228 21.5228 26 16 26C10.4772 26 6 21.5228 6 16C6 10.4772 10.4772 6 16 6"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* The Spark / IQ Dot */}
        <circle cx="22" cy="10" r="3" fill="currentColor" />

        {/* Inner geometric accent for "S" flow */}
        <path
          d="M16 12C13.7909 12 12 13.7909 12 16C12 18.2091 13.7909 20 16 20"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="opacity-60"
        />
      </svg>

      {showText && (
        <span
          className={cn(
            "font-heading font-bold text-xl tracking-tight text-neutral-900",
            textClassName,
          )}
        >
          SchoolIQ
        </span>
      )}
    </div>
  );
}
