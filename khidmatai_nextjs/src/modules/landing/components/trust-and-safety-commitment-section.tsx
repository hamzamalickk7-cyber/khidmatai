"use client";

import { motion } from "framer-motion";
import { BadgeCheck, ClipboardCheck, Eye, Star, type LucideIcon } from "lucide-react";
import { SectionEyebrowLabel } from "@/modules/landing/components/section-eyebrow-label";

interface TrustItem {
  title: string;
  description: string;
  IconComponent: LucideIcon;
}

const trustItemList: TrustItem[] = [
  {
    title: "Identity review",
    description: "Provider profiles show what has been checked instead of using vague trust claims.",
    IconComponent: BadgeCheck,
  },
  {
    title: "Admin-reviewed profiles",
    description: "Provider details can be reviewed before a profile is approved for the marketplace.",
    IconComponent: ClipboardCheck,
  },
  {
    title: "Real job reviews",
    description: "Feedback is connected to completed bookings, making ratings more meaningful.",
    IconComponent: Star,
  },
  {
    title: "Clear information",
    description: "Experience, services, area and availability stay visible before a customer chooses.",
    IconComponent: Eye,
  },
];

export function TrustAndSafetyCommitmentSection() {
  return (
    <section id="trust-and-safety" className="scroll-mt-24 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
          <div className="max-w-lg">
            <SectionEyebrowLabel>Trust without the fine print</SectionEyebrowLabel>
            <h2 className="mt-3 text-3xl leading-tight sm:text-4xl">Know what you are choosing.</h2>
            <p className="text-ink/60 mt-4 leading-7">
              KhidmatAI reduces uncertainty by keeping the provider details customers actually need in view.
            </p>
            <div className="bg-brand-soft text-brand mt-7 inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold">
              <BadgeCheck className="size-4" /> Verification reduces risk—it is not a guarantee
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {trustItemList.map(({ title, description, IconComponent }, index) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="border-border bg-background rounded-xl border p-5"
              >
                <span className="bg-ink-soft text-flash grid size-10 place-items-center rounded-lg">
                  <IconComponent className="size-4.5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="text-ink/55 mt-2 text-sm leading-6">{description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
