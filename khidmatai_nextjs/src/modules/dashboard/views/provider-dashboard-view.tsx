import Link from "next/link";
import { BriefcaseBusiness, Compass, UserRound } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function ProviderDashboardView({ providerName }: { providerName: string }) {
  return (
    <main className="flex-1 bg-[#fafafa] px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-brand">Provider dashboard</p>

        <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl">Welcome, {providerName}</h1>
            <p className="mt-3 text-ink/55">Set up your professional presence at your own pace.</p>
          </div>
          <Link href="/profile" className={buttonVariants({ className: "h-11 gap-2 rounded-full px-5" })}>
            <UserRound className="size-4" />
            Complete your profile
          </Link>
        </div>

        <div className="mt-9 grid gap-4 md:grid-cols-3">
          <ProviderDashboardCard
            href="/profile"
            title="Profile"
            description="Optional until you want to appear publicly and receive customer bookings."
            IconComponent={UserRound}
          />
          <ProviderDashboardCard
            href="/bookings"
            title="Bookings"
            description="Customer job requests and appointments will be managed from one shared page."
            IconComponent={BriefcaseBusiness}
          />
          <ProviderDashboardCard
            href="/explore"
            title="Explore"
            description="View the marketplace as visitors and customers see it. Providers cannot create bookings."
            IconComponent={Compass}
          />
        </div>
      </div>
    </main>
  );
}

interface ProviderDashboardCardProps {
  href: string;
  title: string;
  description: string;
  IconComponent: typeof UserRound;
}

function ProviderDashboardCard({ href, title, description, IconComponent }: ProviderDashboardCardProps) {
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
