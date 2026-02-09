"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/marketing/logo";
import { BrandPanel } from "@/components/auth/brand-panel";
import { motion } from "framer-motion";

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
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>

        {/* Mobile Header */}
        <motion.div
          className="lg:hidden p-6 flex justify-between items-center bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-100 dark:border-neutral-800 relative z-20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link href="/">
            <Logo textClassName="text-neutral-900 dark:text-white" />
          </Link>
        </motion.div>

        <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 xl:p-12 relative z-10">
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-grid-slate/[0.05] bg-[size:40px_40px] pointer-events-none" />

          <motion.div
            className="w-full max-w-md mx-auto relative z-10 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 p-8 shadow-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </div>

        {/* Simple Footer */}
        <motion.div
          className="hidden lg:block relative z-20 pb-6 w-full text-center text-xs text-neutral-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          &copy; {new Date().getFullYear()} SchoolIQ. All rights reserved.
        </motion.div>
      </div>
    </div>
  );
}
