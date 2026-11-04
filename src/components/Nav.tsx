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
    <aside className="sidenav">
      <Link href="/" className="brand">
        <span className="brand-mark">SE</span>
        <span>
          <strong>Smart Empresarial</strong>
          <small>Manutenção</small>
        </span>
      </Link>
      <nav>
        {links.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link${active ? " active" : ""}`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
