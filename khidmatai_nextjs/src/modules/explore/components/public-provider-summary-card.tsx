import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, BriefcaseBusiness, ChevronRight, MapPin, Navigation } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { PublicProviderDirectoryItem } from "../types/public-provider-directory-types";

export function PublicProviderSummaryCard({ provider }: { provider: PublicProviderDirectoryItem }) {
  const primaryCategory = provider.categories[0];

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_12px_32px_-26px_rgba(8,47,32,.5)] transition duration-300 hover:-translate-y-1 hover:border-brand/25 hover:shadow-[0_24px_46px_-26px_rgba(8,82,52,.38)]">
      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-brand-soft to-emerald-100">
        {provider.workImageUrl ? (
          <Image src={provider.workImageUrl} alt={`${provider.fullName} work example`} fill unoptimized className="object-cover transition duration-500 group-hover:scale-[1.04]" sizes="220px" />
        ) : (
          <div className="grid size-full place-items-center px-3 text-center text-xs font-semibold text-brand/60">Professional service provider</div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/45 to-transparent" />
        {primaryCategory && <span className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-md bg-black/55 px-2 py-1 text-[9px] font-semibold text-white backdrop-blur">{primaryCategory.displayName}</span>}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-brand/15 bg-brand-soft text-base font-bold text-brand shadow-sm">
            {provider.profileImageUrl ? (
              <Image src={provider.profileImageUrl} alt={`${provider.fullName} profile picture`} fill unoptimized className="object-cover" sizes="56px" />
            ) : getInitials(provider.fullName)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-1.5">
              <h2 className="truncate text-base font-semibold tracking-tight sm:text-lg">{provider.fullName}</h2>
              <BadgeCheck className="size-4 shrink-0 fill-brand text-white" aria-label="Verified by KhidmatAI" />
            </div>
            <p className="mt-0.5 truncate text-xs font-semibold text-brand sm:text-sm">{provider.professionalTitle}</p>
            <p className="mt-0.5 truncate text-[10px] font-medium text-ink/35">@{provider.username}</p>
          </div>
          {provider.isAvailableForNewJobs && <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">Available</span>}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-medium text-ink/55">
          <span className="flex items-center gap-1"><MapPin className="size-3.5 text-brand" />{provider.cityName}</span>
          <span className="flex items-center gap-1"><BriefcaseBusiness className="size-3.5 text-brand" />{formatExperience(provider.yearsOfExperience)}</span>
        </div>
        <p className="mt-3 line-clamp-2 min-h-9 text-xs leading-[1.125rem] text-ink/55">{provider.professionalBio}</p>

        <div className="mt-3 space-y-2">
          {(provider.serviceAreas ?? []).length > 0 && (
            <div className="flex min-w-0 items-center gap-1.5 text-[10px] font-medium text-ink/45">
              <Navigation className="size-3 shrink-0 text-brand" />
              <span className="shrink-0">Serves</span>
              <span className="truncate font-semibold text-ink/60">{provider.serviceAreas.slice(0, 2).join(" · ")}</span>
              {provider.serviceAreas.length > 2 && <span className="shrink-0 text-brand">+{provider.serviceAreas.length - 2}</span>}
            </div>
          )}
          {provider.categories.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {provider.categories.slice(1, 3).map((category) => (
                <span key={category.slug} className="rounded-md bg-brand-soft px-2 py-1 text-[9px] font-semibold text-brand">
                  {category.displayName}
                </span>
              ))}
              {provider.categories.length > 3 && (
                <span className="rounded-md bg-ink/[.04] px-2 py-1 text-[9px] font-semibold text-ink/45">
                  +{provider.categories.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        <div className="mt-auto border-t border-ink/8 pt-3">
          <Link href={`/explore/${provider.username}`} className={buttonVariants({ className: "w-full rounded-lg bg-brand px-3 font-semibold text-white hover:bg-brand-deep" })}>
            View profile <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function getInitials(fullName: string) {
  return fullName.split(" ").map((part) => part[0]).slice(0, 2).join("");
}

function formatExperience(yearsOfExperience: number) {
  return `${yearsOfExperience} ${yearsOfExperience === 1 ? "year" : "years"}`;
}
