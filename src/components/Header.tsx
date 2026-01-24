"use client";

import Link from "next/link";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Lab", href: "/lab" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between bg-[var(--background)]">
      {/* Brand */}
      <Link
        href="/"
        className="text-xs uppercase tracking-wide hover:opacity-60 transition-smooth"
      >
        Komran.Portfolio
      </Link>

      {/* Navigation */}
      <nav className="flex items-center gap-8">
        {navLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="text-xs uppercase tracking-wide px-2 py-1 hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-smooth"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 bg-[var(--accent)]" />
        <span className="text-xs uppercase tracking-wide">available</span>
      </div>
    </header>
  );
}
