"use client";

import { Upload, type LucideIcon } from "lucide-react";
import { toast } from "sonner";

interface ProfileDocumentUploadRowProps {
  label: string;
  description: string;
  IconComponent: LucideIcon;
}

export function ProfileDocumentUploadRow({ label, description, IconComponent }: ProfileDocumentUploadRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-dashed border-ink/12 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink/5 text-ink/50">
          <IconComponent className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{label}</p>
          <p className="truncate text-xs text-ink/45">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => toast.info("Secure uploads open soon", { description: "Document uploads will be enabled once verified storage is connected." })}
        className="flex shrink-0 items-center gap-1.5 rounded-full border border-ink/10 px-3.5 py-2 text-xs font-semibold text-ink/60 transition hover:border-brand/30 hover:text-brand"
      >
        <Upload className="size-3.5" />
        Upload
      </button>
    </div>
  );
}
