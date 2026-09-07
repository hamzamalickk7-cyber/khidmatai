import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface ProfileSectionCardProps {
  title: string;
  description?: string;
  IconComponent: LucideIcon;
  children: ReactNode;
  footerNote?: string;
  action?: ReactNode;
}

export function ProfileSectionCard({
  title,
  description,
  IconComponent,
  children,
  footerNote,
  action,
}: ProfileSectionCardProps) {
  return (
    <section className="border-ink/10 rounded-2xl border bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <span className="bg-brand-soft text-brand grid size-10 shrink-0 place-items-center rounded-xl">
            <IconComponent className="size-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            {description && <p className="text-ink/55 mt-1 text-sm leading-6">{description}</p>}
          </div>
        </div>
        {action}
      </div>

      <div className="mt-6">{children}</div>

      {footerNote && <p className="text-ink/40 mt-5 text-xs leading-5">{footerNote}</p>}
    </section>
  );
}
