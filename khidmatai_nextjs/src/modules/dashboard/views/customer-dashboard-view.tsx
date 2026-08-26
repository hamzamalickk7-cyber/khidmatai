import Link from "next/link";
import { CalendarDays, Search, UserRound } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function CustomerDashboardView({ customerName }: { customerName: string }) {
  return (
    <main className="flex-1 bg-[#fafafa] px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-brand">Customer dashboard</p>

        <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl">Welcome, {customerName}</h1>
            <p className="mt-3 text-ink/55">Find reliable local help and keep your bookings organized.</p>
          </div>
          <Link href="/explore" className={buttonVariants({ className: "h-11 gap-2 rounded-full px-5" })}>
            <Search className="size-4" />
            Explore providers
          </Link>
        </div>

        <div className="mt-9 grid gap-4 md:grid-cols-2">
          <DashboardActionCard
            href="/bookings"
            title="Your bookings"
            description="Upcoming and previous service appointments will appear here."
            IconComponent={CalendarDays}
          />
          <DashboardActionCard
            href="/profile"
            title="Complete your profile"
            description="Adding basic details is optional and helps make future bookings faster."
            IconComponent={UserRound}
          />
        </div>
      </div>
    </main>
  );
}

interface DashboardActionCardProps {
  href: string;
  title: string;
  description: string;
  IconComponent: typeof Search;
}

function DashboardActionCard({ href, title, description, IconComponent }: DashboardActionCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-ink/10 bg-white p-6 transition hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-lg"
    >
      <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
        <IconComponent className="size-4" />
      </span>
      <h2 className="mt-5 text-xl">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink/55">{description}</p>
    </Link>
  );
}
