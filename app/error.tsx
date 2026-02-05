"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
      <div className="mb-6 rounded-full bg-red-100 p-4 dark:bg-red-900/20">
        <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
      </div>
      <h2 className="mb-2 text-2xl font-semibold tracking-tight">
        Something went wrong!
      </h2>
      <p className="mb-8 max-w-[500px] text-muted-foreground">
        We apologize for the inconvenience. An unexpected error has occurred.
        Our team has been notified.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="default" size="lg">
          Try again
        </Button>
        <Button
          onClick={() => (window.location.href = "/dashboard")}
          variant="outline"
          size="lg"
        >
          Return Home
        </Button>
      </div>
      {error.digest && (
        <p className="mt-8 text-xs text-muted-foreground">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}
