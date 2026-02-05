"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/marketing/logo";

export function Navbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Product", href: "#product" },
    { name: "Pricing", href: "#pricing" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "fixed top-4 left-4 right-4 z-50 transition-all duration-300 ease-in-out mx-auto max-w-6xl rounded-2xl border",
          isScrolled
            ? "bg-white/90 backdrop-blur-xl border-neutral-200 shadow-lg py-3"
            : "bg-white/60 backdrop-blur-md border-transparent py-4 shadow-sm",
        )}
      >
        <div className="px-6 flex items-center justify-between">
          <Link href="#top" className="flex items-center gap-2 group">
            <Logo
              iconClassName="w-8 h-8 group-hover:scale-105 transition-transform"
              textClassName="text-neutral-900"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-neutral-600 hover:text-brand-600 transition-colors relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-500 transition-all group-hover:w-full opacity-0 group-hover:opacity-100" />
              </Link>
            ))}
          </div>

          {/* CTA & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="hidden md:block">
              <Button
                variant="ghost"
                className="hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 font-medium"
              >
                Log In
              </Button>
            </Link>
            <Link href="/auth/register" className="hidden md:block">
              <Button className="bg-brand-600 hover:bg-brand-700 text-white rounded-full px-6 font-semibold shadow-md shadow-brand-500/20 hover:shadow-lg hover:shadow-brand-500/30 transition-all hover:-translate-y-0.5">
                Book Demo
              </Button>
            </Link>
            <button
              className="lg:hidden p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 z-40 bg-white pt-28 px-6 lg:hidden"
        >
          <div className="flex flex-col gap-6 text-center">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-2xl font-semibold text-neutral-900 hover:text-brand-600 transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <div className="h-px w-full bg-neutral-100 my-4" />
            <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant="ghost"
                className="w-full text-lg h-12 text-neutral-600 hover:text-neutral-900"
              >
                Log In
              </Button>
            </Link>
            <Link
              href="/auth/register"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button className="w-full bg-brand-600 hover:bg-brand-700 text-lg h-12 rounded-full text-white shadow-lg shadow-brand-500/30 font-semibold">
                Book Demo
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </>
  );
}
