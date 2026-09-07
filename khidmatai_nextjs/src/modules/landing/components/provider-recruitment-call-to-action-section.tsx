"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

export function ProviderRecruitmentCallToActionSection() {
  return (
    <section id="providers" className="scroll-mt-24 bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-ink-soft grid overflow-hidden rounded-2xl text-white lg:grid-cols-[1.05fr_0.95fr]"
        >
          <div className="flex flex-col justify-center px-7 py-12 sm:px-12 lg:py-14">
            <p className="text-flash text-xs font-bold tracking-[0.18em] uppercase">For skilled professionals</p>
            <h2 className="mt-4 max-w-xl text-3xl leading-tight sm:text-4xl">Good at what you do?</h2>
            <p className="mt-4 max-w-xl leading-7 text-white/65">
              Create a trusted profile, become visible to nearby customers and grow through work you complete.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/70">
              {["Free to join", "Local opportunities", "Your reputation stays yours"].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <Check className="text-flash size-3.5" /> {item}
                </span>
              ))}
            </div>
            <Link
              href="/register"
              className="bg-flash text-ink mt-8 inline-flex h-12 w-fit items-center justify-center gap-2 rounded-lg px-5 text-sm font-bold transition hover:bg-white"
            >
              Join as a provider <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="relative min-h-80 lg:min-h-[390px]">
            <Image
              src="/images/landing/hamza-ali-automotive-provider.png"
              alt="Pakistani automotive technician working in his local workshop"
              fill
              sizes="(max-width:1024px) 90vw,42vw"
              className="object-cover"
            />
            <div className="from-ink-soft/55 absolute inset-0 bg-gradient-to-r to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
