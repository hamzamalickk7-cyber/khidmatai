"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  Check,
  CircleCheckBig,
  CircleAlert,
  ClipboardList,
  Compass,
  FileCheck2,
  Images,
  Settings2,
  Star,
  UserRound,
  Wrench,
} from "lucide-react";
import { RouteLoadingState } from "@/components/feedback/route-loading-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { ProviderApplicationProgressCard } from "@/modules/profile/components/provider-application-progress-card";
import { useProviderProfileQuery } from "@/modules/profile/hooks/use-provider-profile-query";
import type { ProviderProfileData } from "@/modules/profile/types/provider-profile-types";

interface ProviderDashboardViewProperties {
  authenticationUserId: string;
  providerName: string;
}

export function ProviderDashboardView({ authenticationUserId, providerName }: ProviderDashboardViewProperties) {
  const providerProfileQuery = useProviderProfileQuery(authenticationUserId);
  if (providerProfileQuery.isLoading || (providerProfileQuery.isFetching && !providerProfileQuery.data))
    return (
      <RouteLoadingState label="Preparing your dashboard" description="Loading your latest provider information." />
    );
  if (!providerProfileQuery.data)
    return (
      <main className="grid min-h-[55vh] flex-1 place-items-center px-5 text-center">
        <div className="max-w-md">
          <CircleAlert className="mx-auto size-8 text-amber-600" />
          <h1 className="mt-4 text-xl font-semibold">Your provider dashboard could not be loaded</h1>
          <p className="text-ink/50 mt-2 text-sm">Check the backend connection and try again.</p>
          <Button className="mt-5" onClick={() => void providerProfileQuery.refetch()}>
            Try again
          </Button>
        </div>
      </main>
    );
  return <ProviderDashboardContent profile={providerProfileQuery.data} fallbackProviderName={providerName} />;
}

