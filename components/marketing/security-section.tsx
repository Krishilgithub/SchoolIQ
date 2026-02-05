"use client";
import React from "react";
import { ShieldCheck, Lock, Server, FileCheck } from "lucide-react";

export function SecuritySection() {
  return (
    <section className="bg-neutral-950 py-24 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <div className="md:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-medium mb-6">
              <ShieldCheck className="h-4 w-4" />
              Enterprise-Grade Security
            </div>
            <h2 className="text-3xl md:text-5xl font-bold font-heading text-white mb-6">
              Your Data <br /> Is Safe With Us
            </h2>
            <p className="text-neutral-400 text-lg mb-8">
              We adhere to the strictest data privacy standards. Your
              institution's data is encrypted, backed up, and compliant with
              global regulations.
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex gap-3">
                <Lock className="h-6 w-6 text-brand-500 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-bold">256-bit Encryption</h4>
                  <p className="text-neutral-500 text-sm">
                    Bank-level data protection.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Server className="h-6 w-6 text-brand-500 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-bold">Daily Backups</h4>
                  <p className="text-neutral-500 text-sm">
                    Automated and redundant.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <FileCheck className="h-6 w-6 text-brand-500 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-bold">GDPR Compliant</h4>
                  <p className="text-neutral-500 text-sm">
                    Respecting user privacy.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:w-1/2 relative">
            {/* Abstract Shield Visual */}
            <div className="relative z-10 bg-neutral-900 rounded-3xl border border-white/10 p-8 shadow-2xl">
              <div className="w-full aspect-square bg-gradient-to-br from-brand-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.05]" />
                <ShieldCheck className="h-32 w-32 text-white/20" />

                {/* Floating Badges */}
                <div className="absolute top-8 right-8 bg-neutral-950 border border-white/10 px-4 py-2 rounded-lg text-green-500 text-xs font-mono flex items-center gap-2 shadow-lg">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  System Secure
                </div>
                <div className="absolute bottom-8 left-8 bg-neutral-950 border border-white/10 px-4 py-2 rounded-lg text-white text-xs font-mono shadow-lg">
                  Last Backup: 2m ago
                </div>
              </div>
            </div>
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
