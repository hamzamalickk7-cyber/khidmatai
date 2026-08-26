"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, LayoutDashboard, LogOut, Menu, Settings, UserRound, X } from "lucide-react";
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
      className="flex items-center gap-2.5 text-lg font-semibold tracking-[-0.02em]"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-deep text-sm font-bold text-white shadow-[0_8px_20px_-8px_rgba(79,70,229,0.65)]">
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
    <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
      {primaryNavigationLinkList.map((navigationLink) => (
        <Link
          key={navigationLink.href}
          href={navigationLink.href}
          className="rounded-full px-4 py-2 text-sm font-medium text-ink/65 transition hover:bg-ink/5 hover:text-ink"
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
  onSignOut: () => void;
}

function DesktopAccountMenu({ authenticatedUserName, authenticatedUserEmail, onSignOut }: AuthenticatedAccountMenuProps) {
  const trimmedName = authenticatedUserName.trim();
  const userInitial = trimmedName.charAt(0).toUpperCase() || "U";
  const userFirstName = trimmedName.split(/\s+/)[0] || trimmedName;

  return (
    <div className="hidden md:block">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-ink/10 bg-white py-1.5 pl-1.5 pr-3 text-left transition hover:border-ink/20">
          <span className="grid size-8 place-items-center rounded-full bg-ink text-xs font-bold text-white">{userInitial}</span>
          <span className="max-w-24 truncate text-sm font-semibold">{userFirstName}</span>
          <ChevronDown className="size-4 text-ink/45" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>
            <p className="truncate text-sm font-semibold text-ink">{authenticatedUserName}</p>
            <p className="mt-0.5 truncate text-xs text-ink/45">{authenticatedUserEmail}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {accountMenuLinkList.map(({ label, href, IconComponent }) => (
            <DropdownMenuLinkItem key={href} render={<Link href={href} />} closeOnClick>
              <IconComponent className="size-4" />
              {label}
            </DropdownMenuLinkItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onSignOut} className="text-red-600 data-highlighted:bg-red-50 data-highlighted:text-red-600">
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
      <Link href="/login" className={buttonVariants({ variant: "ghost", size: "xs", className: "h-8 rounded-full px-3.5 text-ink/70" })}>
        Login
      </Link>
      <Link href="/register" className={buttonVariants({ size: "xs", className: "h-8 gap-1.5 rounded-full px-3.5" })}>
        Get started <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

interface MobileNavigationDrawerToggleProps {
  isAuthenticated: boolean;
  authenticatedUserName?: string;
  onSignOut: () => void;
}

function MobileNavigationDrawerToggle({ isAuthenticated, authenticatedUserName, onSignOut }: MobileNavigationDrawerToggleProps) {
  const [isMobileNavigationDrawerOpen, setIsMobileNavigationDrawerOpen] = useState(false);
  const closeDrawer = () => setIsMobileNavigationDrawerOpen(false);

  return (
    <div className="relative ml-auto md:hidden">
      <button
        type="button"
        aria-expanded={isMobileNavigationDrawerOpen}
        aria-label="Toggle navigation menu"
        onClick={() => setIsMobileNavigationDrawerOpen((currentValue) => !currentValue)}
        className="grid size-10 place-items-center rounded-full border border-ink/10 text-ink"
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
            className="absolute right-0 top-[calc(100%+0.5rem)] w-64 rounded-3xl border border-ink/10 bg-white p-2 shadow-[0_24px_48px_-16px_rgba(11,15,29,0.25)]"
          >
            {primaryNavigationLinkList.map((navigationLink) => (
              <Link
                key={navigationLink.href}
                href={navigationLink.href}
                onClick={closeDrawer}
                className="block rounded-2xl px-4 py-2.5 text-sm font-medium text-ink/75 hover:bg-ink/5"
              >
                {navigationLink.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-ink/8" />
            {isAuthenticated ? (
              <>
                <p className="px-4 py-2 text-xs font-semibold text-ink/45">Signed in as {authenticatedUserName}</p>
                {accountMenuLinkList.map(({ label, href }) => (
                  <Link key={href} href={href} onClick={closeDrawer} className="block rounded-2xl px-4 py-2.5 text-sm font-medium text-ink/75 hover:bg-ink/5">
                    {label}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={() => { closeDrawer(); onSignOut(); }}
                  className="block w-full rounded-2xl px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={closeDrawer} className="block rounded-2xl px-4 py-2.5 text-sm font-medium text-ink/75 hover:bg-ink/5">
                  Login
                </Link>
                <Link href="/register" onClick={closeDrawer} className="mt-1 flex items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-2.5 text-sm font-semibold text-white">
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
  const { data: authenticationSession, isPending: isAuthenticationSessionPending } = authenticationClient.useSession();
  const authenticatedUser = authenticationSession?.user;
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function signOutAuthenticatedUser() {
    setIsSigningOut(true);
    try {
      await authenticationClient.signOut();
      applicationRouter.push("/");
      applicationRouter.refresh();
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-ink/8 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-screen-2xl items-center gap-2 px-5 py-3 sm:px-8 lg:px-10">
          <KhidmatAiWordmarkLogo />
          <div className="mx-auto">
            <DesktopPrimaryNavigationLinks />
          </div>
          {isAuthenticationSessionPending ? (
            <span className="hidden h-10 w-28 animate-pulse rounded-full bg-ink/5 md:block" />
          ) : authenticatedUser ? (
            <DesktopAccountMenu
              authenticatedUserName={authenticatedUser.name}
              authenticatedUserEmail={authenticatedUser.email}
              onSignOut={signOutAuthenticatedUser}
            />
          ) : (
            <DesktopPublicNavigationActions />
          )}
          <MobileNavigationDrawerToggle
            isAuthenticated={Boolean(authenticatedUser)}
            authenticatedUserName={authenticatedUser?.name}
            onSignOut={signOutAuthenticatedUser}
          />
        </div>
      </header>

      <AnimatePresence>
        {isSigningOut && <ApplicationLoadingOverlay title="Signing you out" description="This will only take a moment." />}
      </AnimatePresence>
    </>
  );
}
