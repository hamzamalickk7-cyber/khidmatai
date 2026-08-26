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
      <Link href="/" className="flex items-center gap-2.5 text-lg font-semibold tracking-[-0.02em]">
        <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-deep text-sm font-bold text-white">
          Kh
        </span>
        <span>
          Khidmat<span className="text-brand">AI</span>
        </span>
      </Link>
      <p className="mt-4 max-w-xs text-sm leading-6 text-ink/60">
        A location-aware marketplace that matches you with verified local service providers, and
        keeps quotes, bookings, and reviews in one place.
      </p>
      <div className="mt-5 space-y-2 text-sm text-ink/55">
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
      <p className="text-sm font-semibold text-ink">{columnTitle}</p>
      <ul className="mt-4 space-y-3">
        {columnLinks.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="text-sm text-ink/55 transition hover:text-brand">
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
    <footer className="border-t border-ink/8 bg-brand-soft/40">
      <div className="mx-auto max-w-screen-2xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <FooterBrandColumn />
          {footerLinkColumnList.map((column) => (
            <FooterLinkColumn key={column.columnTitle} {...column} />
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-ink/8 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink/55">&copy; {new Date().getFullYear()} KhidmatAI. All rights reserved.</p>

          <p className="text-xs text-ink/40">Hackathon MVP</p>
        </div>
      </div>
    </footer>
  );
}
