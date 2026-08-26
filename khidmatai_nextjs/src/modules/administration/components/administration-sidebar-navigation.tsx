import Link from "next/link";
import { LayoutDashboard, ShieldCheck, UsersRound } from "lucide-react";

const administrationNavigationItems = [
  { href: "/administration", label: "Overview", icon: LayoutDashboard },
  { href: "/administration/providers", label: "Provider reviews", icon: UsersRound },
  { href: "/administration/access", label: "Access and security", icon: ShieldCheck },
] as const;

export function AdministrationSidebarNavigation() {
  return <aside className="border-b border-ink/8 bg-ink text-white lg:min-h-[calc(100vh-5rem)] lg:w-72 lg:border-r lg:border-b-0"><div className="p-5 lg:sticky lg:top-20 lg:p-7"><p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">KhidmatAI</p><h2 className="mt-2 text-xl">Administration</h2><nav aria-label="Administration navigation" className="mt-6 flex gap-2 overflow-x-auto lg:flex-col">{administrationNavigationItems.map(({href,label,icon:NavigationIcon})=><Link key={href} href={href} className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"><NavigationIcon className="size-4 text-brand" />{label}</Link>)}</nav></div></aside>;
}
