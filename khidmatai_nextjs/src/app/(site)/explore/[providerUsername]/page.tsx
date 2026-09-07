import { notFound } from "next/navigation";
import { getPublicProviderByUsername } from "@/modules/explore/services/public-provider-directory-api-service";
import { PublicProviderProfileDetailsView } from "@/modules/explore/views/public-provider-profile-details-view";
import { getCurrentAuthenticationSession } from "@/server/authentication/current-session";

interface ExploreProviderDetailsPageProps {
  params: Promise<{ providerUsername: string }>;
}

export const dynamic = "force-dynamic";

export default async function ExploreProviderDetailsPage({ params }: ExploreProviderDetailsPageProps) {
  const { providerUsername } = await params;
  const provider = await getPublicProviderByUsername(providerUsername);
  if (!provider) notFound();
  const session = await getCurrentAuthenticationSession();
  return <PublicProviderProfileDetailsView provider={provider} viewerRole={session?.user.role ?? null} />;
}
