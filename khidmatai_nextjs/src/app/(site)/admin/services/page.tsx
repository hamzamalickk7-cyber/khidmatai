import { headers } from "next/headers";
import { getAdministrationServiceCategories } from "@/modules/administration/services/administration-api-service";
import { AdministrationServiceCategoryManager } from "@/modules/administration/components/administration-service-category-manager";

export default async function AdministrationServicesPage() {
  const requestHeaders = await headers();
  const categories = await getAdministrationServiceCategories(requestHeaders.get("cookie") ?? "");
  return <main className="bg-background px-4 py-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-screen-2xl">
    <p className="text-brand text-xs font-bold uppercase tracking-wider">Marketplace catalogue</p><h1 className="mt-2 text-3xl font-semibold">Service categories</h1><p className="text-ink/50 mt-2 text-sm">These live categories power provider profiles, filters, and the public Explore directory.</p>
    <div className="mt-6"><AdministrationServiceCategoryManager initialCategories={categories}/></div>
  </div></main>;
}
