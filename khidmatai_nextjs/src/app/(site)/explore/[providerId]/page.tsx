import { Search } from "lucide-react";
import { SimpleComingSoonPageView } from "@/modules/shared/views/simple-coming-soon-page-view";
import { requireCurrentAuthenticationSession } from "@/server/authentication/current-session";

interface ExploreProviderDetailsPageProps {
  params: Promise<{ providerId: string }>;
}

export default async function ExploreProviderDetailsPage({ params }: ExploreProviderDetailsPageProps) {
  const { providerId } = await params;
  await requireCurrentAuthenticationSession(`/explore/${providerId}`);
  return <SimpleComingSoonPageView title="Provider profiles are coming soon" description="Provider details will be available when Explore launches." IconComponent={Search} />;
}
