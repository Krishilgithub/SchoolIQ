"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function LiveDemo() {
  const [role, setRole] = useState<"admin" | "teacher" | "student">("admin");

  return (
    <section className="bg-white py-24 border-y border-neutral-100">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-bold font-heading text-neutral-900 mb-8">
          See it in Action
        </h2>

        <div className="inline-flex bg-neutral-100 p-1 rounded-full border border-neutral-200 mb-12">
          {["admin", "teacher", "student"].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r as "admin" | "teacher" | "student")}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all capitalize",
                role === r
                  ? "bg-white text-brand-600 shadow-sm ring-1 ring-black/5"
                  : "text-neutral-500 hover:text-neutral-900",
              )}
            >
              {r} View
            </button>
          ))}
        </div>

        <div className="relative max-w-5xl mx-auto aspect-video bg-white rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden ring-1 ring-black/5">
          {/* Simulator Header */}
          <div className="h-10 bg-neutral-50 border-b border-neutral-200 flex items-center px-4 justify-between">
            <div className="flex gap-2">
              <div className="h-3 w-3 rounded-full bg-red-400/80 border border-red-500/20" />
              <div className="h-3 w-3 rounded-full bg-yellow-400/80 border border-yellow-500/20" />
              <div className="h-3 w-3 rounded-full bg-green-400/80 border border-green-500/20" />
            </div>
            <div className="text-xs text-neutral-400 font-mono">
              dashboard.schooliq.com
            </div>
            <div className="w-16" />
          </div>

          {/* Simulator Content */}
          <motion.div
            key={role}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="p-8 h-full flex flex-col items-center justify-center text-neutral-300"
          >
            {/* Visuals change based on role */}
            {role === "admin" && (
              <div className="grid grid-cols-3 gap-6 w-full h-full p-4">
                <div className="col-span-2 h-full bg-neutral-50 rounded-xl border border-neutral-200 p-4 shadow-sm">
                  <div className="h-8 w-1/3 bg-neutral-200/50 rounded mb-4" />
                  <div className="h-64 w-full bg-gradient-to-t from-brand-50 to-transparent rounded-lg" />
                </div>
                <div className="col-span-1 h-full flex flex-col gap-4">
                  <div className="flex-1 bg-neutral-50 rounded-xl border border-neutral-200 shadow-sm" />
                  <div className="flex-1 bg-neutral-50 rounded-xl border border-neutral-200 shadow-sm" />
                </div>
              </div>
            )}
            {role === "teacher" && (
              <div className="flex flex-col gap-4 w-full h-full p-4">
                <div className="w-full h-16 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center px-4 shadow-sm">
                  <div className="h-8 w-64 bg-neutral-200/50 rounded" />
                </div>
                <div className="flex-1 grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div
                      key={i}
                      className="bg-neutral-50 rounded-xl border border-neutral-200 shadow-sm"
                    />
                  ))}
                </div>
              </div>
            )}
            {role === "student" && (
              <div className="w-full max-w-md mx-auto h-full bg-neutral-50 rounded-xl border border-neutral-200 p-6 flex flex-col gap-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-neutral-200/50" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-neutral-200/50 rounded" />
                    <div className="h-3 w-24 bg-neutral-200/30 rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-12 w-full bg-neutral-200/20 rounded" />
                  <div className="h-12 w-full bg-neutral-200/20 rounded" />
                  <div className="h-12 w-full bg-neutral-200/20 rounded" />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
