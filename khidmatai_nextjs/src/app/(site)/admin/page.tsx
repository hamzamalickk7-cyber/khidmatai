import { headers } from "next/headers";
import Link from "next/link";
import { Ban, Clock3, UserRoundCheck, UsersRound, Wrench } from "lucide-react";
import { getAdministrationOverview } from "@/modules/administration/services/administration-api-service";
import { buttonVariants } from "@/components/ui/button";
import { AdministrationProviderStatusChart } from "@/modules/administration/components/administration-provider-status-chart";
import { AdministrationAccountDistributionChart } from "@/modules/administration/components/administration-account-distribution-chart";

export default async function AdministrationOverviewPage() {
  const requestHeaders = await headers();
  const overview = await getAdministrationOverview(requestHeaders.get("cookie") ?? "");
  const awaitingReview = overview.providerStatuses.filter(({ status }) => ["submitted", "under_review"].includes(status)).reduce((total, item) => total + item.count, 0);
  const activeProviders = overview.providerStatuses.find(({ status }) => status === "active")?.count ?? 0;
  const metrics = [
    { label: "Platform accounts", value: overview.totalUsers, icon: UsersRound },
    { label: "Customers", value: overview.customers, icon: UserRoundCheck },
    { label: "Approved providers", value: activeProviders, icon: Wrench },
    { label: "Awaiting review", value: awaitingReview, icon: Clock3 },
    { label: "Restricted accounts", value: overview.banned + overview.deactivated, icon: Ban },
  ];
  return (
    <main className="bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-screen-2xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-brand text-xs font-bold uppercase tracking-wider">Live platform data</p><h1 className="mt-2 text-3xl font-semibold">Administration overview</h1><p className="text-ink/50 mt-2 text-sm">Only metrics backed by current KhidmatAI records are shown here.</p></div>
          <Link href="/admin/providers" className={buttonVariants()}>Review providers</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {metrics.map(({ label, value, icon: Icon }) => <section key={label} className="border-ink/10 rounded-2xl border bg-white p-5 shadow-sm"><span className="bg-brand-soft text-brand grid size-10 place-items-center rounded-xl"><Icon className="size-5" /></span><p className="text-ink/45 mt-4 text-xs">{label}</p><p className="mt-1 text-2xl font-bold tabular-nums">{value.toLocaleString()}</p></section>)}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="border-ink/10 rounded-2xl border bg-white p-5"><h2 className="font-semibold">Provider approval pipeline</h2><p className="text-ink/45 mt-1 text-xs">Current provider profiles grouped by review status.</p><AdministrationProviderStatusChart data={overview.providerStatuses}/></section>
          <section className="border-ink/10 rounded-2xl border bg-white p-5"><h2 className="font-semibold">Account distribution</h2><p className="text-ink/45 mt-1 text-xs">Current customers, providers, and staff accounts.</p><AdministrationAccountDistributionChart data={[{ name: "Customers", value: overview.customers }, { name: "Providers", value: overview.providers }, { name: "Staff", value: overview.staff }]}/></section>
        </div>
      </div>
    </main>
  );
}
