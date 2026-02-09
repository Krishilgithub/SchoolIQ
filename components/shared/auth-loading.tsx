"use client";

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface AuthLoadingProps {
  message?: string;
}

export function AuthLoading({
  message = "Verifying access...",
}: AuthLoadingProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-brand-200 dark:border-brand-800" />
          <motion.div
            className="absolute inset-0 w-16 h-16 rounded-full border-4 border-t-brand-600 border-r-transparent border-b-transparent border-l-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">{message}</p>
        </div>
      </motion.div>
    </div>
  );
}

export function AuthLoadingInline({
  message = "Loading...",
}: AuthLoadingProps) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
        <span className="text-sm text-muted-foreground">{message}</span>
      </div>
    </div>
  );
}
