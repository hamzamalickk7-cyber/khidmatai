import Link from "next/link";
import { HiOutlineMapPin } from "react-icons/hi2";

interface FooterLinkColumnDefinition {
  columnTitle: string;
  columnLinks: readonly (readonly [label: string, href: string])[];
}

const footerLinkColumnList: readonly FooterLinkColumnDefinition[] = [
  {
    columnTitle: "Explore",
    columnLinks: [
      ["Find providers", "/explore"],
      ["How it works", "/#how-it-works"],
      ["Trust & safety", "/#trust-and-safety"],
    ],
  },
  {
    columnTitle: "Providers",
    columnLinks: [
      ["Register as provider", "/register"],
      ["Provider profile", "/profile"],
      ["Provider dashboard", "/dashboard"],
    ],
  },
  {
    columnTitle: "Company",
    columnLinks: [
      ["Dashboard", "/dashboard"],
      ["Profile", "/profile"],
      ["Settings", "/settings"],
    ],
  },
];

function FooterBrandColumn() {
  return (
    <div>
      <Link href="/" className="flex items-center gap-2.5 text-lg font-bold tracking-[-0.035em] text-white">
        <span className="text-brand-deep grid size-9 shrink-0 place-items-center rounded-xl bg-white text-sm font-bold">
          Kh
        </span>
        <span>
          Khidmat<span className="text-accent-warm">AI</span>
        </span>
      </Link>
      <p className="mt-4 max-w-sm text-sm leading-6 text-white/60">
        A location-aware marketplace that matches you with verified local service providers, and keeps quotes, bookings,
        and reviews in one place.
      </p>
      <div className="mt-5 space-y-2 text-sm text-white/55">
        <p className="flex items-center gap-2">
          <HiOutlineMapPin className="size-4 shrink-0" /> Launching in one city, a few categories at a time
        </p>
      </div>
    </div>
  );
}

function FooterLinkColumn({ columnTitle, columnLinks }: FooterLinkColumnDefinition) {
  return (
    <div>
      <p className="text-sm font-semibold text-white">{columnTitle}</p>
      <ul className="mt-4 space-y-3">
        {columnLinks.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="text-sm text-white/55 transition hover:text-white">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PrimarySiteFooterSection() {
  return (
    <footer className="bg-ink-soft border-t border-white/10 text-white">
      <div className="mx-auto max-w-screen-2xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.5fr_repeat(3,0.8fr)]">
          <FooterBrandColumn />
          {footerLinkColumnList.map((column) => (
            <FooterLinkColumn key={column.columnTitle} {...column} />
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-5 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white/50">&copy; {new Date().getFullYear()} KhidmatAI. All rights reserved.</p>

          <p className="text-xs text-white/35">Built locally for local work</p>
        </div>
      </div>
    </footer>
  );
}
