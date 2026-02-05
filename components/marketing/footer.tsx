"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Twitter, Linkedin, Facebook, Github } from "lucide-react";
import { Logo } from "@/components/marketing/logo";

export function Footer() {
  return (
    <footer className="bg-neutral-50 pt-24 pb-12 border-t border-neutral-200 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/5 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-200/20 rounded-full blur-[128px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Logo />
            </div>
            <p className="text-neutral-500 mb-6">
              The next-generation operating system for modern educational
              institutions.
            </p>
            <div className="flex gap-4">
              {[Twitter, Linkedin, Facebook, Github].map((Icon, i) => (
                <Link
                  key={i}
                  href="#"
                  className="h-10 w-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-brand-600 hover:border-brand-600 transition-all shadow-sm"
                >
                  <Icon size={18} />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-neutral-900 mb-6">Product</h4>
            <ul className="space-y-4 text-neutral-500">
              {[
                "Features",
                "Integrations",
                "Pricing",
                "Changelog",
                "Roadmap",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="hover:text-brand-600 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-neutral-900 mb-6">Company</h4>
            <ul className="space-y-4 text-neutral-500">
              {["About", "Careers", "Blog", "Contact", "Partners"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="hover:text-brand-600 transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-neutral-900 mb-6">
              Subscribe to our newsletter
            </h4>
            <p className="text-neutral-500 mb-4 text-sm">
              Latest updates, articles, and resources, sent to your inbox
              weekly.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter your email"
                className="bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-brand-500"
              />
              <Button className="bg-brand-600 hover:bg-brand-500 text-white shadow-sm">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-500">
          <p>
            &copy; {new Date().getFullYear()} SchoolIQ Inc. All rights reserved.
          </p>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-brand-600">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-brand-600">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-brand-600">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
