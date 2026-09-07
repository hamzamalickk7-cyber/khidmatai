"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, HardHat, Search, type LucideIcon } from "lucide-react";
import { SectionEyebrowLabel } from "@/modules/landing/components/section-eyebrow-label";

interface AudiencePanel {
  title: string;
  description: string;
  benefits: string[];
  actionLabel: string;
  actionHref: string;
  imageUrl: string;
  imageAlt: string;
  IconComponent: LucideIcon;
}

const audiencePanelList: AudiencePanel[] = [
  {
    title: "I need a service",
    description: "Find the right local professional without calling everyone you know.",
    benefits: ["Search by job and area", "Compare profiles and reviews", "Keep booking details together"],
    actionLabel: "Explore providers",
    actionHref: "/explore",
    imageUrl: "/images/landing/customer-requesting-home-service.png",
    imageAlt: "Pakistani customer requesting help with a kitchen tap",
    IconComponent: Search,
  },
  {
    title: "I provide a service",
    description: "Turn your practical skills into visible, trusted local work.",
    benefits: ["Build a credible work profile", "Receive relevant opportunities", "Grow through completed-job reviews"],
    actionLabel: "Join as a provider",
    actionHref: "/register",
    imageUrl: "/images/landing/provider-ready-for-service-job.png",
    imageAlt: "Pakistani air-conditioning technician ready for a local service job",
    IconComponent: HardHat,
  },
];

export function CustomerAndProviderValuePropositionSection() {
  return (
    <section className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <SectionEyebrowLabel>Built for both sides</SectionEyebrowLabel>
          <h2 className="mt-3 text-3xl leading-tight sm:text-4xl">Choose the side that sounds like you.</h2>
          <p className="text-ink/60 mt-4 leading-7">
            One marketplace, with a clear experience for customers and service professionals.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {audiencePanelList.map((panel, index) => (
            <motion.article
              key={panel.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="border-border grid overflow-hidden rounded-2xl border bg-white sm:grid-cols-[0.92fr_1.08fr]"
            >
              <div className="flex flex-col p-6 sm:p-7">
                <span className="bg-ink-soft text-flash grid size-10 place-items-center rounded-lg">
                  <panel.IconComponent className="size-4.5" />
                </span>
                <h3 className="mt-6 text-2xl font-semibold">{panel.title}</h3>
                <p className="text-ink/55 mt-3 text-sm leading-6">{panel.description}</p>
                <ul className="mt-6 space-y-3">
                  {panel.benefits.map((benefit) => (
                    <li key={benefit} className="text-ink/70 flex items-start gap-2 text-sm">
                      <Check className="text-brand mt-0.5 size-4 shrink-0" /> {benefit}
                    </li>
                  ))}
                </ul>
                <Link
                  href={panel.actionHref}
                  className="text-brand hover:text-brand-deep mt-7 inline-flex items-center gap-2 text-sm font-bold"
                >
                  {panel.actionLabel} <ArrowRight className="size-4" />
                </Link>
              </div>
              <div className="relative min-h-72 sm:min-h-full">
                <Image
                  src={panel.imageUrl}
                  alt={panel.imageAlt}
                  fill
                  sizes="(max-width:640px) 90vw,25vw"
                  className="object-cover"
                />
                <div className="from-ink/20 absolute inset-0 bg-gradient-to-t to-transparent" />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
