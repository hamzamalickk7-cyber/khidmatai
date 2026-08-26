// Deliberately no PrimarySiteNavigationHeader/PrimarySiteFooterSection here:
// the login/register screens carry their own "Home" and branding, and
// showing the full site chrome around a sign-in card is redundant.
export default function AuthRouteGroupLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
