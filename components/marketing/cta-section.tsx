"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <div className="h-[40rem] w-full dark:bg-black bg-white  dark:bg-grid-small-white/[0.2] bg-grid-small-black/[0.2] relative flex items-center justify-center">
      {/* Radial gradient for the container to give a faded look */}
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

      <div className="relative z-20 flex flex-col items-center text-center">
        <h2 className="text-4xl md:text-6xl font-bold font-heading text-neutral-800 dark:text-neutral-200">
          Ready to transform your school?
        </h2>
        <p className="mt-4 max-w-2xl text-base md:text-xl text-neutral-600 dark:text-neutral-400">
          Join hundreds of forward-thinking institutions using SchoolIQ to
          simplify management and focus on education.
        </p>

        <div className="mt-8">
          <Button
            size="lg"
            className="h-14 animate-shimmer rounded-full border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-8 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
          >
            Start Your Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
