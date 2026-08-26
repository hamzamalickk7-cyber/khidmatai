"use client";

import { Plus, type LucideIcon } from "lucide-react";
import { toast } from "sonner";

interface ProfileDetailFieldRowProps {
  label: string;
  value?: string;
  placeholder: string;
  IconComponent: LucideIcon;
}

export function ProfileDetailFieldRow({ label, value, placeholder, IconComponent }: ProfileDetailFieldRowProps) {
  const isFilled = Boolean(value);

  return (
    <div className="flex items-center justify-between gap-4 border-b border-ink/6 py-3.5 last:border-b-0 last:pb-0 first:pt-0">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-ink/5 text-ink/50">
          <IconComponent className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">{label}</p>
          <p className={`truncate text-sm ${isFilled ? "text-ink" : "text-ink/35"}`}>{isFilled ? value : placeholder}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => toast.info("Profile editing is coming soon")}
        className="shrink-0 rounded-full border border-ink/10 px-3 py-1.5 text-xs font-semibold text-ink/60 transition hover:border-brand/30 hover:text-brand"
      >
        {isFilled ? "Edit" : (
          <span className="flex items-center gap-1">
            <Plus className="size-3.5" />
            Add
          </span>
        )}
      </button>
    </div>
  );
}
