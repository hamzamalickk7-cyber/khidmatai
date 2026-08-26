"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, CalendarCheck, Camera, Check, Clock3, MapPin, MessageSquareText, Sparkles, Star } from "lucide-react";
import { SectionEyebrowLabel } from "@/modules/landing/components/section-eyebrow-label";

export function HowItWorksProcessTimelineSection() {
  return (
    <section id="how-it-works" className="scroll-mt-24 overflow-hidden border-y border-ink/8 bg-brand-soft/35 py-20 sm:py-28">
      <div className="mx-auto grid max-w-screen-2xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-7 lg:px-8">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionEyebrowLabel>How KhidmatAI works</SectionEyebrowLabel>
          <h2 className="mt-3 max-w-lg text-4xl sm:text-5xl">From &ldquo;something&apos;s wrong&rdquo; to sorted.</h2>
          <p className="mt-5 max-w-md text-lg leading-8 text-ink/60">One guided journey replaces scattered calls, unclear prices, and forgotten details.</p>
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-brand/15 bg-white p-4 shadow-sm"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand text-white"><Sparkles className="size-4" /></span><p className="text-sm leading-6 text-ink/60"><strong className="text-ink">You stay in control.</strong> AI can organize the request, but you review it before anything is shared.</p></div>
          <Link href="/#book-a-service-request" className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-white transition hover:bg-brand-deep">Start a service request <ArrowRight className="size-4" /></Link>
          <div className="mt-10 grid max-w-lg gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {["Clear request details", "Relevant local matches", "One job record"].map((benefitLabel) => <div key={benefitLabel} className="flex items-center gap-2 rounded-xl border border-ink/8 bg-white px-3 py-3 text-xs font-medium text-ink/65"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Check className="size-3" /></span>{benefitLabel}</div>)}
          </div>
          <div className="mt-6 max-w-lg rounded-[1.5rem] border border-ink/8 bg-white p-5 shadow-[0_18px_45px_-38px_rgba(11,15,29,.3)]">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Before it goes live</p><h3 className="mt-2 text-lg">Review your request summary</h3></div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[0.65rem] font-semibold text-emerald-700">You approve it</span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {["Suggested service category", "Problem and urgency", "Approximate service area", "Preferred date and time"].map((requestDetail) => <p key={requestDetail} className="flex items-center gap-2 text-xs text-ink/60"><Check className="size-3.5 shrink-0 text-brand" />{requestDetail}</p>)}
            </div>
            <p className="mt-5 border-t border-ink/8 pt-4 text-xs leading-5 text-ink/45">Nothing is sent to a provider until you have checked and confirmed the details.</p>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-3xl space-y-4 before:absolute before:bottom-8 before:left-5 before:top-8 before:w-px before:bg-brand/15 sm:space-y-5 sm:before:left-6">
          <ProcessCard number="01" title="Tell us what needs attention" description="Type it, speak it, or add a photo. Useful follow-up questions help turn the problem into a request providers can understand." accentClassName="bg-brand text-white" delay={0}>
            <div className="rounded-2xl border border-ink/8 bg-[#f7f7fb] p-4"><div className="flex gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-brand shadow-sm"><MessageSquareText className="size-4" /></span><div><p className="text-[0.65rem] font-bold uppercase tracking-wider text-ink/35">Your description</p><p className="mt-1 text-sm leading-6 text-ink/70">&ldquo;The kitchen tap has been leaking since last night.&rdquo;</p></div></div><div className="mt-3 flex flex-wrap gap-2 pl-13"><span className="rounded-full bg-white px-2.5 py-1 text-[0.68rem] text-ink/55 shadow-sm">Plumbing</span><span className="rounded-full bg-white px-2.5 py-1 text-[0.68rem] text-ink/55 shadow-sm">Kitchen</span><span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[0.68rem] text-ink/55 shadow-sm"><Camera className="size-3" /> 2 photos</span></div></div>
          </ProcessCard>

          <ProcessCard number="02" title="Review professionals who actually fit" description="See providers matched to the service, your area, availability, and category requirements—not an endless directory." accentClassName="bg-emerald-600 text-white" delay={0.08}>
            <div className="space-y-2.5">{[["UR","Usman Riaz","4.9","15 min"],["AH","Adeel Hassan","4.8","25 min"]].map(([initials,name,rating,time])=><div key={name} className="flex items-center gap-3 rounded-2xl border border-ink/8 bg-white p-3"><span className="grid size-10 place-items-center rounded-full bg-ink text-xs font-bold text-white">{initials}</span><div className="min-w-0 flex-1"><p className="flex items-center gap-1 truncate text-sm font-semibold">{name}<BadgeCheck className="size-3.5 shrink-0 text-brand" /></p><p className="mt-0.5 text-xs text-ink/45">Plumbing specialist</p></div><div className="text-right"><p className="flex items-center gap-1 text-xs font-semibold"><Star className="size-3 fill-accent-warm text-accent-warm" />{rating}</p><p className="mt-1 text-[0.65rem] text-ink/40">{time} away</p></div></div>)}</div>
          </ProcessCard>

          <ProcessCard number="03" title="Compare the details, then choose" description="Review scope, price, arrival time, inclusions, and provider history before accepting a quote or booking." accentClassName="bg-accent-warm text-ink" delay={0.16}>
            <div className="overflow-hidden rounded-2xl border border-ink/8"><div className="grid grid-cols-[1fr_auto_auto] gap-4 bg-[#f7f7fb] px-4 py-2.5 text-[0.62rem] font-bold uppercase tracking-wider text-ink/35"><span>Quote</span><span>Arrival</span><span>Total</span></div>{[["Usman Riaz","Today, 3 PM","2,800"],["Adeel Hassan","Today, 5 PM","2,500"]].map(([name,time,total],index)=><div key={name} className={`grid grid-cols-[1fr_auto_auto] items-center gap-4 px-4 py-3 text-xs ${index===0 ? "bg-brand-soft/60" : "border-t border-ink/8 bg-white"}`}><span className="font-semibold">{name}{index===0 && <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-[0.58rem] text-white">Best match</span>}</span><span className="text-ink/50">{time}</span><span className="font-semibold">PKR {total}</span></div>)}</div>
          </ProcessCard>

          <ProcessCard number="04" title="Keep the job accountable" description="Track confirmation, timing, approved changes, completion, and support in a single booking record." accentClassName="bg-ink text-white" delay={0.24}>
            <div className="rounded-2xl bg-ink p-4 text-white"><div className="flex items-center justify-between"><div><p className="text-xs text-white/45">Kitchen tap repair</p><p className="mt-1 text-sm font-semibold">Booking #KHI-1024</p></div><span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[0.68rem] font-semibold text-emerald-300">Confirmed</span></div><div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-xs"><div><p className="text-white/40">Scheduled</p><p className="mt-1 flex items-center gap-1 font-medium"><Clock3 className="size-3" />Today, 3–4 PM</p></div><div><p className="text-white/40">Service area</p><p className="mt-1 flex items-center gap-1 font-medium"><MapPin className="size-3" />Gulberg III</p></div></div><p className="mt-4 flex items-center gap-2 rounded-xl bg-white/8 px-3 py-2.5 text-xs text-white/70"><CalendarCheck className="size-4 text-emerald-300" /> Provider confirmed your booking</p></div>
          </ProcessCard>
        </div>
      </div>
    </section>
  );
}

interface ProcessCardProps { number: string; title: string; description: string; accentClassName: string; delay: number; children: React.ReactNode; }
function ProcessCard({ number, title, description, accentClassName, delay, children }: ProcessCardProps) {
  return <motion.article initial={{ opacity:0,y:24 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true,margin:"-70px" }} transition={{ duration:.55,delay }} className="relative ml-10 rounded-[1.5rem] border border-ink/8 bg-white p-5 shadow-[0_20px_48px_-38px_rgba(11,15,29,.25)] sm:ml-12 sm:p-6"><span className={`absolute -left-10 top-6 grid size-10 place-items-center rounded-xl text-xs font-bold shadow-md sm:-left-12 ${accentClassName}`}>{number}</span><h3 className="text-xl">{title}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-ink/55">{description}</p><div className="mt-5">{children}</div></motion.article>;
}
