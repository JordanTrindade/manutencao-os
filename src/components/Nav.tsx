"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Ordens" },
  { href: "/os/nova", label: "Nova OS" },
  { href: "/pecas", label: "Peças" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[rgba(247,250,251,0.88)] backdrop-blur-md">
      <div className="shell flex flex-wrap items-center justify-between gap-4 py-4">
        <Link href="/" className="group">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
            Smart Empresarial
          </div>
          <div className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-[var(--ink)] transition group-hover:text-[var(--brand)]">
            Manutenção OS
          </div>
        </Link>

        <nav className="flex flex-wrap gap-2">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-[var(--brand)] text-white"
                    : "bg-white text-[var(--muted)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-dark)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
