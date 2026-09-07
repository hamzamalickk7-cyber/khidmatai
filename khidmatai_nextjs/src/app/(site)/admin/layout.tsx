import { AdministrationSidebarNavigation } from "@/modules/administration/components/administration-sidebar-navigation";
import { AdministrationTopBar } from "@/modules/administration/components/administration-top-bar";
import { requireAuthenticatedAccountRole } from "@/server/authentication/current-session";

export default async function AdministrationRouteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { authenticationSession, authenticatedAccountRole } = await requireAuthenticatedAccountRole(
    ["admin", "support"],
    "/admin",
    "/admin/login",
  );
  return (
    <div className="flex min-h-screen flex-1 bg-[#f8faf9]">
      <AdministrationSidebarNavigation />
      <div className="min-w-0 flex-1 lg:pl-60">
        <AdministrationTopBar accountName={authenticationSession.user.name} accountRole={authenticatedAccountRole} />
        {children}
      </div>
    </div>
  );
}
