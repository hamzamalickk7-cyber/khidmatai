import Link from "next/link";
import { Clock3, type LucideIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface SimpleComingSoonPageViewProperties {
  title: string;
  description: string;
  IconComponent: LucideIcon;
}

export function SimpleComingSoonPageView({ title, description, IconComponent }: SimpleComingSoonPageViewProperties) {
  return (
    <main className="flex flex-1 items-center justify-center bg-[#fafafa] px-5 py-20">
      <section className="w-full max-w-xl rounded-3xl border border-ink/10 bg-white px-7 py-12 text-center shadow-[0_24px_70px_-55px_rgba(11,15,29,.45)] sm:px-12">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand"><IconComponent className="size-6" /></span>
        <p className="mt-6 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-brand"><Clock3 className="size-3.5" /> Coming soon</p>
        <h1 className="mt-3 text-3xl sm:text-4xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-ink/55">{description}</p>
        <Link href="/dashboard" className={buttonVariants({ variant: "outline", className: "mt-7 rounded-full px-5" })}>Back to dashboard</Link>
      </section>
    </main>
  );
}
