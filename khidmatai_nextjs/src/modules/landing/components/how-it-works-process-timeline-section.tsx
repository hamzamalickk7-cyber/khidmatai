"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, CalendarCheck, MessageSquareText, Star, type LucideIcon } from "lucide-react";
import { SectionEyebrowLabel } from "@/modules/landing/components/section-eyebrow-label";

interface ProcessStep {
  number: string;
  title: string;
  description: string;
  IconComponent: LucideIcon;
  example: string;
}

const processStepList: ProcessStep[] = [
  {
    number: "01",
    title: "Describe your job",
    description: "Tell us what is wrong and where you need help. Add a photo if it makes the problem clearer.",
    IconComponent: MessageSquareText,
    example: "Leaking kitchen tap · F-7 · Needed today",
  },
  {
    number: "02",
    title: "Compare local professionals",
    description: "Review relevant providers, their experience, availability, pricing and completed-job feedback.",
    IconComponent: BadgeCheck,
    example: "Identity reviewed · 4.9 rating · Available today",
  },
  {
    number: "03",
    title: "Book with confidence",
    description: "Choose the provider that fits, confirm the details and keep the job recorded in one place.",
    IconComponent: CalendarCheck,
    example: "Quote confirmed · Today, 3–4 PM",
  },
];

export function HowItWorksProcessTimelineSection() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-8">
        <div className="bg-ink-soft relative overflow-hidden rounded-2xl px-6 py-12 text-white sm:px-10 lg:px-12 lg:py-14">
          <div className="bg-flash/10 absolute -top-28 -right-24 size-80 rounded-full blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <SectionEyebrowLabel isOnDarkBackground>How KhidmatAI works</SectionEyebrowLabel>
              <h2 className="mt-3 text-3xl leading-tight sm:text-4xl">Three steps from problem to booked.</h2>
              <p className="mt-4 max-w-xl leading-7 text-white/65">
                No complicated process. Tell us what you need, compare suitable professionals and choose who you trust.
              </p>
            </div>
            <Link
              href="/explore"
              className="bg-flash text-ink inline-flex h-12 w-fit items-center justify-center gap-2 rounded-lg px-5 text-sm font-bold transition hover:bg-white"
            >
              Find help now <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="relative mt-10 grid gap-4 lg:grid-cols-3">
            {processStepList.map(({ number, title, description, IconComponent, example }, index) => (
              <motion.article
                key={number}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="rounded-xl border border-white/12 bg-white/7 p-5 backdrop-blur-sm sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="bg-flash text-ink grid size-10 place-items-center rounded-lg text-xs font-black">
                    {number}
                  </span>
                  <IconComponent className="size-5 text-white/45" aria-hidden="true" />
                </div>
                <h3 className="mt-7 text-xl font-semibold">{title}</h3>
                <p className="mt-3 min-h-18 text-sm leading-6 text-white/60">{description}</p>
                <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4 text-xs font-medium text-white/75">
                  {number === "02" ? (
                    <Star className="text-flash size-3.5 fill-current" aria-hidden="true" />
                  ) : (
                    <span className="bg-flash size-1.5 rounded-full" />
                  )}
                  {example}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
