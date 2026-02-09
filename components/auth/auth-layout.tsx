"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/marketing/logo";
import { BrandPanel } from "@/components/auth/brand-panel";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="w-full min-h-screen lg:h-screen lg:overflow-hidden flex bg-neutral-50 dark:bg-neutral-950">
      {/* Left Panel - Brand & Trust */}
      <BrandPanel />

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex flex-col relative w-full lg:w-1/2">
        {/* Mobile Header */}
        <div className="lg:hidden p-6 flex justify-between items-center bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800">
          <Link href="/">
            <Logo textClassName="text-neutral-900 dark:text-white" />
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 xl:p-12 relative z-10">
          {/* Background pattern for right side too, subtle */}
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />

          <div className="w-full max-w-2xl mx-auto relative z-10">
            {children}
          </div>
        </div>

        {/* Simple Footer */}
        <div className="hidden lg:block absolute bottom-6 w-full text-center text-xs text-neutral-400">
          &copy; {new Date().getFullYear()} SchoolIQ. All rights reserved.
        </div>
      </div>
    </div>
  );
}
