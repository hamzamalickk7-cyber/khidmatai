"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  ShieldCheck,
  Star,
  UserRound,
  UsersRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";

interface AdministrationNavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const administrationNavigationGroups: Array<{ label: string; items: AdministrationNavigationItem[] }> = [
  { label: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  {
    label: "Manage",
    items: [
      { href: "/admin/users", label: "All users", icon: UsersRound },
      { href: "/admin/customers", label: "Customers", icon: UserRound },
      { href: "/admin/providers", label: "Service providers", icon: ShieldCheck },
      { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
      { href: "/admin/services", label: "Services", icon: Wrench },
      { href: "/admin/reviews", label: "Reviews", icon: Star },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/audit-logs", label: "Audit logs", icon: ClipboardList },
      { href: "/admin/access", label: "Access & security", icon: ShieldCheck },
    ],
  },
];

export function AdministrationSidebarNavigation() {
  const pathname = usePathname();
  return (
    <aside className="border-ink/10 fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r bg-white lg:flex">
      <div className="border-ink/8 flex h-[76px] items-center border-b px-6">
        <Link href="/admin" className="flex items-center gap-3" aria-label="KhidmatAI admin dashboard">
          <span className="from-brand to-brand-deep grid size-9 place-items-center rounded-lg bg-gradient-to-br text-sm font-bold text-white">
            K
          </span>
          <span>
            <span className="text-ink block text-lg font-bold tracking-tight">KhidmatAI</span>
            <span className="text-brand block text-[10px] font-semibold">Admin Panel</span>
          </span>
        </Link>
      </div>
      <nav aria-label="Administration navigation" className="flex-1 space-y-7 overflow-y-auto px-3 py-6">
        {administrationNavigationGroups.map((group) => (
          <section key={group.label}>
            <p className="text-ink/35 px-3 text-[10px] font-bold tracking-[0.14em] uppercase">{group.label}</p>
            <div className="mt-2 space-y-1">
              {group.items.map((item) => {
                const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${isActive ? "bg-brand-soft text-brand" : "text-ink/60 hover:bg-ink/[.035] hover:text-ink"}`}
                  >
                    {isActive && <span className="bg-brand absolute inset-y-2 -left-3 w-0.5 rounded-r-full" />}
                    <item.icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </nav>
      <div className="border-ink/8 border-t p-4">
        <div className="bg-ink/[.025] flex items-center gap-3 rounded-xl p-3">
          <span className="bg-brand grid size-9 place-items-center rounded-full text-xs font-bold text-white">A</span>
          <div className="min-w-0">
            <p className="text-ink truncate text-sm font-semibold">Administrator</p>
            <p className="text-ink/40 text-[11px]">Secure workspace</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
