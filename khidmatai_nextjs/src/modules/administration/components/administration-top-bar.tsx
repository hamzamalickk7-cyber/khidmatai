"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShieldCheck } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { administrationNavigationGroups } from "./administration-sidebar-navigation";

interface AdministrationTopBarProps {
  accountName: string;
  accountRole: string;
}

export function AdministrationTopBar({ accountName, accountRole }: AdministrationTopBarProps) {
  const pathname = usePathname();
  const firstName = accountName.trim().split(/\s+/)[0] ?? accountName;
  return (
    <header className="border-ink/8 sticky top-0 z-30 flex min-h-[76px] items-center justify-between border-b bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger className="border-ink/10 grid size-9 shrink-0 place-items-center rounded-lg border lg:hidden" aria-label="Open administration navigation"><Menu className="size-4" /></DialogTrigger>
            <DialogContent className="inset-y-0 left-0 top-0 h-dvh max-w-[19rem] translate-x-0 translate-y-0 rounded-none p-5" showCloseButton>
              <DialogTitle>Administration</DialogTitle>
              <nav className="mt-6 space-y-6" aria-label="Mobile administration navigation">
                {administrationNavigationGroups.map((group) => <section key={group.label}><p className="text-ink/35 text-[10px] font-bold tracking-widest uppercase">{group.label}</p><div className="mt-2 space-y-1">{group.items.map((item) => <DialogClose key={item.href} render={<Link href={item.href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${pathname === item.href ? "bg-brand-soft text-brand" : "text-ink/60"}`} />}><item.icon className="size-4" />{item.label}</DialogClose>)}</div></section>)}
              </nav>
            </DialogContent>
          </Dialog>
          <h1 className="text-ink truncate text-lg font-semibold tracking-tight sm:text-xl">Welcome back, {firstName}! 👋</h1>
        </div>
        <p className="text-ink/45 mt-0.5 hidden text-xs sm:block">
          Here&apos;s what&apos;s happening on KhidmatAI today.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div className="border-ink/10 ml-1 flex items-center gap-2 rounded-full border py-1 pr-3 pl-1">
          <span className="bg-brand grid size-7 place-items-center rounded-full text-white">
            <ShieldCheck className="size-3.5" />
          </span>
          <span className="hidden text-xs font-semibold capitalize sm:inline">{accountRole}</span>
        </div>
      </div>
    </header>
  );
}
