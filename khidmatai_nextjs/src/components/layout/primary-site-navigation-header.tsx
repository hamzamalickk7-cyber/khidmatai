"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, ChevronUp, LayoutDashboard, LogOut, Menu, Settings, UserRound, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuLinkItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ApplicationLoadingOverlay } from "@/components/feedback/application-loading-overlay";
import { authenticationClient } from "@/modules/authentication/services/authentication-client";

interface PrimaryNavigationLinkDefinition {
  label: string;
  href: string;
}

const primaryNavigationLinkList: PrimaryNavigationLinkDefinition[] = [
  { label: "Explore", href: "/explore" },
  { label: "Bookings", href: "/bookings" },
  { label: "Services", href: "/#services" },
  { label: "How it works", href: "/#how-it-works" },
];

const accountMenuLinkList: { label: string; href: string; IconComponent: typeof LayoutDashboard }[] = [
  { label: "Dashboard", href: "/dashboard", IconComponent: LayoutDashboard },
  { label: "Profile", href: "/profile", IconComponent: UserRound },
  { label: "Settings", href: "/settings", IconComponent: Settings },
];

function KhidmatAiWordmarkLogo() {
  return (
    <Link
      href="/"
      aria-label="KhidmatAI home"
      className="flex items-center gap-2.5 text-lg font-bold tracking-[-0.035em]"
    >
      <span className="from-brand to-brand-deep grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-sm font-bold text-white shadow-[0_8px_20px_-10px_rgba(22,101,52,0.7)]">
        Kh
      </span>
      <span>
        Khidmat<span className="text-brand">AI</span>
      </span>
    </Link>
  );
}

function DesktopPrimaryNavigationLinks() {
  return (
    <nav
      aria-label="Main navigation"
      className="bg-muted/70 border-border/70 hidden items-center gap-0.5 rounded-xl border p-1 md:flex"
    >
      {primaryNavigationLinkList.map((navigationLink) => (
        <Link
          key={navigationLink.href}
          href={navigationLink.href}
          className="text-ink/65 hover:text-ink rounded-lg px-3.5 py-1.5 text-sm font-medium transition hover:bg-white hover:shadow-sm"
        >
          {navigationLink.label}
        </Link>
      ))}
    </nav>
  );
}

interface AuthenticatedAccountMenuProps {
  authenticatedUserName: string;
  authenticatedUserEmail: string;
  authenticatedUserImageUrl?: string | null;
  onSignOut: () => void;
}

