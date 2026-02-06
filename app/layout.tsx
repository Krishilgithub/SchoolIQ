import type { Metadata } from "next";
// import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
// import { Toaster } from "@/components/ui/sonner"; // we will create this later
// import { ThemeProvider } from "@/components/features/theme-provider"; // we will create this later

// const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const inter = { variable: "font-sans" };
const outfit = { variable: "font-sans" };

export const metadata: Metadata = {
  title: "SchoolIQ - Intelligent School Management",
  description: "Enterprise grade school management platform.",
};

import { Providers } from "@/app/providers";

// ... fonts and metadata ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          outfit.variable,
        )}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
