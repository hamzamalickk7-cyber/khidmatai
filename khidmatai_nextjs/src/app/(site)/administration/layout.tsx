import { AdministrationSidebarNavigation } from "@/modules/administration/components/administration-sidebar-navigation";
import { requireAuthenticatedAccountRole } from "@/server/authentication/current-session";

export default async function AdministrationRouteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireAuthenticatedAccountRole(["admin", "support"], "/administration");
  return <div className="flex flex-1 flex-col lg:flex-row"><AdministrationSidebarNavigation/><div className="min-w-0 flex-1">{children}</div></div>;
}
