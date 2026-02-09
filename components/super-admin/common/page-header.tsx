"use client";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode; // For actions buttons
}

export function PageHeader({
  title,
  description,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-heading">
          {title}
        </h1>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
      {children && (
        <div className="flex items-center gap-2 mt-4 md:mt-0">{children}</div>
      )}
    </div>
  );
}
