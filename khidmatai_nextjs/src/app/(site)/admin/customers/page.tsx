import { headers } from "next/headers";
import { AdministrationUserTable } from "@/modules/administration/components/administration-user-table";
import { getAdministrationUsers } from "@/modules/administration/services/administration-api-service";

export default async function AdministrationCustomersPage() {
  const requestHeaders = await headers();
  const { data, meta } = await getAdministrationUsers(
    requestHeaders.get("cookie") ?? "",
    "page=1&pageSize=50&search=&role=customer",
  );

  return (
    <main className="bg-background px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-screen-2xl">
        <p className="text-xs font-bold uppercase tracking-wider text-brand">Administration</p>
        <h1 className="mt-2 text-3xl font-semibold">Customers</h1>
        <p className="mt-2 text-ink/55">Customer accounts and profile completion status.</p>

        <div className="mt-6">
          <AdministrationUserTable users={data} />
        </div>

        <p className="mt-4 text-sm text-ink/45">{meta?.total ?? data.length} customers</p>
      </div>
    </main>
  );
}
