"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Map" },
  { href: "/learn", label: "Learn" },
  { href: "/report", label: "Report a sighting" },
];

// The menu bar shown at the top of every page.
export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-current/15">
      <nav
        aria-label="Main"
        className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3"
      >
        <Link href="/" className="mr-auto font-bold">
          UK Tick Tracker
        </Link>
        {LINKS.map(({ href, label }) => {
          const isCurrent = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              // aria-current tells screen readers which page you're on
              aria-current={isCurrent ? "page" : undefined}
              className={`text-sm hover:underline ${isCurrent ? "font-semibold text-teal-600" : ""}`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
