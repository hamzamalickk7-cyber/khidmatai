import { headers } from "next/headers";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAdministrationAuditEvents } from "@/modules/administration/services/administration-api-service";

export default async function AdministrationAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const requestHeaders = await headers();
  const query = new URLSearchParams({ search: params.search ?? "", page: params.page ?? "1", pageSize: "30" });
  const { data, meta } = await getAdministrationAuditEvents(requestHeaders.get("cookie") ?? "", query.toString());

  return (
    <main className="bg-background px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-screen-2xl">
        <p className="text-xs font-bold uppercase tracking-wider text-brand">Administration</p>
        <h1 className="mt-2 text-3xl font-semibold">Audit logs</h1>
        <p className="mt-2 text-ink/55">Permanent security and provider-review activity.</p>

        <form className="mt-6 flex max-w-xl gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/35" />
            <Input name="search" defaultValue={params.search} placeholder="Search event, entity or reason" className="pl-9" />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <div className="mt-6 overflow-x-auto rounded-3xl border border-ink/10 bg-white">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="border-b border-ink/8 text-xs uppercase text-ink/40">
              <tr>
                {["Event", "Entity", "Actor", "Reason", "Time"].map((label) => (
                  <th key={label} className="px-4 py-3">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/6">
              {data.map((event) => (
                <tr key={event.id}>
                  <td className="px-4 py-4 font-medium capitalize">{event.eventKey.replaceAll("_", " ")}</td>
                  <td className="px-4">
                    {event.entityType}
                    <p className="max-w-48 truncate text-xs text-ink/45">{event.entityId}</p>
                  </td>
                  <td className="px-4 capitalize text-ink/60">{event.actorRole ?? "system"}</td>
                  <td className="max-w-sm px-4 text-ink/50">{event.reason ?? "—"}</td>
                  <td className="px-4 whitespace-nowrap text-ink/45">{new Date(event.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data.length && <p className="p-10 text-center text-sm text-ink/40">No matching audit events.</p>}
        </div>

        <p className="mt-4 text-sm text-ink/45">{meta?.total ?? data.length} events</p>
      </div>
    </main>
  );
}
