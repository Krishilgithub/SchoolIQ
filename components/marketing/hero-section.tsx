"use client";
import React, { useRef } from "react";
import { Spotlight } from "./spotlight";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { MockDashboard } from "./mock-ui";

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
                Register Your School
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
            <div className="rounded-2xl border border-neutral-200 bg-white p-2 ring-1 ring-neutral-900/5 shadow-2xl relative z-10 w-full h-[600px] md:h-[700px]">
              <MockDashboard />
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
