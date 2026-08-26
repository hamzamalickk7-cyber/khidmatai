"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Eye, Handshake, Lock, Scale, ShieldCheck, type LucideIcon } from "lucide-react";
import { SectionEyebrowLabel } from "@/modules/landing/components/section-eyebrow-label";

interface SafetyCommitmentDefinition {
  IconComponent: LucideIcon;
  title: string;
  description: string;
}

const safetyCommitmentList: SafetyCommitmentDefinition[] = [
  {
    IconComponent: Lock,
    title: "Delayed address sharing",
    description: "Your exact address is shared only when it's operationally necessary.",
  },
  {
    IconComponent: Eye,
    title: "Reports, blocks & appeals",
    description: "Every account can report a problem and expect a documented response.",
  },
  {
    IconComponent: ShieldCheck,
    title: "Category-specific warnings",
    description: "Hazardous work like gas or electrical carries extra guidance and rules.",
  },
  {
    IconComponent: Handshake,
    title: "Human support for disputes",
    description: "A documented decision process, not an automated black box.",
  },
  {
    IconComponent: Scale,
    title: "No inflated guarantees",
    description: "We state exactly what verification covers, and never more than that.",
  },
];

export function TrustAndSafetyCommitmentSection() {
  return (
    <section id="trust-and-safety" className="scroll-mt-24 border-y border-ink/8 bg-brand-soft/40 py-20 sm:py-28">
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[.85fr_1.15fr]">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:sticky lg:top-28 lg:self-start"
          >
            <SectionEyebrowLabel>Made for peace of mind</SectionEyebrowLabel>
            <h2 className="mt-3 text-4xl sm:text-5xl">
              &ldquo;Verified&rdquo; means something specific here.
            </h2>
            <p className="mt-5 text-lg leading-7 text-ink/60">
              We say exactly what was checked and when. Verification lowers risk; it is never
              marketed as a guarantee.
            </p>
            <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-3xl">
              <Image
                src="https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1000&q=85"
                alt="A finished, high-quality home renovation"
                fill
                sizes="(max-width:1024px) 90vw,40vw"
                className="object-cover"
              />
            </div>
          </motion.div>

          <div className="space-y-6">
            {safetyCommitmentList.map((commitment, commitmentIndex) => (
              <motion.div
                key={commitment.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: commitmentIndex * 0.07 }}
                className="flex items-start gap-5 rounded-2xl bg-white/70 p-5"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white text-brand shadow-sm">
                  <commitment.IconComponent className="size-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-ink">{commitment.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-ink/60">{commitment.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
