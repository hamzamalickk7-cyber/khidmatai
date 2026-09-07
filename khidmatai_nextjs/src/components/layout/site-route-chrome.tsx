"use client";

import { usePathname } from "next/navigation";
import { PrimarySiteFooterSection } from "@/components/layout/primary-site-footer-section";
import { PrimarySiteNavigationHeader } from "@/components/layout/primary-site-navigation-header";

export function SiteRouteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdministrationRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdministrationRoute) return children;

  return (
    <>
      <PrimarySiteNavigationHeader />
      {children}
      <PrimarySiteFooterSection />
    </>
  );
}
