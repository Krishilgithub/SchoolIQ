"use client";
import React, { useRef } from "react";
import { Spotlight } from "./spotlight";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  PlayCircle,
  BarChart3,
  Users,
  Wallet,
  GraduationCap,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { AdminDashboardWidget } from "./mock-ui";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FloatingBadge = ({ icon: Icon, label, value, color, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.8 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, duration: 0.5 }}
    className="absolute hidden md:flex items-center gap-3 bg-white/90 backdrop-blur-md border border-neutral-200 p-3 rounded-xl shadow-xl z-20"
    style={{
      boxShadow: `0 10px 30px -10px rgba(0,0,0,0.1)`,
    }}
  >
    <div className={`p-2 rounded-lg ${color} bg-opacity-10 text-white`}>
      <Icon size={20} className={color.replace("bg-", "text-")} />
    </div>
    <div>
      <div className="text-xs text-neutral-500 font-medium">{label}</div>
      <div className="text-sm font-bold text-neutral-900">{value}</div>
    </div>
  </motion.div>
);

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Connect scroll to rotation
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-start overflow-hidden bg-white antialiased pt-32 pb-20 md:pt-40 md:pb-32 min-h-screen"
    >
      <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60 opacity-50"
        fill="#fb923c" // Orange-400
      />

      {/* Radial Gradient for depth - Warm/Orange tinted */}
      <div className="absolute top-0 z-[0] h-screen w-screen bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(251,146,60,0.15),rgba(255,255,255,0))]" />

      <div className="relative z-10 w-full max-w-7xl px-6 text-center">
        <motion.div
          style={{ opacity }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          {/* Pill Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50/50 px-3 py-1 text-sm text-orange-700 shadow-sm transition-colors hover:bg-orange-100">
            <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
            v2.0 is now live
            <ArrowRight className="h-3 w-3 text-orange-400" />
          </div>

          <h1 className="bg-gradient-to-b from-neutral-900 to-neutral-700 bg-clip-text text-5xl font-bold text-transparent md:text-7xl font-heading tracking-tight leading-tight max-w-5xl mx-auto">
            The Modern Operating System <br className="hidden md:block" /> for
            Educational Excellence
          </h1>

          <p className="mt-6 max-w-2xl text-lg font-normal text-start text-neutral-600 mx-auto md:text-center">
            SchoolIQ unifies academics, administration, and finance into a
            single, beautiful platform. Built for high-performance institutions.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row justify-center w-full sm:w-auto">
            <Link href="/auth/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto h-12 rounded-full bg-brand-600 px-8 text-base font-semibold text-white shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:bg-brand-700 hover:shadow-[0_6px_20px_rgba(249,115,22,0.23)] hover:-translate-y-0.5 transition-all"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-12 rounded-full border-neutral-200 bg-white px-8 text-base font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-all hover:-translate-y-0.5 shadow-sm"
            >
              <PlayCircle className="mr-2 h-4 w-4 text-neutral-500" />
              Interactive Demo
            </Button>
          </div>
        </motion.div>

        {/* 3D Dashboard Mockup Container */}
        <motion.div
          style={{
            perspective: "1000px",
            y,
          }}
          className="mt-20 w-full relative max-w-6xl mx-auto"
        >
          <motion.div
            style={{
              rotateX,
              scale,
              transformStyle: "preserve-3d",
            }}
            className="relative"
          >
            {/* Main Dashboard Window */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-2 ring-1 ring-neutral-900/5 shadow-2xl relative z-10">
              <div className="rounded-xl bg-neutral-50 border border-neutral-200 w-full overflow-hidden relative min-h-[500px] md:min-h-[600px] flex">
                {/* Simulated Sidebar */}
                <div className="w-64 border-r border-neutral-200 bg-white hidden md:flex flex-col p-4 gap-4">
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-brand-500/20">
                      IQ
                    </div>
                    <div className="h-4 w-24 bg-neutral-100 rounded" />
                  </div>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-9 w-full rounded-lg bg-neutral-50 border border-neutral-100"
                    />
                  ))}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-6 bg-neutral-50/50">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-neutral-900 text-xl font-bold font-heading">
                        Dashboard
                      </h3>
                      <p className="text-neutral-500 text-sm">
                        Welcome back, Admin
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-10 w-10 rounded-full bg-white border border-neutral-200 shadow-sm flex items-center justify-center text-neutral-400">
                        <Users size={18} />
                      </div>
                      <div className="h-10 w-10 rounded-full bg-brand-50 border border-brand-100 shadow-sm flex items-center justify-center text-brand-600 font-bold">
                        A
                      </div>
                    </div>
                  </div>

                  {/* Grid of Widgets */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-2 shadow-sm rounded-xl">
                      <AdminDashboardWidget />
                    </div>
                    <div className="space-y-6">
                      <div className="h-40 w-full rounded-xl bg-white border border-neutral-200 p-5 shadow-sm flex flex-col justify-between group hover:border-brand-200 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600">
                            <Wallet size={20} />
                          </div>
                          <span className="text-xs font-semibold bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-100">
                            +12%
                          </span>
                        </div>
                        <div>
                          <div className="text-neutral-500 text-sm mb-1 font-medium">
                            Total Revenue
                          </div>
                          <div className="text-neutral-900 text-3xl font-bold tracking-tight">
                            $124k
                          </div>
                        </div>
                      </div>
                      <div className="h-40 w-full rounded-xl bg-white border border-neutral-200 p-5 shadow-sm flex flex-col justify-between group hover:border-brand-200 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="p-2.5 bg-green-50 rounded-xl text-green-600">
                            <Users size={20} />
                          </div>
                          <span className="text-xs font-semibold bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-100">
                            +4%
                          </span>
                        </div>
                        <div>
                          <div className="text-neutral-500 text-sm mb-1 font-medium">
                            Attendance
                          </div>
                          <div className="text-neutral-900 text-3xl font-bold tracking-tight">
                            98.2%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shadow/Glow under the dashboard - Orange/Warm */}
            <motion.div
              style={{
                opacity: useTransform(scrollYProgress, [0, 0.5], [0.4, 0.2]),
              }}
              className="absolute -inset-8 bg-brand-500/20 rounded-[3rem] blur-3xl -z-10"
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
