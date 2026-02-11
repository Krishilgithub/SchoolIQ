"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function RefreshButton() {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => router.refresh()}
      className="gap-2"
    >
      <RefreshCw className="h-4 w-4" />
      Refresh
    </Button>
  );
}
