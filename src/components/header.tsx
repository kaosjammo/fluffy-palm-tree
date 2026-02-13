import Link from "next/link";

const links = [
  { href: "/pricing", label: "Pricing" },
  { href: "/login", label: "Login" },
  { href: "/app", label: "Open App" },
];

export function Header() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
      <Link href="/" className="text-lg font-semibold tracking-tight text-white">
        Snapframe
      </Link>
      <nav className="flex items-center gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-slate-200 hover:border-fuchsia-400 hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
