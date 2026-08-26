import Link from "next/link";
import { ArrowRight, MapPinned } from "lucide-react";

export function PilotServiceAvailabilitySection() {
  return (
    <section aria-label="KhidmatAI pilot availability" className="border-y border-ink/8 bg-ink text-white">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-5 px-5 py-6 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
        <div className="flex items-start gap-3 sm:items-center">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-accent-warm"><MapPinned className="size-5" /></span>
          <div><p className="text-sm font-semibold">KhidmatAI is preparing its first local pilot.</p><p className="mt-1 text-xs leading-5 text-white/55">Join the early-access list and help us choose the first neighborhoods and services.</p></div>
        </div>
        <Link href="/#book-a-service-request" className="inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-accent-warm">Request early access <ArrowRight className="size-4" /></Link>
      </div>
    </section>
  );
}
