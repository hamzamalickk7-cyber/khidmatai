import { SiteRouteChrome } from "@/components/layout/site-route-chrome";

export default function SiteRouteGroupLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SiteRouteChrome>{children}</SiteRouteChrome>;
}
