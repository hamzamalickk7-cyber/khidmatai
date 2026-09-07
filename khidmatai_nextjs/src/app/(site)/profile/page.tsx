import { CustomerProfileView } from "@/modules/profile/views/customer-profile-view";
import { ProviderProfileView } from "@/modules/profile/views/provider-profile-view";
import { requireCurrentAuthenticationSession } from "@/server/authentication/current-session";
import { getPublicServiceCategories } from "@/modules/explore/services/public-provider-directory-api-service";

interface ProfilePageProperties {
  searchParams: Promise<{ tab?: string | string[] }>;
}

export default async function ProfilePage({ searchParams }: ProfilePageProperties) {
  const authenticationSession = await requireCurrentAuthenticationSession("/profile");
  const requestedTabValue = (await searchParams).tab;
  const requestedTab = Array.isArray(requestedTabValue) ? requestedTabValue[0] : requestedTabValue;

  if (authenticationSession.user.role === "provider") {
    const serviceCategories = await getPublicServiceCategories();
    return (
      <ProviderProfileView
        key={authenticationSession.user.id}
        authenticationUserId={authenticationSession.user.id}
        providerName={authenticationSession.user.name}
        providerEmail={authenticationSession.user.email}
        initialTabKey={requestedTab}
        serviceCategories={serviceCategories}
      />
    );
  }

  return (
    <CustomerProfileView
      key={authenticationSession.user.id}
      authenticationUserId={authenticationSession.user.id}
      customerName={authenticationSession.user.name}
      customerEmail={authenticationSession.user.email}
      initialTabKey={requestedTab}
    />
  );
}
