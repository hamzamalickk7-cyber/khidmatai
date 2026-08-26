import { CustomerDashboardView } from "@/modules/dashboard/views/customer-dashboard-view";
import { ProviderDashboardView } from "@/modules/dashboard/views/provider-dashboard-view";
import { requireCurrentAuthenticationSession } from "@/server/authentication/current-session";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const authenticationSession = await requireCurrentAuthenticationSession("/dashboard");
  if (authenticationSession.user.role === "provider") return <ProviderDashboardView providerName={authenticationSession.user.name}/>;
  if (authenticationSession.user.role === "admin" || authenticationSession.user.role === "support") redirect("/administration");
  return <CustomerDashboardView customerName={authenticationSession.user.name}/>;
}
