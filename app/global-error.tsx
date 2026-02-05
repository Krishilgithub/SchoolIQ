"use client";

import { Button } from "@/components/ui/button";

// Error boundaries must be Client Components

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
          <h2 className="mb-4 text-2xl font-bold">Critical Error</h2>
          <p className="mb-8 max-w-[500px] text-muted-foreground">
            A critical system error occurred. Please refresh the page.
          </p>
          <Button onClick={() => reset()} variant="default">
            Try again
          </Button>
        </div>
      </body>
    </html>
  );
}
