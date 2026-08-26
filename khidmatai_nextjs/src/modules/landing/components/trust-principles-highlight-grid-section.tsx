"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BadgeCheck, Check, FileClock, Mic, Quote, ShieldCheck, Sparkles, Star } from "lucide-react";
import { SectionEyebrowLabel } from "@/modules/landing/components/section-eyebrow-label";

const voiceWaveformBarHeightList = [18, 31, 22, 42, 30, 52, 38, 27, 46, 34, 20, 39, 25, 16];

export function TrustPrinciplesHighlightGridSection() {
  return (
    <section className="border-y border-white/8 bg-ink py-20 text-white sm:py-28">
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-8 lg:px-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} className="max-w-2xl">
          <SectionEyebrowLabel isOnDarkBackground>Built for real service jobs</SectionEyebrowLabel>
          <h2 className="mt-3 text-4xl sm:text-5xl">Every step gives you more clarity.</h2>
          <p className="mt-5 text-lg leading-7 text-white/55">From describing the problem to reviewing finished work, the details stay visible and understandable.</p>
        </motion.div>

        <div className="mt-12 grid auto-rows-[minmax(250px,auto)] gap-5 lg:grid-cols-12">
          <motion.article initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative overflow-hidden rounded-[2rem] bg-brand p-7 text-white lg:col-span-7 lg:row-span-2 sm:p-9">
            <div className="absolute -right-16 -top-20 size-72 rounded-full border-[45px] border-white/10" />
            <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-xs font-semibold"><Sparkles className="size-3.5" /> AI-assisted request</span>
            <h3 className="mt-8 max-w-md text-3xl leading-tight sm:text-4xl">Say it naturally. We&apos;ll make it clear.</h3>
            <p className="mt-4 max-w-lg text-sm leading-7 text-white/70">Type or speak in your own words. KhidmatAI suggests the service, urgency, and useful questions—then lets you correct everything before sending.</p>
            <div className="mt-10 rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm sm:p-5"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-full bg-white text-brand"><Mic className="size-5" /></span><div className="flex h-14 flex-1 items-center justify-center gap-1">{voiceWaveformBarHeightList.map((height, index) => <span key={`${height}-${index}`} className="w-1 rounded-full bg-white/80" style={{ height }} />)}</div><span className="text-xs text-white/60">0:12</span></div><p className="mt-4 rounded-2xl bg-white p-4 text-sm leading-6 text-ink">&ldquo;The kitchen tap has been leaking since last night and I need someone this afternoon.&rdquo;</p></div>
          </motion.article>

          <motion.article initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }} className="overflow-hidden rounded-[2rem] border border-ink/8 bg-white lg:col-span-5">
            <div className="grid h-full grid-cols-[1fr_0.9fr]"><div className="p-7"><span className="grid size-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><ShieldCheck className="size-5" /></span><h3 className="mt-6 text-xl">Know what was checked.</h3><p className="mt-3 text-sm leading-6 text-ink/60">Verification is specific and dated—not a vague promise.</p><div className="mt-5 space-y-2 text-xs font-medium text-ink/65"><p className="flex items-center gap-2"><Check className="size-3.5 text-emerald-600" /> Phone ownership</p><p className="flex items-center gap-2"><Check className="size-3.5 text-emerald-600" /> Identity review</p></div></div><div className="relative min-h-64"><Image src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=700&q=88" alt="An electrician completing professional work" fill sizes="(max-width:1024px) 40vw,18vw" className="object-cover" /><div className="absolute bottom-4 left-4 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow"><BadgeCheck className="mr-1 inline size-3.5" /> Reviewed</div></div></div>
          </motion.article>

          <motion.article initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.12 }} className="rounded-[2rem] border border-white/10 bg-[#20283f] p-7 text-white lg:col-span-5">
            <div className="flex items-center justify-between"><span className="grid size-11 place-items-center rounded-2xl bg-white/10 text-accent-warm"><Quote className="size-5" /></span><span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">Verified booking</span></div><blockquote className="mt-7 text-xl leading-8">&ldquo;The quote was clear, he arrived on time, and there were no surprise charges.&rdquo;</blockquote><div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5"><div><p className="text-sm font-semibold">Recent customer</p><p className="text-xs text-white/45">Electrical repair</p></div><div className="flex text-accent-warm">{Array.from({ length: 5 }, (_, index) => <Star key={index} className="size-4 fill-current" />)}</div></div>
          </motion.article>

          <motion.article initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.16 }} className="rounded-[2rem] border border-ink/8 bg-white p-7 lg:col-span-5">
            <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-brand">Quote comparison</p><h3 className="mt-2 text-xl">See what the price includes.</h3></div><span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">PKR</span></div><div className="mt-6 space-y-3">{[["Call-out & inspection", "500"], ["Labor", "1,500"], ["Estimated materials", "800"]].map(([label, amount]) => <div key={label} className="flex items-center justify-between rounded-xl bg-[#f7f7fb] px-4 py-3 text-sm"><span className="text-ink/55">{label}</span><span className="font-semibold">{amount}</span></div>)}</div><div className="mt-4 flex items-center justify-between border-t border-ink/8 pt-4"><span className="text-sm font-semibold">Estimated total</span><span className="text-lg font-semibold text-brand">PKR 2,800</span></div>
          </motion.article>

          <motion.article initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="relative min-h-80 overflow-hidden rounded-[2rem] lg:col-span-7"><Image src="https://images.unsplash.com/photo-1523413363574-c30aa1c2a516?auto=format&fit=crop&w=1200&q=90" alt="Detailed professional finishing work" fill sizes="(max-width:1024px) 90vw,55vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/55 to-transparent" /><div className="relative max-w-sm p-7 text-white sm:p-9"><span className="grid size-11 place-items-center rounded-2xl bg-white/15"><FileClock className="size-5" /></span><h3 className="mt-8 text-2xl">A job history you can return to.</h3><p className="mt-3 text-sm leading-7 text-white/65">Accepted quotes, schedule changes, messages, completion, and reviews stay connected to the same booking.</p></div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
