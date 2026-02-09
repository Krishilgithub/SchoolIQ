import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface InputWithIconProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  iconClassName?: string;
}

export function InputWithIcon({
  icon: Icon,
  iconPosition = "left",
  iconClassName,
  className,
  ...props
}: InputWithIconProps) {
  if (!Icon) {
    return <Input className={className} {...props} />;
  }

  return (
    <div className="relative">
      {iconPosition === "left" && Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Icon className={cn("h-4 w-4", iconClassName)} />
        </div>
      )}
      <Input
        className={cn(
          iconPosition === "left" && !!Icon && "pl-9",
          iconPosition === "right" && !!Icon && "pr-9",
          className,
        )}
        {...props}
      />
      {iconPosition === "right" && Icon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Icon className={cn("h-4 w-4", iconClassName)} />
        </div>
      )}
    </div>
  );
}
