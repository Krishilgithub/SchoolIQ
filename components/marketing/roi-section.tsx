"use client";
import React from "react";
import dynamic from "next/dynamic";

const RoiChart = dynamic(() => import("./roi-chart"), { ssr: false });

export function RoiSection() {
  return (
    <section className="bg-white py-24 border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold font-heading text-neutral-900 mb-6">
              Return on Investment{" "}
              <span className="text-brand-600">Guaranteed</span>
            </h2>
            <p className="text-neutral-500 text-lg mb-8 leading-relaxed">
              Schools utilizing SchoolIQ see a drastic reduction in
              administrative overhead and a significant increase in fee
              collection efficiency within the first 3 months. Our platform pays
              for itself.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl md:text-5xl font-bold text-brand-600 mb-2">
                  30%
                </div>
                <div className="text-neutral-600 font-medium">
                  Reduction in Admin Time
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">
                  98%
                </div>
                <div className="text-neutral-600 font-medium">
                  Fee Collection Rate
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">
                  100%
                </div>
                <div className="text-neutral-600 font-medium">
                  Paperless Operations
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                  24/7
                </div>
                <div className="text-neutral-600 font-medium">
                  System Uptime & Support
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-200 p-8 relative overflow-hidden shadow-xl ring-1 ring-black/5">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/5 to-transparent pointer-events-none" />

            <div className="mb-8 flex justify-between items-end relative z-10">
              <div>
                <h3 className="text-neutral-900 font-semibold text-lg">
                  Growth Trajectory
                </h3>
                <p className="text-neutral-500 text-sm">
                  Revenue vs Efficiency
                </p>
              </div>
              <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                +145% Growth
              </div>
            </div>

            <div className="h-[350px] w-full relative z-10">
              <RoiChart />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
