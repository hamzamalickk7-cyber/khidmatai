import Link from "next/link";
import { ArrowRight, House, MapPinOff, Search, Wrench } from "lucide-react";

export function PageNotFoundState() {
  return (
    <main className="flex flex-1 items-center bg-white px-5 py-16 sm:px-8 lg:py-24">
      <div className="bg-brand-soft/30 border-ink/8 mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border shadow-[0_32px_90px_-55px_rgba(11,15,29,.45)] lg:grid-cols-[1.05fr_.95fr]">
        <section className="p-8 sm:p-12 lg:p-16">
          <div className="flex items-center gap-3">
            <span className="bg-ink grid size-11 place-items-center rounded-2xl text-white">
              <MapPinOff className="size-5" />
            </span>
            <span className="border-brand/15 text-brand rounded-full border bg-white px-3 py-1 text-xs font-bold tracking-[.16em] uppercase">
              Error 404
            </span>
          </div>
          <h1 className="text-ink mt-9 max-w-xl text-5xl leading-[1.03] text-balance sm:text-6xl">
            We could not find this address.
          </h1>
          <p className="text-ink/55 mt-5 max-w-lg text-lg leading-8">
            This page may have moved, or the link may no longer be available. Your KhidmatAI account and requests are
            unaffected.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="bg-brand hover:bg-brand-deep inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-white transition"
            >
              <House className="size-4" />
              Go to homepage
            </Link>
            <Link
              href="/explore"
              className="border-ink/10 text-ink hover:border-brand/30 inline-flex h-12 items-center justify-center gap-2 rounded-full border bg-white px-6 text-sm font-semibold transition"
            >
              <Search className="size-4" />
              Explore providers
            </Link>
          </div>
        </section>
        <aside className="bg-ink relative min-h-80 overflow-hidden p-8 text-white sm:p-12 lg:min-h-full">
          <div className="absolute -top-24 -right-24 size-72 rounded-full border border-white/10" />
          <div className="border-brand/30 absolute -bottom-32 -left-20 size-80 rounded-full border" />
          <div className="relative flex h-full flex-col justify-between">
            <p className="text-sm font-semibold text-white/50">Still need help?</p>
            <div className="my-12">
              <div className="bg-brand grid size-20 place-items-center rounded-[1.75rem] shadow-[0_20px_50px_-20px_rgba(79,70,229,.8)]">
                <Wrench className="size-8" />
              </div>
              <h2 className="mt-7 text-3xl">Find a local professional instead.</h2>
              <p className="mt-4 max-w-sm leading-7 text-white/55">
                Browse electricians, plumbers, mechanics, welders, and trusted home-service providers.
              </p>
            </div>
            <Link href="/explore" className="text-brand-light inline-flex items-center gap-2 text-sm font-semibold">
              Browse local providers
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
