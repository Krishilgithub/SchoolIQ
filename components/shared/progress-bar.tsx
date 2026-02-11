import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ProgressBar({
  value,
  max = 100,
  className,
  barClassName,
  showLabel = false,
  size = "md",
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1 text-sm">
          <span className="font-medium">{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={cn(
          "w-full bg-slate-200 rounded-full overflow-hidden",
          sizeClasses[size],
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            barClassName || "bg-orange-600",
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