function DesktopAccountMenu({
  authenticatedUserName,
  authenticatedUserEmail,
  authenticatedUserImageUrl,
  onSignOut,
}: AuthenticatedAccountMenuProps) {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const trimmedName = authenticatedUserName.trim();
  const userInitial = trimmedName.charAt(0).toUpperCase() || "U";
  const userFirstName = trimmedName.split(/\s+/)[0] || trimmedName;

  return (
    <div className="hidden md:block">
      <DropdownMenu open={isAccountMenuOpen} onOpenChange={setIsAccountMenuOpen}>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-xl bg-white py-1.5 pr-3 pl-1.5 text-left transition">
          <span className="bg-brand-soft text-brand grid size-8 place-items-center overflow-hidden rounded-full text-xs font-bold">
            {authenticatedUserImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- tiny authenticated avatar avoids image-optimization quota usage
              <img src={authenticatedUserImageUrl} alt={`${authenticatedUserName} profile`} className="size-full object-cover" />
            ) : userInitial}
          </span>
          <span className="max-w-24 truncate text-sm font-semibold">{userFirstName}</span>
          <span className="relative size-4 shrink-0" aria-hidden="true">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={isAccountMenuOpen ? "up" : "down"}
                className="absolute inset-0"
                initial={{ opacity: 0, rotate: isAccountMenuOpen ? -90 : 90, scale: 0.75 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: isAccountMenuOpen ? 90 : -90, scale: 0.75 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                {isAccountMenuOpen ? (
                  <ChevronUp className="text-ink/45 size-4" />
                ) : (
                  <ChevronDown className="text-ink/45 size-4" />
                )}
              </motion.span>
            </AnimatePresence>
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>
            <p className="text-ink truncate text-sm font-semibold">{authenticatedUserName}</p>
            <p className="text-ink/45 mt-0.5 truncate text-xs">{authenticatedUserEmail}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {accountMenuLinkList.map(({ label, href, IconComponent }) => (
            <DropdownMenuLinkItem key={href} render={<Link href={href} />} closeOnClick>
              <IconComponent className="size-4" />
              {label}
            </DropdownMenuLinkItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onSignOut}
            className="text-red-600 data-highlighted:bg-red-50 data-highlighted:text-red-600"
          >
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function DesktopPublicNavigationActions() {
  return (
    <div className="hidden items-center gap-2 md:flex">
      <Link
        href="/login"
        className={buttonVariants({ variant: "ghost", size: "sm", className: "text-ink/70 rounded-lg px-3.5" })}
      >
        Login
      </Link>
      <Link
        href="/register"
        className={buttonVariants({
          size: "sm",
          className: "bg-accent-warm hover:bg-accent-warm/90 h-9 gap-1.5 rounded-lg px-4 text-white",
        })}
      >
        Get started <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

function DesktopAdministrationNavigationActions({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="hidden items-center gap-2 md:flex">
      <Link href="/admin" className={buttonVariants({ size: "sm", className: "bg-ink hover:bg-ink/85 h-9 rounded-lg px-4 text-white" })}>
        Admin panel
      </Link>
      <button type="button" onClick={onSignOut} className="text-ink/55 hover:text-ink px-2 py-2 text-sm font-semibold">
        Sign out
      </button>
    </div>
  );
}

interface MobileNavigationDrawerToggleProps {
  isAuthenticated: boolean;
  isAdministrationAccount: boolean;
  authenticatedUserName?: string;
  onSignOut: () => void;
}

function MobileNavigationDrawerToggle({
  isAuthenticated,
  isAdministrationAccount,
  authenticatedUserName,
  onSignOut,
}: MobileNavigationDrawerToggleProps) {
  const [isMobileNavigationDrawerOpen, setIsMobileNavigationDrawerOpen] = useState(false);
  const closeDrawer = () => setIsMobileNavigationDrawerOpen(false);

  return (
    <div className="relative ml-auto md:hidden">
      <button
        type="button"
        aria-expanded={isMobileNavigationDrawerOpen}
        aria-label="Toggle navigation menu"
        onClick={() => setIsMobileNavigationDrawerOpen((currentValue) => !currentValue)}
        className="border-ink/10 text-ink grid size-10 place-items-center rounded-full border"
      >
        {isMobileNavigationDrawerOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      <AnimatePresence>
        {isMobileNavigationDrawerOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="border-ink/10 absolute top-[calc(100%+0.5rem)] right-0 w-64 rounded-3xl border bg-white p-2 shadow-[0_24px_48px_-16px_rgba(11,15,29,0.25)]"
          >
            {primaryNavigationLinkList.map((navigationLink) => (
              <Link
                key={navigationLink.href}
                href={navigationLink.href}
                onClick={closeDrawer}
                className="text-ink/75 hover:bg-ink/5 block rounded-2xl px-4 py-2.5 text-sm font-medium"
              >
                {navigationLink.label}
              </Link>
            ))}
            <div className="bg-ink/8 my-2 h-px" />
            {isAdministrationAccount ? (
              <>
                <Link href="/admin" onClick={closeDrawer} className="text-ink/75 hover:bg-ink/5 block rounded-2xl px-4 py-2.5 text-sm font-medium">
                  Admin panel
                </Link>
                <button type="button" onClick={() => { closeDrawer(); onSignOut(); }} className="block w-full rounded-2xl px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50">
                  Sign out
                </button>
              </>
            ) : isAuthenticated ? (
              <>
                <p className="text-ink/45 px-4 py-2 text-xs font-semibold">Signed in as {authenticatedUserName}</p>
                {accountMenuLinkList.map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={closeDrawer}
                    className="text-ink/75 hover:bg-ink/5 block rounded-2xl px-4 py-2.5 text-sm font-medium"
                  >
                    {label}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    closeDrawer();
                    onSignOut();
                  }}
                  className="block w-full rounded-2xl px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={closeDrawer}
                  className="text-ink/75 hover:bg-ink/5 block rounded-2xl px-4 py-2.5 text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={closeDrawer}
                  className="bg-brand mt-1 flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Get started <ArrowRight className="size-4" />
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PrimarySiteNavigationHeader() {
  const applicationRouter = useRouter();
  const queryClient = useQueryClient();
  const { data: authenticationSession, isPending: isAuthenticationSessionPending } = authenticationClient.useSession();
  const authenticatedUser = authenticationSession?.user;
  const isMarketplaceAccount = authenticatedUser?.role === "customer" || authenticatedUser?.role === "provider";
  const isAdministrationAccount = authenticatedUser?.role === "admin" || authenticatedUser?.role === "support";
  const [profileImageOverride, setProfileImageOverride] = useState<{ userId: string; imageUrl: string | null }>();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const profileImageUrl = profileImageOverride && profileImageOverride.userId === authenticatedUser?.id
    ? profileImageOverride.imageUrl
    : authenticatedUser?.image ?? null;

  useEffect(() => {
    function updateNavigationProfileImage(event: Event) {
      if (authenticatedUser?.id) setProfileImageOverride({ userId: authenticatedUser.id, imageUrl: (event as CustomEvent<{ imageUrl: string | null }>).detail.imageUrl });
    }
    window.addEventListener("khidmatai:profile-image-changed", updateNavigationProfileImage);
    return () => window.removeEventListener("khidmatai:profile-image-changed", updateNavigationProfileImage);
  }, [authenticatedUser?.id]);

  async function signOutAuthenticatedUser() {
    setIsSigningOut(true);
    try {
      await authenticationClient.signOut();
      queryClient.clear();
      applicationRouter.push("/");
      applicationRouter.refresh();
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <>
      <header className="border-border/80 sticky top-0 z-50 border-b bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center gap-2 px-5 sm:px-8">
          <KhidmatAiWordmarkLogo />
          <div className="mx-auto">
            <DesktopPrimaryNavigationLinks />
          </div>
          {isAuthenticationSessionPending ? (
            <span className="bg-ink/5 hidden h-10 w-28 animate-pulse rounded-full md:block" />
          ) : isMarketplaceAccount && authenticatedUser ? (
            <DesktopAccountMenu
              authenticatedUserName={authenticatedUser.name}
              authenticatedUserEmail={authenticatedUser.email}
              authenticatedUserImageUrl={profileImageUrl}
              onSignOut={signOutAuthenticatedUser}
            />
          ) : isAdministrationAccount ? (
            <DesktopAdministrationNavigationActions onSignOut={signOutAuthenticatedUser} />
          ) : (
            <DesktopPublicNavigationActions />
          )}
          <MobileNavigationDrawerToggle
            isAuthenticated={Boolean(isMarketplaceAccount)}
            isAdministrationAccount={Boolean(isAdministrationAccount)}
            authenticatedUserName={isMarketplaceAccount ? authenticatedUser?.name : undefined}
            onSignOut={signOutAuthenticatedUser}
          />
        </div>
      </header>

      <AnimatePresence>
        {isSigningOut && (
          <ApplicationLoadingOverlay title="Signing you out" description="This will only take a moment." />
        )}
      </AnimatePresence>
    </>
  );
}
