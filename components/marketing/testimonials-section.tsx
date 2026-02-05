"use client";

import React from "react";
import Marquee from "react-fast-marquee";

const testimonials = [
  {
    quote:
      "SchoolIQ completely transformed our admissions process from a chaotic paper-trail to a streamlined digital workflow. It's simply brilliant and has saved our administrative team hundreds of hours every admission cycle.",
    name: "Sarah Jenkins",
    role: "Principal, St. Xavier's High",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
  },
  {
    quote:
      "The real-time analytics dashboard gives us unprecedented visibility into student performance and attendance trends. It's a game changer for our weekly board meetings and helps us make data-driven decisions instantly.",
    name: "David Chen",
    role: "Admin, Global Public School",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
  },
  {
    quote:
      "Finally, a school management system that teachers actually love using. The interface is incredibly intuitive, fast, and requires almost no training. It allows our educators to focus on teaching rather than administrative tasks.",
    name: "Emily Rodriguez",
    role: "Coordinator, Valley International",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
  },
  {
    quote:
      "The support team is top-notch and the feature set is incredibly robust. From fee management to library tracking, it handles everything we need. I highly recommend SchoolIQ to any growing institution.",
    name: "Michael Chang",
    role: "Director, Modern Academy",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
  },
  {
    quote:
      "It pays for itself in time saved alone. The automated report generation is a lifesaver during end-of-term assessments, reducing weeks of work into just a few clicks. Parents love the transparency it provides.",
    name: "Robert Fox",
    role: "Trustee, Oakridge International",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
  },
  {
    quote:
      "The best investment we've made for our school administration this year. The mobile app availability for parents has significantly improved communication and engagement with our school community.",
    name: "Lisa Thompson",
    role: "Headmistress, Springdale Public",
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-white py-24 relative overflow-hidden border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <h2 className="text-3xl md:text-5xl font-bold font-heading text-neutral-900 mb-6">
          Loved by Educators
        </h2>
        <p className="text-neutral-500 text-lg max-w-2xl mx-auto">
          Join hundreds of innovative schools that trust SchoolIQ to power their
          operations.
        </p>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <Marquee gradient={false} speed={40} pauseOnHover className="py-4">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="w-[350px] md:w-[450px] bg-white border border-neutral-200 rounded-xl p-8 mx-4 relative group transition-all hover:bg-neutral-50 hover:border-neutral-300 shadow-sm hover:shadow-md"
            >
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.img}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-neutral-100 shrink-0"
                  />
                  <div>
                    <h4 className="text-neutral-900 font-semibold text-sm">
                      {t.name}
                    </h4>
                    <p className="text-neutral-500 text-xs">{t.role}</p>
                  </div>
                </div>
                <p className="text-neutral-600 text-sm leading-relaxed italic relative">
                  <span className="text-brand-500/20 text-5xl absolute -top-6 -left-2 font-serif select-none pointer-events-none">
                    &quot;
                  </span>
                  <span className="relative z-10">{t.quote}</span>
                </p>
              </div>
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
