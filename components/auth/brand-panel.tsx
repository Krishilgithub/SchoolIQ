"use client";

import {
  Shield,
  Lock,
  Sparkles,
  TrendingUp,
  Users,
  MessageSquare,
} from "lucide-react";
import { Logo } from "@/components/marketing/logo";
import Link from "next/link";
import { motion } from "framer-motion";

const features = [
  {
    icon: TrendingUp,
    title: "AI-Driven Analytics & Insights",
    description: "Data-powered decision making for academic excellence",
  },
  {
    icon: Users,
    title: "Automated Fee Collection & Reconciliation",
    description: "Streamlined financial operations with real-time tracking",
  },
  {
    icon: MessageSquare,
    title: "Seamless Parent-Teacher Communication",
    description: "Bridge the gap with integrated messaging and updates",
  },
];

const stats = [
  { label: "Active Schools", value: "2,500+", trend: "+12%" },
  { label: "Students", value: "150K+", trend: "+8%" },
  { label: "Success Rate", value: "98.5%", trend: "+2.3%" },
];

export function BrandPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-neutral-900 via-neutral-800 to-orange-950 relative overflow-hidden">
      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-orange-900/20 via-transparent to-transparent" />

      {/* Animated Gradient Orbs - More Subtle */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/10 rounded-full filter blur-3xl animate-blob" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full filter blur-3xl animate-blob animation-delay-2000" />

      {/* Very Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]" />

      <div className="flex flex-col justify-between p-10 xl:p-12 relative z-10 w-full">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/">
            <Logo textClassName="text-white" iconClassName="text-brand-500" />
          </Link>
        </motion.div>

        {/* Main Content - Centered */}
        <div className="space-y-12 max-w-xl">
          {/* Hero Section */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 backdrop-blur-sm border border-orange-500/20">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-orange-200 font-medium">
                Trusted by 2,500+ Schools
              </span>
            </div>

            {/* Heading */}
            <div className="space-y-3">
              <h1 className="text-5xl xl:text-6xl font-bold leading-tight">
                <span className="text-white">Smarter School</span>
                <br />
                <span className="text-brand-500">Operations</span>
              </h1>
              <p className="text-lg text-neutral-300 leading-relaxed max-w-lg">
                Join thousands of forward-thinking schools managing academics,
                operations, and finance in one unified platform.
              </p>
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            className="grid grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-bold text-white">
                    {stat.value}
                  </span>
                  <span className="text-xs text-green-400 font-medium">
                    {stat.trend}
                  </span>
                </div>
                <div className="text-xs text-neutral-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Features List */}
          <motion.div
            className="space-y-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="flex gap-4 group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                    <feature.icon className="w-5 h-5 text-brand-500" />
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-white font-semibold mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Footer with Security Badges */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          {/* Security Badges */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-neutral-400 text-sm">
              <Shield className="w-4 h-4 text-neutral-500" />
              <span>SOC2 Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-400 text-sm">
              <Lock className="w-4 h-4 text-neutral-500" />
              <span>256-bit Encryption</span>
            </div>
          </div>

          {/* Footer Links */}
          <div className="flex items-center gap-4 text-neutral-500 text-xs">
            <span>© 2024 SchoolIQ</span>
            <span>•</span>
            <Link
              href="/privacy"
              className="hover:text-neutral-300 transition-colors"
            >
              Privacy
            </Link>
            <span>•</span>
            <Link
              href="/terms"
              className="hover:text-neutral-300 transition-colors"
            >
              Terms
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
