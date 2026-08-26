import { Search } from "lucide-react";
import { SimpleComingSoonPageView } from "@/modules/shared/views/simple-coming-soon-page-view";
import { requireCurrentAuthenticationSession } from "@/server/authentication/current-session";

export default async function ExploreProvidersPage() {
  await requireCurrentAuthenticationSession("/explore");
  return <SimpleComingSoonPageView title="Explore is coming soon" description="Soon you will be able to find trusted local service providers near you." IconComponent={Search} />;
}
