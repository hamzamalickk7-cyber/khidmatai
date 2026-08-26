"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Check, MapPin, Search, Sparkles, Star } from "lucide-react";

const heroTrustChipLabelList = ["Verified identity", "Itemized quotes", "Reviews tied to real jobs"];

export function HeroSectionWithServiceRequestForm() {
  return (
    <section className="relative overflow-hidden bg-[#f7f7fb]">
      <div className="absolute -left-52 top-[-180px] size-[34rem] rounded-full bg-brand/10 blur-[130px]" />
      <div className="absolute right-0 top-0 hidden h-full w-[42%] bg-brand-soft/60 lg:block" />

      <div className="relative mx-auto grid max-w-screen-2xl items-center gap-12 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-10 lg:pb-24 lg:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/15 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink/70 shadow-sm">
            <Sparkles className="size-3.5 text-brand" /> Smart matching. Real local professionals.
          </div>

          <h1 className="mt-7 max-w-2xl text-balance text-5xl leading-[1.02] tracking-[-0.04em] sm:text-6xl xl:text-[4.25rem]">
            Skilled local help, <span className="relative text-brand">without the guesswork.<span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-accent-warm/70" /></span>
          </h1>

          <p className="mt-6 max-w-lg text-pretty text-lg leading-8 text-ink/65">
            Tell us what needs doing. KhidmatAI helps you find suitable nearby professionals, compare clear quotes, and keep the whole job in one place.
          </p>

          <form
            id="book-a-service-request"
            action="/"
            method="get"
            className="relative z-20 mt-8 max-w-2xl scroll-mt-28 rounded-2xl border border-ink/10 bg-white p-1.5 shadow-[0_22px_55px_-28px_rgba(11,15,29,0.28)] lg:mr-[-3rem]"
          >
            <div className="grid gap-1 sm:grid-cols-[1fr_.75fr_auto] sm:items-center sm:gap-0">
              <label htmlFor="service-search-query" className="flex min-w-0 items-center gap-2.5 rounded-xl px-3 py-2 focus-within:bg-brand-soft/50">
                <Search className="size-4 shrink-0 text-brand" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.6rem] font-semibold uppercase tracking-wider text-ink/45">Service needed</span>
                  <input id="service-search-query" name="service" required autoComplete="off" className="w-full bg-transparent text-[0.8rem] font-medium outline-none placeholder:font-normal placeholder:text-ink/40" placeholder="e.g. leaking kitchen tap" />
                </span>
              </label>
              <label htmlFor="service-area-query" className="flex min-w-0 items-center gap-2.5 rounded-xl border-t border-ink/8 px-3 py-2 focus-within:bg-brand-soft/50 sm:border-l sm:border-t-0">
                <MapPin className="size-4 shrink-0 text-brand" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.6rem] font-semibold uppercase tracking-wider text-ink/45">Your area</span>
                  <input id="service-area-query" name="area" required autoComplete="address-level3" className="w-full bg-transparent text-[0.8rem] font-medium outline-none placeholder:font-normal placeholder:text-ink/40" placeholder="e.g. Gulberg III" />
                </span>
              </label>
              <button
                className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-ink px-5 text-xs font-semibold text-white transition hover:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                type="submit"
              >
                Find help <ArrowRight className="size-4" />
              </button>
            </div>
          </form>

          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink/65">
            {heroTrustChipLabelList.map((trustChipLabel) => (
              <span key={trustChipLabel} className="flex items-center gap-2">
                <Check className="size-4 text-brand" />
                {trustChipLabel}
              </span>
            ))}
          </div>
        </motion.div>

        <HeroServicePhotographyCollage />
      </div>
    </section>
  );
}

function HeroServicePhotographyCollage() {
  return (
    <motion.div
      className="relative mx-auto min-h-[400px] w-full max-w-[620px] sm:min-h-[500px]"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
    >
      <div className="absolute bottom-14 left-[4%] top-[4%] w-[68%] overflow-hidden rounded-[1.75rem] shadow-[0_32px_65px_-30px_rgba(11,15,29,0.32)] sm:left-[8%]">
        <Image
          src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=90"
          alt="An electrician safely carrying out a home repair"
          fill
          priority
          sizes="(max-width:1024px) 68vw,38vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent" />
      </div>

      <div className="absolute right-[2%] top-[10%] h-[36%] w-[32%] overflow-hidden rounded-[1.4rem] border-[6px] border-[#f7f7fb] shadow-lg"><Image src="https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=700&q=88" alt="A plumber repairing a household water fixture" fill sizes="(max-width:1024px) 30vw,17vw" className="object-cover" /></div>
      <div className="absolute bottom-[4%] right-[5%] h-[37%] w-[37%] overflow-hidden rounded-[1.4rem] border-[6px] border-[#f7f7fb] shadow-lg"><Image src="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=800&q=88" alt="A car mechanic working in a local garage" fill sizes="(max-width:1024px) 34vw,20vw" className="object-cover" /></div>

      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-8 left-0 flex items-center gap-3 rounded-2xl border border-white/70 bg-white/95 p-3.5 pr-5 shadow-xl backdrop-blur"><span className="grid size-10 place-items-center rounded-full bg-brand-soft text-brand"><BadgeCheck className="size-5" /></span><div><p className="text-sm font-semibold text-ink">Profiles with real detail</p><p className="mt-0.5 flex items-center gap-1 text-xs text-ink/50"><Star className="size-3 fill-accent-warm text-accent-warm" /> Skills, history &amp; reviews</p></div></motion.div>
    </motion.div>
  );
}