function ProviderDashboardContent({
  profile,
  fallbackProviderName,
}: {
  profile: ProviderProfileData;
  fallbackProviderName: string;
}) {
  const providerDisplayName = profile.fullName || fallbackProviderName;
  const profileImageUrl = profile.mediaAssets.find((asset) => asset.mediaPurpose === "profile_image")?.url;
  const dashboardChecklist = createProviderDashboardChecklist(profile);
  const completedRequirementCount = dashboardChecklist.filter((requirement) => requirement.isComplete).length;
  const completionPercentage = Math.round((completedRequirementCount / dashboardChecklist.length) * 100);
  return (
    <main className="min-h-full flex-1 bg-[#f6f8f6] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="bg-ink-soft relative overflow-hidden rounded-3xl px-5 py-6 text-white shadow-[0_24px_60px_-38px_rgba(8,47,32,.65)] sm:px-7 sm:py-8">
          <div className="bg-brand/30 absolute -top-24 -right-16 size-64 rounded-full blur-3xl" />
          <div className="bg-flash/10 absolute right-1/3 -bottom-24 size-48 rounded-full blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-4 sm:gap-5">
              <div className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white/10 text-xl font-bold ring-1 ring-white/15 sm:size-20">
                {profileImageUrl ? (
                  <Image
                    src={profileImageUrl}
                    alt={`${providerDisplayName} profile picture`}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  getInitials(providerDisplayName)
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold tracking-[.16em] text-white/50 uppercase">Provider workspace</p>
                <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight sm:text-3xl">
                  Welcome, {providerDisplayName}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/60">
                  {profile.professionalTitle && <span>{profile.professionalTitle}</span>}
                  {profile.city && (
                    <>
                      <span className="size-1 rounded-full bg-white/25" />
                      <span>{profile.city}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {profile.username && profile.status === "active" && (
                <Link
                  href={`/explore/${profile.username}`}
                  className={buttonVariants({
                    variant: "outline",
                    className:
                      "text-ink hover:bg-brand-soft hover:text-ink border-white bg-white shadow-md hover:border-white",
                  })}
                >
                  <Compass className="size-4" /> View public profile
                </Link>
              )}
              <Link href="/profile" className={buttonVariants({ className: "bg-flash text-ink hover:bg-white" })}>
                <UserRound className="size-4" /> {completionPercentage === 100 ? "Manage profile" : "Complete profile"}
              </Link>
            </div>
          </div>
        </section>

        <div>
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-brand text-xs font-bold tracking-[.14em] uppercase">Business performance</p>
              <h2 className="mt-1 text-xl font-semibold">Your work at a glance</h2>
            </div>
            <p className="text-ink/45 text-xs">Updates automatically as customers book and review your work.</p>
          </div>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Provider business performance">
            <OverviewCard
              IconComponent={ClipboardList}
              label="Booking requests"
              value="0"
              detail="No customer requests yet"
            />
            <OverviewCard
              IconComponent={BriefcaseBusiness}
              label="Active jobs"
              value="0"
              detail="No jobs currently in progress"
              tone="warning"
            />
            <OverviewCard
              IconComponent={CircleCheckBig}
              label="Completed jobs"
              value="0"
              detail="Completed bookings will appear here"
              tone="success"
            />
            <OverviewCard
              IconComponent={Star}
              label="Customer rating"
              value="Not rated"
              detail="0 verified customer reviews"
              tone="neutral"
            />
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)] xl:items-start">
          <div className="space-y-6">
            <section className="border-ink/10 rounded-2xl border bg-white p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-brand text-xs font-bold tracking-[.14em] uppercase">Profile readiness</p>
                  <h2 className="mt-2 text-xl font-semibold">{completionPercentage}% complete</h2>
                  <p className="text-ink/50 mt-1 text-sm">
                    Complete these essentials to build customer trust and remain ready for review.
                  </p>
                </div>
                <Link href="/profile" className={buttonVariants({ variant: "outline", className: "shrink-0" })}>
                  Update profile <ArrowRight className="size-4" />
                </Link>
              </div>
              <div
                className="bg-ink/[.07] mt-5 h-2.5 overflow-hidden rounded-full"
                role="progressbar"
                aria-label="Provider profile completion"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={completionPercentage}
              >
                <div
                  className="bg-brand h-full rounded-full transition-[width]"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {dashboardChecklist.map((requirement) => (
                  <Link
                    key={requirement.label}
                    href={requirement.href}
                    className={`hover:border-brand/25 flex items-center gap-3 rounded-xl border px-3.5 py-3 text-sm font-medium transition ${requirement.isComplete ? "border-brand/10 bg-brand-soft/25 text-ink/70" : "border-amber-200 bg-amber-50 text-amber-950"}`}
                  >
                    <span
                      className={`grid size-6 shrink-0 place-items-center rounded-full ${requirement.isComplete ? "bg-brand text-white" : "bg-amber-200 text-amber-800"}`}
                    >
                      {requirement.isComplete ? (
                        <Check className="size-3.5" strokeWidth={3} />
                      ) : (
                        <span className="text-xs font-bold">!</span>
                      )}
                    </span>
                    <span>{requirement.label}</span>
                    <ArrowRight className="ml-auto size-3.5 opacity-40" />
                  </Link>
                ))}
              </div>
            </section>
            <section className="border-ink/10 rounded-2xl border bg-white p-5 sm:p-6">
              <p className="text-brand text-xs font-bold tracking-[.14em] uppercase">Quick actions</p>
              <h2 className="mt-2 text-xl font-semibold">Manage your work presence</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <QuickAction
                  href="/profile?tab=services"
                  IconComponent={Wrench}
                  title="Services"
                  description="Update jobs and pricing."
                />
                <QuickAction
                  href="/profile?tab=availability"
                  IconComponent={CalendarClock}
                  title="Availability"
                  description="Set areas and working hours."
                />
                <QuickAction
                  href="/profile?tab=gallery"
                  IconComponent={Images}
                  title="Work gallery"
                  description="Show customers recent work."
                />
                <QuickAction
                  href="/profile?tab=verification"
                  IconComponent={FileCheck2}
                  title="Verification"
                  description="Manage private documents."
                />
                <QuickAction
                  href="/bookings"
                  IconComponent={BriefcaseBusiness}
                  title="Bookings"
                  description="View customer job requests."
                />
                <QuickAction
                  href="/settings"
                  IconComponent={Settings2}
                  title="Settings"
                  description="Manage account preferences."
                />
              </div>
            </section>
          </div>
          <aside className="space-y-6">
            <ProviderApplicationProgressCard
              currentStageKey={profile.status}
              latestReviewDecision={profile.latestReviewDecision}
            />
            <section className="border-brand/15 bg-brand-soft/45 rounded-2xl border p-5">
              <h2 className="font-semibold">Today&apos;s provider checklist</h2>
              <ul className="text-ink/60 mt-4 space-y-3 text-sm">
                <DashboardTip isComplete={profile.isAvailableForNewJobs}>Accepting new jobs is turned on</DashboardTip>
                <DashboardTip isComplete={profile.weeklyAvailability.length > 0}>
                  Working hours are available
                </DashboardTip>
                <DashboardTip isComplete={profile.services.length > 0}>At least one service is listed</DashboardTip>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function OverviewCard({
  IconComponent,
  label,
  value,
  detail,
  tone = "brand",
}: {
  IconComponent: typeof UserRound;
  label: string;
  value: string;
  detail: string;
  tone?: "brand" | "success" | "warning" | "neutral";
}) {
  const toneClassNames = {
    brand: "bg-brand-soft text-brand",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    neutral: "bg-ink/[.05] text-ink/50",
  };
  return (
    <article className="border-ink/10 rounded-2xl border bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-ink/40 text-xs font-semibold">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight capitalize">{value}</p>
        </div>
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${toneClassNames[tone]}`}>
          <IconComponent className="size-4.5" />
        </span>
      </div>
      <p className="text-ink/45 mt-3 truncate text-xs">{detail}</p>
    </article>
  );
}
function QuickAction({
  href,
  IconComponent,
  title,
  description,
}: {
  href: string;
  IconComponent: typeof UserRound;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group border-ink/10 hover:border-brand/25 hover:bg-brand-soft/20 rounded-xl border p-4 transition"
    >
      <span className="bg-brand-soft text-brand grid size-9 place-items-center rounded-lg">
        <IconComponent className="size-4" />
      </span>
      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p className="text-ink/45 mt-1 text-xs leading-5">{description}</p>
    </Link>
  );
}
function DashboardTip({ isComplete, children }: { isComplete: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2.5">
      <span
        className={`grid size-5 shrink-0 place-items-center rounded-full ${isComplete ? "bg-brand text-white" : "text-ink/30 ring-ink/10 bg-white ring-1"}`}
      >
        {isComplete ? <Check className="size-3" strokeWidth={3} /> : "·"}
      </span>
      {children}
    </li>
  );
}
function createProviderDashboardChecklist(profile: ProviderProfileData) {
  return [
    {
      label: "Basic professional information",
      isComplete: profile.readiness.hasBasicProfile,
      href: "/profile?tab=profile",
    },
    { label: "Services and categories", isComplete: profile.readiness.hasServices, href: "/profile?tab=services" },
    {
      label: "Coverage and availability",
      isComplete: profile.readiness.hasAvailability && profile.serviceAreas.length > 0,
      href: "/profile?tab=availability",
    },
    {
      label: "Identity documents",
      isComplete: profile.readiness.hasIdentityDocuments,
      href: "/profile?tab=verification",
    },
    { label: "Work gallery", isComplete: profile.readiness.hasWorkGallery, href: "/profile?tab=gallery" },
  ];
}
function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .map((namePart) => namePart[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
