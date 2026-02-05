"use client";
import React from "react";
import { XCircle, TrendingDown, Clock, AlertTriangle } from "lucide-react";

export function ProblemSection() {
  const problems = [
    {
      title: "Fragmented Data",
      description:
        "Student records scattered across spreadsheets, paper files, and legacy software.",
      icon: <XCircle className="w-8 h-8 text-red-600" />,
    },
    {
      title: "Revenue Leakage",
      description:
        "Manual fee collection leads to missed payments and untracked expenses.",
      icon: <TrendingDown className="w-8 h-8 text-orange-600" />,
    },
    {
      title: "Time Wastage",
      description:
        "Teachers spend 30% of their time on attendance and administrative paperwork.",
      icon: <Clock className="w-8 h-8 text-yellow-600" />,
    },
    {
      title: "Communication Gaps",
      description:
        "Parents are left in the dark about their child's academic progress.",
      icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
    },
  ];

  return (
    <section className="bg-white py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-heading text-neutral-900 mb-4">The old way is <span className="text-orange-600">broken</span>.
          </h2>
          <p className="text-neutral-500 max-w-2xl mx-auto text-lg">
            Stop struggling with disconnected tools and manual processes that
            hold your institution back.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {problems.map((problem, idx) => (
            <div
              key={idx}
              className="group relative p-8 rounded-2xl bg-white border border-neutral-200 hover:border-red-200 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1"
            >
              <div className="relative z-10">
                <div className="mb-4 bg-neutral-50 w-14 h-14 rounded-xl flex items-center justify-center border border-neutral-100 group-hover:bg-red-50 group-hover:border-red-100 transition-colors">
                  {problem.icon}
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  {problem.title}
                </h3>
                <p className="text-neutral-500 leading-relaxed text-sm">
                  {problem.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
