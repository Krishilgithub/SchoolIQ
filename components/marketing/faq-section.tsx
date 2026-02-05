"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How long does onboarding typically take?",
    answer:
      "For most institutions, our automated migration tools allow us to get you up and running in less than 7 days. Large districts with complex custom data requirements may take 2-4 weeks for a full rollout with training.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We use bank-grade 256-bit encryption for all data in transit and at rest. We conduct daily automated backups and are fully compliant with GDPR and other regional data privacy regulations.",
  },
  {
    question: "Can I migrate data from my old system?",
    answer:
      "Yes, we support one-click imports from common CSV/Excel formats. For legacy systems, our engineering team offers a white-glove migration service to ensure zero data loss.",
  },
  {
    question: "Do you provide training for teachers?",
    answer:
      "We offer an extensive library of video tutorials, a searchable knowledge base, and live webinar training sessions. Enterprise plans include dedicated on-site or virtual training workshops.",
  },
  {
    question: "What happens if we stop using SchoolIQ?",
    answer:
      "You own your data. If you decide to leave, you can export all your student records, financial data, and reports in standard open formats (CSV, PDF, JSON) with a single click.",
  },
  {
    question: "Is there a mobile app for parents?",
    answer:
      "Yes, we have native iOS and Android apps for parents to track attendance, pay fees, viewing report cards, and communicate with teachers instantly.",
  },
  {
    question: "Can we customize the grading system?",
    answer:
      "SchoolIQ supports all major grading standards (GPA, CCE, IB, IGCSE) and allows you to define custom grade boundaries, weightages, and report card templates.",
  },
  {
    question: "Does it work offline?",
    answer:
      "Our mobile apps have offline capabilities for key tasks like taking attendance. Data syncs automatically once the device reconnects to the internet.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-white py-24 border-t border-neutral-100">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-heading text-neutral-900 mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-neutral-500 text-lg">
            Everything you need to know about the product and billing.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={cn(
                "border rounded-xl transition-all duration-300 overflow-hidden",
                openIndex === idx
                  ? "bg-white border-brand-500 shadow-sm"
                  : "bg-white border-neutral-200 hover:border-brand-200",
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span
                  className={cn(
                    "text-lg font-medium transition-colors",
                    openIndex === idx ? "text-brand-700" : "text-neutral-700",
                  )}
                >
                  {faq.question}
                </span>
                <span
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    openIndex === idx
                      ? "bg-brand-50 text-brand-600"
                      : "bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200",
                  )}
                >
                  {openIndex === idx ? <Minus size={16} /> : <Plus size={16} />}
                </span>
              </button>

              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 pt-0 text-neutral-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
