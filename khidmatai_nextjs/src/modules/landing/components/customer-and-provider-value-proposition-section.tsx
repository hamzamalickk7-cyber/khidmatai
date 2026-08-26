"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check, HardHat, Search } from "lucide-react";
import { SectionEyebrowLabel } from "@/modules/landing/components/section-eyebrow-label";

const customerValuePropositionBenefitList = [
  "Find providers by service and location, not guesswork",
  "Compare trust signals and price, not just a phone number",
  "Describe a problem once and receive suitable responses",
  "Keep quotes, messages, and job history in one place",
  "A documented support and dispute process",
];

const providerValuePropositionBenefitList = [
  "Local, relevant job opportunities, not cold broadcasts",
  "A profile built on completed work, not just claims",
  "Less time spent on unqualified phone calls",
  "Simple tools for quotes, schedule, and earnings",
  "A fair path to grow reputation as you complete jobs",
];

interface ValuePropositionPanelProps {
  panelTitle: string;
  IconComponent: typeof Search;
  benefitList: string[];
  photographUrl: string;
  photographAlt: string;
  isEmphasized?: boolean;
  revealDelayInSeconds: number;
}

function ValuePropositionPanel({
  panelTitle,
  IconComponent,
  benefitList,
  photographUrl,
  photographAlt,
  isEmphasized = false,
  revealDelayInSeconds,
}: ValuePropositionPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay: revealDelayInSeconds }}
      className={`overflow-hidden rounded-3xl border ${
        isEmphasized ? "border-brand/25 bg-brand-soft/40" : "border-ink/8 bg-white"
      }`}
    >
      <div className="relative aspect-[16/9]">
        <Image
          src={photographUrl}
          alt={photographAlt}
          fill
          sizes="(max-width:1024px) 90vw,45vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/5 to-transparent" />
        <span
          className={`absolute left-6 top-6 grid size-11 place-items-center rounded-2xl ${
            isEmphasized ? "bg-brand text-white" : "bg-white text-ink"
          }`}
        >
          <IconComponent className="size-5" />
        </span>
        <h3 className="absolute bottom-5 left-6 text-xl font-semibold text-white">{panelTitle}</h3>
      </div>
      <ul className="space-y-3.5 p-7 sm:p-8">
        {benefitList.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2.5 text-sm leading-6 text-ink/70">
            <Check className="mt-1 size-4 shrink-0 text-brand" />
            {benefit}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export function CustomerAndProviderValuePropositionSection() {
  return (
    <section className="border-y border-ink/8 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-8 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="max-w-2xl"
        >
          <SectionEyebrowLabel>Built for both sides of the job</SectionEyebrowLabel>
          <h2 className="mt-3 text-4xl sm:text-5xl">
            A better deal for the person asking, and the person doing the work.
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <ValuePropositionPanel
            panelTitle="For customers"
            IconComponent={Search}
            benefitList={customerValuePropositionBenefitList}
            photographUrl="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=1200&q=88"
            photographAlt="A customer using a laptop at home to review local service options"
            revealDelayInSeconds={0}
          />
          <ValuePropositionPanel
            panelTitle="For providers"
            IconComponent={HardHat}
            benefitList={providerValuePropositionBenefitList}
            photographUrl="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1000&q=85"
            photographAlt="A local provider completing an electrical job"
            isEmphasized
            revealDelayInSeconds={0.1}
          />
        </div>
      </div>
    </section>
  );
}
