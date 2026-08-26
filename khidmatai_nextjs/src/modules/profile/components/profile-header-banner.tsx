"use client";

import { Pencil, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ProfileHeaderBannerProps {
  displayName: string;
  emailAddress: string;
  eyebrowLabel: string;
  StatusBadgeIcon?: LucideIcon;
  statusLabel?: string;
  statusTone?: "neutral" | "warning" | "positive";
}

const statusToneClassNameMap: Record<NonNullable<ProfileHeaderBannerProps["statusTone"]>, string> = {
  neutral: "bg-white/15 text-white",
  warning: "bg-accent-warm/25 text-accent-warm-soft",
  positive: "bg-emerald-500/20 text-emerald-200",
};

export function ProfileHeaderBanner({
  displayName,
  emailAddress,
  eyebrowLabel,
  StatusBadgeIcon,
  statusLabel,
  statusTone = "neutral",
}: ProfileHeaderBannerProps) {
  const initials = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((namePart) => namePart.charAt(0).toUpperCase())
    .join("") || "U";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink via-ink to-brand-deep px-6 pb-16 pt-8 text-white sm:px-10 sm:pt-10">
      <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full border-[40px] border-white/5" />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-white/60">{eyebrowLabel}</p>
          {statusLabel && (
            <span className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusToneClassNameMap[statusTone]}`}>
              {StatusBadgeIcon && <StatusBadgeIcon className="size-3.5" />}
              {statusLabel}
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-full border-white/25 bg-white/10 text-white hover:bg-white/20"
          onClick={() => toast.info("Profile editing is coming soon", { description: "You'll be able to update this information directly from here." })}
        >
          <Pencil className="size-3.5" />
          Edit profile
        </Button>
      </div>

      <div className="relative mt-8 flex items-end gap-4">
        <span className="grid size-20 shrink-0 place-items-center rounded-2xl bg-white text-2xl font-bold text-brand shadow-[0_16px_40px_-16px_rgba(0,0,0,0.6)] sm:size-24 sm:text-3xl">
          {initials}
        </span>
        <div className="pb-1">
          <h1 className="text-2xl sm:text-3xl">{displayName}</h1>
          <p className="mt-1 text-sm text-white/60">{emailAddress}</p>
        </div>
      </div>
    </div>
  );
}
