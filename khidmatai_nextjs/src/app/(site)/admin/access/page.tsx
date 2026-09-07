import { ShieldCheck } from "lucide-react";

export default function AdministrationAccessAndSecurityPage() {
  return (
    <main className="bg-background px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-screen-2xl">
        <p className="text-xs font-bold uppercase tracking-wider text-brand">Administration</p>
        <h1 className="mt-2 text-3xl font-semibold">Access and security</h1>

        <div className="mt-6 max-w-2xl rounded-3xl border border-ink/10 bg-white p-6">
          <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
            <ShieldCheck className="size-5" />
          </span>
          <p className="mt-4 text-sm leading-6 text-ink/55">
            Administrative account provisioning and security controls will be managed here. Public administrator
            registration is permanently disabled.
          </p>
        </div>
      </div>
    </main>
  );
}
