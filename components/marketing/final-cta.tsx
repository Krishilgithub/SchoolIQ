"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="bg-white py-32 relative overflow-hidden border-t border-neutral-100">
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-4xl md:text-6xl font-bold font-heading text-neutral-900 mb-8 tracking-tight">
          Ready to modernize your <br /> institution?
        </h2>
        <p className="text-xl text-neutral-500 mb-10 max-w-2xl mx-auto">
          Join over 500+ schools that have transformed their operations with
          SchoolIQ. No credit card required for the trial.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="h-14 rounded-full bg-brand-600 text-white hover:bg-brand-700 px-8 text-lg font-bold shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.23)] transition-all hover:-translate-y-1"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="h-14 rounded-full bg-neutral-100 text-neutral-900 hover:bg-neutral-200 px-8 text-lg font-bold transition-all hover:-translate-y-1"
          >
            Talk to Sales
          </Button>
        </div>

        <p className="mt-8 text-sm text-neutral-500 font-medium">
          Free 14-day trial • Cancel anytime • 24/7 Support
        </p>
      </div>
    </section>
  );
}
