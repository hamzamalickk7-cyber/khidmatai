import { ExploreProviderDirectoryView } from "@/modules/explore/views/explore-provider-directory-view";
import { getPublicProviderDirectory, getPublicServiceCategories } from "@/modules/explore/services/public-provider-directory-api-service";

export const dynamic = "force-dynamic";

export default async function ExploreProvidersPage() {
  const [providers, categories] = await Promise.all([getPublicProviderDirectory(), getPublicServiceCategories()]);
  return <ExploreProviderDirectoryView providers={providers} categories={categories} />;
}
