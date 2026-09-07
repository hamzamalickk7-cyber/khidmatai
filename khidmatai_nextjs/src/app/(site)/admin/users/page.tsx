import { headers } from "next/headers";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdministrationUserTable } from "@/modules/administration/components/administration-user-table";
import { getAdministrationUsers } from "@/modules/administration/services/administration-api-service";

export default async function AdministrationUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; role?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const requestHeaders = await headers();
  const query = new URLSearchParams({ page: params.page ?? "1", pageSize: "20", search: params.search ?? "" });
  if (params.role) query.set("role", params.role);
  if (params.status) query.set("status", params.status);
  const { data, meta } = await getAdministrationUsers(requestHeaders.get("cookie") ?? "", query.toString());

  return (
    <main className="bg-background px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-screen-2xl">
        <p className="text-xs font-bold uppercase tracking-wider text-brand">Administration</p>
        <h1 className="mt-2 text-3xl font-semibold">Users</h1>
        <p className="mt-2 text-ink/55">Inspect and securely manage every platform account.</p>

        <form className="mt-6 flex max-w-xl gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/35" />
            <Input name="search" defaultValue={params.search} placeholder="Search name or email" className="pl-9" />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <div className="mt-6">
          <AdministrationUserTable users={data} />
        </div>

        {meta && (
          <p className="mt-4 text-sm text-ink/45">
            {meta.total} accounts · Page {meta.page} of {meta.totalPages}
          </p>
        )}
      </div>
    </main>
  );
}
