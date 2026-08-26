"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function ProviderRecruitmentCallToActionSection() {
  return (
    <section id="providers" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-8 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[2.5rem]"
        >
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1600&q=85"
              alt="A skilled local service professional at work"
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-deep/95 via-brand/90 to-brand/70" />
          </div>

          <div className="relative grid gap-10 px-7 py-14 text-white sm:px-14 sm:py-16 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-white/70">
                Are you a skilled professional?
              </p>
              <h2 className="mt-4 max-w-2xl text-4xl sm:text-5xl">Turn your skills into steady local work.</h2>
              <p className="mt-5 max-w-2xl leading-7 text-white/85">
                Build a verified profile, receive relevant local opportunities, and grow your
                reputation through completed jobs, not ad spend.
              </p>
            </div>
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-white transition hover:bg-black"
            >
              Apply as a provider <ArrowRight className="size-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
