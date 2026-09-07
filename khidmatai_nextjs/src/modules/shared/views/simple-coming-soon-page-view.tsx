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
    <main className="bg-background flex flex-1 items-center justify-center px-5 py-20">
      <section className="border-ink/10 w-full max-w-xl rounded-3xl border bg-white px-7 py-12 text-center shadow-[0_24px_70px_-55px_rgba(11,15,29,.45)] sm:px-12">
        <span className="bg-brand-soft text-brand mx-auto grid size-14 place-items-center rounded-2xl">
          <IconComponent className="size-6" />
        </span>
        <p className="text-brand mt-6 flex items-center justify-center gap-2 text-xs font-bold tracking-[.18em] uppercase">
          <Clock3 className="size-3.5" /> Coming soon
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl">{title}</h1>
        <p className="text-ink/55 mx-auto mt-4 max-w-md text-sm leading-6">{description}</p>
        <Link href="/dashboard" className={buttonVariants({ variant: "outline", className: "mt-7 rounded-full px-5" })}>
          Back to dashboard
        </Link>
      </section>
    </main>
  );
}
