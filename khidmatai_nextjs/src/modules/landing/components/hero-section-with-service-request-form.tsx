import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Car,
  Check,
  Clock3,
  Droplets,
  MapPin,
  Search,
  Snowflake,
  Sparkles,
  Star,
  Zap,
  type LucideIcon,
} from "lucide-react";

type ServiceCategory = {
  label: string;
  icon: LucideIcon;
  href: string;
};

const serviceCategories: ServiceCategory[] = [
  { label: "Electrical", icon: Zap, href: "/explore?service=electrical" },
  { label: "Plumbing", icon: Droplets, href: "/explore?service=plumbing" },
  { label: "AC & cooling", icon: Snowflake, href: "/explore?service=air-conditioning" },
  { label: "Home care", icon: Sparkles, href: "/explore?service=home-care" },
  { label: "Automotive", icon: Car, href: "/explore?service=automotive" },
];

export function HeroSectionWithServiceRequestForm() {
  return (
    <section className="border-border bg-background border-b">
      <div className="mx-auto max-w-screen-2xl px-3 py-3 sm:px-6 sm:py-5 lg:px-8 lg:py-4">
        <div className="bg-ink-soft overflow-hidden shadow-[0_22px_70px_rgba(20,83,45,0.18)] sm:rounded-2xl">
          <div className="grid lg:grid-cols-[0.88fr_1.12fr]">
            <div className="relative isolate flex flex-col justify-center overflow-hidden px-6 py-11 sm:px-10 sm:py-14 lg:px-12 lg:py-10">
              <div className="bg-brand/35 absolute top-10 -left-20 -z-10 h-64 w-64 rounded-full blur-3xl" />
              <div className="bg-flash/10 absolute top-0 right-0 -z-10 h-40 w-40 blur-3xl" />

              <div className="mb-5 flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold tracking-wide text-white">
                <span className="bg-flash h-2 w-2 rounded-full shadow-[0_0_12px_#c7f04b]" />
                Local services · Islamabad pilot
              </div>

              <h1 className="font-heading max-w-xl text-4xl leading-[1.02] font-semibold tracking-[-0.045em] text-white sm:text-5xl lg:text-[3.35rem]">
                Your city has someone who can fix it.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-white/70 sm:text-lg">
                Describe the job, choose your area, and discover trusted local professionals without the usual
                guesswork.
              </p>

              <form action="/explore" className="mt-8 max-w-lg rounded-xl bg-white p-2.5 shadow-2xl" method="get">
                <div className="grid gap-2">
                  <label className="bg-muted focus-within:bg-brand-soft flex min-h-14 items-center gap-3 rounded-lg px-4 transition-colors">
                    <Search className="text-brand size-5 shrink-0" aria-hidden="true" />
                    <span className="sr-only">Service needed</span>
                    <input
                      className="text-foreground placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm font-medium outline-none"
                      name="query"
                      placeholder="What needs fixing?"
                      type="search"
                    />
                  </label>
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    <label className="border-border focus-within:border-brand flex min-h-14 items-center gap-3 rounded-lg border px-4 transition-colors">
                      <MapPin className="text-accent-warm size-5 shrink-0" aria-hidden="true" />
                      <span className="sr-only">Your area</span>
                      <input
                        className="text-foreground placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm font-medium outline-none"
                        name="location"
                        placeholder="Your area in Islamabad"
                        type="text"
                      />
                    </label>
                    <button
                      className="group bg-flash text-ink focus-visible:outline-flash flex min-h-14 items-center justify-center gap-2 rounded-lg px-6 text-sm font-bold transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2"
                      type="submit"
                    >
                      Find help
                      <ArrowRight
                        className="size-4 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>
              </form>

              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-white/65">
                {["Identity checks", "Clear quotes", "Real job reviews"].map((item) => (
                  <span className="flex items-center gap-1.5" key={item}>
                    <Check className="text-flash size-3.5" aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative min-h-[430px] overflow-hidden lg:min-h-[540px]">
              <Image
                alt="A local electrician working carefully on a residential electrical panel"
                className="object-cover object-center"
                fill
                priority
                sizes="(min-width: 1024px) 56vw, 100vw"
                src="/images/landing/islamabad-electrician-hero.png"
              />
              <div className="from-ink/75 to-ink/10 lg:from-ink-soft/55 absolute inset-0 bg-gradient-to-t via-transparent lg:bg-gradient-to-r lg:via-transparent lg:to-transparent" />

              <div className="text-ink absolute top-5 right-5 flex items-center gap-2 rounded-full border border-white/50 bg-white/90 px-3 py-2 text-xs font-semibold shadow-lg backdrop-blur-md sm:top-7 sm:right-7">
                <span className="relative flex size-2.5">
                  <span className="bg-brand absolute inline-flex size-full animate-ping rounded-full opacity-50" />
                  <span className="bg-brand relative inline-flex size-2.5 rounded-full" />
                </span>
                Professionals available nearby
              </div>

              <div className="absolute right-5 bottom-5 left-5 rounded-xl border border-white/25 bg-white/94 p-4 shadow-2xl backdrop-blur-md sm:right-auto sm:bottom-7 sm:left-7 sm:w-[340px]">
                <p className="text-ink/40 mb-2 text-[9px] font-bold tracking-widest uppercase">Illustrative profile</p>
                <div className="flex items-center gap-3">
                  <div className="bg-brand-soft relative size-12 shrink-0 overflow-hidden rounded-full">
                    <Image
                      alt="Bilal Ahmed, verified local electrician"
                      className="object-cover"
                      fill
                      sizes="48px"
                      src="/images/landing/bilal-ahmed-provider-portrait.png"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-ink truncate text-sm font-bold">Bilal Ahmed</p>
                      <BadgeCheck className="fill-brand size-4 shrink-0 text-white" aria-label="Verified provider" />
                    </div>
                    <p className="text-muted-foreground text-xs">Residential electrician · F-8, Islamabad</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                    4.9
                  </div>
                </div>
                <div className="border-border mt-3 flex items-center justify-between border-t pt-3 text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Clock3 className="text-brand size-3.5" aria-hidden="true" /> Available today
                  </span>
                  <Link className="text-brand hover:text-brand-deep font-bold" href="/explore">
                    View profile →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <nav aria-label="Popular service categories" className="border-border border-t bg-white">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              {serviceCategories.map(({ label, icon: Icon, href }, index) => (
                <Link
                  className={`group hover:bg-brand-soft flex min-h-16 items-center gap-3 px-5 py-3 transition-colors ${
                    index !== serviceCategories.length - 1 ? "lg:border-border lg:border-r" : ""
                  }`}
                  href={href}
                  key={label}
                >
                  <span className="bg-ink-soft text-flash flex size-9 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105 group-hover:-rotate-3">
                    <Icon className="size-4.5" aria-hidden="true" />
                  </span>
                  <span className="text-ink text-sm font-bold">{label}</span>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </section>
  );
}
