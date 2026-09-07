import type { LucideIcon } from "lucide-react";

export function AdministrationPlaceholderWorkspace({
  title,
  description,
  Icon,
}: {
  title: string;
  description: string;
  Icon: LucideIcon;
}) {
  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <section className="border-ink/10 mx-auto max-w-screen-2xl rounded-2xl border bg-white p-6">
        <span className="bg-brand-soft text-brand grid size-11 place-items-center rounded-xl">
          <Icon className="size-5" />
        </span>
        <h1 className="mt-4 text-xl font-semibold">{title}</h1>
        <p className="text-ink/50 mt-2 max-w-xl text-sm leading-6">{description}</p>
        <div className="border-ink/15 text-ink/40 bg-ink/[.015] mt-6 grid min-h-64 place-items-center rounded-xl border border-dashed text-sm">
          Dashboard data will be connected during backend implementation.
        </div>
      </section>
    </main>
  );
}
