"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  AdminDashboardWidget,
  GradebookWidget,
  ParentAppPreview,
} from "./mock-ui";

type Tab = {
  id: string;
  label: string;
  title: string;
  description: string;
  gradient: string;
  mockContent: React.ReactNode;
};

const tabs: Tab[] = [
  {
    id: "admin",
    label: "Administration",
    title: "Command Center for Principals",
    description:
      "Monitor admissions, finances, and staff performance from a single pane of glass.",
    gradient: "from-brand-500/10 to-blue-600/10",
    mockContent: <AdminDashboardWidget />,
  },
  {
    id: "academics",
    label: "Academics",
    title: "Empower Your Faculty",
    description:
      "Streamlined gradebooks, automated report cards, and lesson planning tools.",
    gradient: "from-purple-500/10 to-pink-600/10",
    mockContent: <GradebookWidget />,
  },
  {
    id: "parents",
    label: "Parents",
    title: "Connect with Families",
    description:
      "Instant notifications, digital fee payments, and attendance alerts.",
    gradient: "from-green-500/10 to-emerald-600/10",
    mockContent: <ParentAppPreview />,
  },
];

export function ProductShowcase() {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <section
      id="product"
      className="bg-neutral-50 py-24 md:py-32 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-heading text-neutral-900 mb-4">
            One Platform. <br /> Infinite Possibilities.
          </h2>
          <p className="text-neutral-500 max-w-2xl mx-auto text-lg">
            Experience the power of a fully integrated ecosystem designed for
            every stakeholder.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Tab Navigation */}
          <div className="flex flex-row lg:flex-col gap-4 w-full lg:w-1/3 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "text-left px-6 py-4 rounded-xl transition-all duration-300 border border-transparent min-w-[200px] lg:min-w-0 group",
                  activeTab.id === tab.id
                    ? "bg-white border-neutral-200 shadow-md ring-1 ring-black/5"
                    : "hover:bg-white/50 hover:border-neutral-200/50",
                )}
              >
                <h3
                  className={cn(
                    "text-lg font-bold mb-1 transition-colors",
                    activeTab.id === tab.id
                      ? "text-brand-600"
                      : "text-neutral-600 group-hover:text-neutral-900",
                  )}
                >
                  {tab.label}
                </h3>
                <p className="text-sm text-neutral-500 line-clamp-2 md:line-clamp-none">
                  {tab.title}
                </p>
              </button>
            ))}
          </div>

          {/* Tab Content Display */}
          <div className="w-full lg:w-2/3 h-[550px] relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full rounded-2xl border border-neutral-200 bg-white relative overflow-hidden group shadow-xl ring-1 ring-black/5"
              >
                {/* Dynamic Background Gradient */}
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-50 pointer-events-none transition-all duration-500",
                    activeTab.gradient,
                  )}
                />

                <div className="relative z-10 w-full h-full p-8 flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                      {activeTab.title}
                    </h3>
                    <p className="text-neutral-500">{activeTab.description}</p>
                  </div>
                  <div className="flex-1 w-full h-full relative flex items-center justify-center p-4 bg-neutral-50/50 rounded-xl border border-neutral-100 overflow-hidden">
                    {/* Render Real Mock Widget */}
                    <div className="w-full h-full scale-100 origin-top-left">
                      {activeTab.mockContent}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
