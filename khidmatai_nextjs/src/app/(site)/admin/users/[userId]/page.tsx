import { headers } from "next/headers";
import { AdministrationUserActions } from "@/modules/administration/components/administration-user-actions";
import { getAdministrationUser } from "@/modules/administration/services/administration-api-service";
import { requireAuthenticatedAccountRole } from "@/server/authentication/current-session";

export default async function AdministrationUserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { authenticatedAccountRole } = await requireAuthenticatedAccountRole(["admin", "support"]);
  const { userId } = await params;
  const requestHeaders = await headers();
  const user = await getAdministrationUser(requestHeaders.get("cookie") ?? "", userId);
  const facts = [
    ["Email", user.email],
    ["Role", user.role],
    ["Registration type", user.accountType],
    ["Email verification", user.emailVerified ? "Verified" : "Not verified"],
    ["Account status", user.deactivatedAt ? "Deactivated" : user.banned ? "Banned" : "Active"],
    ["Joined", new Date(user.createdAt).toLocaleString()],
  ];

  return (
    <main className="bg-background px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-screen-2xl">
        <p className="text-xs font-bold uppercase tracking-wider text-brand">Account review</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">{user.name}</h1>
            <p className="mt-1 text-ink/55">{user.email}</p>
          </div>
          <AdministrationUserActions user={user} isReadOnly={authenticatedAccountRole !== "admin"} />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <section className="rounded-3xl border border-ink/10 bg-white p-6">
            <h2 className="font-semibold">Account information</h2>
            <dl className="mt-4 divide-y divide-ink/6">
              {facts.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-3 text-sm">
                  <dt className="text-ink/50">{label}</dt>
                  <dd className="text-right font-medium capitalize">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="rounded-3xl border border-ink/10 bg-white p-6">
            <h2 className="font-semibold">Role profile (raw, debug)</h2>
            <p className="mt-1 text-xs text-ink/45">Unformatted record data, shown for support diagnostics only.</p>
            <pre className="mt-4 max-h-80 overflow-auto rounded-xl bg-ink/[.035] p-4 text-xs whitespace-pre-wrap">
              {JSON.stringify(
                user.providerProfile ?? user.customerProfile ?? { message: "No role profile data yet." },
                null,
                2,
              )}
            </pre>
          </section>
        </div>

        {(user.banReason || user.deactivationReason) && (
          <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="font-semibold text-amber-950">Restriction reason</h2>
            <p className="mt-2 text-sm text-amber-900/70">{user.deactivationReason ?? user.banReason}</p>
          </section>
        )}
      </div>
    </main>
  );
}
