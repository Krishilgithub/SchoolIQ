"use client";
import React from "react";
import { BentoGrid, BentoGridItem } from "./bento-grid";
import {
  IconClipboardCopy,
  IconFileBroken,
  IconSignature,
  IconTableColumn,
} from "@tabler/icons-react";
import { Check, User, FileText, MessageCircle, TrendingUp } from "lucide-react";

export function ValuePillars() {
  return (
    <section id="features" className="bg-neutral-50 py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-heading text-neutral-900 mb-4 tracking-tight">
            Everything You Need <br className="hidden md:block" /> to Run a{" "}
            <span className="text-brand-600">Modern School</span>.
          </h2>
          <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
            Powerful features designed to streamline operations, enhance
            learning, and simplify management.
          </p>
        </div>

        <BentoGrid className="max-w-4xl mx-auto">
          {items.map((item, i) => (
            <BentoGridItem
              key={i}
              title={item.title}
              description={item.description}
              header={item.header}
              icon={item.icon}
              className={i === 0 || i === 3 ? "md:col-span-2" : ""}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}

// Custom Mini-Widgets (Replacing Skeletons)

const AdmissionsWidget = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-white border border-neutral-100 relative overflow-hidden flex-col p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-neutral-100 flex items-center justify-center">
          <User size={12} className="text-neutral-500" />
        </div>
        <div className="text-xs font-medium text-neutral-700">Alex Student</div>
      </div>
      <div className="bg-green-50 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-medium border border-green-100">
        Paid
      </div>
    </div>
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] text-neutral-500">
        <span>Form Submitted</span>
        <Check size={10} className="text-brand-600" />
      </div>
      <div className="flex items-center justify-between text-[10px] text-neutral-500">
        <span>Doc Verification</span>
        <div className="h-2 w-2 bg-brand-500 rounded-full animate-pulse" />
      </div>
    </div>
  </div>
);

const FinanceWidget = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-white border border-neutral-100 relative overflow-hidden flex-col justify-center p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center">
          <FileText size={16} className="text-orange-600" />
        </div>
        <div>
          <div className="text-xs font-bold text-neutral-900">Invoice #092</div>
          <div className="text-[10px] text-neutral-400">Tuition Fee</div>
        </div>
      </div>
      <div className="text-sm font-bold text-neutral-900">$2,400</div>
    </div>
    <div className="w-full bg-neutral-100 h-1.5 rounded-full mt-2">
      <div className="bg-green-500 h-1.5 rounded-full w-full" />
    </div>
    <div className="mt-2 flex justify-end">
      <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">
        Auto-Reconciled
      </span>
    </div>
  </div>
);

const CommWidget = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-white border border-neutral-100 relative overflow-hidden flex-col justify-center p-4 gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-left">
    <div className="flex gap-2 items-start">
      <div className="h-6 w-6 rounded-full bg-brand-100 flex-shrink-0 flex items-center justify-center">
        <MessageCircle size={12} className="text-brand-600" />
      </div>
      <div className="bg-neutral-50 p-2 rounded-lg rounded-tl-none border border-neutral-100 text-[10px] text-neutral-600">
        School is closed tomorrow due to heavy rain.
      </div>
    </div>
    <div className="flex gap-2 items-center justify-end">
      <div className="text-[9px] text-neutral-400">Sent to 1,240 Parents</div>
      <Check size={10} className="text-brand-500" />
    </div>
  </div>
);

const AnalyticsWidget = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-white border border-neutral-100 relative overflow-hidden p-4 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
    <div className="flex items-center justify-between">
      <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
        Efficiency
      </div>
      <TrendingUp size={12} className="text-green-500" />
    </div>
    <div className="flex items-end justify-between gap-1 h-12 mt-2">
      {[35, 55, 45, 70, 60, 85, 95].map((h, i) => (
        <div
          key={i}
          className="w-full bg-brand-500/80 rounded-t-[2px] hover:bg-brand-600 transition-all duration-300"
          style={{ height: `${h}%`, opacity: i === 6 ? 1 : 0.4 + i * 0.1 }}
        />
      ))}
    </div>
  </div>
);

const items = [
  {
    title: "10x Faster Admissions",
    description:
      "Digital forms and automated workflows reduce processing time.",
    header: <AdmissionsWidget />,
    icon: <IconClipboardCopy className="h-4 w-4 text-neutral-400" />,
  },
  {
    title: "Zero-Error Accounting",
    description: "Automated fee reconciliation.",
    header: <FinanceWidget />,
    icon: <IconFileBroken className="h-4 w-4 text-neutral-400" />,
  },
  {
    title: "Instant Communication",
    description: "SMS, Email, and Push notifications.",
    header: <CommWidget />,
    icon: <IconSignature className="h-4 w-4 text-neutral-400" />,
  },
  {
    title: "Data-Driven Decisions",
    description:
      "Understand the impact of effective communication in our dashboard.",
    header: <AnalyticsWidget />,
    icon: <IconTableColumn className="h-4 w-4 text-neutral-400" />,
  },
];
