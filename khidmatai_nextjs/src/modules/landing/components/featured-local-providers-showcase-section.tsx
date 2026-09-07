"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Clock3, MapPin, Star } from "lucide-react";
import { SectionEyebrowLabel } from "@/modules/landing/components/section-eyebrow-label";

const dummyProviderProfileList = [
  {
    fullName: "Bilal Ahmed",
    trade: "Residential electrician",
    experience: "9 years experience",
    rating: "4.9",
    jobs: 126,
    area: "F-8 & nearby",
    availability: "Available today",
    response: "Usually replies in 20 min",
    price: "PKR 1,200",
    image: "/images/landing/bilal-ahmed-electrician-provider.png",
    services: ["Wiring", "Fault repair", "Lighting"],
  },
  {
    fullName: "Ahsan Malik",
    trade: "Home care specialist",
    experience: "6 years experience",
    rating: "4.8",
    jobs: 94,
    area: "G-11 & nearby",
    availability: "Next slot at 2 PM",
    response: "Usually replies in 35 min",
    price: "PKR 2,500",
    image: "/images/landing/ahsan-malik-home-care-provider.png",
    services: ["Deep cleaning", "Kitchen", "Move-in"],
  },
  {
    fullName: "Usman Riaz",
    trade: "Plumbing specialist",
    experience: "11 years experience",
    rating: "4.9",
    jobs: 158,
    area: "Bahria Town & nearby",
    availability: "Available tomorrow",
    response: "Usually replies in 15 min",
    price: "PKR 1,000",
    image: "/images/landing/usman-riaz-plumber-provider.png",
    services: ["Leaks", "Blockages", "Fittings"],
  },
  {
    fullName: "Hamza Ali",
    trade: "Automotive technician",
    experience: "8 years experience",
    rating: "4.7",
    jobs: 73,
    area: "I-8 & nearby",
    availability: "Available today",
    response: "Usually replies in 40 min",
    price: "PKR 1,500",
    image: "/images/landing/hamza-ali-automotive-provider.png",
    services: ["Diagnostics", "Battery", "Electrical"],
  },
] as const;

export function FeaturedLocalProvidersShowcaseSection() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_.65fr] lg:items-end">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <SectionEyebrowLabel>Meet the professionals</SectionEyebrowLabel>
              <span className="bg-accent-warm-soft rounded-full px-2.5 py-1 text-[0.65rem] font-bold tracking-wider text-amber-700 uppercase">
                Prototype data
              </span>
            </div>
            <h2 className="mt-3 text-4xl sm:text-5xl">See who you&apos;re booking before they arrive.</h2>
          </div>
          <p className="text-ink/55 max-w-lg text-sm leading-7 lg:justify-self-end">
            Each profile brings together relevant trade experience, recent work, service area, availability, pricing,
            and completed-job feedback.
          </p>
        </div>
        <div className="mt-12 grid gap-6 xl:grid-cols-2">
          {dummyProviderProfileList.map((provider, index) => (
            <motion.article
              key={provider.fullName}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              className="group border-ink/8 hover:border-brand/25 grid overflow-hidden rounded-[1.75rem] border bg-white shadow-[0_20px_50px_-38px_rgba(11,15,29,.3)] transition hover:shadow-[0_26px_60px_-36px_rgba(79,70,229,.32)] sm:grid-cols-[.9fr_1.1fr]"
            >
              <div className="relative min-h-64 overflow-hidden bg-neutral-100 sm:min-h-[330px]">
                <Image
                  src={provider.image}
                  alt={`${provider.trade} at work`}
                  fill
                  sizes="(max-width:640px) 90vw,(max-width:1280px) 40vw,22vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.025]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4 pt-16">
                  <span className="inline-flex rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm">
                    {provider.availability}
                  </span>
                </div>
              </div>
              <div className="flex flex-col p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xl">{provider.fullName}</h3>
                      <BadgeCheck className="text-brand size-4 shrink-0" aria-label="Prototype verified provider" />
                    </div>
                    <p className="text-brand mt-1 text-sm font-semibold">{provider.trade}</p>
                    <p className="text-ink/45 mt-1 text-xs">{provider.experience}</p>
                  </div>
                  <span className="bg-accent-warm-soft flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold">
                    <Star className="fill-accent-warm text-accent-warm size-3.5" />
                    {provider.rating}
                  </span>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {provider.services.map((service) => (
                    <span
                      key={service}
                      className="border-ink/8 text-ink/60 rounded-full border bg-[#f7f7fb] px-2.5 py-1 text-[0.68rem] font-medium"
                    >
                      {service}
                    </span>
                  ))}
                </div>
                <div className="border-ink/8 text-ink/50 mt-5 space-y-2.5 border-t pt-4 text-xs">
                  <p className="flex items-center gap-2">
                    <MapPin className="text-brand size-3.5" />
                    {provider.area}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock3 className="text-brand size-3.5" />
                    {provider.response}
                  </p>
                  <p className="flex items-center gap-2">
                    <BadgeCheck className="text-brand size-3.5" />
                    {provider.jobs} completed jobs
                  </p>
                </div>
                <div className="mt-auto flex items-end justify-between gap-3 pt-6">
                  <div>
                    <p className="text-ink/40 text-[0.62rem] font-semibold tracking-wider uppercase">
                      Call-out starts at
                    </p>
                    <p className="mt-1 text-base font-semibold">{provider.price}</p>
                  </div>
                  <Link
                    href="/explore"
                    className="bg-ink hover:bg-brand inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-semibold text-white transition"
                  >
                    Book now <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
        <p className="text-ink/40 mt-6 text-center text-xs">
          All names, availability, ratings, job counts, areas, and prices shown here are prototype data.
        </p>
      </div>
    </section>
  );
}
