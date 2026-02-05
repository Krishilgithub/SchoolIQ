"use client";

import React from "react";
import { Navbar } from "@/components/marketing/navbar";
import { HeroSection } from "@/components/marketing/hero-section";
import { ProblemSection } from "@/components/marketing/problem-section";
import { ProductShowcase } from "@/components/marketing/product-showcase";
import { ValuePillars } from "@/components/marketing/value-pillars";
import { LiveDemo } from "@/components/marketing/live-demo";
import { RoiSection } from "@/components/marketing/roi-section";

import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { FAQSection } from "@/components/marketing/faq-section";
// import { FinalCTA } from "@/components/marketing/final-cta";
import { Footer } from "@/components/marketing/footer";
import { SmoothScroll } from "@/components/providers/smooth-scroll";

export default function LandingPage() {
  return (
    <SmoothScroll>
      <main className="min-h-screen bg-white antialiased selection:bg-brand-500/30">
        <Navbar />

        <div id="top">
          <HeroSection />
        </div>

        <div id="features">
          <ProblemSection />
          <ProductShowcase />
          <ValuePillars />
        </div>

        <div id="product">
          <LiveDemo />
        </div>

        <div id="analytics">
          <RoiSection />
        </div>

        <PricingSection />

        <div id="testimonials">
          <TestimonialsSection />
        </div>

        <FAQSection />

        {/* <FinalCTA /> */}

        <Footer />
      </main>
    </SmoothScroll>
  );
}
