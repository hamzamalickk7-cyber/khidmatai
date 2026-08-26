import { CustomerProfileView } from "@/modules/profile/views/customer-profile-view";
import { ProviderProfileView } from "@/modules/profile/views/provider-profile-view";
import { requireCurrentAuthenticationSession } from "@/server/authentication/current-session";

export default async function ProfilePage() {
  const authenticationSession = await requireCurrentAuthenticationSession("/profile");

  if (authenticationSession.user.role === "provider") {
    return <ProviderProfileView providerName={authenticationSession.user.name} providerEmail={authenticationSession.user.email} />;
  }

  return <CustomerProfileView customerName={authenticationSession.user.name} customerEmail={authenticationSession.user.email} />;
}
