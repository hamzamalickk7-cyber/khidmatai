import { PrimarySiteFooterSection } from "@/components/layout/primary-site-footer-section";
import { PrimarySiteNavigationHeader } from "@/components/layout/primary-site-navigation-header";

export default function SiteRouteGroupLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <PrimarySiteNavigationHeader />
      {children}
      <PrimarySiteFooterSection />
    </>
  );
}
