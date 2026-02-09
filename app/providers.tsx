"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/features/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { GlobalCommandPalette } from "@/components/command/command-palette";
import { AuthProvider } from "@/components/providers/auth-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          {children}
          <Toaster />
          <GlobalCommandPalette />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
