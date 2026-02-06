"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/marketing/logo";
import { CheckCircle2, ShieldCheck, Lock } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="w-full min-h-screen flex">
      {/* Left Panel - Brand & Trust */}
      <div className="hidden lg:flex w-[45%] xl:w-[50%] bg-neutral-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />
        </div>

        {/* Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-block">
            <Logo textClassName="text-white" iconClassName="text-brand-400" />
          </Link>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-4xl xl:text-5xl font-bold font-heading mb-6 leading-tight">
              Smarter School <br />
              <span className="text-brand-400">Operations</span>
            </h1>
            <p className="text-neutral-400 text-lg mb-8 leading-relaxed">
              Join thousands of forward-thinking schools managing academics,
              operations, and finance in one unified platform.
            </p>

            <div className="space-y-4">
              {[
                "AI-Driven Analytics & Insights",
                "Automated Fee Collection & Reconciliation",
                "Seamless Parent-Teacher Communication",
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-3 text-neutral-300"
                >
                  <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-brand-400" />
                  </div>
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Footer / Trust Badges */}
        <div className="relative z-10 flex items-center gap-6 text-sm text-neutral-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>SOC2 Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>256-bit Encryption</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 bg-neutral-50 flex flex-col relative">
        {/* Mobile Header */}
        <div className="lg:hidden p-6 flex justify-between items-center bg-white border-b border-neutral-100">
          <Link href="/">
            <Logo textClassName="text-neutral-900" />
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 overflow-y-auto">
          <div className="w-full max-w-md">{children}</div>
        </div>

        {/* Simple Footer */}
        <div className="hidden lg:block absolute bottom-6 w-full text-center text-xs text-neutral-400">
          &copy; {new Date().getFullYear()} SchoolIQ. All rights reserved.
        </div>
      </div>
    </div>
  );
}
