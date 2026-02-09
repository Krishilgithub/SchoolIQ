"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface DownloadButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

export function DownloadButton({
  className,
  label = "Download Report",
  ...props
}: DownloadButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        "h-9 px-4 py-2",
        "shadow-sm hover:shadow-md",
        className,
      )}
      {...(props as any)}
    >
      <Download className="mr-2 h-4 w-4" />
      {label}
    </motion.button>
  );
}
