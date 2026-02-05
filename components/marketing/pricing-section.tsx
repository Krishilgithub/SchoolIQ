"use client";
import React, { useState } from "react";
import { Check, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Starter",
    description: "Essential tools for small schools and preschools.",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      "Up to 200 Students",
      "Basic Gradebook",
      "Attendance Tracking",
      "Parent Mobile App",
      "Email Support",
    ],
    missing: [
      "Admissions Portal",
      "Financial Management",
      "Advanced Analytics",
      "API Access",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    description: "Comprehensive power for growing institutions.",
    monthlyPrice: 199,
    annualPrice: 159,
    features: [
      "Up to 1000 Students",
      "Advanced Gradebook & Reports",
      "Admissions & CRM",
      "Fee Management & Invoicing",
      "Biometric Integration",
      "Prioritized Support",
    ],
    missing: ["White-label Branding", "Custom Data Migration"],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "Custom solutions for large networks and districts.",
    monthlyPrice: "Custom",
    annualPrice: "Custom",
    features: [
      "Unlimited Students",
      "Multi-branch Management",
      "Custom Data Migration",
      "White-label Branding",
      "Dedicated Account Manager",
      "24/7 SLA Support",
      "On-premise Deployment Option",
    ],
    missing: [],
    cta: "Contact Sales",
    popular: false,
  },
  {
    name: "Ultimate",
    description: "For institutions needing complete control and customization.",
    monthlyPrice: "Talk to Us",
    annualPrice: "Talk to Us",
    features: [
      "Everything in Enterprise",
      "Custom AI Models",
      "Dedicated Infrastructure",
      "Source Code Access",
      "Unlimited API Calls",
    ],
    missing: [],
    cta: "Partner With Us",
    popular: false,
  },
];

export function PricingSection() {
  const [annual, setAnnual] = useState(true);

  return (
    <section
      id="pricing"
      className="bg-neutral-50 py-24 relative overflow-hidden"
    >
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-heading text-neutral-900 mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-neutral-500 text-lg max-w-2xl mx-auto mb-8">
            Choose the plan that fits your institution&apos;s size and needs. No
            hidden fees.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span
              onClick={() => setAnnual(false)}
              className={cn(
                "text-sm font-medium transition-colors cursor-pointer",
                !annual
                  ? "text-neutral-900"
                  : "text-neutral-400 hover:text-neutral-500",
              )}
            >
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={cn(
                "w-14 h-8 rounded-full relative transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-500/50 border border-transparent",
                annual
                  ? "bg-brand-600 shadow-lg shadow-brand-500/20"
                  : "bg-neutral-200 border-neutral-300 hover:border-neutral-400",
              )}
            >
              <div
                className={cn(
                  "absolute top-1 left-1 size-6 bg-white rounded-full transition-all duration-300 shadow-sm",
                  annual ? "translate-x-6" : "translate-x-0",
                )}
              />
            </button>
            <span
              onClick={() => setAnnual(true)}
              className={cn(
                "text-sm font-medium transition-colors cursor-pointer",
                annual
                  ? "text-neutral-900"
                  : "text-neutral-400 hover:text-neutral-500",
              )}
            >
              Annual{" "}
              <span className="text-green-600 text-xs ml-1 font-bold">
                (Save 20%)
              </span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "relative rounded-2xl p-6 border transition-all duration-300 flex flex-col h-full",
                plan.popular
                  ? "bg-white border-brand-500 shadow-xl shadow-brand-900/5 scale-105 z-10"
                  : "bg-white border-neutral-200 hover:border-brand-300 hover:shadow-lg",
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-0 right-0 flex justify-center z-20">
                  <span className="bg-brand-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-lg ring-4 ring-white">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6 pt-2">
                <h3 className="text-lg font-bold text-neutral-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-neutral-500 text-xs h-8 leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold text-neutral-900">
                    {typeof plan.monthlyPrice === "number"
                      ? `$${annual ? plan.annualPrice : plan.monthlyPrice}`
                      : plan.monthlyPrice}
                  </span>
                  {typeof plan.monthlyPrice === "number" && (
                    <span className="text-neutral-400 mb-1 text-sm">/mo</span>
                  )}
                </div>
                {typeof plan.monthlyPrice === "number" && annual && (
                  <p className="text-[10px] text-green-600 mt-1 font-medium">
                    Billed annually
                  </p>
                )}
              </div>

              <div className="flex-1 space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2.5">
                    <div className="mt-0.5 rounded-full bg-brand-50 p-0.5">
                      <Check
                        className="h-3 w-3 text-brand-600 shrink-0"
                        strokeWidth={3}
                      />
                    </div>
                    <span className="text-xs text-neutral-600 font-medium">
                      {feature}
                    </span>
                  </div>
                ))}
                {plan.missing.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-start gap-2.5 opacity-50"
                  >
                    <div className="mt-0.5 p-0.5">
                      <X
                        className="h-3 w-3 text-neutral-400 shrink-0"
                        strokeWidth={3}
                      />
                    </div>
                    <span className="text-xs text-neutral-400 font-medium">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                className={cn(
                  "w-full h-10 rounded-lg text-sm font-semibold transition-all hover:translate-y-[-2px]",
                  plan.popular
                    ? "bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/20"
                    : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-neutral-200",
                )}
              >
                {plan.cta}{" "}
                <ArrowRight className="ml-1 h-3 w-3 opacity-50 group-hover:opacity-100" />
              </Button>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-neutral-500 text-sm mt-12">
          Need a custom quote?{" "}
          <a href="#" className="text-brand-600 underline hover:text-brand-500">
            Contact our sales team
          </a>
          .
        </p>
      </div>
    </section>
  );
}
