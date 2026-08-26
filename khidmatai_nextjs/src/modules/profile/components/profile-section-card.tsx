import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface ProfileSectionCardProps {
  title: string;
  description?: string;
  IconComponent: LucideIcon;
  children: ReactNode;
  footerNote?: string;
}

export function ProfileSectionCard({ title, description, IconComponent, children, footerNote }: ProfileSectionCardProps) {
  return (
    <section className="rounded-3xl border border-ink/10 bg-white p-6 sm:p-7">
      <div className="flex items-start gap-3.5">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
          <IconComponent className="size-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && <p className="mt-1 text-sm leading-6 text-ink/55">{description}</p>}
        </div>
      </div>

      <div className="mt-6">{children}</div>

      {footerNote && <p className="mt-5 text-xs leading-5 text-ink/40">{footerNote}</p>}
    </section>
  );
}
